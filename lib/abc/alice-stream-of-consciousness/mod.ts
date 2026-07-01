/**
 * The stream of consciousness. The docs-as-code translation of that section of
 * `open_architecture_today.md`.
 *
 * All of this, the contracts, the receipts, the admissions, is how Alice
 * instances talk to each other and, through them, how we talk to each other.
 * Because we each run our own instance of Alice, her shared stream of
 * consciousness is also our shared channel.
 *
 * @see open_architecture_today.md "The Stream of Consciousness"
 * @module
 */

import type { SystemContext } from "@publicdomainrelay/alice-common";
import {
  entityAnalysisTrinity,
  hypothesizeSystemContext,
} from "@publicdomainrelay/alice-system-context-abc";

/**
 * One instance can hypothesize a new system context and share it with another.
 * Alice decides whether she likes the thought and what, if anything, she wants
 * to do about it.
 *
 * @see open_architecture_today.md "One instance can hypothesize a new system context"
 */
export function shareAThought(): SystemContext {
  return hypothesizeSystemContext();
}

/**
 * Thinking more deeply just means running a chain of sub contexts, higher order
 * concepts built from clusters of strategic plans analyzed across the Entity
 * Analysis Trinity, the three corners of intent, static analysis, and dynamic
 * analysis.
 *
 * @see open_architecture_today.md "Thinking more deeply just means running a chain of sub contexts"
 */
export function thinkMoreDeeply(): void {
  entityAnalysisTrinity();
}

/**
 * Her prioritizer scores the possibilities; her knowledge graph remembers; she
 * decides whether to notify you, to act, or to keep thinking. Decisions follow
 * the spirit of the law -- intent-based policy derived from the Trinity of
 * Static Analysis, Dynamic Analysis, and Human Intent -- rather than rote
 * rule matching.
 *
 * Every inference the prioritizer produces carries provenance that traces back
 * through the training data, model environment, and configuration that shaped
 * it. This provenance chain is recorded as SCITT claims so that a downstream
 * consumer can audit not just what the prioritizer decided but why.
 *
 * @see open_architecture_today.md "Her prioritizer scores the possibilities"
 * @see entityAnalysisTrinity
 * @see dataProvenanceTracking
 */
export function prioritizer(changes: unknown): "notify" | "think" | "act" {
  knowledgeGraph(changes);
  return "think";
}

/**
 * Her knowledge graph remembers what she knows. Every entry in the knowledge
 * graph carries provenance that traces back through the inference chain --
 * the training data, model environment, and configuration that produced it --
 * so the prioritizer's decisions are auditable against the spirit of the law.
 *
 * @see open_architecture_today.md "her knowledge graph remembers"
 * @see dataProvenanceTracking
 */
export function knowledgeGraph(_changes: unknown): void {
  // What she knows. Each entry carries provenance through the inference chain.
}

/**
 * The shape of her, in the smallest sketch. This function is the literal
 * translation of the `class Alice` pseudocode in the document: ingest the
 * event, decide if it is relevant, and then either notify or think.
 *
 * ```python
 * def on_event(self, event):
 *     self.knowledge.ingest(event)
 *     if self.is_relevant(event):
 *         changes  = self.summarize(event)
 *         priority = self.prioritizer.get_priority(changes)
 *         if self.decide(priority) == "notify":
 *             self.notify(changes)
 *         else:
 *             self.think(changes)
 * ```
 *
 * @see open_architecture_today.md "The shape of her, in the smallest sketch"
 */
export function onEvent(event: unknown): void {
  knowledgeGraph(event);
  dataflowCacheExportImport();
  if (!isRelevant(event)) return;
  const changes = summarize(event);
  if (prioritizer(changes) === "notify") notify(changes);
  else thinkMoreDeeply();
}

/**
 * Alice can export the end state of her orchestrator's input network to a
 * serialized form (pickle, JSON), then re-import it to resume processing
 * from where she left off. This allows her to maintain state across restarts
 * and to transfer a partially-processed stream of thoughts between instances.
 *
 * The cached state can be queried via GraphQL (e.g. using the strawberry
 * library) to introspect what the orchestrator knows without re-running the
 * full dataflow. Merging static data with the cached start state before a
 * query enables Alice to answer questions about "what happened last time"
 * without keeping every event in working memory.
 *
 * @see open_architecture_today.md "Her knowledge graph remembers"
 * @see knowledgeGraph
 */
export function dataflowCacheExportImport(): void {
  // Export orchestrator input network state to pickle/JSON.
  // Re-import to resume. GraphQL query of cached state.
}

/**
 * Is this relevant? A source she trusts, a context she is in.
 *
 * @see open_architecture_today.md "source she trusts, context she's in"
 */
export function isRelevant(_event: unknown): boolean {
  return false;
}

/**
 * Summarize the event into the changes she would act or notify on.
 *
 * @see open_architecture_today.md the on_event sketch
 */
export function summarize(_event: unknown): unknown {
  return undefined;
}

