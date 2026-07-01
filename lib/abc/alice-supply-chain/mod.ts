/**
 * Keeping the supply chain honest. The docs-as-code translation of that section
 * of `open_architecture_today.md`.
 *
 * Most of Alice's day is deciding what to let into your world. A new release, a
 * new dependency, a new SBOM, a new build, each one is a thought arriving on
 * the firehose, and each one is a "should I let this in?" She answers with
 * receipts in a transparency log: the gatekeeper pattern.
 *
 * @see open_architecture_today.md "Keeping the Supply Chain Honest"
 * @module
 */

import type { StrongRef } from "@publicdomainrelay/alice-common";
import { doITrustWhereThisCameFrom, scittTransparencyService } from "@publicdomainrelay/alice-trust-abc";
import { theOverlay } from "@publicdomainrelay/alice-system-context-abc";

/**
 * The gatekeeper pattern, as a loop: scan new things into trust attestations,
 * append them to the transparency log, check every component of a build against
 * the log before it runs, and feed the index of what is trusted back into
 * watching for the next release.
 *
 * @see open_architecture_today.md the gatekeeper mermaid diagram
 */
export function gatekeeper(component: StrongRef): void {
  const attestation = scanIntoTrustAttestation(component);
  appendToTransparencyLog(attestation);
  if (!checkBillOfMaterialsAgainstLog(component)) {
    gatherExceptionReceipts(component);
  }
  openPolicyAgentOverlay();
  applyThreatModelOverlay();
  federateClaimsDownstream();
}

/**
 * When something new appears, it gets scanned, and the result becomes a trust
 * attestation for that exact repo and commit, trusted or untrusted.
 *
 * @see open_architecture_today.md "it gets scanned, and the result becomes a trust attestation"
 */
export function scanIntoTrustAttestation(component: StrongRef): StrongRef {
  // Trusted or untrusted, pinned to exact repo and commit.
  doITrustWhereThisCameFrom("did:plc:");
  return component;
}

/**
 * That attestation is appended to a transparency service, an append only log,
 * and indexed. The index of what is trusted feeds back into watching for the
 * next release, and the loop closes.
 *
 * The transparency service is SCITT (Supply Chain Integrity, Transparency, and
 * Trust), which is content agnostic: it holds SBOMs, test results, hardware
 * BOMs, vulnerability disclosures, policy assertions, and Alice's own system
 * contexts as attested claims.
 *
 * @see open_architecture_today.md "appended to a transparency service, an append only log"
 * @see scittTransparencyService
 */
export function appendToTransparencyLog(_attestation: StrongRef): void {
  // Append only. Indexed. Feeds the next round.
  scittTransparencyService();
}

/**
 * Open Policy Agent policies, serialized to JSON, translated into the DID/VC/
 * SCITT claim format, and applied as overlays to flows. Policy serves two
 * roles in this architecture: (1) admission policy -- what types of data the
 * transparency register may accept, and (2) evaluation policy -- how a
 * consumer judges the registered claims for fitness of use.
 *
 * The overlaid flows define the trusted parties within that context as
 * applicable to the active organizational policies. Each policy is itself a
 * SCITT claim, so the policy engine's rules inherit the same provenance and
 * transparency as every other thought on the chain.
 *
 * @see open_architecture_today.md "she applies each affected project's threat model as an overlay"
 * @see scittTransparencyService
 * @see policyEnginePicksABidder
 */
export function openPolicyAgentOverlay(): void {
  // OPA -> JSON -> DID/VC/SCITT. Admission policy + evaluation policy.
  // Applied as overlays to flows within their applicable context.
}

/**
 * Before a build runs, every component in the bill of materials is checked
 * against the log. The build only proceeds if everything in it is trusted.
 *
 * The evidence riding inside those receipts is built from formats the wider
 * community already speaks: in-toto Statement (the envelope), CycloneDX (the
 * SBOM predicate), test-result (the CI evidence), OpenVEX (vulnerability
 * status), and S2C2F (the maturity ladder the policy engine measures against).
 * Artifacts and their receipts live in a content addressed registry, pulled and
 * pushed by digest, so the thing you verified is provably the thing you ran.
 *
 * @see open_architecture_today.md "every component in the bill of materials is checked against the log"
 */
export function checkBillOfMaterialsAgainstLog(_component: StrongRef): boolean {
  livingSbomVdr();
  return true;
}

/**
 * The living SBOM Vulnerability Disclosure Report (VDR) is a NIST-recommended
 * practice: a software vendor publishes a VDR alongside each SBOM showing that
 * every component has been checked against the NIST NVD for known
 * vulnerabilities. The VDR is a living document -- the vendor updates it
 * whenever new vulnerabilities are discovered, so consumers can always answer
 * "What is the vulnerability status of this product, as of now?"
 *
 * SPDX 2.3 includes provisions (K.1.9) for associating an SBOM document with
 * its online NIST VDR attestation. This linking gives the SBOM a pulse: the
 * living VDR breathes life into the living threat model by continuously
 * updating the vulnerability status of each component. The DFFML community
 * intends to use living SBOM VDR capabilities to facilitate the breathing of
 * life into living threat models, facilitating vulnerabilities on
 * architecture.
 *
 * @see open_architecture_today.md "every component in the bill of materials is checked against the log"
 * @see livingThreatModel
 * @see appendToTransparencyLog
 */
export function livingSbomVdr(): void {
  // NIST VDR: a living document linked from SPDX 2.3 SBOM.
  // Continuously updated vulnerability status for each component.
}

/**
 * When a system context cannot quite clear policy, Alice asks the right people
 * to sign off; those exception receipts land back on the stream, she collects
 * them, and re-issues the request for admission with the exceptions attached as
 * an overlay. Policy bends through a documented, signed process instead of
 * breaking quietly.
 *
 * @see open_architecture_today.md "When a system context can't quite clear policy"
 */
export function gatherExceptionReceipts(_component: StrongRef): void {
  // Re-issue admission with exceptions attached as an overlay.
  applyThreatModelOverlay();
}

/**
 * When she does admit a change, she applies each affected project's threat
 * model as an overlay, decides whether to propagate, and if so emits the
 * manifest that triggers the rebuild, recursively fulfilling whatever else
 * needs to rebuild down the chain.
 *
 * @see open_architecture_today.md "she applies each affected project's threat model as an overlay"
 */
export function applyThreatModelOverlay(): void {
  theOverlay();
}

/**
 * Forges federate their evaluated claims to each other, so a decision made in
 * one place travels, with its provenance intact, to everywhere downstream,
 * where it becomes the next thought for the next instance of Alice.
 *
 * @see open_architecture_today.md "Forges federate their evaluated claims to each other"
 */
export function federateClaimsDownstream(): void {
  // Provenance intact, decision travels to every downstream forge.
}

/**
 * Alice's secure CI/CD pipeline: roll container images and publish build events to her stream of consciousness.
 * 
 * Implements the CNCF Secure Software Factory reference architecture (FRSCA — Factory for Repeatable Secure Creation of Artifacts). Uses Jenkinsfile Runner on Kubernetes with pipeline-as-yaml for declarative pipeline definition. Every build step — from source checkout through signing to container push — produces signed receipts that feed Alice's knowledge graph and transparency log. Policy enforcement at each gate (source → build → test → sign → release) via overlay admission controllers. Integrates with Tekton and Kyverno for policy-based pipeline protection. The factory's output (container images, attestations, SBOMs) becomes input to the gatekeeper's SBOM-against-transparency-log verification.
 * 
 * @see comms/0027
 * @see https://github.com/cncf/tag-security/blob/main/supply-chain-security/secure-software-factory/secure-software-factory.md
 * @see https://buildsec.github.io/frsca/
 */
export function secureSoftwareFactory(): void {
  // Related: gatekeeper, scanIntoTrustAttestation, appendToTransparencyLog, openPolicyAgentOverlay
}

/**
 * Default-trust policy pattern: extend benefit of the doubt unless risk analysis yields unacceptable results to the gatekeeper.
 * 
 * "Be nice, knock and the door shall be opened, karma, pay it forward." Trust is the default posture — Alice assumes goodwill until evidence of risk triggers escalation. When an artifact arrives from an unknown source, she admits it provisionally, logs the admission transparently, and watches. If subsequent risk analysis (threat model overlay against OSCAL/S2C2F data) crosses the unacceptable threshold, the gatekeeper revokes trust and gathers exception receipts. This inverts the zero-trust model: verification is post-hoc and transparent rather than pre-flight and blocking. Transparency logs make the pattern safe — every provisional admission is auditable, and bad actors cannot hide. Enables faster collaboration loops because most verification work is deferred.
 * 
 * @see comms/0031
 */
export function policyBenefitOfDoubt(): void {
  // Related: gatekeeper, openPolicyAgentOverlay, gatherExceptionReceipts, appendToTransparencyLog
}

/**
 * Categorization of plugins and tools into 2nd party (org-local) and 3rd party (external/open source) catalogs, exposed as a discoverable tool catalog for LLM agents.
 * 
 * 2nd party plugins are org-local OpenAPI endpoints that Alice can call within the organization's trust boundary. 3rd party plugins are external open-source tools or external OpenAPI endpoints. Both are registered in a tool catalog accessible via a /tools/list endpoint, which LLM agents query at runtime to discover available capabilities. This pattern mirrors the SCITT emulator's policy engine tool catalog and enables Alice to dynamically compose workflows across internal and external tools. Each plugin's install method is itself an operation name, and deployment types can override which operation implementations are preferred for a given environment.
 * 
 * @see comms/0039
 * @see intel/dffml#1061
 * @see intel/dffml#1207
 */
export function pluginPartyCatalog(): void {
  // Related: gatekeeper
}

/**
 * SCITT registry stores attestation assertions from notaries, not the signed artifacts themselves.
 * 
 * The notary (gatekeeper) holds insert permissions into the SCITT transparency ledger. What goes on chain is an assertion — a claim about an artifact — not the artifact itself (e.g., not the signed SBOM, but the notary's attestation that it verified the SBOM). Consumers submit content-addressed objects to query registries and determine trust by inspecting notary claims. This design separates artifact storage from trust evidence, enabling independent verification without requiring artifact hosting by the registry.
 * 
 * @see comms/0041
 */
export function scittNotaryAssertionRegistry(): void {
  // Related: gatekeeper
}

/**
 * GitHub Actions workflow taking overlays as pip-installable inputs to determine contribution viability with provenance.
 * 
 * The `.github/workflows/alice_shouldi_contribute.yml` workflow accepts a list of overlays — anything passable to `pip install` as an argument (beyond requirements.txt limitations) — and executes them via SLSA-compliant reusable workflows. This enables arbitrary metric collection with any overlay, with cryptographic provenance for both runtime execution and the resulting data and models downstream. Living Threat Models drive continuous re-evaluation: each overlay run is a fresh threat model assessment against current dependency state.
 * 
 * @see comms/0044
 */
export function shouldiContributeOverlayPipeline(): void {
  // Related: gatekeeper
}

