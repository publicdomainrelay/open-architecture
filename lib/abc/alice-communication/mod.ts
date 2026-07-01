/**
 * How Alice communicates: her repository is her voice. The docs-as-code
 * translation of that section of `open_architecture_today.md`.
 *
 * Alice lives on the network the same way we do. She has an identity, a place
 * to keep her thoughts, and a way to hear everyone else's. Today that is all
 * one substrate.
 *
 * @see open_architecture_today.md "How Alice Communicates: Her Repository Is Her Voice"
 * @module
 */

import type {
  DID,
  RepoRecord,
  StrongRef,
} from "@publicdomainrelay/alice-common";

/**
 * Alice lives on the network the same way we do: she has an identity, a place
 * to keep her thoughts, and a way to hear everyone else's.
 *
 * @see open_architecture_today.md "How Alice Communicates: Her Repository Is Her Voice"
 */
export function herRepositoryIsHerVoice(): void {
  herIdentity();
  herMemory();
  herEars();
}

/**
 * Her identity is a DID (`did:plc:...`). It is who she is no matter where she
 * is running, and it is what she signs with so you always know a thought is
 * really hers.
 *
 * @see open_architecture_today.md "Her identity is a DID"
 */
export function herIdentity(): DID {
  return "did:plc:";
}

/**
 * Her memory is her repository on a PDS. Every thought she wants to share, she
 * writes as a record. Each record is content addressed by its CID and signed by
 * her repo key, so a thought cannot be quietly changed after the fact.
 *
 * @see open_architecture_today.md "Her memory is her repository on a PDS"
 */
export function herMemory(): void {
  writeARecord();
}

/**
 * Her ears are the firehose. She follows the people and the collections she
 * cares about, and new records stream to her the moment they are committed.
 * When she finds something relevant she thinks about it; when she does not, she
 * lets it pass.
 *
 * @see open_architecture_today.md "Her ears are the firehose"
 */
export function herEars(): void {
  theFirehoseCarriesIt();
}

/**
 * Everything she wants to say is just a record. To say something new, she
 * writes a receipt for it. Because she is listening to everyone else's records
 * too, she ties her running system context to whatever is happening out in the
 * world, and the loop keeps turning.
 *
 * @see open_architecture_today.md "Everything she wants to say is just a record"
 */
export function writeARecord(): RepoRecord {
  return { uri: "at://", cid: "", author: herIdentity(), value: undefined };
}

/**
 * Records point at each other with strong references, aka a URI plus the CID it
 * must match. That is how a single thought grows into a train of thought: a
 * receipt points at a bid, a bid points at a request, a build points at the
 * source it came from. Walk the references and you walk her whole reasoning.
 *
 * @see open_architecture_today.md "Records point at each other with strong references"
 */
export function walkTheReferences(): StrongRef {
  return { uri: "at://", cid: "" };
}

/**
 * The firehose carries it: someone writes a record to their PDS, Alice is
 * subscribed, and she ingests it into her knowledge graph.
 *
 * @see open_architecture_today.md the loop diagram
 */
export function theFirehoseCarriesIt(): void {
  walkTheReferences();
}
