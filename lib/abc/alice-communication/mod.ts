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
 * DFFML Manifest structure aligns with the W3C Credential Manifest specification, enabling interoperability between Alice's compute contract manifests and decentralized identity credential issuance protocols.
 * 
 * The W3C Credential Manifest describes what inputs a Subject must provide to an Issuer for credential issuance. DFFML's Manifest (defined in ADR 0008) serves the same structural role: intent + schema + data. The Credential Manifest's `SpecVersion` property maps directly to DFFML's `$schema` property — both declare what version of the manifest format applies. This alignment means Alice's compute contract manifests can be treated as credential manifests and vice versa, bridging the distributed compute and decentralized identity domains under one document format.
 * 
 * @see comms/0039
 * @see intel/dffml#1207
 */
export function credentialManifestAlignment(): void {
  // TODO: wire to related concepts
}

/**
 * Analysis of KERI (Key Event Receipt Infrastructure) interoperability ergonomics with the web5 ecosystem and broader decentralized identity landscape.
 * 
 * KERI provides a DID method based on self-certifying key event logs without relying on a distributed ledger. This concept examines how KERI's key management model (key pre-rotation, witnessed key events, duplicity detection) composes with web5's DWN (Decentralized Web Node), DID resolution, and verifiable credential flows. The analysis covers ergonomic fit: whether KERI's event-sourced identity model feels natural alongside web5's record-based data model.
 * 
 * @see comms/0062
 */
export function keriWeb5Interoperability(): void {
  // Related: didStandardization
}

/**
 * ActivityPub (Mastodon) as the transport layer for Alice's stream of consciousness — federated thought sharing over existing decentralized social infrastructure.
 * 
 * Alice instances communicate via a Thought Communication Protocol layered on ActivityPub. Each Alice instance is a Mastodon actor; her thoughts are toots carrying JSON-LD payloads with SCITT receipts for data provenance, content-addressed references to knowledge graph nodes, and cryptographic identity proofs. This reuses the existing fediverse infrastructure for decentralized message passing — follow relationships become trust edges, boosts become endorsements, replies become threaded analysis. Mastodon's ActivityPub implementation handles federation, delivery, and relay, while Alice layers SCITT-verified data provenance and knowledge graph linking on top. This gives Alice a production-grade decentralized transport without building new network protocols.
 * 
 * @see comms/0086
 * @see intel/dffml#20725
 */
export function activityPubStreamOfConsciousness(): void {
  // Related: shareAThought, herMemoryRepository
}

/**
 * SCITT as a DID method for identity within transparency services — SCITT service identity and claim signing key resolution via DID documents.
 * 
 * SCITT services (notaries, transparency logs) need cryptographically verifiable identities that clients can resolve without centralized PKI. A SCITT DID method would encode service identity in `did:scitt:` URIs, with DID documents containing the service's signing keys, transparency log endpoints, and tree algorithm parameters. This integrates SCITT into the W3C DID ecosystem: a SCITT receipt can reference the issuing notary by DID, and verifiers resolve the DID document to fetch the public key and service endpoint needed for receipt verification. The Microsoft SCITT CCF ledger already uses DID-based identity (`pyscitt/did.py`), demonstrating the pattern in a reference implementation. This aligns SCITT with ATProto's DID-based service discovery and DFFML's content-addressed identity model.
 * 
 * Earlier understanding (from comms/0004): DID 1.0 reached W3C Recommendation status July 2022 and is used for identifying and discovering IoT devices and metadata.
 * 
 * @see comms/0086
 * @see comms/0082
 * @see https://github.com/microsoft/scitt-ccf-ledger/blob/main/pyscitt/pyscitt/did.py
 */
export function scittDidMethod(): void {
  // Related: didStandardization, scittReferenceImplementation
}

/**
 * Federate SCITT transparency services via Decentralized Web Nodes (DWN) and Web5 protocols.
 * 
 * SCITT (Supply Chain Integrity, Transparency, and Trust) instances discover and synchronize with each other through DWN relay infrastructure (TBD's dwn-relay, dwn-sdk-js). Each SCITT node operates as a DWN with protocol handlers for SCITT-specific queries (statements, receipts, transparency logs). Web5 provides the decentralized identity layer (did:key, did:web, did:ion) and credential infrastructure (VC issuance/verification, Credential Manifest, Presentation Exchange). This enables SCITT federation without a centralized registry — nodes discover peers through DWN relay, sync statements through protocol handlers, and verify provenance through the Web5 SSI service stack.
 * 
 * @see comms/0101
 * @see intel/dffml#1426
 */
export function scittDwnFederation(): void {
  // Related: scittDidMethod, scittReferenceImplementation, didStandardization
}
