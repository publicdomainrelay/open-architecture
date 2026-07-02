# Open Architecture — Implementation Status Report

Generated 2026-07-01 from polyrepo codegraph analysis.
Regenerate: ask Claude to invoke the `status-report` agent.

## What This Is

The `open-architecture/` repo is **docs-as-code** — TypeScript stub functions
organized in ABC layers. Each function is a paragraph from
`open_architecture_today.md`. The function body calls sub-concepts that
paragraph depends on. **The call graph IS the architecture.** Walk the
references and you walk her whole reasoning.

This report maps those docs-as-code stubs to their actual implementations
across the polyrepo at `~/src/publicdomainrelay/`.

## Alice — The Architecture

Alice is the reference maintainer. Context-aware pile of CI jobs that learns
with you and your organizations. She reviews code, files fixes, watches your
dependencies, cuts releases, and keeps your threat models alive. She is both
the AI software architect and the architecture itself — the universal blueprint
we call the open architecture.

**The spine** (`lib/abc/alice/mod.ts`):

```
whatAliceIs()
  describeTheSystemAsData()    — manifest (what) + dataflow (how) + overlay (in what context)
  herRepositoryIsHerVoice()    — signed records on PDS, carried on firehose, content-addressed

theInfiniteLoop(event)
  herRepositoryIsHerVoice()    — someone acts, writes signed record to PDS
  onEvent(event)               — firehose carries it, Alice ingests, does she care?

puttingItTogether(buildEvent)
  herRepositoryIsHerVoice()    — Bob pushes a build, Alice hears it on the firehose
  doITrustWhereThisCameFrom()  — policy engine asks the trust graph
  gatekeeper()                 — admit through transparency log
  getMyWorkRun()               — if compute needed, open Compute Contract
  thinkMoreDeeply()            — think the train of thought further
```

## AT Protocol Firehose — Architecture

The firehose (`com.atproto.sync.subscribeRepos`) is the nervous system. It is
a WebSocket stream of every record written to any PDS on the network. Events:
`#commit` (record created/updated/deleted), `#identity` (handle/key/PDS change),
`#account` (status change). Cursor-based, at-least-once delivery, per-repo ordering.

```
PDS — Relay (aggregator, verifies) — Jetstream (fan-out, simplified JSON) — Consumers
```

The project implements two firehose transports (ABC pattern — sibling packages):

| Transport | Package | Wire format |
|-----------|---------|-------------|
| Jetstream | `firehose-watcher-jetstream` | Simplified JSON, no CBOR/CAR parsing |
| Native subscribeRepos | `firehose-watcher-subscriberepos` | Relay envelope `{seq, frame: {repo, ops}}` |

The firehose IS `herEars()` and `theFirehoseCarriesIt()`. Every record Alice
writes becomes the next event someone else ingests. The architecture loop:

```
someone acts — writes signed record — firehose carries — Alice ingests
  — isRelevant? — summarize — prioritizer(notify|think|act) — thinkMoreDeeply
  — writes her own records — next thought begins
```

## How to Explore

```
codegraph explore "whatAliceIs theInfiniteLoop puttingItTogether"
```

Package layout:

| Package | Directory | Role |
|---------|-----------|------|
| `alice-common` | `lib/common/alice-common` | Wire types: DID, CID, Manifest, SystemContext, CCRFP… |
| `alice` | `lib/abc/alice` | SPINE: whatAliceIs, puttingItTogether |
| `alice-system-context` | `lib/abc/alice-system-context` | Manifest + DataFlow + Overlay + Trinity |
| `alice-communication` | `lib/abc/alice-communication` | DID, PDS, firehose, records, strong references |
| `alice-trust` | `lib/abc/alice-trust` | Web of trust, SCITT, provenance |
| `alice-supply-chain` | `lib/abc/alice-supply-chain` | Gatekeeper, transparency log, SBOM/VDR |
| `alice-compute-contract` | `lib/abc/alice-compute-contract` | CCRFP — CCB — CCBA — CCR lifecycle |
| `alice-stream-of-consciousness` | `lib/abc/alice-stream-of-consciousness` | onEvent, prioritizer, knowledge graph |

