/**
 * Getting work done: compute contracts. The docs-as-code translation of that
 * section of `open_architecture_today.md`.
 *
 * Alice owns nothing. She is ephemeral. When she needs to run something heavy,
 * she does not own a server, she goes and rents one from someone she trusts,
 * out in the open, with no shared currency required beyond the receipts
 * themselves.
 *
 * @see open_architecture_today.md "Getting Work Done: Compute Contracts"
 * @module
 */

import type {
  CCB,
  CCBA,
  CCR,
  CCRFP,
  DID,
} from "@publicdomainrelay/alice-common";
import { doITrustWhereThisCameFrom } from "@publicdomainrelay/alice-trust-abc";

/**
 * Picture three entities: Alice needs compute, Bob has machines, and Eve is
 * around but unproven. This is how Alice gets her work run, end to end.
 *
 * @see open_architecture_today.md "Picture three entities on the network"
 */
export function getMyWorkRun(): CCR {
  const rfp = publishCCRFP();
  const bids = biddersAnswerWithCCB(rfp);
  const chosen = policyEnginePicksABidder(bids);
  const accept = acceptWithCCBA(chosen);
  payPerTheTerms(accept);
  return bobPublishesCCR(accept);
}

/**
 * Step 1: Alice publishes a Compute Contract Request For Proposal (CCRFP), a
 * manifest describing what she needs built or run.
 *
 * @see open_architecture_today.md "Alice publishes a Compute Contract Request For Proposal"
 */
export function publishCCRFP(): CCRFP {
  return { request: { intent: "", schema: undefined, data: undefined } };
}

/**
 * Step 2: Bob and Eve each answer with a Compute Contract Bid (CCB) against
 * that request.
 *
 * @see open_architecture_today.md "Bob and Eve each answer with a Compute Contract Bid"
 */
export function biddersAnswerWithCCB(_rfp: CCRFP): CCB[] {
  return [];
}

/**
 * Step 3: Alice's policy engine reads the trust graph. She has vouched for Bob
 * and denounced Eve, so she picks Bob.
 *
 * @see open_architecture_today.md "Alice's policy engine reads the trust graph"
 */
export function policyEnginePicksABidder(bids: CCB[]): CCB {
  const trusted = bids.filter((bid) => doITrustWhereThisCameFrom(bid.bidder));
  return trusted[0] ?? bids[0];
}

/**
 * Step 4: She accepts with a Compute Contract Bid Accept (CCBA) against Bob's
 * bid.
 *
 * @see open_architecture_today.md "She accepts with a Compute Contract Bid Accept"
 */
export function acceptWithCCBA(_bid: CCB): CCBA {
  return { accepts: { uri: "at://", cid: "" } };
}

/**
 * Step 5: She pays per the terms in Bob's bid, keyed to the contract's URI and
 * CID:
 * ```
 * npx awal x402 pay https://builder.bob.example.com/ccr/${AT_URI}/${CID}
 * ```
 *
 * @see open_architecture_today.md "She pays per the terms in Bob's bid"
 */
export function payPerTheTerms(_accept: CCBA): void {
  // Receipts are the only currency.
}

/**
 * Step 6: Bob builds to her spec and publishes a Compute Contract Receipt (CCR)
 * over the whole chain, the request, the bid, and the accept. The receipt is
 * the proof the work was done as agreed.
 *
 * @see open_architecture_today.md "Bob builds to her spec and publishes a Compute Contract Receipt"
 */
export function bobPublishesCCR(accept: CCBA): CCR {
  return {
    chain: {
      request: { uri: "at://", cid: "" },
      bid: { uri: "at://", cid: "" },
      accept: accept.accepts,
    },
    evidence: undefined,
  };
}

/**
 * While her workload runs inside Bob's compute, she does not hand over standing
 * credentials. She configures her access ahead of time from the workload
 * identity information in Bob's bid, and at runtime her code exchanges tokens
 * through a reverse proxy that enforces fine grained, role based access to
 * exactly the downstream services she allowed, and nothing more.
 *
 * @see open_architecture_today.md "While her workload runs inside Bob's compute"
 */
export function reverseProxyEnforcesAccess(_workload: DID): void {
  // No standing credentials. Token exchange, role based, least privilege.
}

/**
 * Bob exposes the running service to the world by registering a key and opening
 * a reverse tunnel, which turns arbitrary compute into a real HTTPS endpoint
 * and doubles as service discovery. The relay is the registry.
 *
 * @see open_architecture_today.md "Bob exposes the running service to the world"
 */
export function reverseTunnelIsServiceDiscovery(): void {
  // Arbitrary compute becomes a real HTTPS endpoint via the relay.
}

/**
 * A self-hosted GitHub Actions runner that boots from the Wolfi partition via systemd, enabling headless scale-to-zero CI. The runner starts on VM boot, registers with GitHub, executes queued workflow jobs, and the VM can be deprovisioned when idle.
 * 
 * Integrated into the OS DecentrAlice boot chain: Fedora kernel boots → systemd on Wolfi partition starts sshd and the actions runner → the runner picks up jobs from the repository → Alice runs `alice shouldi contribute` data flows over the scan results → results feed into SCITT OpenSSF Metrics via the OIDC self-attestation path. Packer builds the VM image with the runner pre-installed and user_data cloud-init to register on first boot.
 * 
 * @see comms/0054
 * @see comms/0053
 * @see https://github.com/actions/runner
 * @see https://www.packer.io/plugins/builders/qemu
 */
export function headlessScaleToZeroCiRunner(): void {
  // Related: getMyWorkRun, aliceOsDeployment
}

/**
 * Use W3C Traceability Vocab's BillOfLadingCredential as a model for content-addressed compute contracts, modified to use DIDs instead of names and places.
 * 
 * A Bill of Lading is both a receipt for merchandise and a contract to deliver it — the same structure maps to compute contracts: a receipt for inputs and a contract to execute. The Zephyr use case (tracking git version, toolchain version, .config for reproducibility) maps to this pattern: concat and checksum JSON serializations of tracked inputs into a did:merkle content address. This replaces the BillOfLading's shipper/place fields with DIDs and content addresses.
 * 
 * The BillOfLading schema from the traceability vocab (https://w3c-ccg.github.io/traceability-vocab/#BillOfLadingCredential) serves as the starting template; Alice modifies it into a compute-contract-specific credential with fewer names-and-places and more DIDs.
 * 
 * @see comms/0080
 * @see https://w3c-ccg.github.io/traceability-vocab/#BillOfLadingCredential
 */
export function billOfLadingComputeContract(): void {
  // TODO: wire to related concepts
}

/**
 * Bridge CI/CD pull request validation to production deployment in a hermetic,
 * cacheable execution environment via IPVM (InterPlanetary Virtual Machine).
 * 
 * When a CI/CD build passes, the same artifact should be deployable with
 * no rebuild—provenance and invocation auth formats must align across the
 * boundary. IPVM provides content-addressed, reproducible execution: the
 * build output is the deployment unit, and the same content hash identifies
 * it in both contexts.
 * 
 * Requires alignment across provenance formats (in-toto, SLSA) and invocation
 * auth formats (UCAN, DICE, KERI). When JSON-LD is the common data model,
 * query across ideation and production becomes trivial, feeding Alice's
 * training loop. Policy application becomes uniform, reducing policy escapes
 * where production drifts from what was validated in CI/CD.
 * 
 * @see comms/0214
 * @see intel/dffml#1400
 */
export function ipvmHermeticDeploymentBridge(): void {
  // Related: dataflowDescribeInfrastructure, runDataflowSerializable, inTotoVcKeriBridge
}
