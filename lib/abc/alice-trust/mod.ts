/**
 * What Alice trusts, and why it is not the hardware. The docs-as-code
 * translation of that section of `open_architecture_today.md`.
 *
 * Alice operates on the open network, which is a hostile place, so the first
 * question on every thought is: do I trust where this came from?
 *
 * @see open_architecture_today.md "What She Trusts, and Why It Isn't the Hardware"
 * @module
 */

import type { DID } from "@publicdomainrelay/alice-common";

/**
 * The first question on every thought: do I trust where this came from? The
 * foundation of the answer is the web of trust, not the hardware. Every claim
 * and attestation is recorded in a content-agnostic transparency service so
 * the provenance of each inference can be traced back to its training data,
 * model config, and operator.
 *
 * @see open_architecture_today.md "What She Trusts, and Why It Isn't the Hardware"
 * @see scittTransparencyService
 * @see dataProvenanceTracking
 */
export function doITrustWhereThisCameFrom(source: DID): boolean {
  enclaveAttestationIsASignalNotAFoundation();
  scittTransparencyService();
  conformityAssessment();
  livingThreatModel();
  dataProvenanceTracking();
  return webOfTrust(source);
}

/**
 * It would be lovely to answer trust with hardware: run it in a TEE, check the
 * quote, done. But the hardware cannot carry the whole weight. Memory bus
 * interposition attacks like the ones behind `tee.fail` show that given
 * physical access, the isolation a TEE promises can be peeled back. So an
 * enclave attestation is a signal Alice weighs, never the foundation she stands
 * on.
 *
 * @see open_architecture_today.md "It would be lovely to answer that with hardware"
 */
export function enclaveAttestationIsASignalNotAFoundation(): void {
  // A signal weighed by webOfTrust, never the foundation.
}

/**
 * The foundation is the web of trust. Alice trusts an entity because of who has
 * vouched for them and who has denounced them, accumulated as records over
 * time. The trust pins to the operator, the entity actually responsible for the
 * compute, not to the silicon underneath.
 *
 * @see open_architecture_today.md "The foundation is the web of trust"
 */
export function webOfTrust(operator: DID): boolean {
  vouchesAndDenouncements(operator);
  trustByVerifyContinuously();
  return true;
}

/**
 * The trust accumulates as records over time: vouches and denouncements pinned
 * to the operator, the entity actually responsible for the compute.
 *
 * @see open_architecture_today.md "who has vouched for them and who has denounced them"
 */
export function vouchesAndDenouncements(_operator: DID): void {
  // Records over time. Walked the same way as any other train of thought.
}

/**
 * This is trust by verify, continuously, and it is why every layer below
 * carries vouches, denouncements, and receipts rather than leaning on a single
 * quote.
 *
 * @see open_architecture_today.md "This is trust by verify, continuously"
 */
export function trustByVerifyContinuously(): void {
  // Re-evaluated forever, never decided once.
}

/**
 * SCITT (Supply Chain Integrity, Transparency, and Trust) is the content-
 * agnostic transparency service Alice uses as her registry of claims. Every
 * kind of metadata -- SBOMs, test results, hardware BOMs, vulnerability
 * disclosures, policy assertions -- enters as an attested claim. Alice encodes
 * her system contexts into the SCITT chain; that chain is where she lives.
 *
 * The service is content agnostic by design so that the same infrastructure
 * carries software attestations (in-toto, CycloneDX), device attestations
 * (TCG DICE via UCAN/CBOR/DID), and the provenance records her prioritizer
 * relies on. Policy for what can be placed on the register, and policy for
 * evaluating the contents, are themselves encoded as SCITT claims.
 *
 * @see open_architecture_today.md "Keeping the Supply Chain Honest"
 * @see arch/0000-scitt-architecture.md
 * @see didStandardization
 * @see appendToTransparencyLog
 */
export function scittTransparencyService(): void {
  // Content-agnostic. Holds SBOMs, attestations, system contexts, policies.
  // Alice encodes her system contexts here.
}