Dep direction: `common ← abc` (never reverse). One `mod.ts` per package.

---

## Implementation Coverage

### COMPLETE (production code, full lifecycle)

**Communication subsystem** — every stub has a real implementation:

| Stub | Implementation | Repo |
|------|---------------|------|
| `herIdentity()` / DID | `hostnameToDid`, `resolvePds`, `IdResolver`, `did:web` + `did:plc` resolution | hono-pds, atproto-market, typescript-helpers |
| `herMemory()` / PDS | `RepoApi` ABC — `Repo` impl — `createRecord/getRecord/deleteRecord/applyWrites` XRPC routes | hono-pds, atproto-market |
| `herEars()` / firehose | `FirehoseWatcher` ABC — `jetstream` + `subscribeRepos` transports | typescript-helpers |
| `writeARecord()` | `createRecord`, `createSignedRecord`, `createSignedRepoRecord` | atproto-market, hono-pds |
| `walkTheReferences()` | `RecordResolver` ABC — `createRecordResolver` (did—PDS—getRecord chain) | atproto-market |
| `theFirehoseCarriesIt()` | `FirehoseSequencer` + `subscribeRepos` WS endpoint | hono-pds, atproto-relay |
| `StrongRef` / `RepoRecord` | `StrongRef` type + `strongRef()` factory, all lexicon record types | atproto-market, deno-worker-sandbox |
| Service auth | `signServiceAuth` + `verifyServiceAuth` + `getServiceAuth` JWT flow | hono-pds, atproto-market, did-key-relay, deno-worker-sandbox |

**Compute Contract subsystem** — fully built, end-to-end:

| Stub | Implementation | Repo |
|------|---------------|------|
| `getMyWorkRun()` | `runComputeContract()` — 6-step lifecycle orchestrator | atproto-market |
| `publishCCRFP()` | `compute.vm` record + signed `market.rfp` | atproto-market |
| `biddersAnswerWithCCB()` | `createVmBidderCallbacks` / `createWorkerBidderCallbacks` | atproto-market |
| `policyEnginePicksABidder()` | Lowest-cost winner selection (trust filter stub) | atproto-market |
| `acceptWithCCBA()` | Signed `market.accept` — `submitAccept` | atproto-market |
| `payPerTheTerms()` | X402 settlement: `mintReceiptForAccepts` + `settleX402Payment` + free settlement | atproto-market |
| `bobPublishesCCR()` | `market.receipt` + signature verification chain | atproto-market |
| `reverseProxyEnforcesAccess()` | fedproxy-client (Go) + RBAC OIDC token exchange + SSH relay | atproto-reverse-proxy, hono-compute-provider |
| Compute provisioning | `compute-provider-local` (container) + `compute-provider-digitalocean` (droplet) | hono-compute-provider |
| `buildDefaultUserData` | `cloud-init-common`: `buildDefaultUserData` + `patchDefaultUserData` + `buildTunnelUserData` | atproto-market |
| SSH tunnel / WebSocket | `did-key-relay` tunnel + subscriber + `createSshSessionProvider` | did-key-relay, atproto-market |
| Sandbox / isolated execution | `Sandbox` ABC — Deno worker + persistent worker + permission policies | deno-worker-sandbox |
| Bidder discovery | `discoverBiddersFromRelay` + `autoDiscoverRelayUrls` | atproto-market |

**System Context / DataFlow / Overlay** — fully built (Python/DFFML):

