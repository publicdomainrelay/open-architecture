/**
 * Deterministic loop: process all Alice engineering comms through the
 * alice-eng-comms agent, one batch per iteration, until every comm (0000–0690)
 * processed.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-run --allow-sys --allow-env \
 *     scripts/process-eng-comms.ts [--dry-run] [--max-batches N] [--verbose]
 *
 * All log output is structured JSON, one object per line. Pipe through `jq`
 * for human-readable display:
 *
 *   deno run ... scripts/process-eng-comms.ts 2>&1 | jq -r \
 *     'select(.level != "debug") | "[\(.ts[11:19]) \(.level)] \(.event) \(.data // {})"'
 *
 * Watch a running session (run in a second terminal):
 *
 *   tail -f /tmp/process-eng-comms.log | jq -r \
 *     'select(.level != "debug") | "[\(.ts[11:19]) \(.level)] \(.event): \(.data // {})"'
 *
 * Log to file + stdout:
 *
 *   deno run ... scripts/process-eng-comms.ts 2>&1 | tee /tmp/process-eng-comms.log
 *
 * ## Architecture
 *
 *   process-eng-comms.ts (orchestrator)
 *     │  reads state.json, loads agent prompt
 *     │  calls query() via @anthropic-ai/claude-agent-sdk
 *     ▼
 *   alice-eng-comms agent (Claude subprocess)
 *     │  reads comms, fetches issues via gh, writes stubs
 *     │  inherits process.env → API key + base URL passthrough
 *     ▼
 *   open-architecture/ (docs-as-code DAG) + state.json
 */

import { query } from "npm:@anthropic-ai/claude-agent-sdk";

const ORG_ROOT = new URL("..", import.meta.url).pathname;
const STATE_PATH =
  `${ORG_ROOT}open-architecture/.claude/agent-memory/alice-eng-comms/state.json`;
const AGENT_PATH =
  `${ORG_ROOT}open-architecture/.claude/agents/alice-eng-comms.md`;
const OPEN_ARCH = `${ORG_ROOT}open-architecture`;
const TOTAL_COMMS = 691;

const DRY_RUN = Deno.args.includes("--dry-run");
const VERBOSE = Deno.args.includes("--verbose");
const MAX_BATCHES = (() => {
  const idx = Deno.args.indexOf("--max-batches");
  return idx >= 0 ? parseInt(Deno.args[idx + 1]) : Infinity;
})();

interface AgentState {
  lastProcessedComm: number;
  processedComms: number[];
  concepts?: Record<string, unknown>;
  totalStubsCreated?: number;
  totalIssuesFetched?: number;
  issueCache?: Record<string, unknown>;
  lastBatchSize?: number;
}

// ── Structured JSON logging ────────────────────────────────────────────────

type LogLevel = "info" | "warn" | "error" | "debug";
type LogEvent =
  | "startup"
  | "banner"
  | "batch_start"
  | "batch_dry_run"
  | "agent_invoke"
  | "agent_done"
  | "agent_error"
  | "agent_state_stale"
  | "state_diff"
  | "commit"
  | "commit_error"
  | "progress"
  | "done";

interface LogLine {
  ts: string;
  level: LogLevel;
  event: LogEvent;
  data?: Record<string, unknown>;
}

function emit(level: LogLevel, event: LogEvent, data?: Record<string, unknown>) {
  const line: LogLine = { ts: new Date().toISOString(), level, event };
  if (data) line.data = data;
  console.log(JSON.stringify(line));
}

function banner(title: string) {
  emit("info", "banner", { title });
}

async function readState(): Promise<AgentState> {
  const raw = await Deno.readTextFile(STATE_PATH);
  return JSON.parse(raw);
}

async function loadAgentSystemPrompt(): Promise<string> {
  const raw = await Deno.readTextFile(AGENT_PATH);
  const parts = raw.split("---");
  return parts.slice(1).join("---").trim();
}

