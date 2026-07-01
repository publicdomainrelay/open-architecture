/**
 * Deterministic loop with AI-inference-only agent calls.
 *
 * Phase 1 (deterministic): read state, comms, extract issues, fetch + cache.
 * Phase 2 (AI inference):  single agent call, structured input → structured output.
 * Phase 3 (deterministic): write stubs, wire imports, deno check, commit.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-run --allow-sys --allow-env \
 *     scripts/process-eng-comms.ts [--dry-run] [--max-batches N] [--verbose]
 *
 * Log output is structured JSON, one object per line.
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
const BATCH_SIZE = 25;

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

/** Structured comm data prepared by the orchestrator for the agent. */
interface PreparedComm {
  dir: string;
  indexMd: string;
  replies: { file: string; content: string }[];
  issueRefs: string[];
}

/** An issue/PR fetched and cached, passed to the agent. */
interface PreparedIssue {
  ref: string;
  title: string;
  body: string;
  comments: { author: string; body: string; createdAt: string }[];
  labels: string[];
}

/** Structured input passed to the agent. */
interface AgentInput {
  batchStart: number;
  batchEnd: number;
  existingConcepts: Record<string, ConceptEntry>;
  comms: PreparedComm[];
  issues: PreparedIssue[];
}

/** One concept the agent extracted. */
interface AgentConcept {
  name: string;
  isRefinement: boolean;
  refinesConcept?: string;
  package: string;
  jsdoc: string;
  calls: string[];
  newType?: { name: string; definition: string };
  summary: string;
}

/** Structured output the agent returns. */
interface AgentOutput {
  concepts: AgentConcept[];
}

// ── Metrics for the current batch ──
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
  | "phase3_stub_write"
  | "phase3_package_create"
  | "phase3_type_add"
  | "phase3_import_wire"
  | "phase3_done"
  | "agent_error"
  | "agent_state_stale"
  | "commit"
  | "commit_error"
  | "deno_check"
  | "deno_check_error"
  | "done";

interface LogLine {
  ts: string;
  level: LogLevel;
  event: LogEvent;
  data?: Record<string, unknown>;
}

function emit(
  level: LogLevel,
  event: LogEvent,
  data?: Record<string, unknown>,
) {
  const line: LogLine = { ts: new Date().toISOString(), level, event };
  if (data) line.data = data;
  console.log(JSON.stringify(line));
}

function banner(title: string) {
  emit("info", "banner", { title });
}

// ── Deterministic helpers ──────────────────────────────────────────────────

async function readState(): Promise<AgentState> {
  const raw = await Deno.readTextFile(STATE_PATH);
  return JSON.parse(raw);
}