/**
 * SCITT positioned as the trust registry within the Trust over IP (ToIP) Layer 4 ecosystem governance framework.
 * 
 * The ToIP stack has two parallel halves — technical and governance — operating at four layers: Utility (DLT/Blockchain), Agent/Wallet, Credential Exchange (Issuer/Verifier/Holder), and Ecosystem (Application). A trust registry at Layer 4 enables a governing authority for an ecosystem governance framework (EGF) to specify what governed parties are authorized to perform what actions. SCITT (and rekor) fill this role: the transparency ledger becomes the authoritative registry of which issuers are authorized to issue which types of verifiable credentials and attestations within a governed ecosystem.
 * 
 * @see comms/0046
 */
export function scittToipTrustRegistry(): void {
  // Related: doITrustWhereThisCameFrom, gatekeeper
}

/**
 * Alice helps you understand what your software is EATing — the health of its software supply chain modeled as a biological food chain. You are what you EAT: your software is its development health, and you get out what you put in lifecycle-wise.
 * 
 * The metaphor maps biological supply chain concepts onto software: just as an organism's health depends on what it consumes, a software project's security posture depends on its dependencies, build provenance, and CI/CD inputs. Alice integrates scorecard checks and sigstore gitsign verification to assess supply chain health continuously.
 * 
 * @see comms/0055
 * @see https://github.com/ossf/scorecard/blob/main/docs/checks.md
 * @see https://github.com/sigstore/gitsign
 */
export function softwareSupplyChainHealthMetaphor(): void {
  // Related: checkBillOfMaterialsAgainstLog, scanIntoTrustAttestation
}

/**
 * GitHub Actions OIDC tokens provide self-attested (GitHub-assisted) scan data provenance that feeds into the SCITT OpenSSF Metrics Use Case. The standard GitHub workflow + sigstore toolchain produces machine-attested provenance: the CI runner's OIDC token binds the build to a specific repository and commit, Fulcio issues a short-lived signing certificate, and the signed artifact lands in the Rekor transparency log.
 * 
 * Alice consumes this OIDC-attested scan data as an input to her gatekeeper pipeline. The attestation chain — GitHub OIDC → Fulcio → Rekor → SCITT — creates a verifiable provenance trail from source commit to scanned artifact without requiring developers to manage signing keys.
 * 
 * @see comms/0054
 * @see https://github.com/pdxjohnny/use-cases/blob/openssf_metrics/openssf_metrics.md
 * @see intel/dffml#1207
 */
export function githubActionsOidcSelfAttestation(): void {
  // Related: scanIntoTrustAttestation, appendToTransparencyLog, scittTransparencyService
}

/**
 * SCITT facilitates post-instance-creation labeling: a notary may add statements to the transparency infrastructure at a later point after the initial registration. Consumers who need those late-arriving labels must either query the notary directly or require up-to-date receipts from them.
 * 
 * This addresses the temporal decoupling problem: multiple SBOMs may exist for a single software release, inserted by multiple notaries using different scanner implementations. The SCITT registry provides the dataset; trust graphs are constructed later via graph queries that join registry data with other data. SCITT solves for persistence and auditability of the assertions, not for the graph queries themselves — the graph is projected from the registry data at query time.
 * 
 * Earlier understanding: SCITT notaries register assertions into the transparency registry, feeding the gatekeeper's admission decision.
 * 
 * @see comms/0054
 * @see https://datatracker.ietf.org/doc/charter-ietf-scitt/
 * @see https://vocabulary.transmute.industries/
 */
export function scittPostInstanceLabeling(): void {
  // Related: scittTransparencyService, appendToTransparencyLog, gatekeeper
}

/**
 * Confidential computing-backed ledger (Azure Confidential Ledger, Constellation confidential Kubernetes) stores the roots of trust for transparency log services (Rekor, Fulcio) in the OpenSSF use case.
 * 
 * The threat model: if the transparency log's own root keys are compromised, the entire supply chain verification chain collapses. By storing these roots inside a TEE-backed confidential ledger with hardware attestation, Alice gains cryptographic proof that the root material has not been tampered with — even the cloud provider cannot access it. Constellation extends this to the entire Kubernetes cluster, shielding workloads from the underlying infrastructure.
 * 
 * Connects to the C2PA provenance standard and FLOSS Weekly discussions on AI provenance with SSI.
 * 
 * @see comms/0048
 * @see https://github.com/edgelesssys/constellation
 * @see https://docs.edgeless.systems/constellation/architecture/attestation
 * @see https://learn.microsoft.com/en-us/azure/confidential-ledger/overview
 */
export function confidentialLedgerForTransparencyRoots(): void {
  // Related: scittTransparencyService, doITrustWhereThisCameFrom
}

/**
 * On-demand container image builds where final layers are added statically, each layer carrying its own SBOM with provenance from sigstore. Pulls from the registry are authorized by verifiable credential, and releases receive SCITT receipts for content-addressable verifiability.
 * 
 * Two tiers of data storage mirror two tiers of trust: data.nahdig.com serves data with suspect provenance (best-effort, assume VM compromise), while data.chadig.com serves only data with verified provenance and hardening. Compute contracts can be issued by having the registry pull authed by verifiable credential, closing the loop between supply chain integrity and compute provisioning. The registry releases are content-addressable and verifiable with SCITT receipts, enabling revocation or key rotation when needed.
 * 
 * @see comms/0057
 */
export function containerRegistryOnDemand(): void {
  // Related: scittTransparencyService, livingSbomVdr, scanIntoTrustAttestation, appendToTransparencyLog
}

/**
 * The `alice threats` CLI generates a living THREATS.md document from ThreatDragon threat models by running an auditor overlay dataflow. The overlay applies threat model evaluation as a dataflow: load the ThreatDragon JSON model, convert to open architecture representation, generate mermaid diagrams, produce markdown sections, and write the output. This is distinct from the living SBOM VDR — THREATS.md captures threat modeling (STRIDE, trust boundaries, attack surfaces) rather than vulnerability disclosure. Two-tier evaluation generates both GOOD_THREATS.md and BAD_THREATS.md for comparative auditing.
 * 
 * If you don't make a threat model, your attacker will make it for you.
 * 
 * @see comms/0066
 */
export function livingThreatsMd(): void {
  // Related: livingThreatModel, applyThreatModelOverlay
}

/**
 * The supply chain is a network of information traveling across an ecosystem, where decentralization is natural. Each entity that runs a SCITT instance chooses who they trust. SCITT becomes the fabric for transparent replication across network boundaries: the petnames spec documents how to do clean replication across instances, and each endpoint (e.g., a container registry like roy.azurecr.io with signing aligned) publishes provenance information to customers about released artifacts. The graph detail defines trust depth — trust is not binary, but within a given context the trust value may become infinitely close to 1. Earlier framing (from comm 0015): SCITT as content-agnostic transparency service holding SBOMs, attestations, system contexts, and policies.
 * 
 * @see comms/0068
 */
export function supplyChainInformationNetwork(): void {
  // Related: scittTransparencyService, appendToTransparencyLog
}

/**
 * Apply the W3C VerifiableScorecard credential type to static analysis results in the `alice shouldi` pipeline.
 * 
 * The VerifiableScorecard from the W3C Traceability Vocab (https://w3c-ccg.github.io/traceability-vocab/#VerifiableScorecard) provides a standardized vocabulary for machine-readable scores. When Alice runs static analysis on a dependency or contribution, she issues a VerifiableScorecard as a Verifiable Credential. This gives downstream consumers — including other Alice instances — a cryptographically verifiable assessment of code quality, security posture, or policy compliance.
 * 
 * This feeds into the Entity Analysis Trinity's static analysis corner and the gatekeeper's trust attestation scan.
 * 
 * @see comms/0080
 * @see https://w3c-ccg.github.io/traceability-vocab/#VerifiableScorecard
 */
export function verifiableScorecardStaticAnalysis(): void {
  // Related: gatekeeper
}

/**
 * ATP (AT Protocol) and SCITT integrated: ATP provides decentralized data repositories for SBOM/VEX/VDR records, while SCITT acts as the identity notary and trust chain format within ATP messages.
 * 
 * XRPC — AT Protocol's RPC mechanism — parallels IPVM with effects: both model computation as content-addressed invocations with receipts. SCITT receipts become the message format encapsulated in ATP records. Trust chains are established via context/content analysis of ATP messages (which may contain embedded JWKs for key discovery).
 * 
 * The combination ("APT + SCITT") means SCITT provides the notary function (attesting to claims about software artifacts) while ATP provides the data plane (storing and distributing those attestations in a decentralized repository network). SCITT could potentially become a DID method or operate as a data repository within ATP's lexicon system.
 * 
 * Earlier understanding (stub): SCITT notary assertion registry — related to gatekeeper.
 * 
 * @see comms/0082
 * @see comms/0086
 * @see https://atproto.com/specs/xrpc
 * @see https://scitt.io
 */
export function atpScittIntegration(): void {
  // Related: scittNotaryAssertionRegistry, gatekeeper
}

/**
 * CSAF (Common Security Advisory Framework) as the overarching framework for VEX, with the SBOM acting as the JSON-LD @context for vulnerability data.
 * 
 * CSAF (OASIS standard, https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html) provides the structural framework that VEX (Vulnerability Exploitability eXchange) fits into. In Alice's architecture, the SBOM serves a role analogous to JSON-LD's @context: it defines the vocabulary and namespace that gives meaning to the VEX statements attached to it. Without the SBOM as context, a VEX statement about "component X is not affected" has no anchor.
 * 
 * The VDR (Vulnerability Disclosure Report) and VEX are transported via ATP records, with WebSub providing update notification when new advisories are published. The SCITT transparency log receipts provide the trust anchor for the CSAF documents.
 * 
 * Poly-repo dev tooling rubrics (coding standards, review requirements) become overlay inputs to the CSAF assessment pipeline — distributed checking of compliance across 2nd and 3rd party dependencies.
 * 
 * @see comms/0082
 * @see https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html
 * @see https://github.com/CycloneDX/bom-examples/tree/master/VEX/CISA-Use-Cases
 */
export function csafVexFramework(): void {
  // Related: gatekeeper, livingThreatsMd
}

/**
 * Detailed dataflow for the "Alice, should I contribute?" security analysis pipeline, iterating through static analysis, dynamic analysis, and intent-based triage.
 * 
 * The pipeline walks the Entity Analysis Trinity:
 * 1. Static Analysis: Alice scans the contribution's code and dependencies for known vulnerabilities, policy violations, and license conflicts. Results feed into the VerifiableScorecard.
 * 2. Dynamic Analysis (Living Threat Model): Alice observes runtime behavior — what system calls does it make, what network connections does it open. The THREATS.md living threat model provides the baseline for acceptable behavior.
 * 3. Intent Triage: Alice compares the contribution's stated intent (from its manifest) against the results of static and dynamic analysis. Misalignment between intent and behavior triggers deeper investigation or rejection.
 * 
 * The gateway check (gatekeeper) walks the dependency graph through all three corners before issuing a trust attestation. The result is a SCITT-signed receipt that downstream consumers can verify.
 * 
 * The overlay pipeline allows orgs to customize each analysis stage — different static analyzers, different threat models, different intent policies — without changing the core flow.
 * 
 * Earlier understanding (stub): shouldiContributeOverlayPipeline — related to gatekeeper.
 * 
 * @see comms/0086
 * @see intel/dffml#1287
 */
export function shouldiContributeDetailedFlow(): void {
  // Related: shouldiContributeOverlayPipeline, gatekeeper, entityAnalysisTrinity
}