/**
 * The same little `notify-send` popup whether the API that restarted is on a
 * real server or your friend's laptop. It is Alice telling you what you would
 * want to know, when you would want to know it, because she has been following
 * the streams you cannot.
 *
 * @see open_architecture_today.md "your friend's API just came back up"
 */
export function notify(_changes: unknown): void {
  // notify-send.
}

/**
 * Optimize iterative VCS scanning by caching cloned repos on NFS volumes and executing pull instead of full clone to resolve deltas.
 * 
 * Configure NFS, mount as volume via preapply. Input network definitions annotated as STATIC, CACHED, or NFS become overlays on the input definition graph. When Alice re-scans a repo, subflows reuse input context output operations to grab inputs whose definitions are descendants of these cache annotations. Large repos benefit from delta-only updates; small repos skip caching (examine past runs to estimate size, clone every time to avoid resource overhead of caching). The STATIC/CACHED/NFS annotation system eventually generalizes to Kubernetes volumes and other overlay types.
 * 
 * @see comms/0024
 */
export function nfsRepoCacheDeltaScan(): void {
  // Related: dataflowCacheExportImport, subflowTypecast, subflowWithLockTaken
}

/**
 * Alice as coach persona: you are what you eat. Alice examines your dependencies, traces provenance, and coaches improvement through the lens of what you consume.
 * 
 * The Coach Alice tutorial frames Alice as an active coach that watches your supply chain consumption — every dependency, every build artifact, every upstream change. Just as "you are what you eat" applies to human health, Alice applies it to software health: your software is only as trustworthy as what it consumes. She traces provenance through the Entity Analysis Trinity (intent, dynamic analysis, static analysis) and coaches the developer toward better dependency choices.
 * 
 * @see comms/0056
 * @see intel/dffml#1334
 */
export function coachAlicePersona(): void {
  // Related: onEvent, thinkMoreDeeply, softwareSupplyChainHealthMetaphor
}

/**
 * Stream of consciousness enables gitops for entity (agent, human) configuration of background listening and notification preferences. Like a robots.txt for "should you notify me," each entity declares its notification policy as config checked into version control. This mirrors the plugin/overlay registration pattern: entities opt into notification streams rather than receiving everything by default. The stream of consciousness becomes a pull-based model where entities subscribe to relevant event categories defined in their gitops config.
 * 
 * @see comms/0066
 */
export function streamOfConsciousnessGitops(): void {
  // TODO: wire to related concepts
}

/**
 * WebSub and ActivityPub as transport protocols for Alice's stream of consciousness, enabling federated thought sharing and pub-sub distribution of SBOM/VEX streams.
 * 
 * WebSub (formerly pubsubhubbub, a 12-year-old W3C protocol) provides the pub-sub backbone: Alice publishes SBOM/VEX/thought updates to a hub, and subscribers receive them in real time without polling. ActivityPub (Mastodon's federation protocol) provides the social layer: Alice instances follow each other, share thoughts as ActivityPub Notes with YAML body content and attached SCITT receipts or post-quantum JWKs.
 * 
 * RSS feeds serve as the bridge: Mastodon serves RSS feeds for tags (e.g. mastodon.social/tags/scitt.rss), enabling automated provenance determination. RSS-to-ActivityPub bridges convert traditional feed readers into federation participants. When RSS+WebSub proves simpler than full ActivityPub for SBOM/VEX streams, the architecture defaults to RSS+WebSub with ActivityPub as the optional federation layer.
 * 
 * Earlier understanding (from comm 0066): Stream of consciousness enables gitops for entity configuration of notification preferences — like a robots.txt for "should you notify me."
 * 
 * @see comms/0081
 * @see comms/0082
 * @see comms/0087
 */
export function websubActivityPubThoughtSharing(): void {
  // Related: shareAThought, onEvent, notify
}

/**
 * Alice's knowledge graph shared via JSON-LD static files and queried via GraphQL-LD (Comunica) and Linked Data Fragments (TPF).
 * 
 * The knowledge graph is serialized as JSON-LD documents — each thought, dependency, and provenance link becomes a linked data node. Downstream consumers query across Alice instances using GraphQL-LD (via the Comunica query engine), which resolves linked data across distributed sources without a central SPARQL endpoint. Triple Pattern Fragments (TPF) provide a low-cost server interface: each Alice instance serves TPF for its slice of the knowledge graph, and clients (or other Alice instances) federate queries across them.
 * 
 * Static JSON-LD file dumps serve as the initial integration path — simple HTTP GET returns the current knowledge state. The full query layer (GraphQL-LD over Comunica) builds on top when federated querying becomes necessary.
 * 
 * Earlier understanding (from open_architecture_today.md): Her knowledge graph remembers what she knows. Each entry carries provenance through the inference chain so decisions are auditable.
 * 
 * @see comms/0081
 * @see https://github.com/comunica/comunica
 * @see https://linkeddatafragments.org/
 */
export function knowledgeGraphGraphQLLd(): void {
  // Related: knowledgeGraph
}
