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
 * the three corners of intent, static analysis, and dynamic analysis.
 *
 * @see open_architecture_today.md "Entity Analysis Trinity"
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
