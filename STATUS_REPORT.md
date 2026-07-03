# Open Architecture — Implementation Status Report

Generated 2026-07-03 from 10-agent polyrepo codegraph fan-out.
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

## Poly-Repo Layout

| Repo | Type | Purpose |
|------|------|---------|
| `atproto-market/` | submodule | Market engine: RFP, bid, accept, requester, bidder, policies, attestation |
| `hono-compute-provider/` | submodule | Compute provisioning: local containers, DigitalOcean droplets, OIDC/RBAC |
| `did-key-relay/` | submodule | XRPC relay: WebSocket tunnel, subscriber, dispatcher |
| `deno-macos-runner-desktop/` | submodule | macOS desktop tray app: bidder UI, OAuth, device keys |
| `hono-pds/` | submodule | AT Protocol Personal Data Server (PDS) |
| `atproto-relay/` | submodule | AT Protocol relay: firehose aggregation, collection indexing |
| `deno-worker-sandbox/` | submodule | Isolated Deno worker sandbox: permission policies, persistent workers |
| `open-architecture/` | submodule | Docs-as-code architecture blueprint (this report) |
| `typescript-helpers/` | submodule | Cross-repo shared utilities (event bus, config, logger, serve, firehose watchers) |
| `codebase-rag-proxy/` | direct (untracked) | Codebase RAG proxy: retrieval ABC + skalex impl, LLM proxy ABC + anthropic impl |
| `atproto-reverse-proxy/` | direct | Go service: fedproxy-client, RBAC OIDC token exchange, SSH relay |
| `.reference/` | direct (docs) | Reference implementations (rbac, compute-contract POC) — not production |
| `docs/` | direct | Documentation |
| `scripts/` | direct | Build/test scripts (test-all, commit-and-push-all, status-report) |

9 submodules, 5 direct directories. 142 total `deno.json` package directories.

External repos (NOT submodules, NOT cloned locally):

| Repo | Language | Purpose |
|------|----------|---------|
| `scitt-community/scitt-api-emulator` | Python | SCITT transparency service, policy engine, tree algs |
| `dffml` | Python | SystemContext/DataFlow/Overlay, ShouldI scanners, BOM generation |
| `sshai` | Python + TypeScript | AGI agent, workflow evaluator, MCP tool plugin system |

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
| `publishCCRFP()` | `compute.vm` record + signed `market.rfp` with optional `policy` strongRef to pluggable fulfillment policy (policies.only_me / policies.direct_network / policies.workflow_gha) | atproto-market |
| `biddersAnswerWithCCB()` | `createVmBidderCallbacks` / `createWorkerBidderCallbacks`. OnRfp callback evaluates RFP policy before bidding. | atproto-market |
| `policyEnginePicksABidder()` | Lowest-cost winner selection + fulfillment policy evaluation (trust graph for direct_network, operator DID match for only_me, GHA workflow for policy_based) | atproto-market |
| `acceptWithCCBA()` | Signed `market.accept` — `submitAccept` | atproto-market |
| `payPerTheTerms()` | X402 settlement: `mintReceiptForAccepts` + `settleX402Payment` + free settlement | atproto-market |
| `bobPublishesCCR()` | `market.receipt` + signature verification chain | atproto-market |
| `reverseProxyEnforcesAccess()` | fedproxy-client (Go) + RBAC OIDC token exchange + SSH relay | atproto-reverse-proxy, hono-compute-provider |

**Fulfillment Policy subsystem** — pluggable, following settlement pattern:

| Stub | Implementation | Repo |
|------|---------------|------|
| `policyAsContentAddressedArtifact()` | `market.rfp.policy` strongRef → `market.policies.*` records. Content-addressed, signed, carries downstream through subcontracting chains. | atproto-market |
| `only_me` policy | `createOnlyMePolicy()` — resolves bidder's operator DID via `bidderAssociation`, checks `operatorDid === rootRequesterDid`. | atproto-market |
| `direct_network` policy | `createDirectNetworkPolicy()` — traverses `sh.tangled.graph.vouch` from root requester, checks operator DID in vouch set. Pre-loaded vouchedDids for fast firehose watcher filtering. | atproto-market |
| `workflow_gha` policy | `createWorkflowGhaPolicy()` — stub for running GHA workflows via policy-engine (policy-based scope). | atproto-market |
| `bidderAssociation` | Reverse pointer from bidder's repo → operator's `badgeBlueKeys` record. Bridges did:key → operator DID for graph traversal. Created post-OAuth in desktop apps. | atproto-market |
| Desktop scope UI | Tray UI "Only Me" / "Direct Network" / "Policy-based" → `ProviderState.acceptScope` → `createMarketBidder({acceptScope})` → firehose filter + push-path filter. Bidder restarts on scope change. | deno-macos-runner-desktop |
| CLI scope flag | `request-vm-ssh --policy-mode=only_me|direct_network|policy_based` or `POLICY_MODE` env var → `runComputeContract({policyMode})` → policy record minted + attached to RFP. | atproto-market |
| Compute provisioning | `compute-provider-local` (container) + `compute-provider-digitalocean` (droplet) | hono-compute-provider |
| `buildDefaultUserData` | `cloud-init-common`: `buildDefaultUserData` + `patchDefaultUserData` + `buildTunnelUserData` | atproto-market |
| SSH tunnel / WebSocket | `did-key-relay` tunnel + subscriber + `createSshSessionProvider` | did-key-relay, atproto-market |
| Sandbox / isolated execution | `Sandbox` ABC — Deno worker + persistent worker + permission policies | deno-worker-sandbox |
| Bidder discovery | `discoverBiddersFromRelay` + `autoDiscoverRelayUrls` | atproto-market |

**System Context / DataFlow / Overlay** — fully built (Python/DFFML, external repo):

| Stub | Implementation | Repo |
|------|---------------|------|
| `describeTheSystemAsData()` | `SystemContext` class + `SystemContextConfig` | dffml (EXTERNAL — not a submodule, not cloned locally; installed via PyPI) |
| `theManifest()` | `DataFlow` class (operations+seed+configs+definitions+flow) | dffml (EXTERNAL) |
| `theDataFlow()` | `InputFlow`, `Forward`, `Stage`, `Operation` via Entrypoint | dffml (EXTERNAL) |
| `theOverlay()` | `Overlay` class (extends DataFlow+Entrypoint, `apply` method) | dffml (EXTERNAL) |
| `freezeSystemContext()` | `config_as_defaults_for_subclass`, `deployment()` frozen execution | dffml (EXTERNAL) |
| `subflowWithLockTaken()` | `BaseLockNetwork` + `MemoryLockNetwork` + lock acquisition | dffml (EXTERNAL) |
| `subflowTypecast()` | `subflow()` + `run_custom()` typed sub-context execution | dffml (EXTERNAL) |
| `dataflowCacheExportImport()` | `DataFlow.export()` / `._fromdict()` full serialization | dffml (EXTERNAL) |

**SCITT Transparency Service** — fully built (Python, external repo):