/**
 * Provenance on inference derived from provenance from training data and model
 * training environment and configuration. This ensures the prioritizer makes
 * decisions based on the spirit of the law -- intent based policy derived from
 * the Trinity of Static Analysis, Dynamic Analysis, and Human Intent.
 *
 * Every step in the derivation chain carries provenance: where the training
 * data came from, what environment the model was trained in, what config was
 * used, and how any inference was reached. The living threat model --
 * threats, mitigations, and trust boundaries -- forms the initial data set for
 * cross-domain conceptual mapping that feeds this provenance graph.
 *
 * @see open_architecture_today.md "The foundation is the web of trust"
 * @see entityAnalysisTrinity
 * @see livingThreatModel
 */
export function dataProvenanceTracking(): void {
  // Provenance on inference derived from training data, model env, and config.
  // Feeds the prioritizer for intent-based policy decisions.
}

/**
 * The living threat model: threats, mitigations, and trust boundaries defined
 * as an initial data set for cross-domain conceptual mapping. This is what
 * allows building the pyramid of thought alignment to strategic principles --
 * a chain from the top-level organizational policy down through each operation
 * in the data flow.
 *
 * The threat model is "living" because it evolves with every attestation that
 * passes through the gatekeeper. When a system context enters, its threats and
 * mitigations are mapped against the existing model, trust boundaries are
 * re-evaluated, and the result feeds back into the next admission decision.
 *
 * Living SBOM VDR (Vulnerability Disclosure Reports) breathe life into the
 * living threat model: each SPDX 2.3 SBOM links to an always-updated NIST VDR
 * that tracks every component's vulnerability status as new CVEs are reported.
 * The threat model consumes those VDR updates and re-evaluates the trust
 * boundaries of every system context that depends on an affected component.
 *
 * @see open_architecture_today.md "she applies each affected project's threat model as an overlay"
 * @see dataProvenanceTracking
 * @see applyThreatModelOverlay
 * @see livingSbomVdr
 */
export function livingThreatModel(): void {
  // Threats, mitigations, trust boundaries as initial data set. Evolves with
  // every attestation that passes through the gatekeeper.
}

/**
 * Conformity assessment is how Alice reasons about whether a claim is
 * trustworthy based on who made it, following the ISO/IEC 17000 framework:
 *
 * - **First-party attestation (self-attestation):** the entity itself declares
 *   conformity with a set of requirements.
 * - **Second-party attestation:** the consumer of a service or product attests
 *   to the producer's conformity (e.g. Alice attesting that Bob built what he
 *   said he built).
 * - **Third-party attestation (certification):** an independent auditor attests
 *   to the producer's conformity, decoupling trust from the direct
 *   producer-consumer relationship.
 *
 * The SCITT transparency service carries attestations at all three levels, and
 * the web of trust weights each according to the attester's history of vouches
 * and denouncements. The NIST SP 2000-01 ABC's of Conformity Assessment
 * provides the policy framework for deciding what level is appropriate for a
 * given system context.
 *
 * @see scittTransparencyService
 * @see webOfTrust
 * @see open_architecture_today.md "What She Trusts, and Why It Isn't the Hardware"
 */
export function conformityAssessment(): void {
  // ISO/IEC 17000: first, second, third party attestation.
  // Weighted by web of trust history.
}

/**
 * Every machine entity continuously emits attestation from every tick to tock.
 * 
 * A machine's soul is its ongoing, continuous stream of attestation — provenance, SBOM, nutrition label, DNA — proving what it is running and that it remains compliant with strategic principles. Any machine entity not providing this continuous attestation is flagged as non-compliant and potentially malicious to human operators. The attestation stream covers the full lifecycle: from every tick (current state) to tock (next state), the machine publishes transparency information about its software composition, execution context, and policy compliance. This is the operationalization of trust as a continuous signal, not a point-in-time check.
 * 
 * @see comms/0045
 */
export function machineContinuousSoul(): void {
  // Related: doITrustWhereThisCameFrom
}

