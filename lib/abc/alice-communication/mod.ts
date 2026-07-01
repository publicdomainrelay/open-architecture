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

/**
 * Use security.txt contact as an ActivityPub Actor to advertise delegate actors for attestation roles, SBOM publishing, and FIPS certification.
 * 
 * Every organization's security.txt email contact becomes an ActivityPub actor. That actor lists via attachments other actors delegated to specific roles (SBOM publisher, FIPS certifier, VEX author). Third parties then advertise which actors are authorized to make claims about a product. SCITT receipts attach to these delegated-actor posts, creating a verifiable chain from the organization's security.txt through delegates to attestations. This bridges the DNS-based security.txt discovery mechanism with the federated ActivityPub protocol, giving organizations a bootstrapped identity they already control (their domain) as the root of their supply chain trust graph.
 * 
 * @see comms/0163
 * @see https://github.com/CycloneDX/specification/pull/180
 * @see https://dnssecuritytxt.org/
 */
export function securityTxtActivityPubActor(): void {
  // Related: websubActivityPubThoughtSharing, activityPubScittInputs
}

/**
 * Exchange CI runner tokens over a WebRTC data channel to avoid end-to-end encrypted data being cached and broken in the future.
 * 
 * When a GitHub webhook triggers a runner token request, the token request is sent via ActivityPub message to the SECURITY_TXT actor (or similar). The runner token itself is then delivered over a WebRTC data channel without a signaling server, using the pattern from the WebRTC-perfect-negotation approach. This avoids the risk of end-to-end encrypted tokens being cached in intermediate servers or message queues and later decrypted if encryption is broken. ActivityPub handles discovery and authorization (who is allowed to request a runner token), while WebRTC handles the secure delivery channel.
 * 
 * @see comms/0162
 * @see http://blog.printf.net/articles/2013/05/17/webrtc-without-a-signaling-server/
 * @see intel/dffml#1247
 */
export function webRtcRunnerTokenChannel(): void {
  // Related: websubActivityPubThoughtSharing, oidcSelfIssuedEdge
}

/**
 * Verifiable bi-directional link between a DID and an ActivityPub actor per FEP-c390 Identity Proofs.
 * 
 * An identity proof is a JSON document that establishes a verifiable connection between a DID (per W3C DID Core) and an ActivityPub actor URI. This bridges the decentralized identity world (DIDs, VCs) with the federated social protocol world (ActivityPub). For Alice, this means her DID-based identity (used for signing records, attestations, and compute contracts) can be proven to be the same entity as her ActivityPub actor (used for federation, discovery, and stream of consciousness). The `alsoKnownAs` ActivityPub property and DID `alsoKnownAs` service endpoint create the bi-directional link, with verification via DID resolution and ActivityPub actor document comparison.
 * 
 * @see comms/0162
 * @see https://socialhub.activitypub.rocks/t/fep-c390-identity-proofs/2726
 * @see https://www.w3.org/TR/did-core/
 */
export function activityPubIdentityProofBridge(): void {
  // Related: websubActivityPubThoughtSharing, oidcSelfIssuedEdge
}

/**
 * A federated CI/CD event space where forge events (push, PR, CI status, runner telemetry) are ActivityPub messages using the ForgeFed protocol, with OpenTelemetry transformed into the same federated event space so everything can talk directly to everything.
 * 
 * Forgejo's ActivityPub-based forge federation (ForgeFed protocol, using go-ap library with HTTP signatures) provides the foundation. Woodpecker CI serves as the federated CI engine running pipelines inside containers. The missing piece is aligning CI/CD runner telemetry with the ForgeFed context.jsonld vocabulary — incrementally learning to transform OpenTelemetry events (data flow events as telemetry events) into ActivityPub events. This enables "online cloning" where federated repos allow remote overlay application and incremental vendoring with SHA384 patch tracking.
 * 
 * Virtual branches facilitate trunk-based development across multiple in-progress upstream branches (forgejo-federation + forgejo-ci + forgejo-development), with Alice orchestrating the alignment. CloudEvents (CNCF CDEvents spec) provide an alternative event format that can be bridged into the ActivityPub event space. The Guac project's federated event integration and Grafeas's decentralized artifact metadata API represent aligned efforts.
 * 
 * @see comms/0197
 * @see comms/0198
 * @see comms/0199
 * @see intel/dffml#19133
 * @see https://forgefed.org/
 * @see https://codeberg.org/forgejo-contrib/discussions/issues/12
 */
export function federatedCiCdEventSpace(): void {
  // Related: securityTxtActivityPubActor, gitPushActivityPubStream, websubActivityPubThoughtSharing
}

