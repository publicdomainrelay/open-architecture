/**
 * Deterministic loop: process all Alice engineering comms through the
 * alice-eng-comms agent, one batch per iteration, until every comm (0000–0690)
 * processed.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-run --allow-sys --allow-env \
 *     scripts/process-eng-comms.ts [--dry-run] [--max-batches N] [--verbose]
 *
 * ## Architecture
 *
 * This script + the alice-eng-comms agent form a two-level system:
 *
 *   ┌──────────────────────────────────────────┐
 *   │  process-eng-comms.ts (orchestrator)     │
 *   │  - reads state.json                      │
 *   │  - computes batch range                  │
 *   │  - loads agent system prompt from .md    │
 *   │  - calls query() via Claude Agent SDK    │
 *   │  - commits after each batch              │
 *   │  - loops until comm 0690 done            │
 *   └──────────────┬───────────────────────────┘
 *                  │ SDK query(prompt, options)
 *                  ▼
 *   ┌──────────────────────────────────────────┐
 *   │  alice-eng-comms agent (Claude subprocess)│
 *   │  - reads comm markdown files             │
 *   │  - extracts issue/PR refs via grep       │
 *   │  - fetches issues via gh CLI             │
 *   │  - identifies concepts from headings     │
 *   │  - writes stubs to open-architecture/    │
 *   │  - updates state.json                    │
 *   │  - runs deno check                       │
 *   └──────────────┬───────────────────────────┘
 *                  │ stdout/stderr
 *                  ▼
 *   ┌──────────────────────────────────────────┐
 *   │  orchestrator captures + logs output     │
 *   │  commits changes to git                  │
 *   │  advances to next batch                  │
 *   └──────────────────────────────────────────┘
 *
 * ## Environment passthrough
 *
 * The SDK spawns Claude Code as a subprocess using its bundled executable
 * (claude-agent-sdk-darwin-arm64/.../claude). When `options.env` is omitted,
 * the subprocess inherits `process.env` — so ANTHROPIC_API_KEY,
 * ANTHROPIC_BASE_URL, and any other env vars pass through unchanged.
 * No extra config needed; the agent uses the same auth as the parent.
 */

import { query, HOOK_EVENTS } from "npm:@anthropic-ai/claude-agent-sdk";

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

/** Timestamp for log lines. */
const ts = () => new Date().toISOString().replace("T", " ").substring(0, 19);

function log(...args: unknown[]) {
  console.log(`[${ts()}]`, ...args);
}

function banner(msg: string) {
  const line = "━".repeat(60);
  console.log(`\n${line}\n  ${msg}\n${line}`);
}

async function readState(): Promise<AgentState> {
  const raw = await Deno.readTextFile(STATE_PATH);
  return JSON.parse(raw);
}

/** Read the agent definition file, extract system prompt after --- separator. */
async function loadAgentSystemPrompt(): Promise<string> {
  const raw = await Deno.readTextFile(AGENT_PATH);
  const parts = raw.split("---");
  return parts.slice(1).join("---").trim();
}

async function commit(message: string): Promise<void> {
  const cwd = ORG_ROOT;
  const add = new Deno.Command("git", {
    args: ["add", "open-architecture/"],
    cwd,
  });
  await add.output();

  const cmt = new Deno.Command("git", { args: ["commit", "-m", message], cwd });
  const r = await cmt.output();
  if (!r.success) {
    throw new Error(`git commit failed: ${new TextDecoder().decode(r.stderr)}`);
  }
  log(`  ✓ committed: ${message.substring(0, 80)}`);
}

/**
 * Run one batch. Returns true if more batches remain.
 *
 * Subprocess inherits process.env → ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL,
 * etc. all pass through to the Claude Code executable bundled in the SDK.
 */