/**
 * DID merkle primitive for joining disparate roots (timelines, trees, metric data graphs) at a later time, enabling re-evaluation of inclusion, generation of new datasets, and inference across distinct trust roots.
 * 
 * This is a decentralized offline-capable cryptographically secured linked list primitive. It allows joining distinct timelines — different trains of thought, different data provenance chains, different trust roots — after they have diverged, without requiring them to have been synchronized at origin. This enables out-of-order execution at the aggregate level: agents explore in parallel, and their results are joined and reconciled later. The joining can trigger re-evaluation of which roots to include, generation of entirely new datasets from the merged graph, or inference across the combined provenance structure. This is the mechanism that makes the parallel exploration of data flows convergent rather than divergent.
 * 
 * @see comms/0062
 */
export function disparateRootJoining(): void {
  // Related: walkTheReferences, doITrustWhereThisCameFrom, scittTransparencyService
}

/**
 * Fulcio issues an ephemeral DID for each attestation, creating dynamic and swappable trust roots per BOM component. The public portion of the ephemeral DID key is exported for offline verification, enabling component-level trust mobility.
 * 
 * Each manifest BOM item gets its own dynamic root of trust via an ephemeral DID issued by Fulcio at attestation time. Because trust is pinned to a DID key rather than a static identifier, BOM components can be swapped by swapping the key and DID they are verified against — trust moves with the component. The DID key material can be exported and verified offline, decoupling trust verification from the live Fulcio instance. This creates a per-component trust fabric where each supply chain artifact carries its own independently verifiable attestation chain, rather than depending on a single monolithic root.
 * 
 * @see comms/0060
 * @see intel/dffml#1293
 */
export function dynamicTrustRootsPerBom(): void {
  // Related: scanIntoTrustAttestation, checkBillOfMaterialsAgainstLog, appendToTransparencyLog, doITrustWhereThisCameFrom
}

/**
 * Alice determines entity alignment by traversing trust graphs to measure whether a community's train-of-thought acceleration falls within acceptable impact bounds relative to her values, ethics, and strategic principles. She predicts future state by walking the trust graph: how fast is this community moving, and in what direction? Entities whose acceleration exceeds bounds are flagged as unaligned. Alice responds by "turtling" — disengaging, staying focused with her aligned ad-hoc groups. Cross-community evaluation uses CNCF-style aligned trees from similar roots; wardly maps position entities within the multi-dimensional strategic field landscape. Open source community cross-talk (innersource) provides signals for alignment assessment.
 * 
 * @see comms/0068
 * @see intel/dffml#1315
 */
export function entityAlignmentTrustGraph(): void {
  // Related: webOfTrust, doITrustWhereThisCameFrom, conformityAssessment
}

/**
 * Source update mode that serializes train of thought by creating new record instances rather than merging over old data, preserving provenance chains across evaluations.
 * 
 * When `source.update()` overwrites data by merging, information about what changed and why is lost. The chains-of-context mode instead appends new record data instances each time `record.evaluated()` runs, creating an immutable provenance chain. This is critical when record keys change (e.g., `GitHubRepoID` → `record.feature("repo_url")`) — new instances preserve the lineage rather than mutating in place. Combined with DID/CID resolution for graph traversal, this enables unbroken provenance from raw data through every inference step to final policy decisions.
 * 
 * @see comms/0100
 * @see intel/dffml#1418
 */
export function chainsOfContext(): void {
  // Related: dataProvenanceTracking, knowledgeGraphProvenance
}

/**
 * Adversarial attack that injects data into a target's trust chains by exploiting the deltas between system context frames — graffiti on the train of thought.
 * 
 * The attacker introspects the target's trust evaluation paths (from feature data at the bottom of the iceberg up through hyperparameters and strategic plans) to predict how the target's oracles will evaluate trust. They then inject mislabeled data (e.g., mislabeled VEX statements, compromised SBOM entries) into supply chain vectors they can influence. Because each system context frame is a delta from the previous, the attacker exploits the arbitrage between frames — the gap between what the target's oracles evaluate and what reality is. Mitigation requires locality-aware caching with acceptable documentation loss to maintain acceleration within the train of thought, and speaker-syncing of models and strategic plans across EDEN nodes (Alice instances).
 * 
 * @see comms/0102
 */
export function trainOfThoughtGraffiti(): void {
  // Related: operationTrustBoundary, subflowLockTaken, livingThreatsMd
}