| Stub | Implementation | Repo |
|------|---------------|------|
| `describeTheSystemAsData()` | `SystemContext` class + `SystemContextConfig` | dffml |
| `theManifest()` | `DataFlow` class (operations+seed+configs+definitions+flow) | dffml |
| `theDataFlow()` | `InputFlow`, `Forward`, `Stage`, `Operation` via Entrypoint | dffml |
| `theOverlay()` | `Overlay` class (extends DataFlow+Entrypoint, `apply` method) | dffml |
| `freezeSystemContext()` | `config_as_defaults_for_subclass`, `deployment()` frozen execution | dffml |
| `subflowWithLockTaken()` | `BaseLockNetwork` + `MemoryLockNetwork` + lock acquisition | dffml |
| `subflowTypecast()` | `subflow()` + `run_custom()` typed sub-context execution | dffml |
| `dataflowCacheExportImport()` | `DataFlow.export()` / `._fromdict()` full serialization | dffml |

**SCITT Transparency Service** — fully built (Python):

| Stub | Implementation | Repo |
|------|---------------|------|
| `scittTransparencyService()` | `SCITTServiceEmulator` — COSE Sign1 claim submission, receipt generation (CCF/RKVST tree algs), policy-based admission, DID-based identity, OIDC auth | scitt-api-emulator |
| Statement creation | `create_statement.py` — COSE Sign1 with CWT claims, DID:JWK issuer, registration policy headers, URN generation | scitt-api-emulator |
| Statement verification | `verify_statement.py` — COSE Sign1 verification with pluggable key loaders (did:jwk, did:web, OIDC issuer, SSH authorized_keys) | scitt-api-emulator |
| SCITT API server | `server.py` — Flask-based: entry submission, receipt retrieval, operation tracking, service parameters | scitt-api-emulator |
| Tree algorithms | `tree_algs.py` — Registry dispatching to CCF + RKVST backends | scitt-api-emulator |
| OIDC integration | `oidc.py` — OIDC auth middleware, token-based admission for SCITT endpoints | scitt-api-emulator |
| SCITT client | `client.py` — Submits claims, fetches receipts | scitt-api-emulator |
| DID helpers | `did_helpers.py` — `did:web` URL conversion, `did:jwk` support | scitt-api-emulator |

**Policy Engine / OPA-style Admission Control** — fully built:

| Stub | Implementation | Repo |
|------|---------------|------|
| `openPolicyAgentOverlay()` | 2893-line GitHub Actions workflow evaluation engine: downloads workflow steps, evaluates JavaScript expressions, builds step outputs/env/inputs, maintains operation state | scitt-api-emulator |
| TypeScript workflow evaluator | `workflow.ts` — Deno-based GH Actions workflow engine with sandboxed JS eval, composite action support | sshai |
| Action execution | `action_worker.ts` — Bundled `actions/checkout`, `dorny/paths-filter` execution | sshai |
| `scittNotarizingProxyInCiCd()` | `.github/workflows/notarize.yml` — Reusable workflow: OIDC token fetch, claim creation, SCITT submission with `repository_id`/`repository_owner_id` claim pinning | scitt-api-emulator |

**SCITT Federation** — direction changed: ActivityPub superseded by atproto:

The project has moved away from ActivityPub toward AT Protocol as the
federation transport. Federation of claims/receipts now rides the same
mechanism as everything else: signed records on a PDS, carried by the
firehose, discovered by watchers. `federateClaimsDownstream()` maps to
"write the SCITT receipt as an atproto record; downstream instances ingest
it via their firehose watchers" — the transport is already COMPLETE
(see Communication subsystem). What remains is the lexicon + glue.

| Stub | Implementation | Status |
|------|---------------|--------|
| `federateClaimsDownstream()` | Target: SCITT receipts as atproto records on PDS, federated via firehose (`FirehoseWatcher` + `createRecord` both COMPLETE) | Transport built; SCITT-receipt lexicon + emitter glue not yet written |
| Federation signals | `signals.py` — Blinker signal framework for federation event hooks | scitt-api-emulator (branch) — hook framework reusable for atproto emitter |
| ~~ActivityPub plugin~~ | `federation_activitypub_bovine.py` (486 lines, unmerged branch) — wraps CBOR receipt in ActivityPub Create+Note | **LEGACY** — superseded by atproto direction; do not merge |

