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

/**
 * Local headless CI testing via act runners with ActivityPub-based federated result communication.
 * 
 * The headless CI runner can be tested locally without a full VM deployment: `gh act` (nektos/gh-act) runs GitHub Actions workflows locally using Docker, while `github-act-runner` (ChristopherHX/github-act-runner) and Gitea's `act_runner` provide headless runner implementations for different forges. This enables offline validation of workflow changes before deploying to production runners.
 * 
 * Results from both local and production CI runs are communicated via ActivityPub using `wait-for-message-action`: a downstream project waits for an upstream CI result message published as an ActivityPub activity before proceeding with its own validation. This bridges the CI event space to the federated social graph, turning CI pipeline results into discoverable, federated events.
 * 
 * Earlier understanding (from comms/0054, comms/0053): A self-hosted GitHub Actions runner that boots from the Wolfi partition via systemd, enabling headless scale-to-zero CI. The runner starts on VM boot, registers with GitHub, executes queued workflow jobs, and the VM can be deprovisioned when idle.
 * 
 * @see comms/0259
 * @see https://github.com/ChristopherHX/github-act-runner
 * @see https://github.com/nektos/gh-act
 * @see https://gitea.com/gitea/act_runner
 */
export function activityPubCiResultCommunication(): void {
  // Related: headlessScaleToZeroCiRunner, federatedCiCdEventSpace, activityPubMessageQueueBridge, getMyWorkRun
}

/**
 * Efficient microVM cloning for compute contract provisioning using Linux userfaultfd for post-copy memory migration, enabling near-instant guest VM spawn from a template.
 * 
 * Rather than booting each guest from scratch, a golden microVM snapshot is cloned via userfaultfd — the kernel's user-space page fault handler. Memory pages are lazily copied on first access, so the clone returns immediately while the backing store populates on demand. This dramatically reduces time-to-SSH for compute contract guests, making spot-provisioning viable at scale.
 * 
 * @see comms/0265
 * @see https://codesandbox.io/blog/cloning-microvms-using-userfaultfd
 */
export function microVmCloningUserfaultfd(): void {
  // Related: containerRegistryOnDemand
}

/**
 * Run WASM modules directly in Kubernetes via k8s-wasm, bypassing container image overhead for lightweight portable workloads.
 * 
 * Forge components (KCP, GUAC, forgego) compiled to WASM can execute in-cluster without container images, registries, or OS-level virtualization. Combined with image-ca-injector for certificate injection, this enables a minimal-trust compute environment where only cryptographically verified WASM modules execute.
 * 
 * @see comms/0405
 * @see https://github.com/dvob/k8s-wasm
 * @see https://github.com/dvob/image-ca-injector
 */
export function kubernetesWasmRuntime(): void {
  // TODO: wire to related concepts
}

/**
 * SCRAPI returns a new operation ID on each status check response, carrying step-level detail for long-running compute contract execution.
 * 
 * Rather than returning a static operation handle, SCRAPI rotates the operation
 * ID on each poll, embedding step details (current phase, progress, logs) in the
 * response. The response includes a KCP streaming log URN so callers can tail
 * execution output. This enables KCP/Kubernetes OIDC token issuance leveraging
 * RBAC — the streaming log URN is an authorized view into the execution, and
 * the OIDC token binds access to the caller's RBAC scope.
 * 
 * @see comms/0561
 */
export function scrapiOperationStepDetails(): void {
  // TODO: wire to related concepts
}

/**
 * Process by which Alice determines which available compute resources are trustworthy before dispatching workloads, using SCITT transparency receipts as the trust basis.
 * 
 * Before sending a workload to a compute node, Alice verifies the node's provenance through
 * SCITT transparent statements. The verified claims from those receipts determine what claims
 * go into the workload identity JWT issued for that job. Transport Acquisition is the bridge
 * between the SCITT transparency layer and the compute contract layer — it answers "do I trust
 * this compute enough to run this workload on it?" by consulting the transparency log.
 * 
 * @see comms/0572
 */
export function transportAcquisition(): void {
  // Related: scittReceiptAsVcAuth, vtpmAttestedComputeIdentity
}
