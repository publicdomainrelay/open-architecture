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