| Stub | Implementation | Repo |
|------|---------------|------|
| `scittTransparencyService()` | `SCITTServiceEmulator` — COSE Sign1 claim submission, receipt generation (CCF/RKVST tree algs), policy-based admission, DID-based identity, OIDC auth | scitt-api-emulator (EXTERNAL — `scitt-community/scitt-api-emulator`, not a submodule, not cloned locally) |
| Statement creation | `create_statement.py` — COSE Sign1 with CWT claims, DID:JWK issuer, registration policy headers, URN generation | scitt-api-emulator (EXTERNAL) |
| Statement verification | `verify_statement.py` — COSE Sign1 verification with pluggable key loaders (did:jwk, did:web, OIDC issuer, SSH authorized_keys) | scitt-api-emulator (EXTERNAL) |
| SCITT API server | `server.py` — Flask-based: entry submission, receipt retrieval, operation tracking, service parameters | scitt-api-emulator (EXTERNAL) |
| Tree algorithms | `tree_algs.py` — Registry dispatching to CCF + RKVST backends | scitt-api-emulator (EXTERNAL) |
| OIDC integration | `oidc.py` — OIDC auth middleware, token-based admission for SCITT endpoints | scitt-api-emulator (EXTERNAL) |
| SCITT client | `client.py` — Submits claims, fetches receipts | scitt-api-emulator (EXTERNAL) |
| DID helpers | `did_helpers.py` — `did:web` URL conversion, `did:jwk` support | scitt-api-emulator (EXTERNAL) |

**Policy Engine / OPA-style Admission Control** — fully built (external repos):

| Stub | Implementation | Repo |
|------|---------------|------|
| `openPolicyAgentOverlay()` | 2893-line GitHub Actions workflow evaluation engine: downloads workflow steps, evaluates JavaScript expressions, builds step outputs/env/inputs, maintains operation state | scitt-api-emulator (EXTERNAL — `scitt-community/scitt-api-emulator`, not a submodule) |
| TypeScript workflow evaluator | `workflow.ts` — Deno-based GH Actions workflow engine with sandboxed JS eval, composite action support | sshai (EXTERNAL — not a submodule, not cloned locally) |
| Action execution | `action_worker.ts` — Bundled `actions/checkout`, `dorny/paths-filter` execution | sshai (EXTERNAL — not a submodule, not cloned locally) |
| `scittNotarizingProxyInCiCd()` | SCITT CI/CD notarization via OIDC token fetch, claim creation, SCITT submission with `repository_id`/`repository_owner_id` claim pinning | scitt-api-emulator (EXTERNAL). NOTE: `.github/workflows/notarize.yml` previously referenced does not exist in any polyrepo repo. The SCITT policy engine exists within the external scitt-api-emulator repo only |

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
| Federation signals | `signals.py` — Blinker signal framework for federation event hooks | scitt-api-emulator (EXTERNAL, branch) — hook framework reusable for atproto emitter |
| ~~ActivityPub plugin~~ | `federation_activitypub_bovine.py` (486 lines, unmerged branch) — wraps CBOR receipt in ActivityPub Create+Note | **LEGACY** — superseded by atproto direction; do not merge |

**Record Attestation / Badge.blue** — fully built:

| Stub | Implementation | Repo |
|------|---------------|------|
| `verifyRecordSignatures()` | `Attestation` class, `createInlineAttestation`, `createRemoteAttestation`, `appendInlineAttestation`, CID computation (DAG-CBOR + SHA-256 + CIDv1), ECDSA signing (P-256, K-256), inline and remote proof verification | atproto-market |
| `scittNotaryAssertionRegistry()` | `network.attested.*` lexicon: `proof.json` (remote attestation), `signature.json` (inline), `verify.json` (verification XRPC) | atproto-market |
| `atpScittIntegration()` | `verifyRecordSignatures()` in market server handlers (`createVerifyHandler`), `network.attested.verify` XRPC endpoint. Attestation verification at market server layer, not PDS middleware | atproto-market |

**Supply Chain Scanning / ShouldI** — fully built (Python, external repo):

| Stub | Implementation | Repo |
|------|---------------|------|
| `scanIntoTrustAttestation()` | `ShouldI` CLI with `install` + `use` commands: multi-language vulnerability scanning | dffml (EXTERNAL — not a submodule; shouldi installed via PyPI v0.1.0.post0) |
| Dependency scanning | `bandit` (Python), `safety` (Python vulns), `npm_audit` (JS), `cargo_audit` (Rust), `dependency_check` (Java/OWASP), `golangci-lint` (Go) | dffml (EXTERNAL) |
| BOM generation | `mkbom` with PyPI backend, YAML-backed DependencyDB, Python package introspection | dffml (EXTERNAL) |