async function git(args: string[], cwd: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
  const cmd = new Deno.Command("git", { args, cwd });
  const r = await cmd.output();
  return {
    success: r.success,
    stdout: new TextDecoder().decode(r.stdout),
    stderr: new TextDecoder().decode(r.stderr),
  };
}

async function commit(message: string): Promise<void> {
  await git(["add", "open-architecture/"], ORG_ROOT);
  const r = await git(["commit", "-m", message], ORG_ROOT);
  if (!r.success) {
    emit("error", "commit_error", { message: message.substring(0, 80), stderr: r.stderr.trim() });
    throw new Error(`git commit failed: ${r.stderr}`);
  }
  emit("info", "commit", { message: message.substring(0, 80), hash: r.stdout.trim().split("\n")[0] });
}

// ── Batch runner ────────────────────────────────────────────────────────────

async function runBatch(batchNumber: number): Promise<boolean> {
  const before = await readState();
  const nextComm = before.lastProcessedComm + 1;

  if (nextComm >= TOTAL_COMMS) {
    emit("info", "done", { reason: "all_comms_processed", total: TOTAL_COMMS });
    return false;
  }

  const start = nextComm;
  const end = Math.min(start + 24, TOTAL_COMMS - 1);
  const count = end - start + 1;
  const paddedStart = String(start).padStart(4, "0");
  const paddedEnd = String(end).padStart(4, "0");
  const remaining = TOTAL_COMMS - start;

  banner(`Batch #${batchNumber}: comms ${paddedStart}–${paddedEnd} (${count} comms, ${remaining} left)`);

  emit("info", "batch_start", {
    batch: batchNumber,
    start: paddedStart,
    end: paddedEnd,
    count,
    remaining,
    lastProcessedComm: before.lastProcessedComm,
    conceptsTracked: Object.keys(before.concepts ?? {}).length,
    stubsCreated: before.totalStubsCreated ?? 0,
    issuesFetched: before.totalIssuesFetched ?? 0,
  });

  if (DRY_RUN) {
    const prompt = await loadAgentSystemPrompt();
    emit("info", "batch_dry_run", { promptChars: prompt.length, start: paddedStart, end: paddedEnd });
    return false;
  }

  const systemPrompt = await loadAgentSystemPrompt();
  const prompt = [
    systemPrompt,
    "",
    `Process comms ${paddedStart} through ${paddedEnd} (${count} comms).`,
    `State file: ${STATE_PATH}`,
    `Comms dir: ${ORG_ROOT}dffml/docs/discussions/alice_engineering_comms/`,
    `Stubs workspace: ${OPEN_ARCH}/`,
    "Read state.json to find the last processed comm and resume from there.",
  ].join("\n");

  if (VERBOSE) {
    emit("debug", "agent_invoke", {
      promptChars: prompt.length,
      promptPreview: prompt.substring(0, 300),
      hasApiKey: !!Deno.env.get("ANTHROPIC_API_KEY"),
      baseUrl: Deno.env.get("ANTHROPIC_BASE_URL") ?? "(default)",
    });
  } else {
    emit("info", "agent_invoke", {
      promptChars: prompt.length,
      hasApiKey: !!Deno.env.get("ANTHROPIC_API_KEY"),
      baseUrl: Deno.env.get("ANTHROPIC_BASE_URL") ?? "(default)",
    });
  }

  const startTime = Date.now();

  try {
    const asyncIterableOrResult = await query({
      prompt,
      options: {
        maxTurns: 100,
        allowedTools: [
          "Read",
          "Write",
          "Edit",
          "Grep",
          "Glob",
          "Bash",
          "WebFetch",
        ],
        permissionMode: "bypassPermissions",
        cwd: ORG_ROOT,
        includePartialMessages: true,
      },
    });

    // Stream partial messages in verbose mode
    if (
      VERBOSE &&
      asyncIterableOrResult &&
      typeof asyncIterableOrResult === "object" &&
      Symbol.asyncIterator in asyncIterableOrResult
    ) {
      for await (const msg of asyncIterableOrResult as AsyncIterable<Record<string, unknown>>) {
        const type = msg.type as string | undefined;
        if (type === "assistant" || type === "result") {
          const content = String(
            (msg as { message?: { content?: unknown } }).message?.content ??
              msg.content ?? "",
          );
          emit("debug", "agent_invoke", { streamEvent: type, textPreview: content.substring(0, 300) });
        } else if (type === "tool_use") {
          emit("debug", "agent_invoke", {
            streamEvent: "tool_use",
            tool: (msg as { name?: string }).name,
            inputPreview: JSON.stringify((msg as { input?: unknown }).input).substring(0, 200),
          });
        }
      }
    }

    const elapsedMs = Date.now() - startTime;
    emit("info", "agent_done", { elapsedMs, elapsedS: (elapsedMs / 1000).toFixed(1) });

    // Verify state advanced
    const after = await readState();
    if (after.lastProcessedComm <= before.lastProcessedComm) {
      emit("warn", "agent_state_stale", {
        before: before.lastProcessedComm,
        after: after.lastProcessedComm,
      });
      return false;
    }

    const progressed = after.lastProcessedComm - before.lastProcessedComm;
    const newConcepts =
      Object.keys(after.concepts ?? {}).length -
      Object.keys(before.concepts ?? {}).length;
    const newIssues =
      (after.totalIssuesFetched ?? 0) - (before.totalIssuesFetched ?? 0);
    const newStubs =
      (after.totalStubsCreated ?? 0) - (before.totalStubsCreated ?? 0);
    const totalProgress = after.lastProcessedComm + 1;
    const pct = ((totalProgress / TOTAL_COMMS) * 100).toFixed(1);

    emit("info", "state_diff", {
      progressed,
      newConcepts,
      newStubs,
      newIssues,
      totalProgress,
      totalComms: TOTAL_COMMS,
      pct: Number(pct),
      totalStubs: after.totalStubsCreated ?? 0,
      totalConcepts: Object.keys(after.concepts ?? {}).length,
      totalIssues: after.totalIssuesFetched ?? 0,
    });

    await commit(
      `feat(agent): process eng comms ${paddedStart}–${paddedEnd} ` +
        `${pct}% — ${newConcepts} concepts, ${newStubs} stubs, ${newIssues} issues`,
    );

    return after.lastProcessedComm < TOTAL_COMMS - 1;
  } catch (err) {
    const elapsedMs = Date.now() - startTime;
    emit("error", "agent_error", {
      elapsedMs,
      elapsedS: (elapsedMs / 1000).toFixed(1),
      error: (err as Error).message,
    });
    if (VERBOSE) console.error(JSON.stringify({ ts: new Date().toISOString(), level: "error", event: "agent_error_stack", data: { stack: (err as Error).stack } }));
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  emit("info", "startup", {
    openArch: OPEN_ARCH,
    statePath: STATE_PATH,
    agentPath: AGENT_PATH,
    totalComms: TOTAL_COMMS,
    hasApiKey: !!Deno.env.get("ANTHROPIC_API_KEY"),
    baseUrl: Deno.env.get("ANTHROPIC_BASE_URL") ?? "(default)",
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    maxBatches: MAX_BATCHES === Infinity ? "unlimited" : MAX_BATCHES,
  });

  let batches = 0;
  let keepGoing = true;

  while (keepGoing && batches < MAX_BATCHES) {
    batches++;
    keepGoing = await runBatch(batches);
  }

  const final = await readState();
  const pct = (((final.lastProcessedComm + 1) / TOTAL_COMMS) * 100).toFixed(1);

  banner(
    `Done. ${batches} batches, ${final.lastProcessedComm + 1}/${TOTAL_COMMS} (${pct}%) comms processed.`,
  );

  emit("info", "done", {
    batches,
    commsProcessed: final.lastProcessedComm + 1,
    totalComms: TOTAL_COMMS,
    pct: Number(pct),
    totalStubs: final.totalStubsCreated ?? 0,
    totalIssues: final.totalIssuesFetched ?? 0,
    totalConcepts: Object.keys(final.concepts ?? {}).length,
  });
}

main();