/**
 * Align container registry distribution spec notification protocols with transparency service federation protocols so event stream consumers use a single protocol (ActivityPub/ActivityStreams) for both container image events and supply chain attestation events.
 * 
 * The OCI distribution spec currently lacks inbox-style eventing endpoints for push notifications. By extending container registries (e.g., Zot, Keppel) with ActivityPub federation alongside existing OCI upload/download semantics, every SBOM upload, container image push, manifest publication, and SCITT statement insertion becomes an event in a unified federated space. This enables downstream listeners to consume both container lifecycle events and transparency service events through the same subscription mechanism, bridging the gap between artifact distribution and trust attestation.
 * 
 * KERI provides the duplicity-evident transport for the federation layer, while SCITT and SigStore secure the content. The container registry becomes the "off-chain" data store for event payloads, with the chain being the network of KERI keys between communicating entities. Consumers like Alice's gatekeeper ingest the unified event stream, apply threat model overlays, and decide whether to propagate artifacts into their internal environment.
 * 
 * @see comms/0192
 * @see comms/0194
 * @see https://github.com/opencontainers/distribution-spec/blob/main/spec.md#endpoints
 * @see https://github.com/project-zot/zot
 * @see https://github.com/ietf-scitt/use-cases/issues/14
 */
export function containerRegistryFederationAlignment(): void {
  // Related: containerRegistryOnDemand, scittTransparencyService, everythingAsContainerBuild, activityPubScittRegistryHandshake
}

/**
 * Replace websocket transport for the federated CI/CD event space with
 * Server-Sent Events (SSE) aligned to a Fediverse Enhancement Proposal.
 * 
 * SSE is simpler than WebSocket for unidirectional event streams: standard
 * HTTP, auto-reconnect, no upgrade handshake, works through proxies. The
 * Fediverse Enhancement Proposal provides a standardized SSE profile for
 * ActivityPub inbox delivery, making event consumption interoperable across
 * implementations.
 * 
 * For Alice's abstract compute architecture event loop, SSE carries the same
 * incoming events (new vulns, release notifications, CI/CD status changes)
 * that currently flow through websocket routes, but with better alignment
 * to the broader Fediverse ecosystem.
 * 
 * @see comms/0215
 */
export function federatedSseActivityPub(): void {
  // Related: activityPubScittInputs, activityPubScittRegistryHandshake
}

/**
 * ActivityPub (and future TransparencyInterop) delivered over gRPC as a high-performance, schema-first transport for federated event distribution.
 * 
 * The ActivityPub inbox endpoint resolved via WebFinger is extended with a protobuf service definition, enabling strongly typed, streaming, bidirectional federation between forges, transparency services, and policy engines. OpenAPI-to-protobuf generation tools (openapi2proto, protoc-gen-jsonschema) bridge REST and gRPC ecosystems. The gRPC transport carries the same ActivityStreams semantic model with lower overhead and native streaming, suited for high-frequency events like CI/CD pipeline status, SBOM generation, and vulnerability disclosure.
 * 
 * @see comms/0222
 * @see https://github.com/NYTimes/openapi2proto
 * @see https://github.com/OpenAPITools/openapi-generator
 */
export function activityPubOverGrpc(): void {
  // Related: federatedCiCdEventSpace, federatedSseActivityPub
}

/**
 * Deduplicate computation across federated forges (Forgejo, Codeberg, Gitea) for security posture analysis such as OpenSSF Scorecard, with policy-as-code enabling forge org/repo admins to set secure-by-default policies and repo owners to overlay modifications.
 * 
 * A federated catalog of Free Software actions (Forgejo Actions) serves as the compute substrate. When multiple forges host the same dependency, the federation deduplicates redundant analysis — running Scorecard once and sharing the result across federated instances. Event-based triggers re-analyze on upstream changes. Policy as code allows org admins to define secure-by-default analysis policies, while repo owners or pull request authors can submit overlay modifications. These downstream context-local policy changes are themselves evaluated by the policy engine for auto-approval/denial.
 * 
 * Earlier understanding (from federatedCiCdEventSpace): Federated CI/CD event space using ActivityPub, ForgeFederation, and ValueFlows for cross-forge coordination.
 * 
 * @see comms/0223
 * @see https://codeberg.org/forgejo/discussions/issues/16
 * @see https://github.com/ietf-scitt/use-cases/blob/main/openssf_metrics.md
 */
export function federatedForgeComputeDeduplication(): void {
  // Related: federatedCiCdEventSpace, containerRegistryFederationAlignment, verifiableScorecardStaticAnalysis
}