**SSHAI / AGI Agent** — external repo, fully built:

| Stub | Implementation | Repo |
|------|---------------|------|
| `secureSoftwareFactory()` | `agi.py` (5426 lines) — GitHub webhook ingestion, workflow dispatch, SCITT URN-based CVE triggers, MCP tool plugin system, tmux/socket PTY attachment for agent shell access | sshai (EXTERNAL — not a submodule, not cloned locally) |

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
| OIDC RBAC | Token exchange middleware, provisioning enricher, SSH key RBAC registration. 6 integration tests (container, VM, SSH, SSH relay, callback) | hono-compute-provider |

### PARTIAL (infrastructure exists, integration incomplete)

| Stub | What exists | What's missing |
|------|------------|----------------|
| `doITrustWhereThisCameFrom()` | `verifyRecordSignatures` (attestation verification), `verifyInlineAttestation`, `verifyRemoteProof` | Trust evaluation policy engine — signatures verified but no web-of-trust lookup before decision. `verifyBadgeBlueKeysRecord` and `verifyAppAttestChain` referenced in prior STATUS_REPORT but do not exist in production code |
| `webOfTrust()` | `AttestationKeypair` ABC, `createBadgeBlueSigner`, `loadOrGenerateKeypair`, `KeysForDid` type. Vouch NSID `sh.tangled.graph.vouch` defined | No vouch/denounce record graph traversal. No accumulated trust scoring |
| `vouchesAndDenouncements()` | Vouch-based bidder discovery: fetches `sh.tangled.graph.vouch` records, filters out "denounce" kind | No vouch writing, no vouch graph ranking, no denounce NSID defined |
| `enclaveAttestationIsASignalNotAFoundation()` | `DeviceKeyService` ABC (software-only ECDSA P-256 via Web Crypto), `loadOrCreateMarketKeypair` (desktop secp256k1 key in KeychainStore). No hardware attestation anywhere — Apple App Attest explicitly removed from desktop runner. No `AppAttestService` ABC exists (the ABC is `DeviceKeyService`) | Attestation data not fed into trust decision. Hardware signal not collected — project intentionally chose cross-platform software keys over platform attestation |
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

## Known Architectural Gaps (production code issues, not docs-as-code stubs)

These are discrepancies found in production code during the 2026-07-03 fan-out:

### Fulfillment Policy — evaluate() dead code

`FulfillmentPolicy.evaluate()` is declared in the ABC, implemented in all three
policy packages (`createOnlyMePolicy`, `createDirectNetworkPolicy`,
`createWorkflowGhaPolicy`), but **never called** in any bidder-side RFP dispatch
path. The bidder uses a simple pre-filter (`issuerDid` string compare +
`vouchedDids` set check) instead of evaluating the actual `FulfillmentPolicy`
record on the RFP. The `evaluate()` implementations exist but are dead code.

### resolveOperatorDid — declared, never implemented

The `PolicyEvalCtx.resolveOperatorDid` callback is declared in the interface
but has **no concrete implementation anywhere**. Both `only_me` and
`direct_network` `evaluate()` functions call it, but no caller ever provides
this callback. The did:key → operator DID bridge via `bidderAssociation` is
non-functional at runtime.

### createPolicyPayload() returns fake strongRefs

All three `FulfillmentPolicy.createPolicyPayload()` implementations return
`{uri: "at://...", cid: "" as never}`. The requester-side code discards this
return value and creates the policy record separately. The method's contract
(returning a proper content-addressed strongRef) is not fulfilled.

### bidderAssociation records written but never read

Desktop apps create `bidderAssociation` records post-OAuth (bridging did:key
→ operator DID), but **no code path reads them**. `resolveOperatorDid` (which
was supposed to read them) is unimplemented. Data is written, never consumed.