**Record Attestation / Badge.blue** — fully built:

| Stub | Implementation | Repo |
|------|---------------|------|
| `verifyRecordSignatures()` | `Attestation` class, `createInlineAttestation`, `createRemoteAttestation`, `appendInlineAttestation`, CID computation (DAG-CBOR + SHA-256 + CIDv1), ECDSA signing (P-256, K-256), inline and remote proof verification | atproto-market |
| `scittNotaryAssertionRegistry()` | `network.attested.*` lexicon: `proof.json` (remote attestation), `signature.json` (inline), `verify.json` (verification XRPC) | atproto-market |
| `atpScittIntegration()` | `verifyRecordAttestations()` middleware for PDS server, `network.attested.verify` XRPC endpoint | atproto-market |

**Supply Chain Scanning / ShouldI** — fully built (Python):

| Stub | Implementation | Repo |
|------|---------------|------|
| `scanIntoTrustAttestation()` | `ShouldI` CLI with `install` + `use` commands: multi-language vulnerability scanning | dffml |
| Dependency scanning | `bandit` (Python), `safety` (Python vulns), `npm_audit` (JS), `cargo_audit` (Rust), `dependency_check` (Java/OWASP), `golangci-lint` (Go) | dffml |
| BOM generation | `mkbom` with PyPI backend, YAML-backed DependencyDB, Python package introspection | dffml |

**SSHAI / AGI Agent** — fully built:

| Stub | Implementation | Repo |
|------|---------------|------|
| `secureSoftwareFactory()` | `agi.py` (5426 lines) — GitHub webhook ingestion, workflow dispatch, SCITT URN-based CVE triggers, MCP tool plugin system, tmux/socket PTY attachment for agent shell access | sshai |

**Cross-cutting infrastructure** — fully built:

| Stub | Implementation | Repo |
|------|---------------|------|
| `EventBus` | `EventBus<T>` generic pub-sub (used by sequencer, relay, static-files) | typescript-helpers |
| Config system | `Command` class (flag — env — config.json — default chain) | typescript-helpers |
| Logger | `createLogger` + `createStructuredLogger` + `StructuredLoggerInterface` | typescript-helpers |
| `onEvent` callback | `onEvent` hook in Subscriber ABC + relay firehose frames | did-key-relay, atproto-relay |
| `summarize()` | `summarizeFrame()` — extracts key fields from relay frames | did-key-relay |

**OIDC Workload Identity** — fully built:

| Stub | Implementation | Repo |
|------|---------------|------|
| `oidcSelfIssuedEdge()` | `OidcIssuer` ABC — `createOidcIssuer` (JWK management, token issue/prove, RSA signing), integrated into local + DigitalOcean compute providers | hono-compute-provider |
| OIDC RBAC | Token exchange middleware, provisioning enricher, SSH key RBAC registration. 5 integration tests (container, VM, SSH, callback) | hono-compute-provider |

### PARTIAL (infrastructure exists, integration incomplete)

