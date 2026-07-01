/**
 * Rolling Alice: The Open Architecture Today, as code.
 *
 * This is the spine of the docs-as-code translation of
 * `open_architecture_today.md`. Start exploring here:
 *
 * ```
 * codegraph explore "whatAliceIs theInfiniteLoop puttingItTogether"
 * ```
 *
 * Every function below is a paragraph of the document, and its body calls the
 * sub-concepts that paragraph depends on. The call graph is the architecture.
 * Walk the references and you walk her whole reasoning.
 *
 * @see open_architecture_today.md
 * @module
 */

import { herRepositoryIsHerVoice } from "@publicdomainrelay/alice-communication-abc";
import { doITrustWhereThisCameFrom } from "@publicdomainrelay/alice-trust-abc";
import { getMyWorkRun } from "@publicdomainrelay/alice-compute-contract-abc";
import { gatekeeper } from "@publicdomainrelay/alice-supply-chain-abc";
import {
  onEvent,
  thinkMoreDeeply,
} from "@publicdomainrelay/alice-stream-of-consciousness-abc";
import { describeTheSystemAsData } from "@publicdomainrelay/alice-system-context-abc";

/**
 * Alice is our reference maintainer. She is the context aware pile of CI jobs
 * that learns with you and your organizations. She reviews code, files fixes,
 * watches your dependencies, cuts releases, and keeps your threat models alive.
 * She is both the AI software architect and the architecture itself, the
 * universal blueprint we call the open architecture.
 *
 * She is the entity and the architecture, the 2nd Party: extending her is as
 * simple as writing a single Python function and registering it as an overlay.
 * Every time we teach Alice something new about software development, we write
 * a tutorial on how that functionality can be extended and customized by
 * anyone.
 *
 * @see open_architecture_today.md "What Alice Is"
 */
export function whatAliceIs(): void {
  describeTheSystemAsData();
  herRepositoryIsHerVoice();
}

/**
 * She runs this loop forever. A thought arrives, she decides whether she cares,
 * she acts, and her action becomes the next thought for someone else. That
 * infinite loop is the whole point.
 *
 * ```
 * someone does something  -> writes a record to their PDS (signed, addressed)
 * the firehose carries it -> Alice is subscribed
 * Alice ingests it        -> does she care?
 * she thinks, then acts   -> writes her own records -> the next thought begins
 * ```
 *
 * @see open_architecture_today.md "What Alice Is", the loop diagram
 */
export function theInfiniteLoop(event: unknown): void {
  herRepositoryIsHerVoice();
  onEvent(event);
}

/**
 * Start anywhere, because it is a loop. Bob pushes a build, and a signed record
 * lands in his repo. Alice hears it on the firehose and pulls it into her
 * knowledge graph. Her policy engine asks the trust graph and the transparency
 * log whether the evidence is there. If it is, she admits it, lays each
 * project's threat model over it, and triggers whatever needs to rebuild. If
 * she needs compute to do that work, she opens a Compute Contract, picks a
 * builder the trust graph vouches for, pays with a receipt, and runs behind a
 * reverse proxy that hands out only the access she allowed. When it is done,
 * she publishes her own receipts and federates them downstream, where they
 * become the next thought for the next instance of Alice.
 *
 * No hardware she has to blindly believe. No standing power she has to hold. No
 * currency she has to mint. Just identities, records, receipts, and a web of
 * trust, turning over and over, getting a little more trustworthy each time
 * around.
 *
 * @see open_architecture_today.md "Putting It Together"
 */
export function puttingItTogether(buildEvent: { source: string }): void {
  // Bob pushes a build; Alice hears it on the firehose.
  herRepositoryIsHerVoice();
  // Her policy engine asks the trust graph.
  if (!doITrustWhereThisCameFrom(buildEvent.source)) return;
  // She admits it through the gatekeeper, lays the threat model over it.
  gatekeeper({ uri: "at://", cid: "" });
  // If she needs compute, she opens a Compute Contract.
  getMyWorkRun();
  // She thinks the train of thought further.
  thinkMoreDeeply();
}