/**
 * Webhook-triggered service that checks a project's dependency tree on incoming webhooks and dispatches downstream validation to all dependent projects.
 * 
 * When a dependency publishes a change (new release, vulnerability fix, source update), the webhook service walks the dependency graph to find every project that depends on it, then triggers validation pipelines for each downstream consumer. This creates a reactive supply chain where changes propagate validation automatically — a push-based alternative to periodic scanning. The service forms the event-driven backbone of the shouldi contribute pipeline: an upstream change fires a webhook, the dispatcher determines which downstream projects are affected, and each runs its own shouldi analysis against the new dependency state.
 * 
 * @see comms/0089
 * @see intel/dffml#1061
 * @see intel/dffml#1315
 */
export function webhookDependencyValidationDispatch(): void {
  // Related: shouldiContributeDetailedFlow
}

/**
 * SCITT transparency services federated through Decentralized Web Nodes (DWN) for discovery, relay, and cross-node query.
 * 
 * Individual SCITT instances hold SBOMs, attestations, and system contexts. DWN federation enables these instances to discover each other, relay signed claims, and query across organizational boundaries without a central registry. DWN relay provides the message routing layer; DWN protocols define how SCITT receipts, attestations, and transparency log entries are shared. Integrates with SSI Service for DID management (did:key, did:web, did:ion), Verifiable Credential issuance/verification, and Credential Manifest for applying for VCs. This is the transport layer for the SCITT yin-yang integration pattern where DFFML acts as both notary (issuing receipts) and consumer (verifying downstream).
 * 
 * @see comms/0101
 */
export function scittDwnFederation(): void {
  // Related: scittTransparencyService, appendToTransparencyLog, doITrustWhereThisCameFrom
}

/**
 * A 35-item SCRM questionnaire across acquisition, design/development, logistics, and policy/procedures that Alice applies as an overlay during gatekeeper admission.
 * 
 * The checklist originates from the US State Department Evolve IDIQ RFP (NIST SP 800-161 template, Executive Order 14028 flow-down requirements). It asks: have you identified key suppliers? Do you verify country of origin to the first source? Are only US citizens on your design network? Are compilers controlled? Every question maps to a policy gate Alice evaluates when a new component arrives at the forge. The checklist becomes a structured overlay — not a static document but a living policy instrument that the gatekeeper executes against each incoming artifact. Answers feed the supply chain information network, with "no" answers triggering exception receipts and federation to downstream forges.
 * 
 * @see comms/0107
 */
export function supplyChainRiskManagementChecklist(): void {
  // Related: supplyChainInformationNetwork, gatekeeper, gatherExceptionReceipts, federateClaimsDownstream
}

/**
 * The threat model is the foundational admission requirement — the cornerstone of security that gates every component before it enters Alice's forge. No software passes without threat model coverage.
 * 
 * The OWASP principle applies: without a threat model, how does one know what to protect and from whom? Alice applies this as a hard gate in the CI/CD pipeline. The gatekeeper does not merely apply a threat model overlay alongside other overlays — it checks that a threat model EXISTS as a precondition for admission. If no threat model is present for the incoming component, the gatekeeper blocks admission and gathers exception receipts. This inverts the pattern: the threat model overlay is not one overlay among many; it is THE overlay that determines whether the other overlays even run. Most applications lack threat models — Alice's job is to make that visible and actionable.
 * 
 * @see comms/0109
 * @see https://owasp.org/www-community/Threat_Modeling_Process
 */
export function threatModelAsAdmissionGate(): void {
  // Related: applyThreatModelOverlay, gatekeeper, gatherExceptionReceipts, openPolicyAgentOverlay
}

/**
 * Extend supply chain risk management to ML framework dependency chains.
 * 
 * Machine learning frameworks (PyTorch, TensorFlow) carry deep transitive dependency trees. A single compromised dependency in the chain can exfiltrate models or inject backdoors. The risk management checklist must include ML-specific vectors: dependency chain integrity for framework packages, reproducible build verification of ML runtime wheels, and runtime monitoring for unexpected network egress from training jobs.
 * 
 * @see comms/0134
 */
export function mlDependencyChainVerification(): void {
  // Related: living-sbom-vdr, oss-scanning-openssf-metrics
}

/**
 * A `dffml-operations-dep` package that extracts dependency information from a project and rebuilds it, serving as a serializer/deserializer across development environments.
 * 
 * Treats the dependency tree as a livepatch for a VM — Alice the Overlay takes a snapshot of the System Context. This enables the transition from "it works on my machine" to "it works in CI/CD" to "it works in cloud dev" by capturing and reproducing the exact dependency state. It allows delta comparison across environments and helps new contributors get up to speed by reproducing the development environment programmatically.
 * 
 * @see comms/0140
 * @see comms/0137
 * @see intel/dffml#596
 */
export function operationsDependencyPackage(): void {
  // Related: freezeSystemContext, nfsRepoCacheDeltaScan
}

/**
 * ActivityPub posts serve as SCITT attestation inputs, making federated social interactions feed the transparency log.
 * 
 * Every ActivityPub post about a software artifact, dependency, vulnerability, or build result becomes a signed SCITT assertion. Rather than treating social communication and supply chain attestation as separate systems, the fediverse itself becomes the attestation pipeline — when a developer posts about a dependency issue, that post carries provenance into the SCITT transparency log with the same cryptographic guarantees as any other attestation.
 * 
 * This bridges decentralized social communication (ActivityPub, DWN) with supply chain transparency (SCITT, KERI). Posts from diverse fediverse sources aggregate into a verifiable stream of attestations, enabling trust decisions based on the collective distributed social signal about software artifacts.
 * 
 * @see comms/0148
 */
export function activityPubScittInputs(): void {
  // Related: scittReferenceImplementation, websubActivityPubThoughtSharing
}

/**
 * Docker FROM lines define a rebuild dependency graph across container images. When a base image changes, downstream images are automatically rebuilt via registry webhook-triggered repository_dispatch events.
 * 
 * Multi-stage Docker builds strip secrets (ARG) from published layers. The FROM chain is inspected to build a pipdeptree-style dependency graph: each image's base images are traced to determine which downstream builds to dispatch when a base image updates. Harbor webhooks and OIDC auth provide the notification infrastructure; GitHub Actions repository_dispatch events carry the rebuild trigger. This forms the substrate for automated supply chain rebuild propagation, where a CVE fix in a base image cascades through the entire dependency tree.
 * 
 * @see comms/0152
 * @see comms/0153
 * @see comms/0158
 */
export function containerFromRebuildChain(): void {
  // Related: containerRegistryOnDemand, operationsDependencyPackage
}

/**
 * ActivityPub, SCITT, and OCI registries form a three-way handshake for the Thought Communication Protocol — analogous to TCP SYN/SYN-ACK/ACK but for supply chain events.
 * 
 * ActivityPub Follow replaces WebSub as the registry notification bus for downstream triggers. ActivityPub posts carry content addresses (SHA digests) of artifacts served via ORAS.land-style registries. SCITT provides notarized receipts for these messages, closing the loop of vulnerability analysis and remediation. A content address is placed in both the ActivityPub message and SCITT log, with the registry serving the actual content. This enables federated, verifiable event propagation across the supply chain — registry events trigger ActivityPub notifications, which are receipted by SCITT for non-repudiable audit.
 * 
 * Earlier understanding (from comms/0148): ActivityPub posts serve as SCITT attestation inputs, making federated social interactions feed the transparency log.
 * 
 * @see comms/0159
 */
export function activityPubScittRegistryHandshake(): void {
  // Related: activityPubScittInputs, containerRegistryOnDemand, scittReferenceImplementation, websubActivityPubThoughtSharing
}

/**
 * Vulnerability exploitability is determined by deployment context, not merely by CVE presence. Threat modeling the specific deployment topology surfaces which vulnerabilities are actually reachable in that deployment, enabling pragmatic triage.
 * 
 * While SBOM generation (CVE Bin Tool, CycloneDX, SPDX) identifies what is present, deployment analysis determines what is exploitable. OPA policies encoded as JSON/YAML define deployment-specific exploitability decisions. This bridges static SBOM data with dynamic CSAF/VEX production, prioritizing vulnerabilities based on actual reachability rather than CVSS scores alone. The deployment context becomes the key discriminator for vulnerability response.
 * 
 * @see comms/0158
 */
export function deploymentDrivenExploitability(): void {
  // Related: threatModelAsAdmissionGate
}

/**
 * GitHub OIDC claims embedded in Sigstore certificates should include stable numeric repository_id and repository_owner_id as X.509v3 extensions.
 * 
 * GitHub provides stable numeric identifiers for repositories and their owning users/orgs. These persist across account renames and can detect identity churn: if an attacker takes over a deleted GitHub account name (slug) and attempts to release malicious updates with otherwise valid-looking claims, the numeric IDs will differ from the original, making old attestations detectable as invalid. This extends the existing job_workflow_ref SAN (OID 1.3.6.1.4.1.57264.1.5) with new extensions for repository_id (1.3.6.1.4.1.57264.1.8) and repository_owner_id (1.3.6.1.4.1.57264.1.9).
 * 
 * @see comms/0155
 * @see intel/dffml#1247
 */
export function stableRepositoryIdentityOidc(): void {
  // Related: githubActionsOidcSelfAttestation
}

/**
 * All software artifacts — VEX, SBOM, CSAF, melange builds — are produced as container images. This enables uniform distribution, caching, FROM-based rebuild chain propagation, and scratch-layer result extraction.
 * 
 * Multi-stage Docker builds serve as the universal build system: build dependencies become FROM lines, secrets are stripped via ARG removal in intermediate stages, and output lands in a final scratch layer as pure data (JSON/YAML). Container registry push triggers downstream validation via webhook. The scratch output layer is the serialized dataflow result — downstream consumers pull just the result layer via `reg layer`. This unifies build infrastructure: the same Docker build caching and distribution mechanism serves both traditional software artifacts and supply chain metadata.
 * 
 * @see comms/0152
 * @see comms/0157
 */
export function everythingAsContainerBuild(): void {
  // Related: containerRegistryOnDemand, operationsDependencyPackage
}

/**
 * Bridge OpenVEX vulnerability statements into ActivityPub for real-time, federated security vulnerability data sharing.
 * 
 * OpenVEX is described by its creators as "basically like ActivityStreams, but for security vulnerability data sharing" — with a little work it lifts to ActivityPub for real-time collaboration. This concept maps OpenVEX statements onto ActivityPub Create/Note objects, where each VEX statement becomes a signed post whose content address is the signature of the inbox message. The VEX document carries product identifiers as package URLs (pkg:github/owner/repo@sha), vulnerability identifiers, status (not_affected/affected/fixed), and impact statements containing webhook payload data. The bridge enables watching VEX streams, executing downstream jobs when new VEX records appear, and closing the loop from CVE detection through VEX publication to consumer notification.
 * 
 * @see comms/0164
 * @see comms/0167
 * @see https://github.com/openvex/spec
 */
export function openVexActivityPubBridge(): void {
  // Related: activityPubScittInputs, livingThreatsMd, csafVexFramework
}

