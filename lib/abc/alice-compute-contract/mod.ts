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
 * Apply decentralized finance and automated market making concepts to information and trust markets.
 * 
 * Borrowing from DeFi AMM (Automated Market Making) models, entities can arbitrage across trust graphs: buying undervalued information in one context and selling it where it is valued higher. The RFP/market flow in Alice's compute contract system IS a thought arbitrage mechanism — requesters post compute needs, bidders price them, and the market clears at the intersection of trust-weighted supply and demand. Execution and speculation on information value create liquidity in the knowledge graph, enabling efficient allocation of compute and attention across the system.
 * 
 * @see comms/0067
 */
export function thoughtArbitrage(): void {
  // Related: webOfTrust, knowledgeGraphProvenance
}