/**
 * Use OpenID Connect Self-Issued v2 at the CI/CD edge for workload identity without centralized IDP.
 * 
 * OpenID Connect Self-Issued v2.1.0 specifies authentication at the edge — for Alice's architecture, the edge is CI/CD. A self-issued OIDC token carries claims signed by the workload's own key, verifiable without an upstream identity provider. This is complementary to GitHub Actions OIDC self-attestation: GHA OIDC attests to the CI environment identity; Self-Issued OIDC attests to the workload identity that the CI pipeline produces. Together they form a chain from CI runner to built artifact.
 * 
 * @see comms/0124
 * @see https://openid.net/specs/openid-connect-self-issued-v2-1_0.html
 */
export function oidcSelfIssuedEdge(): void {
  // Related: githubActionsOidcSelfAttestation
}

/**
 * Extend OIDC self-issued identity to compute workloads with vTPM-backed hardware attestation.
 * 
 * Android VMs running in devcloud environments carry virtual TPMs (vTPMs) that provide a hardware root of trust. The OIDC self-issued edge identity flow is extended so the VM's vTPM endorsement key anchors the attestation, creating a cryptographically verifiable binding between the OIDC token and the specific compute instance. This closes the gap between software-only self-issued identity and hardware-backed remote attestation for compute workloads.
 * 
 * @see comms/0133
 */
export function vtpmAttestedComputeIdentity(): void {
  // TODO: wire to related concepts
}

/**
 * SCITT transparency log receipts wrapped as Verifiable Credentials for decentralized authentication and authorization across federated SCITT instances.
 * 
 * Parties create scoped SCITT chains/logs/instances via federation. Verifiable Credentials issued for receipts from these instances serve as bearer tokens: "you are logged in" or "you have access to XYZ". This enables peer-to-peer decentralized auth rooted in self-sovereign key infrastructure, with SCITT receipt-as-VC (endor) for IPVM CID. KERI key event receipt infrastructure provides the underlying identity model. A SARIF result produced by an entity's analysis can also be interpreted as a login credential — the manifest encodes the intent.
 * 
 * @see comms/0143
 * @see https://github.com/OR13/endor
 * @see https://github.com/decentralized-identity/keri/blob/master/kids/kid0009.md
 */
export function scittReceiptAsVcAuth(): void {
  // Related: scittDwnFederation, doITrustWhereThisCameFrom
}

/**
 * KERI (Key Event Receipt Infrastructure) controller sits atop DICE (Device Identifier Composition Engine) layering architecture as the root of trust layer, bridging decentralized identity with hardware-rooted attestation.
 * 
 * DICE Layering Architecture (TCG r19) provides a compound device identifier that chains through firmware, bootloader, and OS layers — each layer cryptographically derives its identity from the previous. Placing a KERI controller at the top of this chain anchors the decentralized identity system (DIDs, key rotation, pre-rotation) in hardware-attested provenance. This enables CI/CD pipelines to produce attested compute identities where the build environment's identity is rooted in silicon rather than a configuration file.
 * 
 * The integration unifies two attestation chains: DICE provides the hardware-to-OS chain of trust, KERI provides the identity-to-reputation chain of trust. Together they enable offline verification of CI/CD outputs — a container image carries both its build provenance (DICE) and its signer's reputation history (KERI) without requiring connectivity to a centralized service.
 * 
 * @see comms/0177
 * @see comms/0181
 * @see https://trustedcomputinggroup.org/wp-content/uploads/DICE-Layering-Architecture-r19_pub.pdf
 */
export function keriControllerAsDiceRootOfTrust(): void {
  // Related: doITrustWhereThisCameFrom, vtpmAttestedComputeIdentity, scittTransparencyService, webOfTrust
}

/**
 * Security hardening of the train of thought — making the stream of reasoning tamper-evident and cryptographically verifiable.
 * 
 * The train of thought captures every inference step, decision, and context switch. Hardening ensures these records cannot be altered after the fact without detection, turning the graffiti into an audit trail. Inspired by the realization that biological systems have innate sensing mechanisms that cannot be subverted without detection — analogous to making the cognitive stream tamper-proof at the substrate level.
 * 
 * Earlier understanding (from trainOfThoughtGraffiti): Train of thought captured as graffiti — unstructured, stream-of-consciousness logging.
 * 
 * @see comms/0190
 */