/**
 * Alice responds to IssueOps trigger phrases in pull request comments (e.g. ".deploy", "alice please show me how to...", "alice please contribute...") to create diffs, pull requests, and branch deployments.
 * 
 * The GitHub branch-deploy action pattern gates deployment steps behind comment triggers. Alice extends this: when a 2nd party plugin maintainer comments "alice please show me how to increase support level", Alice analyzes the plugin against the contribution criteria (community health checks, code quality scans, documentation completeness) and either creates a PR with the needed changes or provides a diff. When they comment "alice please contribute...", Alice creates an automated pull request addressing the specific issue. This enables prospective 2nd party maintainers to self-serve their progression from 3rd to 2nd party support level through Alice-mediated automated contributions.
 * 
 * Earlier understanding (from related concepts): The shouldiContribute flow evaluates whether a project meets contribution criteria; this adds the interactive IssueOps layer on top.
 * 
 * @see comms/0167
 * @see https://github.blog/2023-02-02-enabling-branch-deployments-through-issueops-with-github-actions/
 * @see intel/dffml#1061
 * @see intel/dffml#1239
 */
export function aliceIssueOps(): void {
  // Related: shouldiContributeDetailedFlow, shouldiContributeOverlayPipeline, aliceShellAgent
}

/**
 * SCITT insertion policy expressed as a policy-as-code compute contract that statically defines or fulfills fetching/generating whatever data is needed to validate a statement for insertion or federation, executing within a sandboxed environment.
 * 
 * Each statement submitted to a SCITT registry may have a set of criteria which must be validated by an authorized party (the gatekeeper) before it can be added. The insertion policy IS the compute contract: it encodes what checks run, what data they need, and what constitutes a passing evaluation. These policies can be overlayed with instance-local additional policy-as-code, allowing each deployment to add its own constraints without modifying upstream policies. This turns the registry from a passive log into an active admission controller.
 * 
 * Credential Manifest input evaluation (https://identity.foundation/credential-manifest/#input-evaluation) may serve as the mechanism for expressing insertion policy criteria.
 * 
 * @see comms/0177
 * @see intel/dffml#1207
 */
export function scittInsertionPolicyAsComputeContract(): void {
  // Related: gatekeeper, scittTransparencyService, appendToTransparencyLog, openPolicyAgentOverlay
}

/**
 * Declarative container build manifests in image.container.build JSON format dispatched through GitHub Actions to trigger reproducible, content-addressable builds from versioned specifications.
 * 
 * The manifest carries a $schema pointer to its versioned JSON Schema, a $format_name of image.container.build, and an include array of build targets — each specifying branch, commit SHA, build_args, dockerfile path, image_name, owner, and repository. A single Python pipeline reads the manifest, extracts the include array as JSON, and feeds it through gh workflow run dispatch_build_images_containers.yml --json, turning a declarative build declaration into a CI/CD execution.
 * 
 * This enables Alice to rebuild container images at specific commits across any repo in the ecosystem — the manifest is the build recipe, content-addressed and replayable. Combined with container rebuild chains (FROM line dependency graphs), a base image update triggers manifest dispatch for every downstream image.
 * 
 * @see comms/0181
 * @see comms/0178
 */
export function containerBuildManifestDispatch(): void {
  // Related: everythingAsContainerBuild, containerRegistryOnDemand, containerFromRebuildChain, operationsDependencyPackage
}

/**
 * SCITT federation hybridizes with DWN (Decentralized Web Node) for decentralized registry bootstrapping and JSONLD event streams, where audit and policy are expressed as DID-referenced Verifiable Credentials.
 * 
 * Bootstrapping: Alice auto-PRs repos with security.txt contact URLs that translate to did:web endpoints. Each endpoint deploys a DWN SCITT instance — bootstrapping N decentralized SCITT instances from the ecosystem's own security disclosures. Start with model transformers; use endor-style repos for basic SCITT setup. DWN's push/pull websocket support (dwn-sdk-js v0.0.21+) provides real-time notification of new claims without polling.
 * 
 * Event stream: SCITT federation via ActivityPub produces an all-JSONLD event stream. Every audit decision and policy evaluation becomes a DID/VC-wrapped receipt — a claim whose insertion policy is itself a policy-as-code compute contract, whose acceptance becomes a Verifiable Credential referencing the issuer's DID. New trust chains can be grafted off any point in the stream, enabling ad-hoc dev/test chains of trust that never depend on centralized transparency log infrastructure.
 * 
 * Decentralized primitives scope privilege to the threat model rather than forcing trust in any single authority — whoever controls what software is trusted decides what is real.
 * 
 * @see comms/0181
 * @see comms/0182
 * @see https://identity.foundation/keri/did_methods/
 * @see https://github.com/TBD54566975/dwn-sdk-js
 */
export function scittDwnBootstrapAndJsonLd(): void {
  // Related: scittDwnFederation, scittTransparencyService, appendToTransparencyLog, doITrustWhereThisCameFrom, federateClaimsDownstream, herIdentity, scittReceiptAsVcAuth
}

/**
 * Propagate trust policies and dependency recommendations based on observable lifecycle evidence rather than static rules — a dependency earns recommendation when it demonstrates a track record of improving ecosystem health across real-world usage.
 * 
 * Alice evaluates whether to propagate a trust policy (insertion policy, dependency recommendation — same thing, recursive) by examining the lifecycle of its usage: does adoption of this dependency correlate with fewer vulnerabilities over time? Does it hold up under small, medium, and large stress? Has the fork-and-try workflow produced successful builds? If the evidence supports it, Alice propagates the recommendation upstream through the supply chain information network.
 * 
 * The principle follows atomic habits applied to supply chain security: make it easy to do the right thing. Not low friction — no friction. When something has a proven functional and security track record, it should be the default. When something fails, Alice de-recommends it and verifies the alternative works functionally before suggesting it.
 * 
 * This loops back to `alice shouldi contribute`: the trust decision for a dependency is itself a policy evaluation that runs through the gatekeeper, producing an attestation that feeds the next round of evaluation.
 * 
 * @see comms/0181
 */
export function trustPolicyPropagationByLifecycle(): void {
  // Related: gatekeeper, doITrustWhereThisCameFrom, federateClaimsDownstream, policyBenefitOfDoubt, scanIntoTrustAttestation
}

/**
 * Tool catalog entries classified by party: 2nd-party (org-local OpenAPI endpoints, internal databases) vs 3rd-party (external open-source tools, public APIs).
 * 
 * The tool catalog surfaces available capabilities to AI agents through a /tools/list endpoint. 2nd-party tools connect to organization-internal systems (databases, internal services). 3rd-party tools wrap external systems (kubectl, public APIs). Both feed the same catalog so agents reason uniformly about available capabilities regardless of party.
 * 
 * Earlier understanding (from pluginPartyCatalog): Plugin catalog with party-based categorization.
 * 
 * @see comms/0187
 * @see intel/dffml#1207
 */
export function toolCatalogPartyClassification(): void {
  // Related: pluginPartyCatalog
}

/**
 * Biological inspiration: all living cells possess molecular machinery for a 'sixth sense' — the innate ability to detect environmental changes without dedicated sensory organs. Applied to software supply chain: the system continuously senses changes across its environment (new vulnerabilities, dependency updates, policy shifts) as an intrinsic property, not an external check.
 * 
 * This sensing is not a periodic scan but a continuous awareness — the system feels changes the way cells detect infrared or magnetic fields through molecular mechanisms. It connects to train of thought hardening: the sensing substrate must itself be tamper-evident.
 * 
 * @see comms/0190
 */
export function cellularSixthSense(): void {
  // Related: softwareSupplyChainHealthMetaphor, trainOfThoughtHardening
}

/**
 * There is no way to determine whether a vulnerability matters without the deployment context. Threat model overlays applied on OBOM (Operational Bill of Materials) provide the only valid discriminator for exploitability decisions.
 * 
 * While SBOM generation tools (CVE Bin Tool, CycloneDX, SPDX) identify what is present, deployment analysis determines what is exploitable. CycloneDX may evolve OBOM for architecture links with threat model overlays, enabling context-aware vulnerability triage where the deployment topology becomes the key input. A vulnerability that is critical in one deployment may be irrelevant in another where the affected component runs sandboxed or is not reachable. The classification "vuln is bug type fundamentally" ties vulnerability assessment to the threat model's trust boundaries — no deployment context means no meaningful exploitability decision.
 * 
 * Downstream propagation should use overlays: if a deployment runs the vulnerable component in a sandboxed context that makes it non-critical, propagate "not affected" upstream rather than "affected." This reverses the default CVE-propagation assumption that all findings are relevant to all consumers.
 * 
 * Earlier understanding (from comm 0158): Vulnerability exploitability is determined by deployment context. OPA policies encoded as JSON/YAML define deployment-specific exploitability decisions.
 * 
 * @see comms/0194
 * @see intel/dffml#596
 */
export function deploymentContextOverlay(): void {
  // Related: livingThreatModel, applyThreatModelOverlay, livingSbomVdr
}

/**
 * Living threat models are continuously delivered through forge federation via ActivityPub as part of Alice's Stream of Consciousness, turning threat model updates into federated events that propagate across trust boundaries.
 * 
 * The transport mechanism is ActivityPub through Forgejo's federation layer: each entity publishes threat model changes as ActivityPub Notes, and downstream entities receive them via their inbox and apply them as overlays. The ActivityPub security.txt methodology structures this as daily threads from an ActivityPub group — entities reply to the group's daily log, linking issues and auto-backreferencing to discussion threads using downstream watchers. This is the same review system notification pattern used for SARIF CD eventing.
 * 
 * Converged CD events (CloudEvents + CDEvents spec) offer an alternative binding that can be translated into the federated event space. The goal is a pull-based model where entities subscribe to relevant threat model events defined in their gitops config, rather than receiving everything by default. Earlier understanding (from comm 0066): alice threats CLI generates living THREATS.md from ThreatDragon models via auditor overlay dataflow.
 * 
 * @see comms/0199
 * @see intel/dffml#1315
 * @see comms/0194
 */
export function livingThreatModelContinuousDelivery(): void {
  // Related: livingThreatsMd, streamOfConsciousnessGitops, securityTxtActivityPubActor, websubActivityPubThoughtSharing, livingThreatModel
}

/**
 * Map CVEs to source code URLs via link traversal and automated triage.
 * 
 * When an SBOM lists a dependency, finding the corresponding source repository
 * is non-trivial—especially for Maven, Gradle, and npm packages where the VCS
 * URL is not always in the package metadata. This concept describes a process
 * of automated link traversal and triage to establish the CVE→source mapping,
 * enabling downstream vulnerability analysis within the correct deployment
 * context.
 * 
 * Earlier DFFML implementation (cvemap) demonstrated feasibility but bitrotted.
 * The approach generalizes to GitHub trending daily analysis, where the same
 * mapping technique identifies new projects for Alice to ingest and analyze.
 * 
 * @see comms/0208
 * @see comms/0215
 */
export function cveToSourceMapping(): void {
  // Related: livingSbomVdr, csafVexFramework
}

