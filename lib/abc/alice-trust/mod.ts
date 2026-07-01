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
 * foundation of the answer is the web of trust, not the hardware.
 *
 * @see open_architecture_today.md "What She Trusts, and Why It Isn't the Hardware"
 */
export function doITrustWhereThisCameFrom(source: DID): boolean {
  enclaveAttestationIsASignalNotAFoundation();
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
