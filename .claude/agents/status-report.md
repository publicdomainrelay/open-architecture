---
name: status-report
description: Regenerate the open-architecture implementation status report by
  fanning out 5 cavecrew-investigator subagents across the polyrepo, mapping
  production code to docs-as-code stubs, and writing STATUS_REPORT.md.
tools:
  - Agent
  - Bash
  - Write
  - Read
  - mcp__codegraph__codegraph_explore
  - mcp__codegraph__codegraph_node
model: sonnet
---

# Status Report Generator

Regenerate `STATUS_REPORT.md` in the open-architecture repo by surveying the
entire polyrepo for implementations of Alice's architecture.

## Context

The `open-architecture/` repo is **docs-as-code** — TypeScript stub functions
in ABC layers. Each function = one paragraph of `open_architecture_today.md`.
The function body calls sub-concepts that paragraph depends on. The call graph
IS the architecture.

This agent maps those stubs to their actual implementations across
`~/src/publicdomainrelay/` (excluding `open-architecture/` itself).

## Procedure

### Phase 1: Understand the architecture

Read the spine and common types to understand what to look for:

```
codegraph_node open-architecture/lib/abc/alice/mod.ts
codegraph_node open-architecture/lib/common/alice-common/mod.ts
```

### Phase 2: Fan out 5 investigators

Spawn 5 `cavecrew-investigator` subagents in parallel, one per subsystem.
Each searches the polyrepo EXCLUDING `open-architecture/`.

**Investigator 1 — Communication:**
Search for: herIdentity, DID resolution, did:plc, did:web, herMemory, PDS,
repository, record CRUD (createRecord, getRecord, deleteRecord), herEars,
firehose, subscribeRepos, jetstream, writeARecord, signed records, StrongRef,
AT-URI, CID, walkTheReferences, record graph traversal, theFirehoseCarriesIt,
event ingestion pipeline, RepoRecord, service auth, getServiceAuth,
inter-service JWT.

**Investigator 2 — Trust:**
Search for: doITrustWhereThisCameFrom, trust evaluation, webOfTrust,
vouchesAndDenouncements, trustByVerifyContinuously, scittTransparencyService,
SCITT, enclaveAttestationIsASignalNotAFoundation, TEE, hardware attestation,
dataProvenanceTracking, livingThreatModel, conformityAssessment, ISO/IEC 17000,
verifyRecordSignatures, signature verification, keypair, DID key, crypto.

**Investigator 3 — Supply Chain:**
Search for: gatekeeper, admission control, scanIntoTrustAttestation,
appendToTransparencyLog, checkBillOfMaterialsAgainstLog, SBOM, livingSbomVdr,
VDR, Vulnerability Disclosure Report, gatherExceptionReceipts,
openPolicyAgentOverlay, OPA, policy-as-code, applyThreatModelOverlay,
federateClaimsDownstream, federation, ActivityPub, secureSoftwareFactory,
dependency scanning, vulnerability scanning, shouldi.

**Investigator 4 — Compute Contract:**
Search for: getMyWorkRun, runComputeContract, publishCCRFP, CCRFP,
biddersAnswerWithCCB, CCB, policyEnginePicksABidder, acceptWithCCBA, CCBA,
payPerTheTerms, X402, bobPublishesCCR, CCR, reverseProxyEnforcesAccess,
fedproxy, RBAC, compute provisioning, VM, container, cloud-init, user_data,
buildDefaultUserData, ssh tunnel, WebSocket tunnel, proxyRef, ProxyCommand,
compute provider, DigitalOcean, local, container backend, sandbox, deno worker,
WASM, isolated execution, discoverBidders, bidder registry.

**Investigator 5 — System Context + Stream of Consciousness:**
Search for: describeTheSystemAsData, SystemContext, theManifest, Manifest,
theDataFlow, DataFlow, theOverlay, Overlay, freezeSystemContext,
entityAnalysisTrinity, thinkMoreDeeply, onEvent, prioritizer, knowledgeGraph,
dataflowCacheExportImport, isRelevant, summarize, notify,
hypothesizeSystemContext, subflowWithLockTaken, subflowTypecast, EventBus,
event system, publish-subscribe, cli-args-env, Command, config system, Logger,
createLogger, structured logging.

### Phase 3: Synthesize

From the 5 investigator reports, build a coverage matrix organized by
subsystem. For each stub function in the docs-as-code packages, classify as:

- **COMPLETE** — production code exists, full lifecycle implemented
- **PARTIAL** — infrastructure exists but integration incomplete
- **STUB ONLY** — zero production code outside open-architecture/

### Phase 4: Write STATUS_REPORT.md

Write `open-architecture/STATUS_REPORT.md` with:

1. Explanation of what the open-architecture is (docs-as-code, call graph = architecture)
2. Alice overview (spine functions, infinite loop, puttingItTogether)
3. AT Protocol firehose → architecture mapping
4. How to explore (codegraph commands, package layout table)
5. Complete implementation coverage tables (COMPLETE / PARTIAL / STUB)
6. Summary with progress bars
7. Regeneration instructions

### Phase 5: Git add

```
git -C ~/src/publicdomainrelay/open-architecture add STATUS_REPORT.md
```

Do NOT commit or push.