### getVouchedDids — likely broken

`createDirectNetworkPolicy` wraps `ctx.resolve()` (a strongRef resolver for
single records) as if it were `listRecords` (a collection lister). Resolving
a collection URI returns one record, not a list. Vouch graph traversal for
`direct_network` policy evaluation is likely non-functional.

### External repos not cloned as submodules

These repos are referenced by STATUS_REPORT as fully built but are not
submodules and not cloned locally:

| Repo | Language | Status |
|------|----------|--------|
| `scitt-api-emulator` | Python | `scitt-community/scitt-api-emulator` — external community org |
| `dffml` | Python | Available via PyPI (`shouldi` package), not cloned |
| `sshai` | Python + TypeScript | Not a submodule, not cloned. `agi.py` not found locally |

### Deno worker sandbox — duplicate attestation signing

`deno-worker-sandbox/lib/compute-deno-atproto/signing.ts` contains a third
independent implementation of inline attestation CID computation and ECDSA
signing, duplicating logic from `atproto-market/lib/atproto-attestation-port/`.

## Summary

```
Communication:              ████████████████████ 100%
Compute Contract:           ████████████████████ 100%
Fulfillment Policy:         ███████████████░░░░░  80%  (lexicons+plumbing exist; evaluate() dead code, resolveOperatorDid missing, createPolicyPayload fake strongRefs)
System Context:             ████████████████████ 100%  (DFFML Python — external repo, not a submodule)
SCITT Transparency:         ████████████████████ 100%  (scitt-api-emulator — external repo, not a submodule)
Policy Engine (OPA-style):  ████████████████████ 100%  (scitt-api-emulator + sshai — both external repos)
Infrastructure:             ████████████████████ 100%  (config, log, event bus, serve)
Record Attestation:         ████████████████████ 100%  (badge.blue, atproto-market)
OIDC Workload Identity:     ████████████████████ 100%  (hono-compute-provider, 6 integration tests)
Supply Chain Scanning:      ████████████████████ 100%  (shouldi multi-language — dffml external repo)
Federation (via atproto):   ████████████░░░░░░░░  60%  (transport COMPLETE; SCITT-receipt lexicon + emitter glue missing; ActivityPub plugin LEGACY)
Trust (crypto):             ████████████░░░░░░░░  60%  (signatures + attestation exist; web-of-trust doesn't; no App Attest — project chose cross-platform software keys)
Supply Chain (pipeline):    ██████░░░░░░░░░░░░░░  30%  (scanners exist, gatekeeper orchestrator doesn't)
Stream of Consciousness:    ████░░░░░░░░░░░░░░░░  20%  (onEvent hooks + firehose watchers exist; prioritizer/knowledge graph/notify all stubs)
Trust (policy/model):       ██░░░░░░░░░░░░░░░░░░  10%  (KERI, living threat model, conformity — all stub)
```

**What's built:** The transport layer, compute contract lifecycle, policy lexicons
+ plumbing, record attestation, OIDC workload identity, and cross-cutting
infrastructure are all production-quality in the TypeScript polyrepo. Records
flow from PDS — firehose — watcher — bidder — contract — provision — tunnel —
SSH. Python subsystems (SCITT transparency, supply chain scanning, SystemContext,
policy engine, AGI agent) are fully built but live in **external repos**
(`scitt-community/scitt-api-emulator`, `dffml`, `sshai`) — not submodules, not
cloned locally.

**Known issues in production code** (see Known Architectural Gaps above):
Fulfillment policy `evaluate()` is dead code — never called in bidder dispatch.
`resolveOperatorDid` is declared but never implemented — the did:key → operator
DID bridge doesn't work. `createPolicyPayload()` returns fake strongRefs with
empty CIDs. `bidderAssociation` records are written but never read.
`getVouchedDids` wraps a single-record resolver as a collection lister — likely
broken.

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
