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