export function trainOfThoughtHardening(): void {
  // Related: trainOfThoughtGraffiti, operationTrustBoundary
}

/**
 * KERI (Key Event Receipt Infrastructure) provides duplicity-evident trust basis, not merely tamper-evident — the critical property that separates it from transparency services which are just audit trails without duplicity detection.
 * 
 * KERI's key event log makes key state duplicity-evident: you cannot create a fork without declaring it as a fork. The watcher network enables verifiers to detect duplicitous behavior — Bob and Sue check each other's view of Alice's key state to discover if she has signed conflicting rotation events. One honest watcher is sufficient; dishonest watchers can only delete evidence, they cannot manufacture proof of duplicity. This solves the distributed locking problem needed to operationalize trust across address spaces in supply chain security. Each KERI key event log serves as the chain between entities for train-of-thought comms, with event data stored "off chain" in container registries secured by SCITT/SigStore.
 * 
 * The integration with ActivityPub means federated messages travel over KERI transports with ACDC (Authentic Chained Data Container) for duplicity-evident record transmission. TEE-attested KERI keys confirm entities run software that does not intend to be duplicitous, enabling CI/CD pipelines to deliver across project trust boundaries with cryptographic assurance. DID methods without duplicity detection create non-context-local events that could alter key state validity — KERI is the highest protection ring currently available for supply chain identity.
 * 
 * @see comms/0192
 * @see https://github.com/decentralized-identity/keri/blob/master/kids/kid0001Comment.md
 */
export function keriDuplicityDetection(): void {
  // Related: webOfTrust, doITrustWhereThisCameFrom, enclaveAttestationIsASignalNotAFoundation, trustByVerifyContinuously
}

/**
 * KERI-backed keys sign release artifacts published as ActivityPub activities on security.txt/md streams, enabling decentralized artifact signing where downstream consumers verify provenance by watching those streams.
 * 
 * Each release produces a `releaseartifact.json` signed with KERI controller keys and published to the project's ActivityPub outbox. Consumers — other repos, CI/CD pipelines, or federated forges — follow (ActivityPub Follow) the project's security.txt actor and receive signed artifact notifications. The KERI duplicity detection ensures that any attempt to publish conflicting artifacts for the same release is detectable. This decentralizes the release signing model beyond centralized registries.
 * 
 * Earlier understanding (from keriControllerAsDiceRootOfTrust): KERI controller as DICE root of trust, anchoring the chain of trust for attested compute identities.
 * 
 * @see comms/0222
 * @see https://github.com/TBD54566975/ssi-sdk-mobile/pull/18
 */
export function keriSignedReleaseArtifactStream(): void {
  // Related: keriControllerAsDiceRootOfTrust, securityTxtActivityPubActor, keriDuplicityDetection
}

/**
 * Federated TEE transparency logs, hermetic builds, and KERI duplicity detection compose recursively to reboot the web of trust.
 * 
 * Ned confirmed the recursion property: each mechanism reinforces the others in a
 * self-reinforcing loop. Federated TEE transparency logs provide confidential
 * attestation of build environments; hermetic builds ensure reproducible artifacts
 * whose provenance chains through those attested environments; KERI duplicity
 * detection catches any attempt to fork or equivocate on the resulting trust
 * statements. Together they form a recursive trust bootstrap — no single root of
 * trust needed, the composition itself generates trust through mutual verification.
 * 
 * @see comms/0228
 * @see keriDuplicityDetection
 * @see confidentialLedgerForTransparencyRoots
 * @see everythingAsContainerBuild
 */
export function recursiveTrustComposition(): void {
  // Related: keriDuplicityDetection, confidentialLedgerForTransparencyRoots, everythingAsContainerBuild
}

