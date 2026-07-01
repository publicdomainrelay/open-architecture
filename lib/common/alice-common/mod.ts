/**
 * Alice / Open Architecture glossary and wire types, as code.
 *
 * This is the leaf layer of the docs-as-code translation of
 * `open_architecture_today.md`. Every glossary term in that document maps to a
 * documented type here, and every other package in this workspace imports its
 * vocabulary from this one module. Read this file as the dictionary; read the
 * `lib/abc/*` packages as the sentences that use the words.
 *
 * @see open_architecture_today.md "Glossary"
 * @module
 */

/**
 * Alice's portable, signed identity. A DID (`did:plc:...`) is who she is no
 * matter where she is running, and it is what she signs with so you always know
 * a thought is really hers.
 *
 * @see open_architecture_today.md "How Alice Communicates: Her Repository Is Her Voice"
 */
export type DID = string;

/**
 * Content address. Each record is content addressed by its CID and signed by
 * its repo key, so a thought cannot be quietly changed after the fact, and
 * anyone can pin it down to exactly the bytes that were meant.
 *
 * @see open_architecture_today.md "CID / strong reference"
 */
export type CID = string;

/**
 * `at://` URI locating a record within a repository on a PDS.
 *
 * @see open_architecture_today.md "PDS / repository"
 */
export type ATURI = string;

/**
 * A strong reference: a URI plus the CID it must match. Records point at each
 * other with strong references, and that is how a single thought grows into a
 * train of thought. Walk the references and you walk her whole reasoning.
 *
 * @see open_architecture_today.md "Records point at each other with strong references"
 * @see CID
 * @see ATURI
 */
export interface StrongRef {
  uri: ATURI;
  cid: CID;
}

/**
 * A manifest says *what*: intent plus a schema plus the data. If the data is
 * there, Alice has to use it. Want her to behave differently? Hand her a
 * different manifest.
 *
 * @see open_architecture_today.md "What Alice Is"
 * @see arch/0008-Manifest.md
 */
export interface Manifest {
  /** The intent: documentation telling you what data is involved and why. */
  intent: string;
  /** The schema telling you what the data should look like. */
  schema: unknown;
  /** The data. If it is there, Alice has to use it. */
  data: unknown;
}

/**
 * A data flow says *how*: a graph of operations that consume the manifest.
 *
 * @see open_architecture_today.md "What Alice Is"
 * @see concepts/dataflow.rst
 */
export interface DataFlow {
  operations: Record<string, unknown>;
  links: Array<StrongRef>;
}

/**
 * An overlay says *in what context*: your policy, your deployment, your living
 * threat model, patched on top.
 *
 * @see open_architecture_today.md "What Alice Is"
 */
export interface Overlay {
  context: string;
  patch: unknown;
}

/**
 * The fundamental unit of Alice's reasoning: upstream + overlays + inputs,
 * frozen for one execution. A system context is a Thought.
 *
 * @see open_architecture_today.md "System context"
 * @see arch/0009-Open-Architecture.rst
 * @see Manifest
 * @see DataFlow
 * @see Overlay
 */
export interface SystemContext {
  upstream: Manifest;
  overlays: Overlay[];
  orchestrator: DataFlow;
}

/**
 * A record written to a PDS and carried on the firehose. Everything Alice wants
 * to say is just a record; to say something new, she writes a receipt for it.
 *
 * @see open_architecture_today.md "Everything she wants to say is just a record"
 */
export interface RepoRecord {
  uri: ATURI;
  cid: CID;
  author: DID;
  value: unknown;
}

/**
 * Compute Contract Request For Proposal: a manifest describing what Alice needs
 * built or run.
 *
 * @see open_architecture_today.md "Getting Work Done: Compute Contracts"
 */
export interface CCRFP {
  request: Manifest;
}

/**
 * Compute Contract Bid: a bidder's answer against a {@link CCRFP}.
 *
 * @see open_architecture_today.md "Getting Work Done: Compute Contracts"
 */
export interface CCB {
  against: StrongRef;
  bidder: DID;
  terms: unknown;
}

/**
 * Compute Contract Bid Accept: Alice accepts a {@link CCB} she has chosen.
 *
 * @see open_architecture_today.md "Getting Work Done: Compute Contracts"
 */
export interface CCBA {
  accepts: StrongRef;
}

/**
 * Compute Contract Receipt: the proof, signed over the whole chain (request,
 * bid, and accept), that the work was done as agreed.
 *
 * @see open_architecture_today.md "Getting Work Done: Compute Contracts"
 */
export interface CCR {
  chain: { request: StrongRef; bid: StrongRef; accept: StrongRef };
  evidence: unknown;
}

/**
 * The Entity Analysis Trinity: the three corners of intent, static analysis,
 * and dynamic analysis, across which clusters of strategic plans are analyzed.
 *
 * @see open_architecture_today.md "Entity Analysis Trinity"
 */
export interface EntityAnalysisTrinity {
  intent: unknown;
  staticAnalysis: unknown;
  dynamicAnalysis: unknown;
}
