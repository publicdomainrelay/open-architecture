/**
 * The system context: how Alice describes the system as data before she acts on
 * it. This package is the docs-as-code translation of the "What Alice Is"
 * section of `open_architecture_today.md` together with the deeper Open
 * Architecture model it rests on.
 *
 * Read each function's doc comment as the prose; read its body as the links to
 * the concepts that prose depends on. The call graph IS the train of thought.
 *
 * @see open_architecture_today.md "What Alice Is"
 * @see arch/0009-Open-Architecture.rst
 * @module
 */

import type {
  DataFlow,
  EntityAnalysisTrinity,
  Manifest,
  Overlay,
  SystemContext,
} from "@publicdomainrelay/alice-common";

/**
 * Everything Alice does comes back to one habit: she describes the system as
 * data before she acts on it. When the system is data, she can reason about it,
 * attest to it, negotiate over it, and rebuild it. That description has three
 * shapes you will see everywhere: a manifest, a data flow, and an overlay.
 *
 * @see open_architecture_today.md "What Alice Is"
 */
export function describeTheSystemAsData(): SystemContext {
  const upstream = theManifest();
  const orchestrator = theDataFlow();
  const overlays = [theOverlay()];
  return freezeSystemContext(upstream, overlays, orchestrator);
}

/**
 * A manifest says *what*: intent plus a schema plus the data. If the data is
 * there, she has to use it. Want her to behave differently? Hand her a
 * different manifest.
 *
 * @see open_architecture_today.md "What Alice Is"
 * @see arch/0008-Manifest.md
 */
export function theManifest(): Manifest {
  return { intent: "", schema: undefined, data: undefined };
}

/**
 * A data flow says *how*: a graph of operations that consume the manifest.
 *
 * @see open_architecture_today.md "What Alice Is"
 * @see concepts/dataflow.rst
 */
export function theDataFlow(): DataFlow {
  return { operations: {}, links: [] };
}

/**
 * An overlay says *in what context*: your policy, your deployment, your living
 * threat model, patched on top.
 *
 * @see open_architecture_today.md "What Alice Is"
 */
export function theOverlay(): Overlay {
  return { context: "", patch: undefined };
}

/**
 * A system context is upstream + overlays + inputs, frozen for one execution.
 * It is a Thought. Thinking more deeply just means running a chain of sub
 * contexts, higher order concepts built from clusters of strategic plans
 * analyzed across the {@link entityAnalysisTrinity}.
 *
 * @see open_architecture_today.md "System context"
 */
export function freezeSystemContext(
  upstream: Manifest,
  overlays: Overlay[],
  orchestrator: DataFlow,
): SystemContext {
  return { upstream, overlays, orchestrator };
}

/**
 * One instance can hypothesize a new system context and share it with another.
 * Alice decides whether she likes the thought and what, if anything, she wants
 * to do about it.
 *
 * @see open_architecture_today.md "The Stream of Consciousness"
 */
export function hypothesizeSystemContext(): SystemContext {
  return describeTheSystemAsData();
}

/**
 * Higher order concepts built from clusters of strategic plans analyzed across
 * the three corners of intent, static analysis, and dynamic analysis. This is
 * the "Trinity of Static Analysis, Dynamic Analysis, and Human Intent" that
 * allows the prioritizer to make decisions based on the spirit of the law --
 * intent-based policy rather than rote rule matching.
 *
 * The trinity builds a pyramid of thought alignment to strategic principles:
 * top-level organizational policies cascade down through the operations of
 * each data flow, and the provenance of every inference can be traced back to
 * which corner of the trinity produced it. One of those strategic principles
 * is: "We must be able to trust the sources of all input data used for all
 * model training was done from research studies with these ethical
 * certifications."
 *
 * @see open_architecture_today.md "Entity Analysis Trinity"
 * @see dataProvenanceTracking
 * @see prioritizer
 */
export function entityAnalysisTrinity(): EntityAnalysisTrinity {
  return {
    intent: intentAnalysis(),
    staticAnalysis: staticAnalysis(),
    dynamicAnalysis: dynamicAnalysis(),
  };
}

/** The intent corner: what the entity aimed to do. @see entityAnalysisTrinity */
export function intentAnalysis(): unknown {
  return undefined;
}

/** The static analysis corner: what the code says. @see entityAnalysisTrinity */
export function staticAnalysis(): unknown {
  return undefined;
}

/** The dynamic analysis corner: how the code behaves. @see entityAnalysisTrinity */
export function dynamicAnalysis(): unknown {
  return undefined;
}

/**
 * Pattern: the parent flow acquires a lock on a shared resource (e.g. a git
 * repo), then launches subflows that operate without needing to acquire their
 * own lock. The subflows trust that the parent's lock is held for the duration
 * of the operation, and they are free to read and write the resource without
 * coordination. This avoids lock contention and simplifies the subflow's
 * state machine.
 *
 * Each subflow receives just the context it needs from the parent -- a
 * reference to the locked resource, never a new handle. When all subflows
 * complete, the parent releases the lock.
 *
 * @see open_architecture_today.md "What Alice Is"
 */
export function subflowWithLockTaken(): void {
  // Parent flow locks, subflows operate without acquiring own lock.
}

/**
 * An operation declares whether its input network context is reused from the
 * top-level system context or isolated. This trust boundary property is
 * critical for static analysis: when the operation data structure does not
 * allowlist a usage of a context, it must be passed to a subflow for reuse
 * rather than consumed directly.
 *
 * For example, an ELF binary does not reuse its parent's input network context
 * (it lacks access to the parent's memory region), while Python code running
 * in the same process does reuse the parent's input network context (it has
 * access to that memory region). The same format describes trust boundary
 * properties across all domain-specific representations of architecture.
 *
 * @see open_architecture_today.md "What Alice Is"
 * @see subflowWithLockTaken
 */
export function operationTrustBoundary(): void {
  // ictx/nctx context reuse declared in the Operation data structure.
  // Allowlist defines which contexts an operation may consume directly.
}