async function runBatch(batchNumber: number): Promise<boolean> {
  const before = await readState();
  const nextComm = before.lastProcessedComm + 1;

  if (nextComm >= TOTAL_COMMS) {
    log(`✓ All ${TOTAL_COMMS} comms processed.`);
    return false;
  }

  const start = nextComm;
  const end = Math.min(start + 24, TOTAL_COMMS - 1);
  const count = end - start + 1;
  const paddedStart = String(start).padStart(4, "0");
  const paddedEnd = String(end).padStart(4, "0");
  const remaining = TOTAL_COMMS - start;

  banner(
    `Batch #${batchNumber}: comms ${paddedStart}–${paddedEnd} (${count} comms, ${remaining} left)`,
  );
  log(`  state: lastProcessedComm=${before.lastProcessedComm}`);
  log(`  concepts tracked: ${Object.keys(before.concepts ?? {}).length}`);
  log(`  stubs created so far: ${before.totalStubsCreated ?? 0}`);
  log(`  issues fetched so far: ${before.totalIssuesFetched ?? 0}`);

  if (DRY_RUN) {
    const prompt = await loadAgentSystemPrompt();
    log(`  [dry-run] system prompt: ${prompt.length} chars`);
    log(`  [dry-run] would process ${paddedStart}–${paddedEnd}`);
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
    log(`  prompt: ${prompt.length} chars total`);
    log(`  prompt preview: ${prompt.substring(0, 200)}...`);
  }

  log("  → invoking agent (Claude SDK subprocess)...");
  log("    env passthrough: ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL, etc.");
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
        // env NOT set — subprocess inherits process.env
      },
    });

    // The SDK returns different shapes depending on options. Try async iterable first.
    if (
      asyncIterableOrResult &&
      typeof asyncIterableOrResult === "object" &&
      Symbol.asyncIterator in asyncIterableOrResult
    ) {
      log("  streaming output:");
      for await (const msg of asyncIterableOrResult as AsyncIterable<unknown>) {
        if (VERBOSE) {
          const m = msg as Record<string, unknown>;
          if (m.type === "assistant" || m.type === "result") {
            const text = String((m as { message?: { content?: unknown } }).message?.content ?? m.content ?? "")
              .substring(0, 200);
            log(`    [${m.type}] ${text}`);
          } else if (m.type === "tool_use") {
            log(`    [tool] ${(m as { name?: string }).name} ${JSON.stringify((m as { input?: unknown }).input).substring(0, 120)}`);
          }
        }
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`  ✓ agent finished in ${elapsed}s`);

    // Verify state advanced
    const after = await readState();
    if (after.lastProcessedComm <= before.lastProcessedComm) {
      log(
        `  ⚠ state did not advance (was ${before.lastProcessedComm}, still ${after.lastProcessedComm})`,
      );
      return false;
    }

    const progressed = after.lastProcessedComm - before.lastProcessedComm;
    const newStubs =
      Object.keys(after.concepts ?? {}).length -
      Object.keys(before.concepts ?? {}).length;
    const newIssues =
      (after.totalIssuesFetched ?? 0) - (before.totalIssuesFetched ?? 0);
    const totalProgress = after.lastProcessedComm + 1;
    const pct = ((totalProgress / TOTAL_COMMS) * 100).toFixed(1);

    log(`  progress: ${totalProgress}/${TOTAL_COMMS} (${pct}%) — +${progressed} this batch`);
    log(`  new concepts: ${newStubs}, issues fetched: ${newIssues}`);
    log(`  total stubs: ${after.totalStubsCreated ?? 0}, total concepts: ${Object.keys(after.concepts ?? {}).length}`);

    await commit(
      `feat(agent): process eng comms ${paddedStart}–${paddedEnd} ` +
        `${pct}% — ${newStubs} concepts, ${newIssues} issues`,
    );

    return after.lastProcessedComm < TOTAL_COMMS - 1;
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`  ✗ ERROR after ${elapsed}s: ${(err as Error).message}`);
    if (VERBOSE) console.error(err);
    return false;
  }
}

async function main() {
  banner("Alice Eng-Comms Processor");
  log(`open-architecture: ${OPEN_ARCH}`);
  log(`state: ${STATE_PATH}`);
  log(`agent definition: ${AGENT_PATH}`);
  log(`total comms: ${TOTAL_COMMS}`);
  log(`env passthrough: ANTHROPIC_API_KEY=${Deno.env.get("ANTHROPIC_API_KEY") ? "✓ set" : "✗ missing"}`);
  log(` ANTHROPIC_BASE_URL=${Deno.env.get("ANTHROPIC_BASE_URL") ?? "(default)"}`);
  if (DRY_RUN) log("[dry-run mode — no agent invoked, no commits]");
  if (VERBOSE) log("[verbose mode]");
  log(`max batches: ${MAX_BATCHES === Infinity ? "unlimited" : MAX_BATCHES}`);

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
  log(`total stubs: ${final.totalStubsCreated ?? 0}`);
  log(`total issues: ${final.totalIssuesFetched ?? 0}`);
  log(`concepts: ${Object.keys(final.concepts ?? {}).length}`);
}

main();