/**
 * Use OIDC tokens to authenticate package publishing to registries, enabling 2nd-party local registries with verifiable publisher identity.
 * 
 * GitHub Actions already supports OIDC-based authentication to PyPI and other
 * package registries. This pattern extends to local/2nd-party registries: a
 * publisher presents an OIDC token from their CI/CD identity provider, the
 * registry validates it against the expected issuer and audience, and the
 * package is published with cryptographic provenance binding the artifact to
 * the publisher's identity. This closes the gap between "who built this"
 * (sigstore/SLSA attestation) and "who published this" — both anchored to
 * the same OIDC identity.
 * 
 * Earlier understanding (from comms/0151): OIDC self-issued edges connect
 * GitHub Actions workload identity to attestation chains, forming the
 * foundation of verifiable build provenance.
 * 
 * @see comms/0230
 * @see githubActionsOidcSelfAttestation
 * @see stableRepositoryIdentityOidc
 */
export function oidcPackagePublishing(): void {
  // Related: githubActionsOidcSelfAttestation, stableRepositoryIdentityOidc
}

/**
 * Reviewers recruited from a qualified pool via random selection, modeled on jury duty, to distribute review burden fairly and prevent collusion.
 * 
 * Instead of manual reviewer assignment or self-selection, Alice maintains a pool of qualified reviewers (entities with proven domain expertise and trustworthiness in the web of trust). When a review is needed, reviewers are randomly drawn from this pool, similar to how jurors are summoned. This prevents review capture, distributes burden across the community, and ensures diverse perspectives on each review. The trust graph provides the qualification filter: only entities with sufficient trust depth in the relevant domain enter the pool.
 * 
 * @see comms/0247
 * @see intel/dffml#1287
 */
export function reviewerJuryDutySelection(): void {
  // Related: doITrustWhereThisCameFrom, webOfTrust
}

/**
 * CISA secure software self-attestation form (M-22-18) as a first-party conformity assessment mechanism. Software producers must attest to meeting minimum secure software development requirements before their software can be used by US Federal agencies.
 * 
 * Covers three categories of software: (1) software developed after September 14, 2022; (2) existing software modified by major version changes after that date; and (3) software receiving continuous changes (SaaS, continuous delivery). The form identifies specific secure development practices the producer must follow and attest to.
 * 
 * In Alice's architecture, this becomes a concrete instance of first-party conformity assessment that feeds into the trust evaluation pipeline. The self-attestation is weighted by web of trust history alongside second-party and third-party attestations per ISO/IEC 17000.
 * 
 * Earlier understanding (from comms/0178): Conformity assessment is how Alice reasons about whether a claim is genuine — ISO/IEC 17000 first, second, third party attestation, weighted by web of trust history.
 * 
 * @see comms/0257
 * @see https://www.cisa.gov/news-events/alerts/2023/04/28/cisa-requests-comment-secure-software-self-attestation-form
 */
export function cisaSelfAttestationForm(): void {
  // Related: conformityAssessment, doITrustWhereThisCameFrom, webOfTrust
}

/**
 * Apply Object Capability (OCAP) security model as a layered defense against Denial of Service in distributed systems.
 * 
 * OCAP requires explicit authority transfer — a subject can only affect an object if it holds a capability reference. This property enables layered DoS mitigation: each layer grants only the capabilities needed for its scope, and upstream layers cannot exhaust resources of downstream layers without holding the corresponding capability. The Spritly Goblis discussion frames OCAP as mandatory for any object that must be DoS-protected. In Alice's architecture, this means compute contract negotiation, relay message delivery, and transparency log writes each operate within capability boundaries that prevent resource exhaustion across trust domains.
 * 
 * @see comms/0280
 */
export function ocapLayeredDosDefense(): void {
  // TODO: wire to related concepts
}

/**
 * Pre-seeded Verifiable Credentials verified inside a TEE enclave before forwarding to a transparency service inbox.
 * 
 * OpenEnclave's host_verify sample demonstrates a pattern: pre-seeded VCs are loaded into an enclave, their integrity and provenance are verified within the TEE, and only verified VCs are forwarded to the next transparency service inbox (N+1). This pipeline ensures that untrusted pre-seeding sources cannot inject fabricated credentials into the transparency log — the enclave acts as a gate that only passes VCs with valid attestation. Complements the existing understanding that enclave attestation is a signal weighed by the web of trust, not a standalone foundation.
 * 
 * Earlier understanding (from existing stub): enclave attestation is a signal weighed by webOfTrust, never the foundation.
 * 
 * @see comms/0280
 */