| Stub | What exists | What's missing |
|------|------------|----------------|
| `doITrustWhereThisCameFrom()` | `verifyRecordSignatures` (attestation verification), `verifyInlineAttestation`, `verifyRemoteProof`, `verifyBadgeBlueKeysRecord`, `verifyAppAttestChain` | Trust evaluation policy engine — signatures verified but no web-of-trust lookup before decision |
| `webOfTrust()` | `AttestationKeypair` ABC, `createBadgeBlueSigner`, `loadOrGenerateKeypair`, `KeysForDid` type. Vouch NSID `sh.tangled.graph.vouch` defined | No vouch/denounce record graph traversal. No accumulated trust scoring |
| `vouchesAndDenouncements()` | Vouch-based bidder discovery: fetches `sh.tangled.graph.vouch` records, filters out "denounce" kind | No vouch writing, no vouch graph ranking, no denounce NSID defined |
| `enclaveAttestationIsASignalNotAFoundation()` | Apple App Attest (`dc_attest_key`), software fallback (Web Crypto X.509), `AppAttestService` ABC | Attestation data not fed into trust decision. Hardware signal collected but not weighed |
| `gatekeeper()` | `shouldi` dependency scanners (bandit, safety, npm_audit, cargo_audit, OWASP dep-check, golangci-lint), SBOM generation (`mkbom`), SPDX SBOM file. SCITT policy engine evaluates admission workflows | No integrated admission pipeline that chains scanner output — SCITT admission. Scanners exist standalone |
| `checkBillOfMaterialsAgainstLog()` | BOM structure with DependencyDB, UUID-based dedup, PyPI/YAML backends. CycloneDX 1.5 SBOM for DFFML | SBOM generation command logs: "does not generate an SBOM yet." No log check integration |
| `prioritizer()` | `score()` stub in dffml | Returns hardcoded `"think"`. No scoring. No `notify|think|act` decision matrix |
| `thinkMoreDeeply()` | `subflows` tracking + `subflow_system_context_added` + `subflow_context_result` forwarding (DFFML orchestrator) | Entity Analysis Trinity not wired. Sub-context chain exists but trinity analysis not driving it |
| `onEvent()` (stream of consciousness) | `onEvent` callback hooks in subscriber + relay | No `isRelevant` — `summarize` — `prioritizer` — `notify|thinkMoreDeeply` pipeline wired together |
| `entityAnalysisTrinity()` | Static analysis `NewType` definition exists (dffml `examples/innersource`) | No intent analysis. No dynamic analysis. No triangulation between three corners |
| `conformityAssessment()` | SCITT policy engine provides admission policy evaluation mechanism | No ISO/IEC 17000 1st/2nd/3rd party attestation framework. No attestation level weighting |
| `dataProvenanceTracking()` | Firehose watchers track AT Protocol events. ShouldI scanners produce vulnerability data | No inference provenance chain tracking. No training data provenance |

### STUB ONLY (zero production code outside open-architecture/)

| Stub | Notes |
|------|-------|
| `livingThreatModel()` | THREATS.md files exist in `.reference/rbac/` and `deno-macos-runner-desktop/` (590 lines) but are static docs, not living/data-driven |
| `livingSbomVdr()` | VDR schema proposed but not implemented |
| `knowledgeGraph()` | DFFML MemoryOrchestrator tracks state but no persisted knowledge graph with provenance |
| `isRelevant()` | No relevance filter implementation |
| `notify()` | No notification dispatch |
| `hypothesizeSystemContext()` | SystemContext ABC exists but no context sharing between Alice instances |
| `gatherExceptionReceipts()` | No exception receipt flow |
| `applyThreatModelOverlay()` | Overlay infrastructure exists (DFFML) but not applied to threat models |
| `trustByVerifyContinuously()` | No continuous re-verification loop |
| `chainsOfContext()` | Source update append mode for provenance — discussed in comms/0100, no code |
| `trainOfThoughtGraffiti()` | Adversarial injection detection — no code |
| `trainOfThoughtHardening()` | Tamper-evident reasoning stream — no code |
| `keriControllerAsDiceRootOfTrust()` | KERI + DICE integration — no code |
| `keriDuplicityDetection()` | Duplicity-evident key event logs — no code |
| `keriSignedReleaseArtifactStream()` | Signed release artifact stream (originally ActivityPub, now targets atproto records) — no code |
| `keriAcdcAsScittBackend()` | ACDC as SCITT backend — no code |
| `recursiveTrustComposition()` | Federated TEE + hermetic + KERI recursion — no code |
| `notaryLatticeTrustGraph()` | Per-entity notary chains as lattice — no code |
| `teeToTeeAttestationChain()` | Local-before-remote attestation — no code |
| `ratsEntityMeasurementAttestation()` | IETF RATS EAT measurements — no code |
| `machineContinuousSoul()` | Continuous attestation stream — no code |
| `dynamicTrustRootsPerBom()` | Fulcio ephemeral DIDs per BOM component — no code |
| `entityAlignmentTrustGraph()` | Trust graph alignment measurement — no code |
| `cisaSelfAttestationForm()` | M-22-18 conformity assessment — no code |
| `openVexActivityPubBridge()` | OpenVEX template exists, no bridge logic. Direction change: bridge target is now atproto records/firehose, not ActivityPub — stub name kept for provenance |
| `csafVexFramework()` | CSAF framework — no code |
| `cveToSourceMapping()` | CVEMAP approach discussed, bitrotted |
| `livingThreatsMd()` | No `alice threats` CLI implementing ThreatDragon—Markdown pipeline |
| `supplyChainRiskManagementChecklist()` | 35-item SCRM questionnaire — no code |
| `everythingAsContainerBuild()` | FROM-chain rebuild graph concept — no code |

