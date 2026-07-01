/**
 * Deterministic loop: process all Alice engineering comms through the
 * alice-eng-comms agent, one batch per iteration, until every comm (0000–0690)
 * has been processed.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-run --allow-sys --allow-env \
 *     scripts/process-eng-comms.ts [--dry-run] [--max-batches N]
 *
 * Each iteration:
 * 1. Reads state.json to find the next unprocessed comm.
 * 2. Invokes the alice-eng-comms agent via the Claude Agent SDK.
 * 3. Commits the resulting stub + state changes.
 * 4. Repeats until all 691 comms are done.
 *
 * Run inside a Claude Code session or from the terminal. The SDK spawns Claude
 * Code as a subprocess for each batch.
 */

import { query } from "npm:@anthropic-ai/claude-agent-sdk";

const ORG_ROOT = new URL("..", import.meta.url).pathname;
const STATE_PATH = `${ORG_ROOT}open-architecture/.claude/agent-memory/alice-eng-comms/state.json`;
const AGENT_PATH = `${ORG_ROOT}open-architecture/.claude/agents/alice-eng-comms.md`;
const OPEN_ARCH = `${ORG_ROOT}open-architecture`;
const TOTAL_COMMS = 691;

const DRY_RUN = Deno.args.includes("--dry-run");
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
}

async function readState(): Promise<AgentState> {
  const raw = await Deno.readTextFile(STATE_PATH);
  return JSON.parse(raw);
}

/**
 * Read the agent definition markdown file and extract the system prompt
 * (everything after the frontmatter `---` separator).
 */
async function loadAgentSystemPrompt(): Promise<string> {
  const raw = await Deno.readTextFile(AGENT_PATH);
  const parts = raw.split("---");
  // Frontmatter = parts[0], system prompt = parts.slice(1).join("---")
  return parts.slice(1).join("---").trim();
}

async function commit(message: string): Promise<void> {
  const cwd = ORG_ROOT;
  const add = new Deno.Command("git", { args: ["add", "open-architecture/"], cwd });
  await add.output();

  const cmt = new Deno.Command("git", {
    args: ["commit", "-m", message],
    cwd,
  });
  const result = await cmt.output();
  if (!result.success) {
    throw new Error(`git commit failed: ${new TextDecoder().decode(result.stderr)}`);
  }
  console.log(`  committed: ${message.substring(0, 80)}...`);
}

async function runBatch(): Promise<boolean> {
  const before = await readState();
  const nextComm = before.lastProcessedComm + 1;

  if (nextComm >= TOTAL_COMMS) {
    console.log(`All ${TOTAL_COMMS} comms processed. Done.`);
    return false;
  }

  const start = nextComm;
  const end = Math.min(start + 24, TOTAL_COMMS - 1);
  const paddedStart = String(start).padStart(4, "0");
  const paddedEnd = String(end).padStart(4, "0");

  console.log(
    `\nBatch: comms ${paddedStart}–${paddedEnd} (${end - start + 1} comms) — ${TOTAL_COMMS - start} remaining`,
  );

  if (DRY_RUN) {
    console.log("  [dry-run] would invoke agent with system prompt from alice-eng-comms.md");
    console.log(`  prompt length: ${(await loadAgentSystemPrompt()).length} chars`);
    return false; // dry-run: stop after one iteration
  }

  const systemPrompt = await loadAgentSystemPrompt();
  const prompt = [
    systemPrompt,
    "",
    `Process comms ${paddedStart} through ${paddedEnd}.`,
    `State file: ${STATE_PATH}`,
    `Comms dir: ${ORG_ROOT}dffml/docs/discussions/alice_engineering_comms/`,
    `Stubs workspace: ${OPEN_ARCH}/`,
    "Read state.json to find the last processed comm and resume from there.",
  ].join("\n");

  console.log("  invoking agent...");
  const startTime = Date.now();

  try {
    const result = await query({
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
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  agent finished in ${elapsed}s`);

    // Verify state advanced
    const after = await readState();
    if (after.lastProcessedComm <= before.lastProcessedComm) {
      console.log(
        `  WARNING: state did not advance (was ${before.lastProcessedComm}, still ${after.lastProcessedComm})`,
      );
    } else {
      console.log(
        `  progress: ${after.lastProcessedComm + 1} / ${TOTAL_COMMS} comms`,
      );

      // Commit
      const newStubs =
        Object.keys(after.concepts || {}).length -
        Object.keys(before.concepts || {}).length;
      const newIssues =
        (after.totalIssuesFetched || 0) - (before.totalIssuesFetched || 0);

      await commit(
        `feat(agent): process eng comms ${paddedStart}–${paddedEnd} ` +
          `— ${newStubs} concepts, ${newIssues} issues`,
      );
    }

    return after.lastProcessedComm < TOTAL_COMMS - 1;
  } catch (err) {
    console.log(`  ERROR: ${(err as Error).message}`);
    return false; // stop on error
  }
}

// Main loop
async function main() {
  console.log(`Processing eng comms → ${OPEN_ARCH}`);
  console.log(`State: ${STATE_PATH}`);
  if (DRY_RUN) console.log("[dry-run mode]");

  let batches = 0;
  let keepGoing = true;

  while (keepGoing && batches < MAX_BATCHES) {
    batches++;
    keepGoing = await runBatch();
  }

  const final = await readState();
  console.log(
    `\nDone. ${batches} batches, ${final.lastProcessedComm + 1} / ${TOTAL_COMMS} comms processed.`,
  );
}

main();