async function writeState(state: AgentState): Promise<void> {
  await Deno.writeTextFile(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

async function gitCmd(args: string[], cwd: string) {
  const cmd = new Deno.Command("git", { args, cwd });
  const r = await cmd.output();
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

/** List all files in a comm directory. */
async function listCommDir(dirNum: number): Promise<string[]> {
  const padded = String(dirNum).padStart(4, "0");
  const path = `${COMMS_DIR}${padded}/`;
  const entries: string[] = [];
  try {
    for await (const e of Deno.readDir(path)) {
      if (e.isFile && (e.name === "index.md" || e.name.startsWith("reply_"))) {
        entries.push(e.name);
      }
    }
  } catch {
    // Directory may not exist (gaps in numbering)
  }
  return entries.sort();
}

/** Read a comm directory — return PreparedComm or null if empty. */
async function readComm(dirNum: number): Promise<PreparedComm | null> {
  const padded = String(dirNum).padStart(4, "0");
  const dir = `${COMMS_DIR}${padded}/`;
  const files = await listCommDir(dirNum);
  if (files.length === 0) return null;

  let indexMd = "";
  const replies: PreparedComm["replies"] = [];

  for (const file of files) {
    const content = await Deno.readTextFile(`${dir}${file}`);
    if (file === "index.md") {
      indexMd = content;
    } else {
      replies.push({ file, content });
    }
  }

  // Extract issue/PR refs (skip discussions — those ARE the comms)
  const allText = [indexMd, ...replies.map((r) => r.content)].join("\n");
  const issueRefs = extractIssueRefs(allText);

  return { dir: padded, indexMd, replies, issueRefs };
}

/**
 * Extract GitHub issue and PR references from text.
 * Skips discussion references (already exported as comms).
 */
function extractIssueRefs(text: string): string[] {
  const refs = new Set<string>();
  // intel/dffml#NNNN or intel/dffml/issues/NNNN
  for (const m of text.matchAll(/\bintel\/dffml#(\d+)\b/g)) {
    refs.add(`intel/dffml#${m[1]}`);
  }
  // Full issue URLs
  for (
    const m of text.matchAll(
      /https:\/\/github\.com\/intel\/dffml\/(issues|pull)\/(\d+)/g,
    )
  ) {
    refs.add(`intel/dffml#${m[2]}`);
  }
  // Bare #NNNN (4-5 digits, contextual in intel/dffml)
  for (const m of text.matchAll(/(?<![\/\w])#(\d{4,5})\b/g)) {
    if (!text.includes(`discussions/${m[1]}`)) {
      refs.add(`intel/dffml#${m[1]}`);
    }
  }
  return [...refs].sort();
}

/** Fetch and cache a GitHub issue if not already cached. */
async function fetchIssue(
  ref: string,
  issueCache: Record<string, IssueCacheEntry>,
): Promise<PreparedIssue | null> {
  // Check cache first
  const cached = issueCache[ref];
  const cacheFile = cached?.cacheFile ??
    `${CACHE_DIR}/intel-dffml-issue-${ref.split("#")[1]}.json`;

  // Try disk cache
  try {
    const raw = await Deno.readTextFile(cacheFile);
    const data = JSON.parse(raw);
    return {
      ref,
      title: data.title ?? "",
      body: data.body ?? "",
      comments: (data.comments ?? []).map((c: Record<string, unknown>) => ({
        author: (c.author as { login?: string })?.login ?? "unknown",
        body: c.body ?? "",
        createdAt: c.createdAt ?? "",
      })),
      labels: (data.labels ?? []).map((l: Record<string, unknown>) =>
        String(l.name ?? "")
      ),
    };
  } catch {
    // Cache miss — fetch via gh
  }

  // Fetch
  const num = ref.split("#")[1];
  const isPR = ref.includes("/pull/");
  const viewCmd = isPR ? "pr" : "issue";

  const cmd = new Deno.Command("gh", {
    args: [
      viewCmd,
      "view",
      num,
      "--repo",
      "intel/dffml",
      "--json",
      "title,body,comments,labels,author,createdAt",
    ],
    cwd: ORG_ROOT,
  });

  const r = await cmd.output();
  if (!r.success) return null;

  const stdout = new TextDecoder().decode(r.stdout);
  // Save to cache
  await Deno.mkdir(CACHE_DIR, { recursive: true });
  await Deno.writeTextFile(cacheFile, stdout);

  const data = JSON.parse(stdout);
  return {
    ref,
    title: data.title ?? "",
    body: data.body ?? "",
    comments: (data.comments ?? []).map((c: Record<string, unknown>) => ({
      author: (c.author as { login?: string })?.login ?? "unknown",
      body: c.body ?? "",
      createdAt: c.createdAt ?? "",
    })),
    labels: (data.labels ?? []).map((l: Record<string, unknown>) =>
      String(l.name ?? "")
    ),
  };
}

/** Check gh rate limit before fetching. */
async function checkRateLimit(): Promise<number> {
  const cmd = new Deno.Command("gh", {
    args: ["api", "rate_limit", "--jq", ".resources.core.remaining"],
    cwd: ORG_ROOT,
  });
  const r = await cmd.output();
  if (!r.success) return 0;
  return parseInt(new TextDecoder().decode(r.stdout).trim()) || 0;
}

// ── Phase 2: AI inference ──────────────────────────────────────────────────

const INFERENCE_SYSTEM_PROMPT = `You are an architecture concept extractor. Your job: read engineering discussion
logs and return a structured JSON manifest of the concepts they contain.

You receive:
- comms: array of {dir, indexMd, replies: [{file, content}], issueRefs}
- issues: array of {ref, title, body, comments: [{author, body}], labels}
- existingConcepts: map of concept name → {functionName, filePath, summary, ...}

For each concept you find, produce:
- name: camelCase concept identifier
- isRefinement: true if this concept already exists in existingConcepts
  (use semantic judgment — same idea under different name = refinement)
- refinesConcept: if refinement, which existing concept name
- package: which ABC package it belongs to (alice-trust, alice-system-context,
  alice-communication, alice-compute-contract, alice-supply-chain,
  alice-stream-of-consciousness, alice (spine), or "new" for a new package)
- jsdoc: JSDoc comment text (no /** */ markers). ONE paragraph describing the
  concept in clear technical prose. If refinement, newer understanding first,
  then "Earlier understanding (from comm NNNN):" provenance.
- calls: array of function names this concept should call in its stub body
  (use existing function names from existingConcepts where possible)
- summary: one-line summary (max 80 chars)

Return ONLY valid JSON matching this TypeScript type:
{
  "concepts": [
    {
      "name": string,
      "isRefinement": boolean,
      "refinesConcept"?: string,
      "package": string,
      "jsdoc": string,
      "calls": string[],
      "summary": string
    }
  ]
}

Rules:
- Skip trivial headings (TODO, Notes, References) and empty content.
- Only extract concepts with substantive technical content.
- Prefer existing function names for "calls" array.
- If a concept introduces a new wire type, note it in jsdoc but don't create types.
- Concepts should be distinct — don't produce near-duplicate names.
- Write jsdoc in the style of the existing stubs: one clear sentence, then
  detail, then @see references (cite comm dir, issue refs).`;

async function aiInference(input: AgentInput): Promise<AgentOutput> {
  const prompt = JSON.stringify(input, null, 2);

  emit("info", "phase2_start", {
    promptChars: prompt.length,
    comms: input.comms.length,
    issues: input.issues.length,
    existingConcepts: Object.keys(input.existingConcepts).length,
  });

  const startTime = Date.now();

  try {
    const result = await query({
      prompt: `${INFERENCE_SYSTEM_PROMPT}\n\nInput:\n${prompt}\n\nReturn ONLY the JSON.`,
      options: {
        maxTurns: 10,
        allowedTools: [], // NO tools — inference only
        permissionMode: "bypassPermissions",
        cwd: ORG_ROOT,
        systemPrompt: INFERENCE_SYSTEM_PROMPT,
      },
    });

    const elapsedMs = Date.now() - startTime;

    // Extract JSON from result. The result may be an object or async iterable.
    let text = "";
    if (result && typeof result === "object") {
      if (Symbol.asyncIterator in result) {
        for await (const msg of result as AsyncIterable<Record<string, unknown>>) {
          const m = msg as { type?: string; message?: { content?: unknown }; content?: unknown };
          if (m.type === "result" || m.type === "assistant") {
            text += String((m.message?.content ?? m.content ?? ""));
          }
        }
      } else {
        text = JSON.stringify(result);
      }
    }

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*"concepts"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in agent response. Raw: ${text.substring(0, 500)}`);
    }

    const output: AgentOutput = JSON.parse(jsonMatch[0]);
    emit("info", "phase2_done", {
      elapsedMs,
      elapsedS: (elapsedMs / 1000).toFixed(1),
      conceptsFound: output.concepts.length,
      newCount: output.concepts.filter((c) => !c.isRefinement).length,
      refinementCount: output.concepts.filter((c) => c.isRefinement).length,
    });

    return output;
  } catch (err) {
    const elapsedMs = Date.now() - startTime;
    emit("error", "agent_error", {
      elapsedMs,
      elapsedS: (elapsedMs / 1000).toFixed(1),
      error: (err as Error).message,
    });
    throw err;
  }
}

// ── Phase 3: Deterministic stub writer ─────────────────────────────────────

/** Build the full stub function source text. */
function buildStubFunction(concept: AgentConcept): string {
  const lines: string[] = [];
  lines.push("/**");
  for (const line of concept.jsdoc.split("\n")) {
    lines.push(` * ${line}`);
  }
  lines.push(" */");
  lines.push(`export function ${concept.name}(): void {`);
  for (const call of concept.calls) {
    if (call) lines.push(`  ${call}();`);
  }
  if (concept.calls.length === 0) lines.push("  // TODO: wire to related concepts");
  lines.push("}");
  return lines.join("\n") + "\n";
}

/** Package file path from package name. */
function packageFilePath(pkg: string): string {
  const map: Record<string, string> = {
    "alice-trust": `${OPEN_ARCH}/lib/abc/alice-trust/mod.ts`,
    "alice-system-context": `${OPEN_ARCH}/lib/abc/alice-system-context/mod.ts`,
    "alice-communication": `${OPEN_ARCH}/lib/abc/alice-communication/mod.ts`,
    "alice-compute-contract": `${OPEN_ARCH}/lib/abc/alice-compute-contract/mod.ts`,
    "alice-supply-chain": `${OPEN_ARCH}/lib/abc/alice-supply-chain/mod.ts`,
    "alice-stream-of-consciousness":
      `${OPEN_ARCH}/lib/abc/alice-stream-of-consciousness/mod.ts`,
    "alice": `${OPEN_ARCH}/lib/abc/alice/mod.ts`,
  };
  return map[pkg] ?? `${OPEN_ARCH}/lib/abc/${pkg}/mod.ts`;
}

/** Package deno.json name from package key. */
function packageName(pkg: string): string {
  const map: Record<string, string> = {
    "alice-trust": "@publicdomainrelay/alice-trust-abc",
    "alice-system-context": "@publicdomainrelay/alice-system-context-abc",
    "alice-communication": "@publicdomainrelay/alice-communication-abc",
    "alice-compute-contract": "@publicdomainrelay/alice-compute-contract-abc",
    "alice-supply-chain": "@publicdomainrelay/alice-supply-chain-abc",
    "alice-stream-of-consciousness":
      "@publicdomainrelay/alice-stream-of-consciousness-abc",
    "alice": "@publicdomainrelay/alice-abc",
  };
  return map[pkg] ?? `@publicdomainrelay/${pkg}-abc`;
}

/** Resolve which package a function name lives in. */
function resolveFunctionPackage(
  functionName: string,
  concepts: Record<string, ConceptEntry>,
): string | null {
  for (const [name, entry] of Object.entries(concepts)) {
    if (entry.functionName === functionName) {
      // Extract package from filePath
      const match = entry.filePath.match(/lib\/abc\/([^/]+)/);
      return match ? match[1] : null;
    }
  }
  return null;
}

async function applyConcepts(
  output: AgentOutput,
  state: AgentState,
  startComm: number,
  endComm: number,
): Promise<BatchMetrics> {
  emit("info", "phase3_start", { concepts: output.concepts.length });
  const metrics: BatchMetrics = {
    newConcepts: 0,
    refinedConcepts: 0,
    stubsCreated: 0,
    stubsUpdated: 0,
    typesAdded: 0,
    issuesFetched: 0,
    newPackages: [],
  };

  // Group by package so we edit each file once
  const byPackage = new Map<string, AgentConcept[]>();
  for (const c of output.concepts) {
    const pkg = c.package === "new" ? c.name : c.package;
    const existing = byPackage.get(pkg) ?? [];
    existing.push(c);
    byPackage.set(pkg, existing);
  }

  for (const [pkg, concepts] of byPackage) {
    const filePath = packageFilePath(pkg);

    // Check if package file exists, create if not
    let existingContent = "";
    try {
      existingContent = await Deno.readTextFile(filePath);
    } catch {
      // New package needed
      if (pkg !== "alice-common") {
        await createPackage(pkg);
        metrics.newPackages.push(pkg);
      }
    }

    for (const concept of concepts) {
      const stubSource = buildStubFunction(concept);
      const refinement = concept.isRefinement && concept.refinesConcept;

      if (refinement) {
        // Find existing function and update its JSDoc
        const existingFn = findFunctionInSource(
          existingContent,
          concept.refinesConcept!,
        );
        if (existingFn) {
          existingContent = existingContent.replace(existingFn, stubSource);
          metrics.stubsUpdated++;
          emit("debug", "phase3_stub_write", {
            concept: concept.name,
            action: "refine",
            existingFunction: concept.refinesConcept,
            package: pkg,
          });
        } else {
          // Refinement target not found — append as new
          existingContent += "\n" + stubSource;
          metrics.stubsCreated++;
          emit("debug", "phase3_stub_write", {
            concept: concept.name,
            action: "new (refinement target not found)",
            package: pkg,
          });
        }
      } else {
        existingContent += "\n" + stubSource;
        metrics.stubsCreated++;
        emit("debug", "phase3_stub_write", {
          concept: concept.name,
          action: "new",
          package: pkg,
        });
      }

      // Update state
      state.concepts[concept.name] = {
        functionName: concept.name,
        filePath: filePath.replace(OPEN_ARCH + "/", ""),
        lastUpdatedComm: endComm,
        sourceIssues: [],
        summary: concept.summary,
      };

      if (refinement && concept.refinesConcept) {
        const existing = state.concepts[concept.refinesConcept];
        if (existing) {
          // Keep old entry but update metadata
          existing.lastUpdatedComm = endComm;
        }
      }
    }

    await Deno.writeTextFile(filePath, existingContent);
  }

  // Update state
  state.lastProcessedComm = endComm;
  state.processedComms = [];
  for (let i = 0; i <= endComm; i++) {
    state.processedComms.push(i);
  }
  state.totalStubsCreated += metrics.stubsCreated;
  state.lastBatchSize = endComm - startComm + 1;

  await writeState(state);

  emit("info", "phase3_done", {
    stubsCreated: metrics.stubsCreated,
    stubsUpdated: metrics.stubsUpdated,
    newPackages: metrics.newPackages,
    totalStubs: state.totalStubsCreated,
    totalConcepts: Object.keys(state.concepts).length,
  });

  return metrics;
}

/** Simple regex-based function finder — finds `export function name() { ... }`. */
function findFunctionInSource(
  source: string,
  functionName: string,
): string | null {
  const pattern = new RegExp(
    `(?:\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?export\\s+function\\s+${functionName}\\s*\\([^)]*\\)[^{]*\\{[^}]*\\}`,
    "m",
  );
  const match = source.match(pattern);
  return match ? match[0] : null;
}

/** Create a new ABC package (deno.json + mod.ts + root workspace entry). */
async function createPackage(pkg: string): Promise<void> {
  const dir = `${OPEN_ARCH}/lib/abc/${pkg}`;
  await Deno.mkdir(dir, { recursive: true });

  const denoJson = {
    name: packageName(pkg),
    version: "0.0.0",
    license: "Unlicense",
    exports: "./mod.ts",
    imports: {
      "@publicdomainrelay/alice-common":
        "jsr:@publicdomainrelay/alice-common@^0",
    },
  };
  await Deno.writeTextFile(
    `${dir}/deno.json`,
    JSON.stringify(denoJson, null, 2) + "\n",
  );

  const modHeader = [
    "/**",
    ` * @module @publicdomainrelay/${pkg}-abc`,
    " */",
    "",
  ].join("\n");
  await Deno.writeTextFile(`${dir}/mod.ts`, modHeader);

  // Add to root workspace
  const rootDeno = JSON.parse(
    await Deno.readTextFile(`${OPEN_ARCH}/deno.json`),
  );
  const workspace: string[] = rootDeno.workspace ?? [];
  const entry = `./lib/abc/${pkg}`;
  if (!workspace.includes(entry)) {
    workspace.push(entry);
    rootDeno.workspace = workspace;
    await Deno.writeTextFile(
      `${OPEN_ARCH}/deno.json`,
      JSON.stringify(rootDeno, null, 2) + "\n",
    );
  }

  emit("info", "phase3_package_create", { package: pkg, dir: `lib/abc/${pkg}` });
}

/** Run deno check and return whether it passed. */
async function runDenoCheck(): Promise<boolean> {
  const cmd = new Deno.Command("deno", {
    args: ["check", "lib/abc/alice/mod.ts"],
    cwd: OPEN_ARCH,
  });
  const r = await cmd.output();
  const stderr = new TextDecoder().decode(r.stderr);
  if (!r.success) {
    emit("error", "deno_check_error", { stderr: stderr.substring(0, 500) });
    return false;
  }
  emit("info", "deno_check", { result: "clean" });
  return true;
}

// ── Batches ─────────────────────────────────────────────────────────────────

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

  banner(
    `Batch #${batchNumber}: comms ${paddedStart}–${paddedEnd} (${count} comms, ${remaining} left)`,
  );

  emit("info", "batch_start", {
    batch: batchNumber,
    start: paddedStart,
    end: paddedEnd,
    count,
    remaining,
    lastProcessedComm: state.lastProcessedComm,
    conceptsTracked: Object.keys(state.concepts).length,
    stubsCreated: state.totalStubsCreated,
    issuesFetched: state.totalIssuesFetched,
  });

  // ═══ Phase 1a: Read comms + extract issue refs (no network) ═══
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

  // Dry-run gate: stop here, report what would happen
  if (DRY_RUN) {
    const wouldFetch = [...allIssueRefs].filter((r) => !state.issueCache[r]);
    emit("info", "phase1_done", {
      commsRead: comms.length,
      issueRefsExtracted: allIssueRefs.size,
      issuesWouldFetch: wouldFetch.length,
      issuesInCache: allIssueRefs.size - wouldFetch.length,
    });
    emit("info", "batch_dry_run", {
      start: paddedStart,
      end: paddedEnd,
      wouldFetchIssues: wouldFetch.slice(0, 10),
    });
    return false;
  }

  // ═══ Phase 1b: Fetch issues (network) ═══
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
            cacheFile:
              `${CACHE_DIR}/intel-dffml-issue-${ref.split("#")[1]}.json`,
          };
        }
      }
    }
    state.totalIssuesFetched += issuesFetched;
  }

  emit("info", "phase1_done", {
    commsRead: comms.length,
    issuesFetched,
    totalIssues: issues.length,
    cachedIssues: issues.length - issuesFetched,
    rateLimit,
  });

  // ═══ Phase 2: AI inference ═══
  const agentInput: AgentInput = {
    batchStart: start,
    batchEnd: end,
    existingConcepts: state.concepts,
    comms,
    issues,
  };

  let output: AgentOutput;
  try {
    output = await aiInference(agentInput);
  } catch {
    return false; // Error already logged
  }

  // ═══ Phase 3: Deterministic apply ═══
  const metrics = await applyConcepts(output, state, start, end);

  // Reload state after apply
  const updatedState = await readState();

  // Deno check
  const checkOk = await runDenoCheck();
  if (!checkOk) {
    emit("warn", "agent_state_stale", {
      reason: "deno_check_failed",
      before: state.lastProcessedComm,
      after: updatedState.lastProcessedComm,
    });
    return false;
  }

  // Commit
  const pct = (((updatedState.lastProcessedComm + 1) / TOTAL_COMMS) * 100)
    .toFixed(1);
  await commit(
    `feat(agent): process eng comms ${paddedStart}–${paddedEnd} ` +
      `${pct}% — ${metrics.newConcepts + metrics.refinedConcepts} concepts ` +
      `(${metrics.newConcepts} new, ${metrics.refinedConcepts} refined), ` +
      `${metrics.stubsCreated} stubs, ${issuesFetched} issues`,
  );

  return updatedState.lastProcessedComm < TOTAL_COMMS - 1;
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

  banner(
    `Done. ${batches} batches, ${final.lastProcessedComm + 1}/${TOTAL_COMMS} (${pct}%) comms processed.`,
  );

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