---

## Summary

```
Communication:              ████████████████████ 100%
Compute Contract:           ████████████████████ 100%
System Context:             ████████████████████ 100%  (DFFML Python)
SCITT Transparency:         ████████████████████ 100%  (scitt-api-emulator)
Policy Engine (OPA-style):  ████████████████████ 100%  (scitt-api-emulator + sshai)
Infrastructure:             ████████████████████ 100%  (config, log, event bus)
Record Attestation:         ████████████████████ 100%  (badge.blue, atproto-market)
OIDC Workload Identity:     ████████████████████ 100%  (hono-compute-provider)
Supply Chain Scanning:      ████████████████████ 100%  (shouldi multi-language)
Federation (via atproto):   ████████████░░░░░░░░  60%  (transport COMPLETE; SCITT-receipt lexicon + emitter glue missing; ActivityPub plugin LEGACY, will not merge)
Trust (crypto):             ████████████░░░░░░░░  60%  (signatures + attestation exist, web-of-trust doesn't)
Supply Chain (pipeline):    ██████░░░░░░░░░░░░░░  30%  (scanners exist, gatekeeper orchestrator doesn't)
Stream of Consciousness:    ████░░░░░░░░░░░░░░░░  20%  (onEvent hooks exist, prioritizer/knowledge graph don't)
Trust (policy/model):       ██░░░░░░░░░░░░░░░░░░  10%  (KERI, living threat model, conformity — all stub)
```

**What's built:** The transport layer, compute contract lifecycle, SCITT
transparency service, policy engine, record attestation, and dependency
scanners are all production-quality. Records flow from PDS — firehose — watcher
— bidder — contract — provision — tunnel — SSH. SCITT claims flow through
COSE Sign1 — registration policy — transparency log — receipt verification.
Supply chain scanning covers Python, JS, Rust, Go, and Java.

**What's missing:** Alice's *reasoning* — the trust evaluation engine that
weighs vouches and denouncements, the prioritizer that decides
notify/think/act, the knowledge graph with provenance, the integrated
gatekeeper pipeline that chains scanner output — SCITT admission, the living
threat model that evolves with every attestation. KERI duplicity detection,
TEE attestation chains, and conformity assessment remain design discussions.

**Direction note (2026-07):** ActivityPub is superseded by AT Protocol for
all federation. Any stub, comm, or branch referencing ActivityPub as a
transport should be read as targeting atproto records + firehose instead.
The unmerged `federation_activitypub_bovine` branch is legacy and will not
be merged; its Blinker signal hook framework is the reusable part.

**The nervous system works. The brain is still docs-as-code stubs.**

## Regenerating This Report

Ask Claude: "regenerate the status report" or invoke the `status-report` agent
(defined at `.claude/agents/status-report.md`). The agent fans out 5
cavecrew-investigator subagents across the polyrepo, maps findings to the
docs-as-code stubs in `open-architecture/lib/abc/`, and produces this file.
