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
 * decides whether to notify you, to act, or to keep thinking.
 *
 * @see open_architecture_today.md "Her prioritizer scores the possibilities"
 */
export function prioritizer(changes: unknown): "notify" | "think" | "act" {
  knowledgeGraph(changes);
  return "think";
}

/**
 * Her knowledge graph remembers what she knows.
 *
 * @see open_architecture_today.md "her knowledge graph remembers"
 */
export function knowledgeGraph(_changes: unknown): void {
  // What she knows.
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
  if (!isRelevant(event)) return;
  const changes = summarize(event);
  if (prioritizer(changes) === "notify") notify(changes);
  else thinkMoreDeeply();
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
