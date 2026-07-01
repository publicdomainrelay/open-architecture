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
 * really hers. When the W3C approved DIDs as a Recommendation in July 2022 they
 * became a settled foundation for this architecture: a single framework to
 * unify identity across cloud, edge, and client systems, preserving the
 * integrity of information as it moves through the supply chain.
 *
 * @see open_architecture_today.md "Her identity is a DID"
 * @see arch/0000-did-standardization.md
 */
export function herIdentity(): DID {
  didStandardization();
  return "did:plc:";
}

/**
 * The W3C approved Decentralized Identifiers as a Recommendation in July 2022.
 * This milestone settles the identity layer of the open architecture: DID
 * provides a framework to unify and consolidate multiple evolving identity
 * systems, which is useful for validating the authenticity of information and
 * preserving its integrity as it is moved and processed among cloud, edge, and
 * client systems. SCITT (Supply Chain Integrity, Transparency, and Trust) has
 * already highlighted DID as a useful approach for exchanging information
 * through the supply chain, and the Web of Things (WoT) WG plans to support
 * DID for identifying and discovering IoT devices and metadata.
 *
 * @see arch/0000-did-standardization.md
 * @see scittTransparencyService
 */
export function didStandardization(): void {
  // DID 1.0 reached W3C Recommendation status July 2022.
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

/**
 * Entrypoints for dataflows and overlays are registered as DIDs in the DID method registry, where the DID key or identifier is the hash of the system context to be executed. Negotiation occurs via cached state snapshots embedded into the static system context or carried as a dataflow seed.
 * 
 * The DID identifies the operation entrypoint; the system context hash ensures content-addressable integrity. When Alice loads an overlay from the network, the DID resolves to the current state of that overlay's system context, and the hash verification guarantees it matches what was expected. Visualization and editing of these credential manifests can leverage GraphQL, Cypher (JSON-LD to graph), or JSON Crack for direct manipulation of the overlay definitions before they are registered as DIDs.
 * 
 * @see comms/0051
 * @see https://github.com/w3c/did-spec-registries/
 * @see https://github.com/transmute-industries/jsonld-to-cypher
 */
export function entrypointsAsSystemContextDids(): void {
  // Related: herRepositoryIsHerVoice, describeTheSystemAsData, freezeSystemContext
}

/**
 * DID entry points refined to trigger GitHub Actions workflows via on.push.paths filtering at operation-level granularity within data flows. Workflows are advertised to the stream of consciousness and dispatched when overlays are enabled.
 * 
 * DID entry points serve as paths that signal which workflows should be triggered on specific events. The granularity reaches down to individual operations within data flows: a path like `did:alice:shouldi:contribute:clone_git_repo:outputs.repo` triggers a specific workflow only when that operation's output changes. Through workflow inspection, these triggers are exposed as overlays that can be advertised to the stream of consciousness. When an overlay is enabled, the corresponding workflow dispatches automatically, closing the loop from identity through event to execution.
 * 
 * Earlier understanding (from comms/0051): Entrypoints for dataflows and overlays are registered as DIDs in the DID method registry, where the DID key or identifier is the hash of the system context to be executed.
 * 
 * @see comms/0062
 */
export function didEntrypointWorkflowTrigger(): void {
  // Related: entrypointsAsSystemContextDids, theFirehoseCarriesIt
}

/**
 * Sigstore/Rekor transparency log infrastructure bridges to the DID/VC (Self-Sovereign Identity) space, enabling notarized attestations to become Verifiable Credentials.
 * 
 * Rekor Merkle trees graft onto DID Merkle DAGs via did:merkle. Fulcio acts as CA bridge between OIDC identities and DIDs, with OpenIDVC combining auth to Fulcio with decentralized identity. This enables offline/decentralized trust verification via flat files rather than running servers — critical for ad-hoc grafting when nodes go on/offline and for dev/test/prod roll environments. Sigstore's ephemeral key signing + transparency log notarization maps naturally to VC issuance + DID-anchored verification. 2nd party plugin trust chains can be grafted lickety-split from existing transparency logs.
 * 
 * @see comms/0156
 */
export function sigstoreScittDidVcBridge(): void {
  // Related: scittReferenceImplementation, oidcSelfIssuedEdge
}