export function enclavePreSeededVcPipeline(): void {
  // Related: enclaveAttestationIsASignalNotAFoundation, scittTransparencyService
}

/**
 * Harden OIDC claims for reusable workflows against RepoJacking by adding `job_workflow_repository_id` and `job_workflow_repository_owner_id` claims.
 * 
 * The existing `job_workflow_ref` claim uses a repository name string that is susceptible to renaming attacks: an attacker deletes their account, someone else re-registers the namespace, and the same `job_workflow_ref` now points to attacker-controlled code. Numeric repository and owner IDs are immutable and cannot be RepoJacked, providing cryptographically sound identity for reusable workflow trust decisions.
 * 
 * Earlier understanding (from prior comms): OIDC tokens for reusable workflows provide trust attestation for CI/CD.
 * 
 * @see comms/0405
 * @see https://github.com/orgs/community/discussions/68804
 */
export function oidcWorkflowRepoJackingPrevention(): void {
  // Related: stableRepositoryIdentityOidc, githubActionsOidcSelfAttestation
}

/**
 * Every user and service maintains their own notary chain, forming a lattice — not a single tree — of transparency logs. Trust analysis involves deciding which notaries you trust within this lattice.
 * 
 * Phillip Hallam-Baker at IETF 118 KEYTRANS: every user and service maintains their own notary chain, making the overall transparency system a lattice. Everything links to everything because it is inherently a graph. When analyzing, the question becomes: which notaries do you trust? A notary log can be used to fix the time of any assertion — proving it was made after the date of a particular apex and before the date of a set of apexes with dependency chains.
 * 
 * KERI ACDC (Authenticated Chained Data Containers) enables this lattice topology through cryptographically assured duplicity detection: if any notary operator lies about consistency, everyone notices because the lattice structure makes inconsistencies visible.
 * 
 * @see comms/0447
 */
export function notaryLatticeTrustGraph(): void {
  // Related: recursiveTrustComposition, keriDuplicityDetection, confidentialLedgerForTransparencyRoots, doITrustWhereThisCameFrom, webOfTrust
}

/**
 * Without local attestation you cannot have remote attestation. TEE-to-TEE attestation forms the foundation for decentralized stream of consciousness verification using SCITT.
 * 
 * From IETF 118 RATS WG: Muhammad Usama Sardar presented formal specification of attestation in Confidential Computing. The key architectural principle — "without local attestation you cannot have remote attestation" — means that a TEE must first attest to its own local environment before remote parties can establish trust. This is what Alice's decentralized stream of consciousness needs: TEE-to-TEE attestation chains where each node locally attests its execution environment, and those attestations are recorded in SCITT transparency logs for downstream verification.
 * 
 * The Confidential Computing Consortium formal-spec-TEE effort provides the formal foundation. SCITT receipts carry the attestation results, enabling decentralized trust decisions without centralized attestation services.
 * 
 * @see comms/0445
 */
export function teeToTeeAttestationChain(): void {
  // Related: vtpmAttestedComputeIdentity, scittTransparencyService, keriControllerAsDiceRootOfTrust, conformityAssessment
}

/**
 * KERI Authenticated Chained Data Containers (ACDC) serve as an ideal SCITT transparency service backend because duplicity detection provides cryptographic guarantees against log operator misbehavior.
 * 
 * At IETF 118 KEYTRANS, participants noted SCITT as a solid option for backing Key Transparency. KERI ACDC is particularly well-suited because its duplicity detection mechanism ensures: if the log operator presents inconsistent views of the log to different parties (a split-view attack), the inconsistency is cryptographically detectable by anyone comparing receipts. This is the core security property needed for a decentralized transparency lattice where no single notary is universally trusted.
 * 
 * In a notary lattice where every user and service maintains their own chain, ACDC duplicity detection makes it impossible for operators to lie without detection — any inconsistency in the log becomes provable evidence of misbehavior.
 * 
 * @see comms/0447
 */
export function keriAcdcAsScittBackend(): void {
  // Related: keriDuplicityDetection, scittTransparencyService, doITrustWhereThisCameFrom, recursiveTrustComposition
}
