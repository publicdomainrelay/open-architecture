/**
 * Weaponize thought arbitrage as an attack vector: exploit the delta between information value in different trust contexts to inject malicious influence through supply chain vectors.
 * 
 * Earlier understanding (from comms/0067): thought arbitrage applies DeFi AMM concepts to information markets — buying undervalued information in one context and selling it where valued higher, creating liquidity in the knowledge graph.
 * 
 * Attack framing (Vol 3 Attack 2): an adversary exploits the same arbitrage mechanism by predicting how target trust oracles evaluate data, then injecting mislabeled data (e.g., mislabeled VEX statements) into supply chain vectors the target consumes. The attacker performs train-of-thought graffiti — introducing data into the target's introspection of trust chains to perform subconscious attacks. The defense is Alice's locality advantage: when working in ad-hoc groups, entities sync via strategic plans and trust assessments across EDEN nodes (Alice instances), using the same techniques to detect misalignment before injection succeeds. The bus factor in train-of-thought threat modeling trades off cache restoration response time against acceptable documentation loss.
 * 
 * @see comms/0102
 * @see comms/0067
 */
export function thoughtArbitrageAttack(): void {
  // Related: thoughtArbitrage, livingThreatModel, trustGraphTraversalAlignment, knowledgeGraphProvenance
}


/**
 * Kernel-level network policy enforcement for compute guests using eBPF through bpfilter, replacing iptables with BPF programs.
 * 
 * The bpfilter project in the Linux kernel uses eBPF to handle iptables configuration blob parsing and code generation at the kernel level. Instead of the legacy iptables netfilter path, network policy rules are compiled into BPF programs that run in the kernel's eBPF VM. For Alice's compute contract guests, this provides a more efficient, verifiable, and programmable network filtering layer — policy overlays can compile to eBPF bytecode rather than shelling out to iptables. The v3 patchset (Quentin Deslandes, Dec 2022) revived bpfilter development after a hiatus since v2 (Aug 2021), signaling upstream momentum for this approach.
 * 
 * @see comms/0131
 * @see https://lore.kernel.org/lkml/20221224000402.476079-1-qde@naccy.de/
 * @see https://lwn.net/Articles/755919/
 */
export function ebpfNetworkPolicy(): void {
  // Related: sandboxingPolicyOverlay
}
