/**
 * Deterministic loop with AI-inference-only agent calls.
 *
 * Phase 1 (deterministic): read state, comms (compressed), extract issues,
 *   fetch + cache.
 * Phase 2 (AI inference): single agent call, compressed input → JSON output.
 *   Uses native system prompt from alice-eng-comms.md. No JSON narration.
 * Phase 3 (deterministic): write stubs, wire imports, deno check, commit.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-run --allow-sys --allow-env \
 *     scripts/process-eng-comms.ts [--dry-run] [--max-batches N] [--verbose]
 */

import { query } from "npm:@anthropic-ai/claude-agent-sdk";

const ORG_ROOT = new URL("..", import.meta.url).pathname;
const COMMS_DIR =
  `${ORG_ROOT}dffml/docs/discussions/alice_engineering_comms/`;
const STATE_PATH =
  `${ORG_ROOT}open-architecture/.claude/agent-memory/alice-eng-comms/state.json`;
const AGENT_PATH =
  `${ORG_ROOT}open-architecture/.claude/agents/alice-eng-comms.md`;
const OPEN_ARCH = `${ORG_ROOT}open-architecture`;
const CACHE_DIR = `${OPEN_ARCH}/.cache`;
const TOTAL_COMMS = 691;
const BATCH_SIZE = 8;

const DRY_RUN = Deno.args.includes("--dry-run");
const VERBOSE = Deno.args.includes("--verbose");
const MAX_BATCHES = (() => {
  const idx = Deno.args.indexOf("--max-batches");
  return idx >= 0 ? parseInt(Deno.args[idx + 1]) : Infinity;
})();

// ── Types ───────────────────────────────────────────────────────────────────

interface AgentState {
  lastProcessedComm: number;
  processedComms: number[];
  concepts: Record<string, ConceptEntry>;
  totalStubsCreated: number;
  totalIssuesFetched: number;
  issueCache: Record<string, IssueCacheEntry>;
  lastBatchSize: number;
}

interface ConceptEntry {
  functionName: string;
  filePath: string;
  lastUpdatedComm: number;
  sourceIssues: string[];
  summary: string;
}

interface IssueCacheEntry {
  fetchedAt: string;
  title: string;
  commentCount: number;
  cacheFile: string;
}

interface PreparedComm {
  dir: string;
  summary: string; // compressed: headings + first meaningful paragraph
  issueRefs: string[];
}

interface PreparedIssue {
  ref: string;
  title: string;
  body: string;
  comments: { author: string; body: string; createdAt: string }[];
  labels: string[];
}

interface AgentInput {
  batchStart: number;
  batchEnd: number;
  existingConceptNames: string[];
  comms: PreparedComm[];
  issues: PreparedIssue[];
}

interface AgentConcept {
  name: string;
  isRefinement: boolean;
  refinesConcept?: string;
  package: string;
  jsdoc: string;
  calls: string[];
  summary: string;
}

interface AgentOutput {
  concepts: AgentConcept[];
}

interface BatchMetrics {
  newConcepts: number;
  refinedConcepts: number;
  stubsCreated: number;
  stubsUpdated: number;
  typesAdded: number;
  issuesFetched: number;
  newPackages: string[];
}

// ── Structured JSON logging ────────────────────────────────────────────────

type LogLevel = "info" | "warn" | "error" | "debug";
type LogEvent =
  | "startup"
  | "banner"
  | "batch_start"
  | "batch_dry_run"
  | "phase1_start"
  | "phase1_done"
  | "phase2_start"
  | "phase2_stream"
  | "phase2_done"
  | "phase3_start"
  | "phase3_done"
  | "agent_error"
  | "agent_state_stale"
  | "commit"
  | "commit_error"
  | "deno_check"
  | "deno_check_error"
  | "done";

function emit(
  level: LogLevel,
  event: LogEvent,
  data?: Record<string, unknown>,
) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    data,
  }));
}

function banner(title: string) {
  emit("info", "banner", { title });
}

// ── Deterministic helpers ──────────────────────────────────────────────────

async function readState(): Promise<AgentState> {
  return JSON.parse(await Deno.readTextFile(STATE_PATH));
}

