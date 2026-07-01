# open-architecture

The docs, as a call graph.

`open_architecture_today.md` describes Alice (the Open Architecture). This
workspace turns that document into TypeScript you can dive through with
`codegraph`. Every function is a paragraph of the document. Every function body
calls the sub-concepts that paragraph depends on. The call graph is the
architecture — the docs literally say *"walk the references and you walk her
whole reasoning."*

These are stubs on purpose. There is no implementation here, only documentation
and the links between concepts. The point is navigation, not execution.

## Where to start

```
codegraph explore "whatAliceIs theInfiniteLoop puttingItTogether"
```

`lib/abc/alice/mod.ts` is the spine. From `puttingItTogether` you can walk into
trust, the compute contract flow, the supply-chain gatekeeper, and the stream of
consciousness.

## Layout (one package per document section)

| Package | Document section |
|---|---|
| `lib/common/alice-common` | Glossary + wire types (the dictionary) |
| `lib/abc/alice` | What Alice Is · Putting It Together (the spine) |
| `lib/abc/alice-system-context` | What Alice Is (manifest / data flow / overlay) · Entity Analysis Trinity |
| `lib/abc/alice-communication` | How Alice Communicates: Her Repository Is Her Voice |
| `lib/abc/alice-trust` | What She Trusts, and Why It Isn't the Hardware |
| `lib/abc/alice-compute-contract` | Getting Work Done: Compute Contracts |
| `lib/abc/alice-supply-chain` | Keeping the Supply Chain Honest |
| `lib/abc/alice-stream-of-consciousness` | The Stream of Consciousness |

## Useful traversals

```
codegraph explore "how does the trust graph feed the compute contract policy engine"
codegraph explore "gatekeeper transparency log threat model overlay"
codegraph explore "onEvent prioritizer knowledge graph notify think act"
codegraph node getMyWorkRun
```

## License

Unlicense (public domain).