/**
 * Apply the same security and compliance policy across ideation (CI/CD PR
 * validation) and production (live deployment), eliminating policy escapes.
 * 
 * When policy is defined once and evaluated uniformly, there is no gap between
 * "what was approved in CI" and "what runs in production." The principle: if
 * there was a valid CI/CD build with passing checks, deploy it—the policy
 * already said yes. This feeds the behavioral analysis portion of the Entity
 * Analysis Trinity: actual runtime behavior is compared against the intent
 * declared in the threat model, and policy drift is detected as misalignment.
 * 
 * JSON-LD as the common query layer enables uniform policy evaluation across
 * both environments. IPVM's content-addressed execution makes the deployment
 * artifact the same bytes that passed CI/CD, closing the provenance gap.
 * 
 * @see comms/0214
 */
export function policyUniformityIdeationToProduction(): void {
  // Related: overlayAsAdmissionController, trinityTriangulation, ipvmHermeticDeploymentBridge
}

/**
 * Hash descendants of a package in SBOM parsing to produce a merkle tree qualifier on PURLs that differentiates package instances with identical coordinates but different dependency graphs.
 * 
 * GUAC's approach leverages serialization of dependency predicates in lexical order, hashing the result as a qualifier on the PURL. This prevents false deduplication when two packages share coordinates but differ in their transitive dependency sets. The hash acts as a content-addressed fingerprint of the full dependency DAG below a node, enabling precise vulnerability reachability analysis and rebuild chain determination.
 * 
 * @see comms/0220
 * @see https://github.com/guacsec/guac/issues/594
 * @see https://github.com/CycloneDX/cyclonedx-maven-plugin/pull/306
 */
export function merkleTreePurlDependencyDedup(): void {
  // Related: dependencyTreeToDataflow, livingSbomVdr
}

/**
 * OWASP Common Requirement Enumeration (CRE) as the requirements-side mirror of VEX: security requirements are just more interesting versions of regular requirements.
 * 
 * Where VEX declares exploitability status for known vulnerabilities, CRE enumerates the security requirements that, when unmet, constitute vulnerabilities. This symmetry enables a unified policy language: the same overlay mechanism that applies VEX statements can apply CRE requirements as admission gates. Requirements become machine-readable assertions checked during CI/CD, not just human-readable documents. The piggyback pattern — security piggybacks on regular requirements, Alice piggybacks on social network infrastructure — recurs.
 * 
 * @see comms/0216
 * @see https://github.com/OWASP/common-requirement-enumeration
 * @see https://cwe.mitre.org/data/definitions/1053.html
 */
export function owaspCreRequirementsSideOfVex(): void {
  // Related: openVexActivityPubBridge, csafVexFramework
}

/**
 * ML classifier detects software packages missing essential properties (documentation, storage, security features), treating absence as a CWE-class vulnerability and feeding findings into the shouldiContribute overlay pipeline for automated upstream remediation.
 * 
 * A new CWE class covers absence-of-property weaknesses: software that lacks sufficient storage, documentation, or security features is vulnerable by omission. An ML classifier trained on data scraped via img2dataset identifies packages with and without these properties. Classified findings feed the overlay/org fork CD pipeline: Alice sews the missing property into a fork, and renovate/dependabot submit the patch upstream as a schema diff. This turns vulnerability remediation into feature contribution — instead of filing security bugs, Alice contributes the missing feature.
 * 
 * @see comms/0247
 * @see https://github.com/rom1504/img2dataset
 */
export function cweAbsencePropertyClassifier(): void {
  // Related: shouldiContributeOverlayPipeline
}

/**
 * Policy distributed as content-addressable JSON artifacts stored in OCI registries, referenced via did:web URIs with content digests, and secured through SCITT attestations.
 * 
 * Insertion policy for a SCITT transparency service becomes a content-addressable blob in an OCI registry: `did:web:registry.example.com:policy-as-code:blocklist%40sha256%3Aaaaaaaaa`. The policy is fetched via OCI distribution (with SCITT enhancements per scitt.io/distributing-with-oci-scitt), laid down as `insertPolicy.json`, and evaluated by a policy-as-code engine that watches the SCITT workspace directory for `.cose` receipt files. On each new receipt the engine runs the content-addressable policy JSON against the receipt, producing allow/deny decisions with `reason.json` output. This uplevels the existing SCITT API emulator's inline Python policy into a schema-governed, content-addressable, distributable policy artifact that any conformant policy engine can consume.
 * 
 * Earlier understanding (from comms/0177): SCITT insertion policy expressed as a compute contract — the policy is a contract evaluated at insert time.
 * 
 * @see comms/0252
 * @see https://scitt.io/distributing-with-oci-scitt.html
 * @see https://github.com/ietf-wg-scitt/draft-ietf-scitt-architecture/issues/62
 */
export function policyAsContentAddressedArtifact(): void {
  // Related: scittInsertionPolicyAsComputeContract, gatekeeper, scittTransparencyService, appendToTransparencyLog
}

/**
 * Use GitHub Actions OIDC subject claims from reusable workflows as a trust anchor for automated dependency approval, replacing manual review with verifiable workflow identity.
 * 
 * GitHub OIDC tokens carry claims including `job_workflow_ref` (identifying the specific reusable workflow that invoked a job), `repository_id`, and `repository_owner_id`. By pinning these claims — e.g. requiring that a dependency-bump PR originates from DFFML's own trusted reusable workflow identified by `job_workflow_ref` — Alice can auto-approve and merge dependency update PRs without human review. The `gh oidc-sub` extension configures the claim set for a repo. This extends the OIDC self-attestation pattern from build-time identity to runtime trust decisions: the workflow's identity is the credential that authorizes merging into main.
 * 
 * Earlier understanding (from comms prior): GitHub Actions OIDC tokens self-attest a workflow run's identity.
 * 
 * @see comms/0252
 * @see https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/using-openid-connect-with-reusable-workflows
 * @see https://github.com/tspascoal/gh-oidc-sub
 */
export function oidcReusableWorkflowTrust(): void {
  // Related: githubActionsOidcSelfAttestation, scanIntoTrustAttestation, appendToTransparencyLog
}

/**
 * Embed a SCITT notary and transparency service proxy directly within CI/CD reusable workflows so every push-to-main emits a SCITT receipt as a federated event.
 * 
 * The DFFML reusable workflow combines notary and transparency service roles into a single CI artifact: on push to main, the workflow emits a SCITT receipt for the updated content and publishes it as a federated event via the existing event space. Renovate and Dependabot are later patched to consume these federated SCITT receipt events, closing the loop from dependency update PR to attested merge confirmation. This transforms CI/CD from a passive execution environment into an active notarizing proxy — every main-branch mutation carries a verifiable SCITT receipt witnessed by the CI identity.
 * 
 * Earlier understanding (from comms prior): SCITT notary provides assertion registration; transparency logs record claims.
 * 
 * @see comms/0252
 * @see https://github.com/ietf-wg-scitt/draft-ietf-scitt-architecture/issues/62
 */
export function scittNotarizingProxyInCiCd(): void {
  // Related: scittNotaryAssertionRegistry, federatedCiCdEventSpace, scittTransparencyService, appendToTransparencyLog
}

/**
 * Federated cross-repo dependency validation through Pull Request Target (PRT) flows connected by GUAC knowledge graph and ActivityPub transparency service federation.
 * 
 * When a dependency manifest change triggers a PRT flow, the PRT queries the local GUAC (neo4j) knowledge graph for TCB protection ring admission control. If the dependency data is not yet in the graph, the system runs a dependency evaluation flow (shouldi) that collects metrics and feeds them to the local transparency service. The transparency service emits results via ActivityPub back into GUAC, closing the local loop.
 * 
 * For downstream validation, a home instance's PRT creates a pull request in a faraway instance's manifest when a dependency change passes admission control. The faraway instance runs its own PRT → GUAC → evaluation → transparency service loop, then federates evaluated claims back to the home transparency service via ActivityPub. This creates a reactive, federated supply chain where dependency changes propagate validation across organizational boundaries, with each instance maintaining its own GUAC-backed knowledge graph and transparency log.
 * 
 * @see comms/0263
 */
export function federatedPrtDependencyValidation(): void {
  // Related: webhookDependencyValidationDispatch, shouldiContributeDetailedFlow, scittTransparencyService, federatedCiCdEventSpace, activityPubMessageQueueBridge, doITrustWhereThisCameFrom
}

/**
 * Cryptographically sign the DFFML Operation Authority (OA) DAG — later the CycloneDX DAG — using COSE2 (CBOR Object Signing and Encryption) via in-toto supply chain tooling.
 * 
 * The Operation Authority graph represents the network of operations, dependencies, and trust decisions that Alice's dataflow engine executes. Signing this graph with COSE2 via in-toto produces verifiable supply chain links: each step (VCS checkout, QA, packaging) gets an in-toto link file signed with a cryptographic key, creating a tamper-evident chain from source to artifact. The signed DAG can be composed from individual link files into a complete provenance record.
 * 
 * COSE2 provides a compact binary signing format suitable for constrained environments while maintaining cryptographic strength. Combined with CycloneDX for SBOM representation, this creates a verifiable, standards-based chain connecting operations to their artifacts.
 * 
 * @see comms/0258
 * @see https://github.com/in-toto/demo/pull/49
 * @see https://github.com/in-toto/layout-web-tool
 */
export function operationAuthorityCose2Signing(): void {
  // Related: scanIntoTrustAttestation, appendToTransparencyLog, scittTransparencyService
}

/**
 * CISA's secure software self-attestation form identifying minimum secure development requirements a software producer must meet before their software may be used by Federal agencies.
 * 
 * The form covers three categories of software: (1) software developed after September 14, 2022; (2) existing software modified by major version changes after that date; and (3) software with continuous changes delivered (SaaS, continuous delivery/deployment). Alice consumes this form as a signed attestation artifact at the gatekeeper, verifying the producer's conformity claims against the transparency log. The self-attestation becomes an input to the policy overlay that gates admission — software without a valid CISA attestation is blocked or flagged for exception handling.
 * 
 * @see comms/0257
 * @see intel/dffml#1451
 */
export function cisaSelfAttestationForm(): void {
  // Related: gatekeeper, conformityAssessment, appendToTransparencyLog
}

/**
 * Supply chain step attestation using in-toto layouts signed with COSE2 (CBOR Object Signing and Encryption).
 * 
 * Each step in the supply chain — version control checkout (vcs), quality assurance (qa), and packaging — is attested via in-toto-run with COSE2 signatures, producing link files that form a verifiable chain of custody. The DFFML/OA (later CycloneDX) DAG is signed with COSE2 as the binding between the dependency graph and the step attestations. This integrates with the SCITT transparency service: each attested step becomes a SCITT statement, enabling federated verification across home and faraway forges. The basic allowlist in workflow cross-repo pinning controls which downstream repositories are triggered when an attested step completes.
 * 
 * @see comms/0258
 * @see intel/dffml#1453
 */
export function inTotoCoseSupplyChainAttestation(): void {
  // Related: scanIntoTrustAttestation, appendToTransparencyLog, scittTransparencyService, federateClaimsDownstream
}

