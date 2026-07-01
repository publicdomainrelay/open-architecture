# Alice Open Architecture — Caveman Report

2026-06-29. Generated from codegraph + batch data.

## State

```
comms processed:  32 / 691   (4.63%)
concepts:         24
stubs (empty fn): 19
issues logged:    9
```

## How This Was Built

`process-eng-comms.ts` reads 691 engineering discussion logs, feeds
them to `alice-eng-comms` agent (defined `.claude/agents/`). Agent
writes stub functions — one per paragraph of `open_architecture_today.md`.
Every stub = JSDoc prose + empty body. Call graph IS the architecture.
Walk references = walk reasoning.

Batch history:
```
batch 1: 6 found, 103.3s, 5 new + 1 refinement, 1 attempt
```

## Package Layout (ABC Layering)

Deps flow one way: common ← abc. Never reverse.
One `mod.ts` per package. Single export surface. No sub-modules.

```
lib/common/alice-common          ██████████████ 14 — types: DID, CID, Manifest, CCRFP, CCB, CCBA, CCR, SystemContext, Overlay, DataFlow, StrongRef, EntityAnalysisTrinity
lib/abc/alice                    ████           4 — spine: whatAliceIs, puttingItTogether, theInfiniteLoop, navigatingThisCodebase
lib/abc/alice-trust              █████████       9 — trust: doITrustWhereThisCameFrom, webOfTrust, scittTransparencyService, livingThreatModel
lib/abc/alice-supply-chain       ███████████    11 — gatekeeper, transparency log, SBOM/VDR, threat model overlay, secure software factory
lib/abc/alice-system-context     ████████████████ 16 — manifest, dataflow, overlay, trinity, operation trust boundary
lib/abc/alice-compute-contract   █████████       9 — CCRFP → CCB → CCBA → CCR lifecycle
lib/abc/alice-communication      ████████        8 — DID, PDS, firehose, records, herRepositoryIsHerVoice
lib/abc/alice-stream-of-consciousness ██████████ 10 — prioritizer, onEvent, knowledge graph, thinkMoreDeeply
```

ASCII bar: 1 char = 1 exported symbol.

## Call Graph (spine only)

```
puttingItTogether(buildEvent)
  ├── herRepositoryIsHerVoice()           // alice-communication: DID, PDS, firehose
  ├── doITrustWhereThisCameFrom(source)   // alice-trust: web-of-trust verdict
  ├── gatekeeper({uri, cid})              // alice-supply-chain: admit/reject
  ├── getMyWorkRun()                      // alice-compute-contract: CCRFP→CCB→CCBA→CCR
  └── thinkMoreDeeply()                   // alice-stream-of-consciousness: next thought

whatAliceIs()
  ├── describeTheSystemAsData()           // alice-system-context: manifest+overlay+dataflow
  └── herRepositoryIsHerVoice()           // alice-communication

theInfiniteLoop(event)
  ├── herRepositoryIsHerVoice()
  └── onEvent(event)                      // alice-stream-of-consciousness
```

## Full Symbol Inventory

### lib/abc/alice (4)
- `whatAliceIs` — entity + architecture, 2nd Party definition
- `theInfiniteLoop` — someone acts → firehose → Alice ingests → she acts
- `puttingItTogether` — full loop: build → trust-verdict → gatekeep → compute → think
- `navigatingThisCodebase` — self-documenting entry point for codegraph

### lib/abc/alice-trust (9)
- `doITrustWhereThisCameFrom` — verdict on build source
- `enclaveAttestationIsASignalNotAFoundation`
- `webOfTrust` — operator trust check
- `vouchesAndDenouncements`
- `trustByVerifyContinuously`
- `scittTransparencyService`
- `dataProvenanceTracking`
- `livingThreatModel`
- `conformityAssessment`

### lib/abc/alice-supply-chain (11)
- `gatekeeper` — admit/reject component
- `scanIntoTrustAttestation`
- `appendToTransparencyLog`
- `openPolicyAgentOverlay`
- `checkBillOfMaterialsAgainstLog`
- `livingSbomVdr`
- `gatherExceptionReceipts`
- `applyThreatModelOverlay`
- `federateClaimsDownstream`
- `secureSoftwareFactory`
- `policyBenefitOfDoubt`

### lib/abc/alice-system-context (16)
- `describeTheSystemAsData` → SystemContext
- `theManifest` → Manifest
- `theDataFlow` → DataFlow
- `theOverlay` → Overlay
- `freezeSystemContext` — freeze upstream+overlays+orchestrator
- `hypothesizeSystemContext`
- `entityAnalysisTrinity` — intent × static × dynamic
- `intentAnalysis`
- `staticAnalysis`
- `dynamicAnalysis`
- `subflowWithLockTaken`
- `subflowTypecast`
- `operationTrustBoundary`
- `dataflowConceptualUpleveling`
- `overlayAsAdmissionController`
- `dataflowAsFunctionInvocation`

### lib/abc/alice-compute-contract (9)
- `getMyWorkRun` → CCR
- `publishCCRFP` → CCRFP
- `biddersAnswerWithCCB` → CCB[]
- `policyEnginePicksABidder` → CCB
- `acceptWithCCBA` → CCBA
- `payPerTheTerms`
- `bobPublishesCCR` → CCR
- `reverseProxyEnforcesAccess`
- `reverseTunnelIsServiceDiscovery`

### lib/abc/alice-communication (8)
- `herRepositoryIsHerVoice` — central comms concept
- `herIdentity` → DID
- `didStandardization`
- `herMemory` — PDS as memory
- `herEars` — firehose subscription
- `writeARecord` → RepoRecord
- `walkTheReferences` → StrongRef
- `theFirehoseCarriesIt`

### lib/abc/alice-stream-of-consciousness (10)
- `shareAThought` → SystemContext
- `thinkMoreDeeply`
- `prioritizer` → "notify" | "think" | "act"
- `knowledgeGraph`
- `onEvent` — event ingestion point
- `dataflowCacheExportImport`
- `isRelevant`
- `summarize`
- `notify`
- `nfsRepoCacheDeltaScan`

### lib/common/alice-common (14 types)
- `DID`, `CID`, `ATURI`
- `StrongRef` {uri, cid}
- `Manifest` {intent, schema, data}
- `DataFlow` {operations, links}
- `Overlay` {context, patch}
- `SystemContext` {upstream, overlays, orchestrator}
- `RepoRecord` {uri, cid, author, value}
- `CCRFP` {request: Manifest}
- `CCB` {against, bidder, terms}
- `CCBA` {accepts: StrongRef}
- `CCR` {chain, evidence}
- `EntityAnalysisTrinity` {intent, staticAnalysis, dynamicAnalysis}

## Issues (9 logged)

Not enumerated in provided data. Expected categories from code structure:
- stub bodies empty (19 of 24 concepts)
- no transport implementations yet (all ABC, zero impl/factory/CLI layers)
- no tests
- no deno.json workspace entries for open-architecture packages

## Build Pipeline

```
691 engineering discussion logs
   │
   ▼
process-eng-comms.ts ──reads──→ alice-eng-comms agent (.claude/agents/)
   │                               │
   │                               ▼
   │                    AI writes stub functions
   │                    (1 stub = 1 paragraph of open_architecture_today.md)
   │                               │
   ▼                               ▼
32/691 processed            24 concepts extracted
(4.63%)                     19 stubs (empty bodies)
                             9 issues logged
```

Next batch: 659 comms remain unprocessed. At 103s/batch (6 concepts),
expect ~18 more batches to cover remaining.