async function writeState(state: AgentState): Promise<void> {
  await Deno.writeTextFile(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

async function gitCmd(args: string[], cwd: string) {
  const r = await new Deno.Command("git", { args, cwd }).output();
  return {
    success: r.success,
    stdout: new TextDecoder().decode(r.stdout),
    stderr: new TextDecoder().decode(r.stderr),
  };
}

async function commit(message: string): Promise<void> {
  await gitCmd(["add", "open-architecture/"], ORG_ROOT);
  const r = await gitCmd(["commit", "-m", message], ORG_ROOT);
  if (!r.success) {
    emit("error", "commit_error", {
      message: message.substring(0, 80),
      stderr: r.stderr.trim(),
    });
    throw new Error(`git commit failed: ${r.stderr}`);
  }
  emit("info", "commit", {
    message: message.substring(0, 80),
    hash: r.stdout.trim().split("\n")[0],
  });
}

/**
 * Compress a comm's full text into a summary: all headings + first substantive
 * paragraph after each heading. Strips code blocks, CI logs, and boilerplate.
 */
function compressCommText(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let inCodeBlock = false;
  let headingLines = 0;

  for (const line of lines) {
    // Track code blocks
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      if (!inCodeBlock) continue; // skip closing fence, keep content
      continue;
    }
    if (inCodeBlock) continue;

    // Keep headings
    if (/^#{1,4}\s/.test(line)) {
      out.push(line);
      headingLines = 1;
      continue;
    }

    // Keep first N non-empty lines after a heading (ENG logs start with dates)
    if (headingLines > 0 && headingLines <= 10 && line.trim().length > 0) {
      // Skip CI/CD noise, emoji-only, bare URLs
      if (
        /^\[.*\]\(.*\)$/.test(line.trim()) && line.trim().length < 30
      ) continue;
      out.push(line);
      headingLines++;
      continue;
    }

    if (line.trim().length === 0 && headingLines > 0) {
      headingLines = 0;
    }
  }

  return out.join("\n").substring(0, 5000);
}

async function readComm(dirNum: number): Promise<PreparedComm | null> {
  const padded = String(dirNum).padStart(4, "0");
  const dir = `${COMMS_DIR}${padded}/`;

  const entries: string[] = [];
  try {
    for await (const e of Deno.readDir(dir)) {
      if (e.isFile && (e.name === "index.md" || e.name.startsWith("reply_"))) {
        entries.push(e.name);
      }
    }
  } catch { return null; }
  if (entries.length === 0) return null;

  let allText = "";
  for (const file of entries.sort()) {
    allText += await Deno.readTextFile(`${dir}${file}`) + "\n";
  }

  const summary = compressCommText(allText);
  if (summary.trim().length === 0) return null;

  const issueRefs = extractIssueRefs(allText);
  return { dir: padded, summary, issueRefs };
}

function extractIssueRefs(text: string): string[] {
  const refs = new Set<string>();
  for (const m of text.matchAll(/\bintel\/dffml#(\d+)\b/g)) refs.add(`intel/dffml#${m[1]}`);
  for (const m of text.matchAll(/https:\/\/github\.com\/intel\/dffml\/(issues|pull)\/(\d+)/g)) refs.add(`intel/dffml#${m[2]}`);
  for (const m of text.matchAll(/(?<![\/\w])#(\d{4,5})\b/g)) {
    if (!text.includes(`discussions/${m[1]}`)) refs.add(`intel/dffml#${m[1]}`);
  }
  return [...refs].sort();
}

async function fetchIssue(
  ref: string,
  issueCache: Record<string, IssueCacheEntry>,
): Promise<PreparedIssue | null> {
  const cached = issueCache[ref];
  const cacheFile = cached?.cacheFile ??
    `${CACHE_DIR}/intel-dffml-issue-${ref.split("#")[1]}.json`;

  try {
    const data = JSON.parse(await Deno.readTextFile(cacheFile));
    return {
      ref,
      title: data.title ?? "",
      body: (data.body ?? "").substring(0, 3000),
      comments: (data.comments ?? []).map((c: Record<string, unknown>) => ({
        author: (c.author as { login?: string })?.login ?? "unknown",
        body: String(c.body ?? "").substring(0, 1000),
        createdAt: c.createdAt ?? "",
      })),
      labels: (data.labels ?? []).map((l: Record<string, unknown>) => String(l.name ?? "")),
    };
  } catch { /* cache miss */ }

  const num = ref.split("#")[1];
  const isPR = ref.includes("/pull/");
  const r = await new Deno.Command("gh", {
    args: ["view", isPR ? "pr" : "issue", num, "--repo", "intel/dffml", "--json", "title,body,comments,labels,author,createdAt"],
    cwd: ORG_ROOT,
  }).output();
  if (!r.success) return null;

  const stdout = new TextDecoder().decode(r.stdout);
  await Deno.mkdir(CACHE_DIR, { recursive: true });
  await Deno.writeTextFile(cacheFile, stdout);

  const data = JSON.parse(stdout);
  return {
    ref,
    title: data.title ?? "",
    body: (data.body ?? "").substring(0, 3000),
    comments: (data.comments ?? []).map((c: Record<string, unknown>) => ({
      author: (c.author as { login?: string })?.login ?? "unknown",
      body: String(c.body ?? "").substring(0, 1000),
      createdAt: c.createdAt ?? "",
    })),
    labels: (data.labels ?? []).map((l: Record<string, unknown>) => String(l.name ?? "")),
  };
}

async function checkRateLimit(): Promise<number> {
  const r = await new Deno.Command("gh", {
    args: ["api", "rate_limit", "--jq", ".resources.core.remaining"],
    cwd: ORG_ROOT,
  }).output();
  return parseInt(new TextDecoder().decode(r.stdout).trim()) || 0;
}

// ── Phase 2: AI inference ──────────────────────────────────────────────────

function extractEventText(event: Record<string, unknown>): string {
  // stream_event: delta in event.event.delta
  const se = (event.event ?? event.delta) as Record<string, unknown> | undefined;
  if (se?.delta && typeof se.delta === "object") {
    const d = se.delta as { text?: string; thinking?: string };
    return d.text ?? d.thinking ?? "";
  }
  if (event.delta && typeof event.delta === "object") {
    const d = event.delta as { text?: string; thinking?: string };
    return d.text ?? d.thinking ?? "";
  }
  // assistant: content blocks
  const msg = event.message as { content?: unknown } | undefined;
  if (msg?.content) {
    if (Array.isArray(msg.content)) {
      return (msg.content as Array<{ text?: string; thinking?: string }>)
        .map((b) => b.text ?? b.thinking ?? "").join("");
    }
    return String(msg.content);
  }
  // result event
  if (typeof event.result === "string" && event.result.length > 0) return event.result;
  return "";
}

/** Read the agent system prompt from the definition file (single source). */
async function loadAgentSystemPrompt(): Promise<string> {
  const raw = await Deno.readTextFile(AGENT_PATH);
  const parts = raw.split("---");
  return parts.slice(1).join("---").trim();
}

async function aiInference(input: AgentInput): Promise<AgentOutput> {
  const agentPrompt = await loadAgentSystemPrompt();
  const inputJson = JSON.stringify(input, null, 2);
  const prompt = `${agentPrompt}\n\nInput:\n${inputJson}\n\nOUTPUT ONLY VALID JSON. No analysis. No markdown. No narration. If the input is sparse or empty, return {\"concepts\": []}. Do NOT explain what you are doing. Start your response with { and end with }. Use codegraph_explore or codegraph_node if you need to check existing concepts.`;

  emit("info", "phase2_start", {
    promptChars: prompt.length,
    comms: input.comms.length,
    issues: input.issues.length,
    existingConcepts: input.existingConceptNames.length,
  });

  const startTime = Date.now();
  let allText = "";
  let turnCount = 0;
  let lastStreamTime = Date.now();

  // Retry loop: if model narrates instead of outputting JSON, retry once
  for (let attempt = 1; attempt <= 2; attempt++) {
    const retryPrompt = attempt === 1
      ? prompt
      : `FAILED PREVIOUS ATTEMPT — you output narration instead of JSON. DO NOT DO THAT.\n\n${prompt}`;

    emit("info", "phase2_start", {
      promptChars: retryPrompt.length,
      comms: input.comms.length,
      issues: input.issues.length,
      existingConcepts: input.existingConceptNames.length,
      attempt,
    });

    const attemptStart = Date.now();
    let allText = "";
    let turnCount = 0;
    let lastStreamTime = Date.now();

    try {
      const session = await query({
        prompt: retryPrompt,
        options: {
          maxTurns: 30,
          allowedTools: ["codegraph_explore", "codegraph_node"],
          permissionMode: "bypassPermissions",
          cwd: ORG_ROOT,
          includePartialMessages: true,
        },
      });

    for await (const event of session as unknown as AsyncIterable<Record<string, unknown>>) {
      const txt = extractEventText(event);
      if (txt) allText += txt;

      const type = event.type as string;
      const now = Date.now();
      if (txt || now - lastStreamTime > 5000) {
        emit("info", "phase2_stream", {
          elapsedS: ((now - startTime) / 1000).toFixed(1),
          chars: allText.length,
          preview: txt ? txt.substring(0, 200).replace(/\n/g, " ") : "(thinking)",
        });
        lastStreamTime = now;
      }
      if (type === "result") {
        turnCount = (event as { num_turns?: number }).num_turns ?? turnCount;
      }
    }

    // Extract JSON — try fence then bare, trim trailing garbage, retry on failure
    let jsonText = "";
    const fenceMatch = allText.match(/```json\s*([\s\S]*?)```/);
    if (fenceMatch) jsonText = fenceMatch[1].trim();
    else { const bareMatch = allText.match(/\{[\s\S]*"concepts"[\s\S]*\}/); if (bareMatch) jsonText = bareMatch[0]; }
    // Strip trailing text after the last closing brace
    if (jsonText) {
      const lastBrace = jsonText.lastIndexOf("}");
      if (lastBrace > 0 && lastBrace < jsonText.length - 1) {
        jsonText = jsonText.substring(0, lastBrace + 1);
      }
    }

    if (!jsonText && attempt < 2) { emit("warn","agent_error",{attempt,reason:"no_json_retry"}); continue; }
    if (!jsonText) throw new Error("No JSON after 2 tries");

    let output;
    try { output = JSON.parse(jsonText); } catch(pe) {
      if (attempt < 2) { emit("warn","agent_error",{attempt,reason:"parse_retry"}); continue; }
      throw pe;
    }
    if (!output.concepts?.length) {
      if (attempt < 2) { emit("warn","agent_error",{attempt,reason:"no_concepts_retry"}); continue; }
      throw new Error("Missing concepts array");
    }

    emit("info","phase2_done",{elapsedMs:Date.now()-startTime,elapsedS:((Date.now()-startTime)/1000).toFixed(1),turns:turnCount,responseChars:allText.length,conceptsFound:output.concepts.length,newCount:output.concepts.filter((c: AgentConcept) => !c.isRefinement).length,refinementCount:output.concepts.filter((c: AgentConcept) => c.isRefinement).length,attempts:attempt});
    return output;
  } catch (innerErr: unknown) {
    if (attempt < 2) { emit("warn", "agent_error", { attempt, reason: "stream_err_retry" }); continue; }
    const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
    emit("error", "agent_error", { elapsedMs: Date.now() - startTime, elapsedS: ((Date.now() - startTime) / 1000).toFixed(1), error: msg, charsReceived: allText.length });
    throw innerErr;
  }
  } // for loop
  throw new Error("unreachable");
}
function buildStubFunction(concept: AgentConcept): string {
  const lines = ["/**"];
  for (const line of concept.jsdoc.split("\n")) lines.push(` * ${line}`);
  lines.push(" */");
  lines.push(`export function ${concept.name}(): void {`);
  if (concept.calls.length > 0) {
    lines.push(`  // Related: ${concept.calls.join(", ")}`);
  } else {
    lines.push("  // TODO: wire to related concepts");
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

function packageFilePath(pkg: string): string {
  const map: Record<string, string> = {
    "alice-trust": `${OPEN_ARCH}/lib/abc/alice-trust/mod.ts`,
    "alice-system-context": `${OPEN_ARCH}/lib/abc/alice-system-context/mod.ts`,
    "alice-communication": `${OPEN_ARCH}/lib/abc/alice-communication/mod.ts`,
    "alice-compute-contract": `${OPEN_ARCH}/lib/abc/alice-compute-contract/mod.ts`,
    "alice-supply-chain": `${OPEN_ARCH}/lib/abc/alice-supply-chain/mod.ts`,
    "alice-stream-of-consciousness": `${OPEN_ARCH}/lib/abc/alice-stream-of-consciousness/mod.ts`,
    "alice": `${OPEN_ARCH}/lib/abc/alice/mod.ts`,
  };
  return map[pkg] ?? `${OPEN_ARCH}/lib/abc/${pkg}/mod.ts`;
}

function packageName(pkg: string): string {
  const map: Record<string, string> = {
    "alice-trust": "@publicdomainrelay/alice-trust-abc",
    "alice-system-context": "@publicdomainrelay/alice-system-context-abc",
    "alice-communication": "@publicdomainrelay/alice-communication-abc",
    "alice-compute-contract": "@publicdomainrelay/alice-compute-contract-abc",
    "alice-supply-chain": "@publicdomainrelay/alice-supply-chain-abc",
    "alice-stream-of-consciousness": "@publicdomainrelay/alice-stream-of-consciousness-abc",
    "alice": "@publicdomainrelay/alice-abc",
  };
  return map[pkg] ?? `@publicdomainrelay/${pkg}-abc`;
}

function findFunctionInSource(source: string, functionName: string): string | null {
  const pattern = new RegExp(
    `(?:\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?export\\s+function\\s+${functionName}\\s*\\([^)]*\\)[^{]*\\{[^}]*\\}`,
    "m",
  );
  const match = source.match(pattern);
  return match ? match[0] : null;
}

async function createPackage(pkg: string): Promise<void> {
  const dir = `${OPEN_ARCH}/lib/abc/${pkg}`;
  await Deno.mkdir(dir, { recursive: true });

  const denoJson = {
    name: packageName(pkg),
    version: "0.0.0",
    license: "Unlicense",
    exports: "./mod.ts",
    imports: { "@publicdomainrelay/alice-common": "jsr:@publicdomainrelay/alice-common@^0" },
  };
  await Deno.writeTextFile(`${dir}/deno.json`, JSON.stringify(denoJson, null, 2) + "\n");

  const modHeader = `/**\n * @module @publicdomainrelay/${pkg}-abc\n */\n`;
  await Deno.writeTextFile(`${dir}/mod.ts`, modHeader);

  const rootDeno = JSON.parse(await Deno.readTextFile(`${OPEN_ARCH}/deno.json`));
  const workspace: string[] = rootDeno.workspace ?? [];
  const entry = `./lib/abc/${pkg}`;
  if (!workspace.includes(entry)) {
    workspace.push(entry);
    rootDeno.workspace = workspace;
    await Deno.writeTextFile(`${OPEN_ARCH}/deno.json`, JSON.stringify(rootDeno, null, 2) + "\n");
  }

  emit("info", "phase3_start", { newPackage: pkg, dir: `lib/abc/${pkg}` });
}

async function applyConcepts(
  output: AgentOutput,
  state: AgentState,
  startComm: number,
  endComm: number,
): Promise<BatchMetrics> {
  emit("info", "phase3_start", { concepts: output.concepts.length });
  const metrics: BatchMetrics = {
    newConcepts: 0, refinedConcepts: 0, stubsCreated: 0, stubsUpdated: 0,
    typesAdded: 0, issuesFetched: 0, newPackages: [],
  };

  const byPackage = new Map<string, AgentConcept[]>();
  for (const c of output.concepts) {
    const pkg = c.package === "new" ? c.name : c.package;
    const existing = byPackage.get(pkg) ?? [];
    existing.push(c);
    byPackage.set(pkg, existing);
  }

  for (const [pkg, concepts] of byPackage) {
    const filePath = packageFilePath(pkg);
    let existingContent = "";
    try { existingContent = await Deno.readTextFile(filePath); } catch {
      if (pkg !== "alice-common") { await createPackage(pkg); metrics.newPackages.push(pkg); }
    }

    for (const concept of concepts) {
      const stubSource = buildStubFunction(concept);
      const refinement = concept.isRefinement && concept.refinesConcept;

      if (refinement) {
        // Always append — never replace cross-package call targets.
        // The old function keeps its name and callers; the refined
        // version documents the evolution as a new stub alongside.
        existingContent += "\n" + stubSource;
        metrics.stubsCreated++;
        metrics.refinedConcepts++;
      } else {
        existingContent += "\n" + stubSource;
        metrics.stubsCreated++;
        metrics.newConcepts++;
      }

      state.concepts[concept.name] = {
        functionName: concept.name,
        filePath: filePath.replace(OPEN_ARCH + "/", ""),
        lastUpdatedComm: endComm,
        sourceIssues: [],
        summary: concept.summary,
      };

      if (refinement && concept.refinesConcept) {
        const existing = state.concepts[concept.refinesConcept];
        if (existing) existing.lastUpdatedComm = endComm;
      }
    }

    await Deno.writeTextFile(filePath, existingContent);
  }

  state.totalStubsCreated += metrics.stubsCreated;
  // NOTE: state.lastProcessedComm written AFTER deno check passes
  // NOTE: state NOT saved here — saved in runBatch after deno check

  emit("info", "phase3_done", {
    stubsCreated: metrics.stubsCreated,
    stubsUpdated: metrics.stubsUpdated,
    newPackages: metrics.newPackages,
    totalStubs: state.totalStubsCreated,
    totalConcepts: Object.keys(state.concepts).length,
  });

  return metrics;
}

async function runDenoCheck(): Promise<boolean> {
  const r = await new Deno.Command("deno", {
    args: ["check", "lib/abc/alice/mod.ts"], cwd: OPEN_ARCH,
  }).output();
  if (!r.success) {
    emit("error", "deno_check_error", { stderr: new TextDecoder().decode(r.stderr).substring(0, 500) });
    return false;
  }
  emit("info", "deno_check", { result: "clean" });
  return true;
}

// ── Batch runner ────────────────────────────────────────────────────────────

async function runBatch(batchNumber: number): Promise<boolean> {
  const state = await readState();
  const nextComm = state.lastProcessedComm + 1;

  if (nextComm >= TOTAL_COMMS) {
    emit("info", "done", { reason: "all_comms_processed", total: TOTAL_COMMS });
    return false;
  }

  const start = nextComm;
  const end = Math.min(start + BATCH_SIZE - 1, TOTAL_COMMS - 1);
  const count = end - start + 1;
  const remaining = TOTAL_COMMS - start;
  const paddedStart = String(start).padStart(4, "0");
  const paddedEnd = String(end).padStart(4, "0");

  banner(`Batch #${batchNumber}: comms ${paddedStart}–${paddedEnd} (${count} comms, ${remaining} left)`);

  emit("info", "batch_start", {
    batch: batchNumber, start: paddedStart, end: paddedEnd, count, remaining,
    lastProcessedComm: state.lastProcessedComm,
    conceptsTracked: Object.keys(state.concepts).length,
    stubsCreated: state.totalStubsCreated,
  });

  // Phase 1: read + compress comms, extract + fetch issues
  emit("info", "phase1_start", { start: paddedStart, end: paddedEnd });

  const comms: PreparedComm[] = [];
  const allIssueRefs = new Set<string>();

  for (let i = start; i <= end; i++) {
    const comm = await readComm(i);
    if (comm) {
      comms.push(comm);
      comm.issueRefs.forEach((ref) => allIssueRefs.add(ref));
    }
  }

  if (DRY_RUN) {
    const wouldFetch = [...allIssueRefs].filter((r) => !state.issueCache[r]);
    emit("info", "phase1_done", { commsRead: comms.length, issueRefsExtracted: allIssueRefs.size, issuesWouldFetch: wouldFetch.length });
    emit("info", "batch_dry_run", { start: paddedStart, end: paddedEnd, wouldFetchIssues: wouldFetch.slice(0, 10) });
    return false;
  }

  const rateLimit = await checkRateLimit();
  const issues: PreparedIssue[] = [];
  let issuesFetched = 0;

  if (rateLimit >= 10) {
    for (const ref of allIssueRefs) {
      const issue = await fetchIssue(ref, state.issueCache);
      if (issue) {
        issues.push(issue);
        if (!state.issueCache[ref]) {
          issuesFetched++;
          state.issueCache[ref] = {
            fetchedAt: new Date().toISOString(),
            title: issue.title,
            commentCount: issue.comments.length,
            cacheFile: `${CACHE_DIR}/intel-dffml-issue-${ref.split("#")[1]}.json`,
          };
        }
      }
    }
    state.totalIssuesFetched += issuesFetched;
  }

  emit("info", "phase1_done", { commsRead: comms.length, issuesFetched, totalIssues: issues.length, rateLimit });

  // Phase 2: AI inference
  const agentInput: AgentInput = {
    batchStart: start,
    batchEnd: end,
    existingConceptNames: Object.keys(state.concepts),
    comms,
    issues,
  };

  let output: AgentOutput;
  try {
    output = await aiInference(agentInput);
  } catch {
    return false;
  }

  // Phase 3: apply
  const metrics = await applyConcepts(output, state, start, end);

  if (!(await runDenoCheck())) {
    // Roll back: revert stubs to git HEAD, reset state
    emit("warn", "agent_state_stale", { reason: "deno_check_failed" });
    await gitCmd(["checkout", "--", "open-architecture/lib/"], ORG_ROOT);
    return false;
  }

  // deno check passed — now persist state + commit
  state.lastProcessedComm = end;
  state.processedComms = [];
  for (let i = 0; i <= end; i++) state.processedComms.push(i);
  state.lastBatchSize = end - start + 1;
  await writeState(state);

  const pct = (((state.lastProcessedComm + 1) / TOTAL_COMMS) * 100).toFixed(1);
  await commit(
    `feat(agent): process eng comms ${paddedStart}–${paddedEnd} ${pct}% — ` +
    `${metrics.newConcepts + metrics.refinedConcepts} concepts (${metrics.newConcepts} new, ${metrics.refinedConcepts} refined), ` +
    `${metrics.stubsCreated} stubs, ${issuesFetched} issues`,
  );

  return state.lastProcessedComm < TOTAL_COMMS - 1;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  emit("info", "startup", {
    openArch: OPEN_ARCH,
    statePath: STATE_PATH,
    agentPath: AGENT_PATH,
    totalComms: TOTAL_COMMS,
    batchSize: BATCH_SIZE,
    hasApiKey: !!Deno.env.get("ANTHROPIC_API_KEY"),
    baseUrl: Deno.env.get("ANTHROPIC_BASE_URL") ?? "(default)",
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    maxBatches: MAX_BATCHES === Infinity ? "unlimited" : MAX_BATCHES,
    architecture: "3-phase: deterministic-prep → AI-inference → deterministic-apply",
  });

  let batches = 0;
  let keepGoing = true;

  while (keepGoing && batches < MAX_BATCHES) {
    batches++;
    keepGoing = await runBatch(batches);
  }

  const final = await readState();
  const pct = (((final.lastProcessedComm + 1) / TOTAL_COMMS) * 100).toFixed(1);

  banner(`Done. ${batches} batches, ${final.lastProcessedComm + 1}/${TOTAL_COMMS} (${pct}%) comms processed.`);

  emit("info", "done", {
    batches,
    commsProcessed: final.lastProcessedComm + 1,
    totalComms: TOTAL_COMMS,
    pct: Number(pct),
    totalStubs: final.totalStubsCreated,
    totalIssues: final.totalIssuesFetched,
    totalConcepts: Object.keys(final.concepts).length,
  });
}

main();