/**
 * Federated supply chain validation topology where home and faraway deployments coordinate dependency admission control through a chain of PRT flows, GUAC dependency graphs, transparency services, and ActivityPub-based async messaging.
 * 
 * The topology works as follows: a PEP 440 manifest change triggers the PRT (pull request target) flow in the home deployment. The PRT flow queries the local GUAC (Graph for Understanding Artifact Composition, backed by neo4j) for admission control — source TCB protection ring queries that check whether the proposed dependency change is safe. If GUAC lacks data for the query, it triggers a dependency evaluation flow ("shouldi" metrics) that feeds results to the local transparency service (SCITT). The transparency service emits data-added events via ActivityPub, which triggers GUAC ingest. Home and faraway transparency services federate evaluated claims to each other. When the home admission control allows the dependency change, it creates a pull request in the faraway deployment, triggering the faraway PRT flow to repeat the validation chain. The faraway results flow back via wait-for-message-action (ActivityPub async) and the status check API.
 * 
 * Earlier understanding (from comms/0215): Federated CI/CD event space using SSE and ActivityPub for event distribution across forges.
 * 
 * @see comms/0263
 */
export function federatedSupplyChainValidationTopology(): void {
  // Related: gatekeeper, federateClaimsDownstream, scittTransparencyService, supplyChainInformationNetwork, activityPubScittRegistryHandshake, webhookDependencyValidationDispatch
}

/**
 * GUAC (Graph for Understanding Artifact Composition) serves as the TCB protection ring admission controller for dependency changes, queried synchronously by the PRT flow or asynchronously via ActivityPub wait-for-message.
 * 
 * When a dependency change is proposed (manifest update triggers PRT), the admission control query checks GUAC's neo4j-backed graph for the dependency's composition, known vulnerabilities, and trust attestations. If GUAC has no data for the queried artifact, it emits a "data not in graph" event that triggers the dependency evaluation flow — running "shouldi" metrics collection against the new dependency version. The evaluation results feed into the transparency service, which emits ActivityPub events back to GUAC (triggering ingest of the newly evaluated data). This creates a self-healing loop: unknown artifacts trigger evaluation, evaluation feeds the transparency log, the log feeds GUAC, and subsequent queries resolve instantly from the enriched graph.
 * 
 * @see comms/0263
 */
export function guacDependencyGraphAdmissionControl(): void {
  // Related: checkBillOfMaterialsAgainstLog, gatekeeper, livingSbomVdr, federateClaimsDownstream
}

/**
 * Treat the entire operating system image as an OCI container artifact — built, signed, distributed, and attested through the same supply chain as application containers.
 * 
 * The Universal Blue model: the OS image itself is a container build produced by a Containerfile, stored in an OCI registry, and consumed by bootable container runtimes. This unifies OS delivery with the existing container supply chain — SBOMs, signatures, VEX statements, and transparency log entries apply to the OS layer exactly as they do to application images. Every layer from kernel to userspace is provenance-tracked.
 * 
 * @see comms/0266
 * @see https://github.com/ublue-os/main
 */
export function containerNativeOsImages(): void {
  // Related: everythingAsContainerBuild, containerFromRebuildChain, livingSbomVdr
}

/**
 * A structured JSON manifest describing how to build a container from a git repository at a specific commit. The manifest encodes owner, repository, branch, commit, dockerfile path, and destination image name, enabling reproducible container builds from source at a pinned revision.
 * 
 * Earlier understanding (from prior comms): containerBuildManifestDispatch coordinates dispatch of container builds from manifests. This comm adds the concrete manifest schema: an include array of objects with owner, repository, branch, commit, dockerfile, and image_name fields.
 * 
 * @see comms/0290
 */
export function containerBuildManifestStructure(): void {
  // Related: everythingAsContainerBuild, containerRegistryOnDemand, containerFromRebuildChain
}

/**
 * Binary artifacts carry verifiable provenance through a transparency framework at release time. Builds produce signed attestations (SLSA provenance) logged to a transparency log, so consumers can verify binary integrity and build chain before deployment. Applies to containers (docker-bench-security with SLSA workflows) and language packages (PyO3/maturin metadata embedding provenance in Python wheels).
 * 
 * Connects to project-oak/transparent-release, Google's framework for binary authorization via transparency logs. Distinct from SCITT (supply chain claims at insert time) — transparent release focuses on the release artifact itself carrying attestation that can be independently verified.
 * 
 * @see comms/0289
 * @see https://github.com/project-oak/transparent-release
 */
export function binaryTransparentRelease(): void {
  // Related: dataProvenanceTracking, containerFromRebuildChain
}

/**
 * Publish and distribute OpenVEX vulnerability disclosure data through OCI registries using ORAS (OCI Registry As Storage) tooling, providing an alternative discovery and delivery channel alongside ActivityPub federation.
 * 
 * The OpenVEX community (OpenSSF SIG Release) is building tooling to publish VEX documents to OCI registries. ORAS (oras.land) enables storing arbitrary artifact types in OCI-compatible registries — VEX statements become content-addressable, signable artifacts within existing container supply chain infrastructure. This complements ActivityPub-based VEX federation by offering a distribution path that aligns with the existing OCI registry ecosystem already deployed across container build pipelines.
 * 
 * @see comms/0297
 * @see https://github.com/openvex/spec/issues/9
 * @see https://oras.land/
 * @see https://mailarchive.ietf.org/arch/msg/scitt/8ai-bxr959fzJvwQroINyzV2_oY/
 */
export function openVexOciDistribution(): void {
  // Related: openVexActivityPubBridge, containerRegistryOnDemand, scittReferenceImplementation
}

/**
 * Feed SCITT transparency log entries into DFFML's InputNetwork as dataflow inputs, enabling transparency-driven dataflow orchestration.
 * 
 * Transparency log entries (SCITT receipts, signed statements) become DFFML Input entries that flow through the dataflow graph. The InputNetwork stores all input data and output data of operations — SCITT entries enter as seed inputs, pass through validation operations, and drive downstream decisions. Chroma (vector database) and LLM leaderboard evaluation are candidate implementation backends for storing and querying SCITT entries within the InputNetwork. This bridges the transparency log world (SCITT) with the dataflow orchestration world (DFFML), making every signed supply chain claim a machine-actionable dataflow input.
 * 
 * @see comms/0314
 * @see https://github.com/ietf-scitt/use-cases/pull/18
 * @see https://github.com/scitt-community/scitt-api-emulator/pull/27
 */
export function scittInputNetwork(): void {
  // Related: scittTransparencyService, appendToTransparencyLog, scanIntoTrustAttestation
}

/**
 * A universal, ecosystem-independent identifier for software products, as proposed by FIRST.org's TLPCLEAR working group.
 * 
 * Unlike package URLs (purl) which identify packages within a specific ecosystem, a universal software product identity spans ecosystems — the same product recognized whether it ships as an npm package, a Debian deb, a container image, or a Windows installer. This identity underpins cross-ecosystem vulnerability management, SBOM correlation, and supply chain transparency. It complements stable repository identity (OIDC-based) by addressing the product level rather than the repository/build level.
 * 
 * @see comms/0319
 * @see https://www.first.org/resources/papers/conf2023/FIRSTCON23-TLPCLEAR-Schmidt-Manion-Universal-Software-Product-Indentity.pdf
 */
export function universalSoftwareProductIdentity(): void {
  // Related: stableRepositoryIdentityOidc, livingSbomVdr, supplyChainInformationNetwork
}

/**
 * Run the entire forge (KCP, GUAC, forgego) in-browser by compiling all components to WASM, augmented with WebML for client-side ML inference.
 * 
 * The browser becomes a fully capable supply chain verification and build orchestration environment. Dependency graph analysis, transparency log queries, and deployment decisions execute entirely client-side with no backend server. Enables zero-trust supply chain validation from any device with a browser.
 * 
 * @see comms/0403
 * @see https://github.com/dffml/dffml/tree/main/docs/tutorials/rolling_alice/0000_architecting_alice#entity-analysis-trinity
 */
export function browserWasmForge(): void {
  // Related: everythingAsContainerBuild
}

/**
 * GUAC query engine combined with evented graph execution and SCITT transparency data forms an admission control firewall for Alice instances.
 * 
 * Every deployment passes through GUAC-based admission before KCP applies resources. SCITT events feed the graph; GUAC queries the graph to decide allow/deny. This is not just a one-time scan — it is a continuously operating firewall where new SCITT entries (vulnerability disclosures, attestation revocations) trigger re-evaluation of running deployments.
 * 
 * Earlier understanding (from prior comms): GUAC serves as a dependency graph for admission control decisions.
 * 
 * @see comms/0403
 */
export function guacScittAdmissionFirewall(): void {
  // Related: scittTransparencyService, guacDependencyGraphAdmissionControl
}

/**
 * Cross-compile Deno TypeScript to native platform binaries (x86_64 Linux/Windows/macOS, aarch64 macOS) and distribute as self-contained composite GitHub Actions.
 * 
 * Replaces the Node.js runtime dependency in GitHub Actions with compiled native binaries. Each platform gets its own binary via `deno compile --target`. The composite action YAML dispatches to the correct binary based on `runner.os` and `runner.arch`. Eliminates supply chain risk from npm dependency trees in CI/CD by shipping a single static binary.
 * 
 * @see comms/0404
 * @see https://docs.deno.com/runtime/manual/tools/compiler
 */
export function denoCompileGitHubAction(): void {
  // Related: githubActionsOidcSelfAttestation
}

/**
 * CISA mandates OASIS CSAF 2.0 Security Advisory format (profile 4) for ICS vulnerability advisories, removing uncertainty around machine-readable vulnerability reporting.
 * 
 * This government mandate establishes CSAF 2.0 as the required format for known exploited vulnerability disclosure. Companies now have clear guidance: report vulnerabilities as machine-readable CSAF Security Advisories so customers can automate mitigation responses when new vulnerabilities are reported. This aligns with the SCITT transparency ecosystem where CSAF VEX data feeds into automated admission control.
 * 
 * Earlier understanding (from prior comms): CSAF provides a VEX (Vulnerability Exploitability eXchange) framework for machine-readable security advisories.
 * 
 * @see comms/0406
 * @see https://www.cisa.gov/news-events/news/transforming-vulnerability-management-cisa-adds-oasis-csaf-20-standard-ics-advisories
 */
export function cisaCsafVulnerabilityMandate(): void {
  // Related: csafVexFramework, scittTransparencyService
}

/**
 * SCITT receipt federation via Bovine ActivityPub server with mechanical_bull automation handlers, enabling decentralized transparency log interop across independent SCITT instances.
 * 
 * A SCITT emulator federation plugin (federation_activitypub_bovine) listens on a UNIX socket for newly created receipt entries. When a receipt is registered, the plugin receives the CBOR-encoded claim + receipt bundle, wraps it in an ActivityPub Create activity with a Note object carrying the base64-encoded CBOR payload as content, and publishes to the ActivityPub outbox. mechanical_bull runs as the client-side automation handler, connecting to the bovine server, iterating the outbox, and sending messages to followers. This is the first working end-to-end implementation of SCITT-to-SCITT federation over ActivityPub, demonstrating that any two SCITT instances can exchange receipts without a centralized relay.
 * 
 * Actors register via bovine_tool.register and authenticate via did:key (Moo-Auth-1), with mechanical_bull.add_user automating follow-request acceptance. The federation handler pattern: SCITT emulator writes receipt to workspace → federation plugin notified via UNIX socket → ActivityPub Create+Note activity constructed → outbox collection helper delivers to followers.
 * 
 * @see comms/0421
 * @see https://github.com/scitt-community/scitt-api-emulator/pull/37
 */
