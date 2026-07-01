/**
 * SCITT transparency log receipts used directly as verifiable credentials for decentralized authentication and authorization — a "you are logged in" token rooted in self-sovereign key infrastructure.
 * 
 * Via federation, parties create scoped SCITT chains/logs/instances. The VC receipts from these instances serve as access control tokens: a receipt proving a statement was logged at a particular SCITT instance becomes a credential that grants access to resources governed by that instance's policy. This enables peer-to-peer decentralized auth without centralized identity providers — the transparency log is the authority. A SARIF result produced by an entity's analysis can be interpreted as a login credential, where the manifest's written form (THREATS.md, PLANS.md) expresses intent and the SARIF results determine access level. Endor (https://github.com/OR13/endor) demonstrates SCITT receipt → VC bridging. KERI kid0009 provides the key infrastructure foundation.
 * 
 * @see comms/0143
 * @see https://github.com/OR13/endor
 * @see https://github.com/decentralized-identity/keri/blob/master/kids/kid0009.md
 */
export function scittReceiptAsVerifiableCredential(): void {
  // Related: scittDwnFederation, scittDidMethod, didStandardization
}


/**
 * ActivityPub posts ingested as inputs to Alice's knowledge graph carry SCITT provenance receipts, guaranteeing that every social input is transparency-logged and cryptographically verifiable.
 * 
 * ActivityPub serves as the social input layer: posts from federated instances become events in Alice's stream of consciousness. Combined with SCITT, each ingested post gets a transparency receipt — the post content, its origin server, and the time of ingestion are all logged to a SCITT transparency service. This means Alice can later prove what information she consumed, from whom, and when, enabling post-hoc audit of her decision-making inputs. The SCITT receipt travels with the ingested post through the knowledge graph, so every inference derived from that post carries provenance back to the original social input.
 * 
 * Earlier understanding (from prior comms): Stream of consciousness carried over ActivityPub as transport for signed thoughts distributed via firehose.
 * 
 * @see comms/0148
 * @see comms/0147
 */
export function activityPubScittProvenanceInput(): void {
  // Related: graphBackedStreamOfConsciousness, scittPostHocAuditability, knowledgeGraphProvenance
}

/**
 * Alice's decentralized identity and data layer follows an evolutionary path: ActivityPub for social federation, SCITT for transparency and VDR for verifiable data, DWN for decentralized storage, and KERI for self-sovereign key infrastructure.
 * 
 * This is not a big-bang migration but a progressive layering: each stage builds on the previous. ActivityPub provides the initial federated social graph (posts, actors, federation). SCITT adds transparency logging and VDR adds verifiable data registries on top of that social layer. DWN (Decentralized Web Nodes) provide personal data stores that Alice instances can query directly, bypassing centralized relays. KERI (Key Event Receipt Infrastructure) provides the root cryptographic identity layer — self-sovereign key management without blockchain anchoring, using pre-rotation and key event logs. The path ends at full decentralization: Alice instances discover each other via KERI identifiers, store data in DWNs, and prove provenance through SCITT receipts anchored to KERI key events.
 * 
 * Earlier understanding (from prior comms): SCITT and DWN federated together for decentralized transparency and storage.
 * 
 * @see comms/0147
 * @see https://github.com/decentralized-identity/keri
 * @see https://github.com/web3-storage/ucanto
 */
export function dwnKeriEvolutionPath(): void {
  // Related: scittDwnFederation, scittDidMethod, didStandardization, scittReceiptAsVerifiableCredential
}
