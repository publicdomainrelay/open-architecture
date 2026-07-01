/**
 * Architecture report generator: deterministic data + AI-formatted report.
 *
 * Usage:
 *   deno run --allow-read --allow-run --allow-sys --allow-env \
 *     scripts/report-alice-architecture.ts [--json] [--mode caveman-full]
 *
 * --json:    raw gathered data (skip AI report generation)
 * --mode:    "caveman-full" (default), "caveman-lite", "normal"
 */

import { query } from "npm:@anthropic-ai/claude-agent-sdk";

const ORG_ROOT = new URL("..", import.meta.url).pathname;
const OPEN_ARCH = new URL("..", import.meta.url).pathname;
const STATE_PATH = `${OPEN_ARCH}/.claude/agent-memory/alice-eng-comms/state.json`;
const LOG_PATH = "/tmp/alice-run.log";

const JSON_ONLY = Deno.args.includes("--json");
const MODE = (() => {
  const idx = Deno.args.indexOf("--mode");
  return idx >= 0 ? Deno.args[idx + 1] : "caveman-full";
})();

async function gatherState() {
  const s = JSON.parse(await Deno.readTextFile(STATE_PATH));
  return {
    commsProcessed: s.lastProcessedComm + 1,
    totalComms: 691,
    pct: ((s.lastProcessedComm + 1) / 691 * 100),
    concepts: Object.keys(s.concepts ?? {}).length,
    stubs: s.totalStubsCreated ?? 0,
    issues: s.totalIssuesFetched ?? 0,
  };
}

async function gatherPackages(): Promise<Record<string, number>> {
  const pkgs = [
    "alice-trust", "alice-supply-chain", "alice-system-context",
    "alice-compute-contract", "alice-communication",
    "alice-stream-of-consciousness", "alice",
  ];
  const counts: Record<string, number> = {};
  for (const pkg of pkgs) {
    try {
      const text = await Deno.readTextFile(`${OPEN_ARCH}/lib/abc/${pkg}/mod.ts`);
      counts[pkg] = (text.match(/export function/g) ?? []).length;
    } catch { counts[pkg] = 0; }
  }
  try {
    const text = await Deno.readTextFile(`${OPEN_ARCH}/lib/common/alice-common/mod.ts`);
    counts["alice-common"] = (text.match(/export (interface|type)/g) ?? []).length;
  } catch { counts["alice-common"] = 0; }
  return counts;
}

async function gatherBatchHistory(): Promise<Array<Record<string, unknown>>> {
  const history: Array<Record<string, unknown>> = [];
  try {
    for (const line of (await Deno.readTextFile(LOG_PATH)).split("\n")) {
      if (line.includes('"event":"phase2_done"')) {
        const d = JSON.parse(line).data;
        history.push({
          conceptsFound: d.conceptsFound,
          elapsedS: Number(d.elapsedS),
          newCount: d.newCount ?? d.conceptsFound,
          refinementCount: d.refinementCount ?? 0,
          attempts: d.attempts ?? 1,
        });
      }
    }
  } catch { /* no log file */ }
  return history.slice(-10);
}

function extractEventText(event: Record<string, unknown>): string {
  const se = (event.event ?? event.delta) as Record<string, unknown> | undefined;
  if (se?.delta && typeof se.delta === "object") {
    return (se.delta as { text?: string }).text ?? "";
  }
  const msg = event.message as { content?: unknown } | undefined;
  if (msg?.content) {
    if (Array.isArray(msg.content)) {
      return (msg.content as Array<{ text?: string }>)
        .map((b) => b.text ?? "").join("");
    }
    return String(msg.content);
  }
  return "";
}

async function main() {
  const data = {
    state: await gatherState(),
    packages: await gatherPackages(),
    batchHistory: await gatherBatchHistory(),
  };

  if (JSON_ONLY) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const prompts: Record<string, string> = {
    "caveman-full": `FIRST: call codegraph_node navigatingThisCodebase to learn the package layout
and how to navigate this codebase. Use that as your map.

CRITICAL: after getting the layout, call codegraph_explore for EVERY key function
to build a FULL call graph across all packages. Minimum: explore puttingItTogether,
doITrustWhereThisCameFrom, gatekeeper, getMyWorkRun, onEvent, entityAnalysisTrinity,
herRepositoryIsHerVoice, describeTheSystemAsData. Each explore returns the call chain
for that subsystem. Build a complete tree in the report.

Then write a caveman-mode architecture report. Rules:
- NO articles, filler, pleasantries, hedging. Fragments OK.
- Short synonyms. Technical terms exact.
- Include: state nums, package sizes as ASCII bars, FULL call graphs for EVERY subsystem, batch history.
- DO NOT list a flat symbol inventory. Show CONNECTIONS.
- For EACH subsystem, include a MERMAID diagram showing the call graph.
  Use a mermaid code block with graph TD or flowchart. Nodes = function names. Edges = calls.
- After each mermaid diagram, include a brief text tree for readability.
- Use text fences. Wrap at 60 chars for text, unlimited for mermaid.
- Every fact from the provided data. No speculation.`,

    "caveman-lite": `FIRST: codegraph_node navigatingThisCodebase. Then write a SHORT caveman architecture report. Under 15 lines. Only key numbers and 1-2 call paths. No fluff.`,

    "normal": `FIRST: codegraph_node navigatingThisCodebase. Then write a clear architecture report from the provided data. Include state, package sizes, and batch history. Use headings and bullet points. No caveman style.`,
  };

  const focusQuery = Deno.args.find((a) => !a.startsWith("--") && a !== MODE) ?? "";
  const systemPrompt = prompts[MODE] ?? prompts["caveman-full"];

  let prompt = `${systemPrompt}\n\nData:\n${JSON.stringify(data, null, 2)}`;
  const tools = ["codegraph_explore", "codegraph_node"];
  let maxTurns = 20;

  if (focusQuery) {
    maxTurns = 30;
    prompt = `${systemPrompt}

IMPORTANT: focus on this area of the architecture: "${focusQuery}"
Use codegraph_explore and codegraph_node to explore the relevant stubs,
their call graphs, and their JSDoc. Include the call paths you find.

Data:\n${JSON.stringify(data, null, 2)}`;
  }

  console.error(`mode: ${MODE} | focus: "${focusQuery || "(none)"}" | state: ${data.state.commsProcessed}/${data.state.totalComms} (${data.state.pct.toFixed(1)}%)`);
  console.error("calling agent for report...\n");

  const session = await query({
    prompt,
    options: {
      maxTurns,
      allowedTools: tools,
      permissionMode: "bypassPermissions",
      cwd: ORG_ROOT,
      includePartialMessages: true,
    },
  });

  for await (const event of session as unknown as AsyncIterable<Record<string, unknown>>) {
    const txt = extractEventText(event);
    if (txt) Deno.stdout.writeSync(new TextEncoder().encode(txt));
  }
}

main();