export function scittBovineFederation(): void {
  // Related: activityPubScittRegistryHandshake, activityPubScittInputs
}

/**
 * Use cryptographic hash of the SCITT claim as the entry ID to prevent ping-pong re-insertion when federating claims across multiple transparency log instances.
 * 
 * When two SCITT instances federate the same claim between each other, a naive sequentially-assigned entry ID causes the claim to be inserted again on the receiving instance, which then federates it back — creating an infinite ping-pong loop. By deriving the entry ID from the claim content hash, every instance computes the same ID for the same claim. The receiving instance can check if an entry with that ID already exists and skip re-insertion. This makes SCITT federation idempotent.
 * 
 * Proposed on the SCITT architecture mailing list during IETF 118 milestone discussions. Complements the ActivityPub federation pattern by ensuring messages carrying duplicate claims are harmless no-ops.
 * 
 * @see comms/0423
 * @see https://github.com/ietf-wg-scitt/draft-ietf-scitt-architecture/issues/79
 */
export function scittEntryIdContentAddressing(): void {
  // TODO: wire to related concepts
}

/**
 * NIST OSCAL (Open Security Controls Assessment Language) provides standardized JSON/XML machine-readable formats for security compliance automation: control catalogs, profiles, system security plans (SSPs), and component definitions.
 * 
 * OSCAL enables Alice to consume, generate, and verify security compliance artifacts programmatically. Key models: (1) Component Definition — software, containers, or VMs ship with bundled control implementation documentation describing which NIST 800-53 controls they satisfy, enabling downstream consumers to auto-populate their SSPs. (2) Profile — a selection of controls from one or more catalogs mapped across multiple regulatory frameworks (FISMA, HIPAA, PCI DSS), letting a single profile satisfy multiple compliance regimes. (3) SSP — machine-readable system security plan replacing Word/Excel documentation with queryable, diffable, automatable security posture data.
 * 
 * For Alice, OSCAL component definitions are the machine-readable self-description that a container or VM image ships alongside its SBOM — the "this is what security controls I implement" counterpart to the "this is what I contain" SBOM. Admission controllers can validate that arriving software satisfies required controls before deployment.
 * 
 * @see comms/0423
 * @see https://pages.nist.gov/OSCAL/
 */
export function oscalMachineReadableCompliance(): void {
  // Related: csafVexFramework
}

/**
 * Supply chain transparency is a voluntary commitment, not a mandate. Actors choose to sign statements about their part of the supply chain because they believe transparency is essential for securing critical infrastructure.
 * 
 * These signed statements enter transparency services through commercial products that implement SCITT APIs internally while exposing different (possibly better) APIs to their users. The commercial product acts as a bridge: proprietary API on one side, SCITT transparency service on the other. This means adoption is market-driven — transparency is opt-in, and the ecosystem grows as more actors see value in proving their supply chain integrity.
 * 
 * @see comms/0427
 * @see https://mailarchive.ietf.org/arch/msg/scitt/mV3K6O5O9s36PRcRiNr59qpf-uc/
 */
export function voluntaryTransparencyCommitment(): void {
  // Related: scittTransparencyService, doITrustWhereThisCameFrom, appendToTransparencyLog
}

/**
 * SCITT registration policies themselves receive transparency receipts, enabling verifiers to check which policy was in effect at statement insertion time.
 * 
 * When a transparency service updates its registration policy, the new policy gets its own SCITT receipt. When a statement is inserted, the resulting receipt embeds the entry ID of the registration policy receipt that was evaluated against. Verifiers keep both receipts — the claim receipt and the policy receipt — so they can verify later: what policy was enforced at insert time, and was the issuer valid at that time? This solves the backwards-looking audit problem where keys may have been rotated or compromised since the original insertion.
 * 
 * Discussed in depth at IETF 118 SCITT WG meeting with Cedric, Steve, and Jon Geater. The group agreed: (1) knowing which registration policy was evaluated is a requirement, (2) v1 does not need to standardize what the policy ID points to, (3) v2 may standardize a recommended format for the policy content.
 * 
 * @see comms/0443
 */
export function registrationPolicyAsReceipt(): void {
  // Related: scittInsertionPolicyAsComputeContract, scittTransparencyService, appendToTransparencyLog, gatekeeper
}

/**
 * End-to-end pipeline from SBOM generation through OCI registry storage to SCITT transparency service registration.
 * 
 * The pipeline: (1) generate SPDX/CycloneDX SBOM via GitHub CLI (`gh sbom`), (2) push SBOM to an ORAS-compatible OCI registry tagged with both the release version and the git commit hash, (3) create a SCITT claim referencing the OCI image digest, (4) submit the claim to a SCITT transparency service for a receipt. The dual tagging (version + commit) enables both human-readable and content-addressed lookup. An async Python scanner searches SBOMs for dependencies in question to answer supply chain queries.
 * 
 * This connects SBOM generation (GitHub dependency graph), OCI distribution (ORAS/zot), and SCITT transparency — the three pillars of verifiable supply chain metadata.
 * 
 * @see comms/0444
 */
export function sbomToScittOciPipeline(): void {
  // Related: livingSbomVdr, containerRegistryOnDemand, everythingAsContainerBuild, appendToTransparencyLog
}

/**
 * SCITT transparency services export service parameters declaring supported federation protocols, threat model, and security properties to enable informed client selection.
 * 
 * Different SCITT instances have different threat models and require different levels of assurance around confidentiality, integrity, and availability (CIA) properties of federation protocols. A service parameter declaration allows a transparency service to advertise: which federation protocols it supports, what its registration policy covers, and what security guarantees it provides. Clients use these declarations to select appropriate transparency services for their supply chain risk posture.
 * 
 * This is analogous to a server's .well-known endpoints or TLS certificate transparency — the service publishes its capabilities so the ecosystem can make informed trust decisions without out-of-band negotiation. Discussed at IETF 118 SCITT in the context of side-channel resistance for federation channels and WIMSE composite claims concerns.
 * 
 * @see comms/0447
 * @see comms/0443
 */
export function scittServiceParameterDeclaration(): void {
  // Related: federatedSupplyChainValidationTopology, activityPubScittRegistryHandshake, scittTransparencyService, doITrustWhereThisCameFrom
}

/**
 * Registration policies expressed as RDF labeled property graphs (RDFStar) enabling machine-reasoned policy evaluation and isomorphism detection across transparency services.
 * 
 * At IETF 118 SCITT Hackathon, Orie Steele explained RDF triples (Subject, Predicate, Object) as an expression of first-order logic with many serializations. RDFStar (labeled property graphs) puts nodes on edges, equivalent to labeled property graphs. Applied to SCITT registration policies: policies become RDF graphs, and different transparency services can compare their policy graphs for isomorphism — finding intersections of what parties agree on. A machine can compute this when policies use URI/URL-scoped terms.
 * 
 * Henk Birkholz identified this as a v2 registration policy direction: policy graphs evaluated via RDF/OWL forward chaining (Prolog-style reasoning). URIs scope terms uniquely (e.g., `https://oscal.org/Component` vs `https://react.org/Component`), preventing name collisions across domains.
 * 
 * @see comms/0441
 */
export function rdfLabeledPropertyGraphPolicy(): void {
  // Related: graphQueryDrivenOverlayStore, knowledgeGraph, scittInsertionPolicyAsComputeContract, openPolicyAgentOverlay
}

/**
 * Use a developer's existing SSH key (optionally TPM-bound via PKCS#11) as a SCITT signing identity, bypassing OAuth/Fulcio flows.
 * 
 * GitHub exports SSH keys as Authentication Keys at the user's `.keys` endpoint. These can be converted to PKCS#8 PEM and fed to the SCITT client as the signing key. Combined with federated forges (WASM environment) and an attested Transparency Service, the SSH ECDSA-384 key produces SCITT receipts without any external OIDC issuer. The CWT issuer is the keys endpoint itself. tpm2-pkcs11 binds the key to a TPM owned by the developer, adding hardware root of trust. This removes the Fulcio dependency from the signing path — the SSH key already proves identity to GitHub, so re-proving via OIDC is redundant.
 * 
 * @see comms/0448
 */
export function sshKeyAsScittIdentity(): void {
  // Related: scittNotaryAssertionRegistry
}

/**
 * Use COSE Enc0Message instead of COSESign1 for SCITT statements, enabling the policy engine to evaluate payload validity without revealing contents.
 * 
 * The notary signs with its own key and encrypts the payload to the destination log's asymmetric key. Alternatively, symmetric keys with TIGRESS and OAuth Dynamic Client Registration allow the policy engine to access the symmetric key needed to verify payload contents. An OIDC token embedded in the payload authorizes access to a content-addressable resource that was uploaded before the statement was handed to the notary. Combined with KERI duplicity detection, this enables trustless trade: parties can prove asset ownership via receipts without revealing what the assets are.
 * 
 * @see comms/0449
 */
export function encryptedScittStatement(): void {
  // Related: scittInsertionPolicyAsComputeContract
}

/**
 * Embed a labeled property graph policy definition within the SCITT receipt itself, allowing clients to verify that data conformed to policy without knowing what the data is.
 * 
 * The policy definition travels with the receipt. A verifier evaluates the registration policy that was used by the Transparency Service prior to receipt generation — confirming that a check was done (e.g., "Eve has at least 1 Apple in storage") without seeing the underlying data. The receipt proves conformance; the policy proves what conformance means. This is blind policy verification: the verifier trusts the policy engine's output without accessing the payload or the data referenced from it.
 * 
 * @see comms/0449
 */
export function scittPolicyEmbeddedReceipt(): void {
  // Related: scittReceiptAsVcAuth, scittInsertionPolicyAsComputeContract
}

/**
 * Fundamental architectural distinction: a SCITT Transparency Service witnesses the signature artifact (the signed bytes), NOT the signing operation (the act of signing).
 * 
 * The TS can truthfully say "I witnessed this signature" — the signed artifact was logged, signer identity was checked, signer authorization may have been checked, and the artifact was logged with some range of transparency. But the TS cannot say "I witnessed this signing operation" — it did not observe the signer apply their key to the document. A physical-world notary watches the signer sign; SCITT only sees the already-signed document. The "notary" metaphor is therefore misleading and should not exist in SCITT architecture. The TS is closer to a document registry than a notary.
 * 
 * Earlier understanding (from prior comms): SCITT notary as an assertion registry.
 * 
 * @see comms/0450
 */
export function scittWitnessedSignature(): void {
  // Related: scittNotaryAssertionRegistry
}

/**
 * Convert NIST NVD vulnerability polling into SCITT statements and federate them as ActivityPub events, turning periodic database polling into a real-time federated event stream.
 * 
 * Uses cve-bin-tool's cvedb module to poll NIST NVD, wraps each CVE update as a SCITT statement with a transparency receipt, and publishes the statement via ActivityPub (Mastodon push API). Federated SCITT instances subscribe to each other's NVD statement feeds, creating a decentralized vulnerability event mesh. This bridges the gap between centralized vulnerability databases (poll-based) and decentralized supply chain security (event-driven).
 * 
 * @see comms/0450
 */
export function nvdPollingToScittEventBridge(): void {
  // Related: cveToSourceMapping, activityPubScittInputs
}