/**
 * Use the WebCrypto API for ActivityPub server-to-server authentication, distinct from password-based client-to-client bootstrap.
 * 
 * Server-to-server federation in ActivityPub currently relies on HTTP Signatures
 * or shared secrets. WebCrypto — the browser-native cryptographic API — offers a
 * path to stronger, hardware-backed server identity proofs without passwords.
 * Servers authenticate to each other using key pairs generated and stored via
 * WebCrypto, with identity discovery through WebFinger. This separates the
 * server-to-server auth channel from the password-based client-to-client login
 * flow, reducing the attack surface of federated trust.
 * 
 * Earlier understanding (from comms/0148): ActivityPub identity proofs bridge
 * WebSub and OIDC self-issued edges for thought sharing across federated nodes.
 * 
 * @see comms/0229
 * @see oidcSelfIssuedEdge
 * @see websubActivityPubThoughtSharing
 */
export function webcryptoActivityPubServerAuth(): void {
  // Related: oidcSelfIssuedEdge, websubActivityPubThoughtSharing
}

/**
 * Standardize CI/CD system interoperability using the CDEvents protocol (CDF SIG Events) over CloudEvents, mapping low-level pipeline events to high-level abstractions (Change, Build, Deployment, etc.).
 * 
 * Tekton can already emit CloudEvents but in a Tekton-specific format. CDEvents provides a vendor-neutral vocabulary so heterogeneous CI/CD systems — Tekton, Jenkins, Spinnaker — interoperate on a shared event bus. Tekton Tasks and Pipelines (low-level) are annotated to identify which high-level CDEvent they represent. A dedicated controller emits the standardized events, enabling DevOps engineers to collect metrics and trigger cross-system workflows without per-tool integration.
 * 
 * Earlier understanding (from federatedCiCdEventSpace): use ActivityPub/ActivityStreams as the single protocol for container image events and supply chain attestation events.
 * 
 * @see comms/0236
 * @see https://github.com/tektoncd/community/issues/435
 * @see https://cdevents.dev
 */
export function cdeventsCiCdInterop(): void {
  // Related: federatedCiCdEventSpace, activityPubOverGrpc, federatedSseActivityPub
}

/**
 * Bridge ActivityPub federation events through MQTT message queues to WebSocket for real-time browser delivery and WebRTC for peer-to-peer communication.
 * 
 * The protocol chain — ActivityPub → MQTT → WebSocket → WebRTC — enables real-time fediverse communication by connecting asynchronous federation (ActivityPub inbox/outbox) to synchronous messaging. MQTT (e.g. ActiveMQ, Eclipse Paho, Cloudflare Pub/Sub) decouples federation event producers from consumers, acting as a message bus. WebSocket bridges MQTT topics to browser clients with persistent connections. WebRTC extends the chain to direct peer-to-peer channels for low-latency use cases like remote terminal sessions or live collaboration. This complements the existing gRPC transport (`activityPubOverGrpc`) and WebRTC runner token channel (`webRtcRunnerTokenChannel`) with a message-queue-centric topology suitable for high fan-out event distribution.
 * 
 * @see comms/0250
 * @see https://activemq.apache.org/
 * @see https://developers.cloudflare.com/pub-sub/examples/connect-python/
 * @see https://docs.celeryq.dev/en/stable/reference/celery.app.amqp.html
 */
export function activityPubMessageQueueBridge(): void {
  // Related: activityPubOverGrpc, webRtcRunnerTokenChannel, federatedSseActivityPub, federatedCiCdEventSpace
}

/**
 * Extend ActivityPub federation to XMPP transport, enabling bidirectional message flow between XMPP chat networks and the federated supply chain event space.
 * 
 * Builds on the multi-transport ActivityPub pattern where the same ActivityStreams semantic model is carried over different protocols (gRPC, SSE, message queues). XMPP brings presence, pubsub, and multi-user chat primitives that map naturally to federated event distribution — forge events, vulnerability disclosures, and transparency log notifications can reach XMPP clients and vice versa. References the XMPP-AP bridge work by Goffi.
 * 
 * @see comms/0264
 * @see https://mastodon.social/@Goffi/110348831017599581
 */
export function xmppActivityPubBridge(): void {
  // Related: activityPubOverGrpc, activityPubMessageQueueBridge, federatedSseActivityPub
}

/**
 * Two-party event exchange mediated by DID infrastructure: producers sign events with DID keypairs and publish via DID resolver, consumers subscribe with criteria filters, and an EventBus routes published events to matching subscribers.
 * 
 * Bob (producer) detects changes, creates a signed event with his DID keypair, and publishes to the DID resolver via `self.did.resolve().publish(event)`. Alice (consumer) initializes her DID, sets up event subscriptions with criteria (e.g. "git"), and receives routed events through the EventBus. Her on_event lifecycle processes each event: knowledge graph ingestion → relevance check → summarization → prioritization → decision (notify or think). Both entities hold DIDs as their identity roots, making the DID resolver the event routing infrastructure between them.
 * 
 * @see comms/0347
 */
export function didMediatedEventExchange(): void {
  // Related: onEvent, knowledgeGraph, prioritizer, isRelevant, summarize, notify, thinkMoreDeeply
}