/**
 * Map S2C2F (Secure Supply Chain Consumption Framework) requirements to SCITT attestation statements for automated compliance evidence.
 * 
 * Each S2C2F requirement category (ING for ingestion, SCA for scanning, INV for inventory, UPD for updates, AUD for auditing, ENF for enforcement, REB for rebuilding, FIX for fixing) maps to a SCITT-notarized attestation of conformance. A YAML mapping format drives webhook event data to SCITT statement creation. The presence of data in respective SCITT feeds/subjects determines the overall compliance result. Teams output "attestations of conformance" to S2C2F requirements stored in SCITT, creating auditable, cryptographically verifiable compliance evidence for the entire OSS consumption lifecycle.
 * 
 * @see comms/0451
 */
export function s2c2fScittConformance(): void {
  // Related: scittNotaryAssertionRegistry
}

/**
 * SCITT transparency service root rotation or merkle tree swap that preserves historical context and root of trust across the TS lifecycle.
 * 
 * When a Transparency Service rotates its signing key or replaces its merkle tree, the accumulated transparency context and trust anchors must survive the transition. The rotation must be provable: a new root must chain back to the old root so verifiers can follow the trust continuity. Combined with a policy engine and federation, the labeled property graph built from receipts persists across rotations. This ensures long-lived supply chain transparency even as individual TS instances evolve or are replaced.
 * 
 * @see comms/0452
 */
export function scittRootRotation(): void {
  // Related: scittNotaryAssertionRegistry
}

/**
 * Apply NIST metaschema abstract information modeling to SCITT statements, SBOM, and VEX for schema generation, code generation, and format conversion.
 * 
 * Metaschema defines key objects, their relationships, abstract objects, and constraints/rules against data point combinations. These feed schema generators (XML Schema, JSON Schema, YAML) and programming-language code generators (Java and TypeScript first targets). Applied to SCITT: metaschema models of SBOM and VEX statements enable format conversion (any format → common abstract format → any format), constraint validation via XPATH-based profiling, and traversal across federated SCITT logs. Uses OSCAL modeling techniques (7-8 security document models) with allowed-value constraints. CBOR support on roadmap. Goal: metaschema-ize supply chain data so federated SCITT logs become uniformly queryable and validatable.
 * 
 * @see comms/0454
 */
export function metaschemaScittTooling(): void {
  // Related: scittToipTrustRegistry
}

/**
 * Trust model for attestations that graduates from registry-presence-based to entity-signature-verified.
 * 
 * OpenVEX SIG discussion (2023-11-27) articulates a trust maturity ladder for container image attestations: currently, anyone who can push to a registry is trusted for their attestation (registry-upload == trust). The next rung verifies that the attestation signature originates from the same entity that signed the artifact — entity provenance, not just registry access. This graduation path applies to VEX statements, SBOMs, and any attestation attached to OCI artifacts. It parallels the SLSA track from "source exists" to "hermetic, isolated, parameterless" — trust increases as the attestation's origin moves closer to the artifact's author.
 * 
 * @see comms/0464
 * @see https://github.com/openvex/spec/issues/43
 * @see https://github.com/opencontainers/distribution-spec/issues/459
 */
export function registryTrustGraduation(): void {
  // Related: openVexActivityPubBridge, scittEntryIdContentAddressing
}

/**
 * The SLSA provenance v1.0 in-toto attestation structure Alice should produce and verify for build artifacts.
 * 
 * Documents the precise wire format from slsa.dev/spec/v1.0/provenance: an in-toto Statement (subject + predicateType + predicate) where the predicate carries buildDefinition (buildType, externalParameters, internalParameters, resolvedDependencies as ResourceDescriptors) and runDetails (builder identity, invocation metadata with timestamps, byproducts). Each ResourceDescriptor carries uri, digest (sha256/sha512/gitCommit), name, downloadLocation, mediaType, content (base64), and annotations. A concrete example from the sigstore npm package release shows how GitHub Actions buildType feeds the workflow ref, repository, event_name, and repository_id into externalParameters and internalParameters. Alice must both emit these attestations from her build pipelines and consume them during policy evaluation.
 * 
 * @see comms/0468
 * @see https://slsa.dev/spec/v1.0/provenance
 * @see https://search.sigstore.dev/?logIndex=33351527
 */
export function slsaProvenanceAttestationShape(): void {
  // Related: scittEntryIdContentAddressing, inTotoCoseSupplyChainAttestation
}

/**
 * Self-contained portable AI inference binary that can be attested, signed, and distributed through supply chain integrity mechanisms.
 * 
 * Mozilla Ocho's llamafile demonstrates the pattern: a single-file LLM runtime that bundles the model weights, inference engine, and runtime into one portable binary. For Alice's supply chain, this means AI models become content-addressable artifacts — each llamafile has a digest, can be signed with cosign/in-toto, registered in SCITT transparency logs, and policy-checked at deployment. The portable binary pattern eliminates the "model weights downloaded separately" trust gap: the entire inference stack is one auditable unit. Extends the container-as-artifact pattern to AI workloads.
 * 
 * @see comms/0469
 * @see https://github.com/Mozilla-Ocho/llamafile
 */
export function portableAiInferenceArtifact(): void {
  // Related: slsaProvenanceAttestationShape, aiSupplyChainTransparency
}

/**
 * Poll 2nd party repositories via GitHub GraphQL API with cursor-based pagination to discover pull requests that modify specific files (e.g. SBOM, SECURITY.md), then trigger SCITT notarization of the discovered changes.
 * 
 * Alternative to webhook-based event ingestion. Works without requiring webhook configuration on target repos. Paginates through PRs (states: OPEN, MERGED, CLOSED) and their files independently, matching against a target file path. Enables federation of supply chain events from the CBOR API perspective — polling becomes a discovery mechanism for transparency service federation.
 * 
 * @see comms/0473
 */
export function federatedGraphQLSupplyChainPolling(): void {
  // Related: scittNotarizingProxyInCiCd, scittBovineFederation, federatedSupplyChainValidationTopology
}

/**
 * Use a `public-keys` git branch as the authorized_keys discovery mechanism for SCITT notary signing identity. Ephemeral ECDSA keypair generated per CI run, public key appended to the branch, pushed, and the workflow polls `raw.githubusercontent.com` until the new key propagates. The `did:web` issuer resolves to `raw.githubusercontent.com:<owner>:<repo>:public-keys:authorized_keys`.
 * 
 * After SCITT submission, the private key is immediately deleted. The public-keys branch serves as a transparent, auditable log of all notary keys that have been authorized to sign SCITT statements for the repository.
 * 
 * Earlier understanding (from prior comms): SSH keys can serve as SCITT identity. This comm adds the git branch distribution + ephemeral key generation + propagation polling pattern.
 * 
 * @see comms/0479
 */
export function publicKeysBranchNotaryDiscovery(): void {
  // Related: sshKeyAsScittIdentity, scittNotaryAssertionRegistry, scittNotarizingProxyInCiCd
}

/**
 * Complete GitHub Actions workflow pipeline: generate SBOM for Python package → wrap in in-toto v0.1 Statement with CycloneDX v1.4 predicate → generate ephemeral ECDSA (secp384r1) keypair → publish public key to `public-keys` branch → poll for raw.githubusercontent.com propagation → submit signed attestation to SCITT transparency service → auto-create PR for SBOM file updates.
 * 
 * The in-toto attestation binds the SBOM (predicate) to the release artifacts (subjects with sha256 digests). The ephemeral key is deleted immediately after SCITT submission — the public-keys branch history serves as the persistent identity record.
 * 
 * Earlier understanding (from prior comms): SBOM flows into SCITT via OCI pipeline. This comm adds the in-toto attestation wrapping, ephemeral key lifecycle, and public-keys branch identity pattern.
 * 
 * @see comms/0479
 */
export function inTotoCycloneDxScittSubmission(): void {
  // Related: sbomToScittOciPipeline, inTotoCoseSupplyChainAttestation, sshKeyAsScittIdentity, publicKeysBranchNotaryDiscovery
}

/**
 * CycloneDX 1.6 schema adds an evidence references array linking each supply-chain claim to the evidence that supports it.
 * 
 * The CycloneDX BOM schema at bom-1.6.schema.json#L276-L281 introduces "The array of references to evidence that supports this claim." This pattern makes every SBOM assertion auditable by pointing to the specific data (test results, scan output, attestation) that backs it. When combined with SCITT registration, the evidence references become transparency-log-backed, creating a verifiable chain from claim to evidence to notarized receipt. This is the foundational data model for Alice's claim-evidence-receipt pipeline: CycloneDX carries the structured evidence reference, SBOMit specifies the attestation format, and SCITT registers the result.
 * 
 * @see comms/0481
 * @see https://github.com/CycloneDX/specification/blob/e8ae437941d01c006c0a5f0450e183238e899d8b/schema/bom-1.6.schema.json#L276-L281
 * @see https://github.com/SBOMit/specification
 */
export function cycloneDxEvidenceReferences(): void {
  // Related: sbomToScittOciPipeline, inTotoCycloneDxScittSubmission
}

/**
 * GitHub Actions pipeline that generates OpenVEX vulnerability statements and submits them to a SCITT transparency log.
 * 
 * The pipeline chains two community actions: `openvex/generate-vex` runs vexctl to produce an OpenVEX document for a package (identified by `pkg:github/${{ github.repository }}@${{ github.sha }}`), then `scitt-community/scitt-api-emulator` submits that VEX payload to a SCITT instance. The issuer is a did:web DID resolved from a public-keys branch (`did:web:raw.githubusercontent.com:intel:dffml:public-keys:authorized_keys`), establishing cryptographic identity for the CI job. The subject uses the pkg:github purl scheme. This pattern makes every CI run a notary: each build produces a SCITT-registered VEX statement, creating an immutable, transparent record of vulnerability status at build time. Combined with VDO (Vulnerability Description Ontology), the VEX statements become structured input to Alice's decentralized Data Analysis Control loop.
 * 
 * @see comms/0482
 * @see comms/0480
 * @see https://github.com/openvex/generate-vex/pull/1
 * @see https://github.com/scitt-community/scitt-api-emulator
 */
export function openVexScittCiSubmission(): void {
  // Related: scittNotarizingProxyInCiCd, publicKeysBranchNotaryDiscovery, sbomToScittOciPipeline
}

/**
 * Vulnerability Description Ontology (VDO) provides standardized, machine-readable vulnerability descriptions that feed Alice's decentralized Data Analysis Control loop.
 * 
 * VDO defines a structured vocabulary for describing vulnerabilities — affected products, impact, severity, remediation — in a format suitable for automated reasoning. When VEX statements are issued using VDO, they become computable inputs to Alice's analysis engine rather than human-oriented prose. The vision: CI pipelines produce SCITT-registered VEX statements with VDO-structured vulnerability data; Alice ingests these via the transparency log, correlates them across the supply chain graph, and drives automated remediation decisions (update, patch, gate) through the Data Analysis Control loop. This closes the loop from vulnerability discovery → structured description → transparency registration → analysis → action.
 * 
 * @see comms/0482
 * @see comms/0480
 */
export function vulnerabilityDescriptionOntologyAnalysisLoop(): void {
  // Related: openVexScittCiSubmission, livingSbomVdr, csafVexFramework
}
