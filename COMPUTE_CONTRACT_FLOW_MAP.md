# Compute Contract Flow — Complete Architecture Map

Generated 2026-07-12. Maps every layer from spec (lexicons) through ABC interfaces, transport implementations, Hono factories, CLI entrypoints, e2e integration test, guest tunnel-subscriber transport, onNetwork event flow, and ephemeral JSR registry.

---

## Repos Involved

| Repo | Role |
|------|------|
| `compute-contract` | Schema-only: AT Protocol lexicons + example data. No executable code. |
| `atproto-market` | **Primary**: All market ABCs, impls, factories, CLIs (`hono-bidder`, `request-vm-ssh`), e2e test (`compute-contract-full-flow`) |
| `hono-compute-provider` | Compute provider ABCs, impls (local container/QEMU, DigitalOcean), OIDC issuer, RBAC, Hono factories, CLI |
| `did-key-relay` | Relay: dispatcher routes WebSocket tunnels by SNI subdomain — requester → relay → bidder → guest |
| `typescript-helpers` | Cross-repo shared: `serve`, `logger`, `cli-args-env`, `compute-spa-keypair-noble`, `compute-spa-relay-client`, `firehose-watcher-*` |
| `hono-pds` | AT Protocol PDS (repo storage, record CRUD) |
| `deno-worker-sandbox` | Deno worker compute (separate compute path, not VM) |
| `deno-macos-runner-desktop` | Desktop bidder: badge blue keys, device keys, OAuth |
| `open-architecture` | Docs-as-code stubs referencing all production implementations |

---

## Spec Layer: Lexicons (`compute-contract` repo)

All under `lexicons/com/publicdomainrelay/temp/` (pre-stable `temp` namespace):

| NSID | Record Type | Schema |
|------|-------------|--------|
| `com.publicdomainrelay.temp.compute.vm` | record | `{ cpus, mem, disk, network, role, user_data, location? }` |
| `com.publicdomainrelay.temp.market.rfp` | record | `{ domain, payload: StrongRef, submitBid: string, policy?: StrongRef, createdAt }` |
| `com.publicdomainrelay.temp.market.bid` | record | `{ rfp: StrongRef, payload: StrongRef, bidConfig?: StrongRef, submitAccept: string, createdAt }` |
| `com.publicdomainrelay.temp.market.bids.x402` | record | `{ cost, currency, frequency, prepay, url }` — X402 pricing payload |
| `com.publicdomainrelay.temp.market.bids.free` | record | `{ cost: 0 }` — free pricing payload |
| `com.publicdomainrelay.temp.market.accept` | record | `{ rfp: StrongRef, bid: StrongRef, submitEvent: string, createdAt }` |
| `com.publicdomainrelay.temp.market.receipt` | record | `{ rfp: StrongRef, bid: StrongRef, accept: StrongRef, submitEvent: string, createdAt }` |
| `com.publicdomainrelay.temp.market.offering` | record | `{ endpointUrl, appliesTo: string[], createdAt, refreshedAt }` — bidder advertisement |
| `com.publicdomainrelay.temp.market.event` | record | `{ receipt: StrongRef, payload: StrongRef, createdAt }` — lifecycle events (vm.delete etc.) |
| `com.publicdomainrelay.temp.market.policy` | record | `{ requesterDid, policyMode, vouchNsid?, maxDepth?, policyEngine? }` — fulfillment policy |
| `com.publicdomainrelay.temp.compute.config.wif.simple` | record | `{ accept_path, issuer_uri, to_issue, token_path, url_path, url_route, subject, actx_path }` — WIF bid config |
| `com.publicdomainrelay.temp.agent.class` | record | Agent class template: name, description, skills, parent |
| `com.publicdomainrelay.temp.agent.skill` | record | Agent skill: name, description, content, examples |
| `com.publicdomainrelay.temp.auth.allowlist.rbacDid` | record | RBAC allowlist: `{ protects: { [key]: { service, scope } }, allowed: { [key]: string[] } }` |
| `com.publicdomainrelay.temp.market.relays` | record | `{ relays: string[] }` — relay URL advertisement for auto-discovery |
| `com.fedproxy.rbac` | record | SSH key RBAC: `{ service, issuer, actx, operations }` — grants VM SSH host key registration |

**Record lifecycle chain:**
```
compute.vm (payload) ──► market.rfp ──► market.bid ──► market.accept ──► market.receipt
                             │               │               │
                             └── policy ─────┘               └── market.event (vm.delete)
```

---

## ABC Layer: Pure Interfaces

### `market-abc` (`atproto-market/lib/abc/market/`)

**Record resolution & graph:**
- `RecordResolver` — resolves AT URIs to records
- `ContractGraph` — `{ bid, rfp, rfpPayload, bidPayload, bidConfig, accept, receipt, event }` — full contract state
- `StrongRef` — `{ uri, cid }`

**Settlement:**
- `Settlement` — `{ mode: "x402"|"free", bidPayloadNsid, receiptUrl(), createBidPayload() }`
- `SettlementCtx` — `{ getAgent, resolve, getSigner, log, baseUrl }`

**Callbacks (event system):**
- `RfpCallbacks` — `Record<serviceId, Record<payloadNsid, SubmitRfpCallback>>`
- `SubmitRfpCallback` — `(ctx: SubmitRfpContext) => HandlerResult`
- `SubmitBidCallback` — `(ctx: SubmitBidContext) => HandlerResult`
- `SubmitAcceptCallback` — `(ctx: SubmitAcceptContext) => HandlerResult`
- `EventCallbacks` — `Record<serviceId, Record<payloadNsid, EventCallback>>`
- `EventCallback` — `(ctx: EventDispatchContext) => HandlerResult`

**Attestation:**
- `AttestationKeypair` — `{ did(), privateKey }` — signs records for attestation chain

### `market-bidder-abc` (`atproto-market/lib/abc/market-bidder/`)

- `ActiveContract` — `{ providerIdPromise?, acceptAuthor, receiptUri, receiptCid, acceptedAt }`
- `ContractEvent` — `{ type: "accepted"|"provisioned"|"provisioning-failed"|"terminated"|"termination-failed", ... }`
- `CallbackSet` — `{ rfpCallbacks?, onAccept?, eventCallbacks? }`
- `CallbackFactoryDeps` — all deps a provider needs: `did, repoApi, signer, attestationKp, idResolver, relay, dispatcherHost, log, activeContracts, createRecord, createRepoRecord, createSignedRepoRecord, deleteRecord, callService, resolve`
- `MarketBidderProviderRef` — `{ serviceId, appliesTo, setup?(), teardown?(), buildCallbacks(deps): CallbackSet }`

### `requester-abc` (`atproto-market/lib/abc/requester/`)

- `RequesterPDS` — `{ did, serve, relay, proxyRef, proxyUrl, proxyHost, relaySubdomain, beginServe(), pendingBids, createRepoRecord, createSignedRepoRecord, resolveBidderEndpoint, callBidder, attestationKp, signer, privateKeyHex, associateCalled, approveAssociation, rejectAssociation, dispose }`
- `ContractFlowOptions` — 24 fields: `vmName?, bidWindowSec?, skipSsh?, execProgram?, keepVm?, vmReadyTimeoutSec?, extraBidderDids?, denyBidderDids?, relayUrls?, baseUserData?, rbac?, policyMode?, policyEngineEndpoint?, sshProvider?, payloadFactory?, ...`
- `ContractFlowResult` — `{ event, vmUri?, vmCid?, rfpUri?, rfpCid?, acceptUri?, acceptCid?, bidUri?, bidCid?, winnerDid?, receiptUri?, receiptCid?, submitEventRef?, receiptOk?, bids?, error?, sshReady?, sshExitCode? }`
- `SshSessionProvider` — `{ generateKeypair(vmName), pollReady(privateKeyPath, fqdn, timeoutMs), runSession(privateKeyPath, fqdn, program) }`
- `CollectedBid` — `{ did, uri, cid, record }`

### `market-policy-abc` (`atproto-market/lib/abc/market-policy/`)

- `FulfillmentPolicy` — `{ policyNsid, label, createPolicyPayload(ctx), evaluate(ctx): { allow, violations } }`
- `PolicyEvalCtx` — `{ subjectDid, rootRequesterDid, counterpartyDid, resolve, resolveOperatorDid, log, policyRef? }`

### `policy-abc` (`atproto-market/lib/abc/policy/`)

- `PolicyHandler<T>` — `{ name, evaluate(ctx: T): PolicyResult }`
- `PolicyRegistry` — `{ get(name), names() }`

### `compute-provider-abc` (`hono-compute-provider/lib/abc/compute-provider/`)

- `ComputeProvider` — `{ name, provision(vm, requesterDid, spec?), destroy(id), createBidConfig(nowIso), injectAcceptBundle(userData, bundle), getDroplet?(id), setup?(), teardown?() }`
- `ComputeAtproto` — `{ getAgentDid(), createRecord(), deleteRecord() }`
- `VM` — `{ cpus, mem, disk, network, role, user_data, location?, _uri?, _cid? }`
- `RbacProvisioner` — `{ provision(vm, requesterDid, ctx): { uri }? }`

### `compute-contract-gateway-abc` (`atproto-market/lib/abc/compute-contract-gateway/`)

- `ComputeContractGateway` — `{ did, beginServe(), dispose(), requestComputeVM(caller, input), requestComputeWorkerEphemeral(caller, input), requestComputeWorkerPersistent(caller, input), deleteCompute(caller, receiptUri, receiptCid, token) }`

---

## Implementation Layer: Transport Bindings

### `requester-xrpc` (`atproto-market/lib/requester-xrpc/mod.ts` — 1064 lines)

**The spine.** Orchestrates the full contract flow from requester side.

**Exports:**
- `createRequesterPDS(opts): RequesterPDSImpl` — creates a full PDS with did:plc registration, repo factory, relay, submitBid handler, association confirmation
- `runComputeContract(pds, opts): ContractFlowResult` — drives the full 11-step flow (see below)
- `createSshSessionProvider(logger?, opts?): SshSessionProvider` — SSH keygen + polling + session
- `ensureWebsocat(logger?)` — downloads websocat binary if not on PATH
- `discoverBiddersFromRelay(opts): string[]` — queries relay for bidders by collection
- `discoverBiddersFromRelays(opts): string[]` — union across multiple relays
- `autoDiscoverRelayUrls(opts): string[]` — reads relay URLs from `$ATPROTO_DID`'s repo

**`runComputeContract` — the full 11-step flow:**

```
1. ssh-keygen ed25519 → generate ephemeral keypair for guest
2. buildDefaultUserData(ssh public key) → cloud-init YAML
3. pds.createRepoRecord(compute.vm) → payload record on requester PDS
4. pds.createSignedRepoRecord(market.rfp) → signed RFP referencing compute.vm
5. discoverBiddersFromRelays → query relay index + firehose watcher DIDs
6. submitRfp XRPC → POST to each discovered bidder's submitRfp endpoint
7. await bidWindowSec → collect bids in pds.pendingBids
8. pick lowest-cost bid → cost from bid payload
9. (optional) evaluateRfpPolicy → policy_based mode only
10. pds.createSignedRepoRecord(market.accept) → submitAccept XRPC to winner
11. verify receipt → verifyRecordSignatures + verifyRemoteProof
12. sshProvider.pollReady → SSH into guest, exec program
13. market.event (vm.delete) → tear down guest (unless --keep-vm)
```

**Bidder discovery cascade:**
```
relay index (listReposByCollection on offering NSID)
  + firehose watcher DIDs (live catch-up)
  + vouch graph (sh.tangled.graph.vouch)
  + extraBidderDids (CLI --bidder-dids)
  - denyBidderDids (CLI --deny-bidder-dids)
```

### `market-bidder` (`atproto-market/lib/market-bidder/mod.ts` — 474 lines)

**Bidder lifecycle orchestrator.** No I/O of its own — takes serve + atproto + providers; wires everything in `beginServe()`.

**Exports:**
- `createMarketBidder(config): MarketBidder` — `{ beginServe(), shutdown() }`
- `MarketBidderConfig` — logger, serve, atproto, relay, providers, setup/teardown, callbackFactory, onContractChange, acceptScope, rfpWatcherFactory/Factories, offeringRefreshMs

**`beginServe()` flow:**
```
1. Provider setup (each provider.setup())
2. Build callback deps (did, signer, attestationKp, relay, activeContracts, ...)
3. Merge callbacks from all providers + optional callbackFactory:
   - rfpCallbacks: deep-merge by [serviceId][payloadNsid]
   - onAccept: first provider wins
   - eventCallbacks: deep-merge
4. Wire Hono routes via createMarketFactory:
   - POST /xrpc/com.publicdomainrelay.temp.market.submitRfp
   - POST /xrpc/com.publicdomainrelay.temp.market.submitBid
   - POST /xrpc/com.publicdomainrelay.temp.market.submitAccept
   - POST /xrpc/com.publicdomainrelay.temp.market.submitEvent
   - optional rfpScopeFilter (only_me / direct_network / policy_based)
5. Start firehose watchers (pull-mode RFP discovery)
6. serve.onConnected:
   - ensureOperatorAllowlist (rbacDid allowlist record)
   - ensureOffering (advertise bidder on relay index)
   - startOfferingRefresh (periodic re-commit)
7. serve.beginServe()
```

**Accept scope filter chain:**
- `only_me`: check badgeBlueKeys requester_associate — bidder ↔ requester QR association
- `direct_network`: requester DID == bidder DID, OR in vouch graph (`sh.tangled.graph.vouch`), OR requester_associate
- `policy_based`: pass through, dispatch evaluates policy

**Bidder association check (3 paths):**
1. Own repo: `badgeBlueKeys` where `challenge=requesterDid, service=requester_associate`
2. Operator bridge: `bidder_associate` → operator DID → check requester's `requester_associate`
3. Legacy: public read on own repo

### `market-bidder-compute` (`atproto-market/lib/market-bidder-compute/mod.ts` — 364 lines)

**VM compute bidder callbacks.** Handles the compute.vm RFP → bid → provision → destroy lifecycle.

**Exports:**
- `createVmBidderCallbacks(deps): { rfp, accept, event }` — the three callback sets
- `createComputeProviderHooks({ provider }): MarketBidderProviderRef` — wraps a ComputeProvider into bidder hooks

**`onRfp` (submitRfp callback):**
```
1. (optional) evaluateRfpPolicy — if RFP has policy ref
2. computeProvider.createBidConfig(nowIso) → wif.simple bid config
3. createRepoRecord(market.bids.free) → pricing payload (cost: 0)
4. createSignedRepoRecord(market.bid) → signed bid
5. callService(submitBidUrl, submitBid) → POST bid to requester
```

**`onAccept` (submitAccept callback):**
```
1. Resolve RFP → payload (compute.vm) → user_data
2. Resolve bid → bidConfig (wif.simple)
3. Build accept bundle: { accept, rfp, bid, bid_config, vm }
4. computeProvider.injectAcceptBundle(user_data, bundle) → patched cloud-init
5. computeProvider.provision(vm_with_bundle, issuerDid) → run container/VM
6. Create receipt: market.receipt with attestation CID binding accept→receipt
7. Store in activeContracts map
8. Fire onContractChange({ type: "accepted" })
9. Return { uri: receiptUri, cid: receiptCid, submitEvent: relay.proxyUrl }
```

**`onVmDelete` (submitEvent callback):**
```
1. Extract receipt ref from event
2. Verify receipt in activeContracts
3. Verify issuerDid == acceptAuthor
4. computeProvider.destroy(providerId)
5. Fire onContractChange({ type: "terminated" })
6. Delete from activeContracts
```

### `cloud-init-common` (`atproto-market/lib/common/cloud-init-common/mod.ts` — 325 lines)

**Pure YAML generation. Zero I/O.**

**Exports:**
- `flattenLabel(s): string` — replaces `.:` with `-` (mirrors Go `atprp-ssh-relay` flattenLabel)
- `buildDefaultUserData(ctx): string` — full cloud-config for VM
- `patchDefaultUserData(baseUserData, ctx): string` — merge our provisioning into existing cloud-config
- `buildTunnelUserData(ctx): string` — alternative tunnel-subscriber transport (did-key-relay instead of fedproxy)
- `CloudInitContext` — `{ vmName, didPlc, didPlcKey, relayHost, xrpcRelaySubdomain, sshAuthorizedKey }`
- `TunnelCloudInitContext` — `{ dispatcherHost, audHost, privateKeyHex, jsrUrl, sshAuthorizedKey, targetPort? }`

**`buildDefaultUserData` output (fedproxy transport):**
```yaml
#cloud-config
packages: [openssh-server, jq, curl]
disable_root: false
ssh_pwauth: false

write_files:
  /root/.ssh/authorized_keys          — requester's ephemeral public key
  /etc/ssh/sshd_config.d/10-websocat.conf — ListenAddress 127.0.0.1, key-only root
  /usr/local/bin/setup-websocat.sh    — download fedproxy-client + websocat binaries
  /etc/systemd/system/websocat.service — ws-l:127.0.0.1:8080 → tcp:127.0.0.1:22
  /etc/systemd/system/fedproxy-client.service — SERVICE=vmName, HANDLE=didPlc, PORT=8080
  /etc/systemd/system/setup-websocat.service — oneshot binary installer
  /etc/systemd/system/setup-websocat.path — watch for DO token then run setup

runcmd:
  systemctl daemon-reload
  systemctl enable --now ssh/sshd
  systemctl enable setup-websocat.path
```

**Guest transport chain:**
```
SSH client (requester)
  ProxyCommand websocat --binary wss://<vmName>--did-plc-<key>.fedproxy.com
    → TLS to fedproxy.com
      → SNI route: <subdomain>.fedproxy.com
        → did-key-relay dispatcher
          → relay WebSocket → bidder → guest container
            → fedproxy-client (SERVICE=vmName, PORT=8080)
              → websocat ws-l:127.0.0.1:8080 → tcp:127.0.0.1:22
                → sshd (key-only root, loopback only)
```

### `compute-provider-local` (`hono-compute-provider/lib/compute-provider-local/mod.ts`)

**Local VM/container provisioning.** Two modes: container (lightweight, systemctl-shim) or VM (QEMU/KVM).

**Exports:**
- `createLocalComputeProvider(ctx): ComputeProvider`
- `runContainer(backend, userData, opts): ContainerInfo`
- `spawnVM(opts): void` — QEMU path
- `pollSsh(host, port?, timeoutMs?): boolean` — TCP connect probe
- `buildContainerImage(backend, distro?): string` — Dockerfile with cloud-init + openssh + deno

**Provisioning chain (container mode):**
```
provision(vm, requesterDid)
  → rbacProvisioner.provision(vm, requesterDid) → RBAC record on PDS
  → oidcProvisioner.enrich(userData, teamUuid, issuerUrl)
      → inject provisioning-token.sh + provisioning-token.service into cloud-init
      → returns { userData: enriched, nonce, associateWithDroplet }
  → runContainer(backend, enrichedUserData, opts)
      → buildContainerImage() if missing
      → container/docker run with:
          - user_data file mounted
          - systemctl-shim as entrypoint
          - port 22 forwarded
      → pollSshExec() wait for sshd
      → return { ip, containerName, gateway }
  → associateWithDroplet(dropletId) → links nonce to container
```

### `compute-provider-digitalocean` (`hono-compute-provider/lib/compute-provider-digitalocean/mod.ts`)

**DigitalOcean droplet provisioning.** Proxies through DO API with OIDC enrichment.

```
provision(vm, requesterDid)
  → GET /v2/account → teamUuid
  → rbacProvisioner.provision(vm, requesterDid) → RBAC record
  → POST /v2/droplets { user_data: enriched, x-on-behalf-of: requesterDid }
```

### `oidc-issuer-hono` (`hono-compute-provider/lib/oidc-issuer-hono/mod.ts`)

**Workload identity provisioning.** Guest proves possession of SSH host key → receives OIDC token.

**Routes:**
- `GET /.well-known/openid-configuration` — OIDC discovery
- `GET /.well-known/jwks` — JWKS endpoint
- `POST /v1/oidc/issue` — issue token (RBAC-gated)
- `POST /v1/oidc/prove` — nonce + SSH signature → workload identity token

**Provisioning prove flow:**
```
Guest boots → cloud-init runs provisioning-token.service
  → /usr/local/bin/provisioning-token.sh:
      1. ssh-keygen -Y sign on provisioning OIDC token
      2. POST /v1/oidc/prove { token, signature, port }
  → Provider:
      1. OIDCToken.validate(token)
      2. Look up droplet by nonce
      3. ssh-keyscan guest, verify SSH signature
      4. Issue workload identity OIDC token
      5. Return token to guest
  → Guest writes token to /root/secrets/digitalocean.com/serviceaccount/token
  → fedproxy-client reads token, uses for service auth
```

---

## Hono Factory Layer

### `hono-factory-market-atproto` (`atproto-market/lib/hono-factory-market-atproto/`)

Wires the 4 XRPC endpoints + did:web + service auth verification. All handlers run with `bindKeys` always-on: the signing `did:key` must appear in the issuer/author DID document's `verificationMethod[]`.

**Routes:**
- `POST /xrpc/com.publicdomainrelay.temp.market.submitRfp` — createSubmitRfpHandler
- `POST /xrpc/com.publicdomainrelay.temp.market.submitBid` — createSubmitBidHandler
- `POST /xrpc/com.publicdomainrelay.temp.market.submitAccept` — createSubmitAcceptHandler
- `POST /xrpc/com.publicdomainrelay.temp.market.submitEvent` — createSubmitEventHandler
- `GET /xrpc/com.publicdomainrelay.network.attested.verify` — createVerifyHandler (always binds keys)
- `GET /.well-known/did.json` — did:web document (includes verificationMethod with atproto + attestation keys)

### `hono-factory-market-settlement-free` / `hono-factory-market-settlement-x402`

**Routes:**
- `GET /free/receipt/*` or `GET /x402/receipt/*` — receipt minting endpoints
- X402 variant supports optional `paymentMiddleware`

### `hono-factory-requester-xrpc`

Standalone requester — only registers `submitBid` endpoint. Takes bare `{ post() }` object (not Hono app).

### `hono-factory-compute-contract-gateway-xrpc`

Gateway for compute contract requests (VM + worker).

**Routes:**
- `POST /xrpc/com.publicdomainrelay.compute.contract.requestComputeVM`
- `POST /xrpc/com.publicdomainrelay.compute.contract.requestComputeWorkerEphemeral`
- `POST /xrpc/com.publicdomainrelay.compute.contract.requestComputeWorkerPersistent`
- `POST /xrpc/com.publicdomainrelay.compute.contract.deleteCompute`
- `GET /health`, `GET /.well-known/did.json`

### `hono-factory-policy-builtin`

Policy engine — evaluates `PolicyHandler[]` in order, first deny short-circuits.

**Routes:**
- `POST /xrpc/com.publicdomainrelay.market.evaluatePolicy`
- `POST /xrpc/com.publicdomainrelay.gate.registry.workerManifestPermissions`

### `hono-factory-compute-provider-local` / `hono-factory-compute-provider-digitalocean`

DigitalOcean-compatible API surface. Mounts OIDC issuer + droplet CRUD.

**Routes:**
- OIDC routes (`/.well-known/*`, `/v1/oidc/*`)
- `GET /v2/account` — `{ account: { team: { uuid } } }`
- `POST /v2/droplets` — create droplet (enriches user_data with OIDC provisioning)
- `GET /v2/droplets` — list
- `GET /v2/droplets/:id` — get
- `DELETE /v2/droplets/:id` — destroy

---

## CLI Layer

### `hono-bidder` (`atproto-market/hono-bidder/mod.ts` — 368 lines)

**Bidder CLI.** Wires providers (DigitalOcean, local, deno worker) into a market bidder.

**Config:** `CONFIG_PATH_HONO_BIDDER`

**Startup:**
1. Resolve options (Command)
2. Create keypair (Secp256k1)
3. Create AT Protocol agent (remote or local PDS)
4. Register PDS with relay market registries
5. Create ATProto instance (badgeBlueSigner, PLC directory)
6. Build providers list:
   - `--compute-provider-digitalocean-token` → DigitalOcean provider
   - `--compute-provider-local` → local provider (container or VM)
   - `--compute-provider-deno-worker` → Deno worker provider
7. Each provider gets its own relay + serve (own keypair → own subdomain)
8. Create market bidder with providers + firehose watchers
9. `bidder.beginServe()` → wires routes, starts offering refresh
10. QR association flow (bidder_associate)

**Provider wire-up pattern:**
```
provider = createComputeProviderHooks({ provider: createLocalComputeProvider(...) })
  → buildCallbacks(deps) → { rfpCallbacks, onAccept, eventCallbacks }
  → market bidder deep-merges with other provider callbacks
  → Hono factory wires into XRPC routes
```

### `request-vm-ssh` (`atproto-market/request-vm-ssh/mod.ts` — 239 lines)

**Requester CLI.** Creates a requester PDS, runs compute contract, SSHs into the VM.

**Config:** `CONFIG_PATH_REQUEST_VM_SSH`

**Startup:**
1. Resolve options (Command)
2. `ensureWebsocat()` — download websocat if missing
3. `createRequesterPDS()` — did:plc registration, repo factory, relay
4. Optional firehose offering watch (jetstream or subscribeRepos)
5. `pds.beginServe()`
6. QR association flow (requester_associate)
7. `runComputeContract(pds, opts)` — drives full 11-step flow
8. Result logged, PDS disposed

**SSH flow (inside runComputeContract):**
```
ssh-keygen ed25519 → ephemeral keypair
buildDefaultUserData(publicKey) → cloud-init
... RFP → bid → accept → provision ...
pollReady(privateKeyPath, vmFqdn) → SSH probe every 5s
runSession(privateKeyPath, vmFqdn, execProgram) → interactive SSH
```

### `compute-contract-full-flow` (`atproto-market/compute-contract-full-flow/run_full_flow.ts` — 390 lines)

**Single-process e2e integration test.** Stands up everything in one Deno process: dispatcher, fake PLC, bidder (with local container provider), requester. Drives the full contract flow.

**Architecture:**
```
One Deno process:
  ├── dispatcher (did-key-relay, port auto-assigned)
  ├── fake PLC (Hono app, port auto-assigned)
  ├── fetch interceptor (*.localhost → localhost:dispPort)
  ├── bidder:
  │     ├── local PDS agent (Secp256k1 keypair)
  │     ├── ATProto instance
  │     ├── local compute provider (container mode)
  │     ├── provider hooks → bidder callbacks
  │     ├── market bidder (with relay + serve)
  │     └── beginServe()
  ├── requester:
  │     ├── requester PDS
  │     ├── beginServe()
  │     └── runComputeContract(pds, { skipSsh: false, keepVm: true, ... })
  ├── collect AT Protocol records from both repos
  └── write SUMMARY.md + atproto-records.json + full-flow.log
```

**Key difference from production:** Everything in one process — no network boundaries. `*.localhost` DNS resolved via fetch interceptor. Fake PLC instead of real `plc.directory`. Local container provider instead of DigitalOcean.

---

## Policy & Settlement Layer

### Policy modes

| Mode | Impl | Behavior |
|------|------|----------|
| `only_me` | `market-policy-only-me` | Requester must be associated with bidder operator (badgeBlueKeys) |
| `direct_network` | `market-policy-direct-network` | Requester in vouch graph (`sh.tangled.graph.vouch`) or associated |
| `policy_based` | `market-policy-remote` + `market-policy-workflow-gha` | Evaluate via policy engine endpoint |
| (none) | — | Accept all RFPs (default) |

### Settlement modes

| Mode | Impl | Behavior |
|------|------|----------|
| `free` | `market-settlement-free` | Zero-cost, mints receipt without payment |
| `x402` | `market-settlement-x402` | HTTP 402 Payment Required, receipt after payment |

### Policy evaluation flow (requester side, step 9):
```
if policyMode == "policy_based" and policyRef:
  evaluateRfpPolicy({
    policyRef, subjectDid: winner.did, rootRequesterDid: pds.did,
    resolve, signer, log
  })
  → if !allow: return "policy_rejected"
```

### Policy evaluation flow (bidder side, onRfp):
```
if rfp.policy:
  evaluateRfpPolicy({ policyRef, subjectDid: bidder.did, ... })
  → if !allow: return { ok: false, error: "policy rejected" }
```

---

## SSH Tunnel Path (full chain)

```
┌─────────────────────────────────────────────────────────────────────┐
│ REQUESTER                                                            │
│                                                                      │
│ ssh -i /tmp/ssh-<vm>/id_ed25519                                     │
│   -o ProxyCommand='websocat --binary wss://<vm>--did-plc-<key>.fp'  │
│   root@<vm>--did-plc-<key>.fedproxy.com                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ fedproxy.com / xrpc.fedproxy.com (TLS terminator)                   │
│                                                                      │
│ SNI route: <service>--did-plc-<key>.fedproxy.com                    │
│   → did-key-relay dispatcher (WebSocket proxy)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BIDDER (hono-bidder process)                                         │
│                                                                      │
│ did-key-relay subscriber (connected to dispatcher)                   │
│   → routes by subdomain to tunnel endpoint                           │
│   → WebSocket → fedproxy-client on guest                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ GUEST CONTAINER / VM                                                 │
│                                                                      │
│ fedproxy-client                                                      │
│   SERVICE=<vmName>  HANDLE=<didPlc>  PORT=8080                      │
│   ATPRP_URL=https://<subdomain>.fedproxy.com                        │
│   → connects to relay, bridges external WS to local :8080           │
│                                                                      │
│ websocat --binary ws-l:127.0.0.1:8080 tcp:127.0.0.1:22             │
│   → bridges WebSocket ↔ TCP to sshd                                 │
│                                                                      │
│ sshd -o ListenAddress=127.0.0.1                                     │
│   PermitRootLogin prohibit-password                                  │
│   authorized_keys: requester's ephemeral ed25519 public key          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## AT Protocol Record Flow

```
Requester PDS                          Relay/Network              Bidder PDS
─────────────                          ─────────────              ──────────

1. compute.vm
   { role, user_data }
   
2. market.rfp (signed)
   { domain: "compute",
     payload: StrongRef(compute.vm),
     submitBid: did#pdr_temp_market,
     policy?: StrongRef(policy) }
                                       ──► firehose / submitRfp ──►
                                                                  3. compute.config.wif.simple
                                                                     (bid config)
                                                                  4. market.bids.free
                                                                     { cost: 0 }
                                                                  5. market.bid (signed)
                                                                     { rfp, payload, bidConfig,
                                                                       submitAccept }
                                       ◄── submitBid XRPC ───────
6. collect bids (bidWindowSec)
7. pick lowest-cost
8. (optional) evaluatePolicy
9. market.accept (signed)
   { rfp, bid, submitEvent }
                                       ──► submitAccept XRPC ────►
                                                                  10. provision VM/container
                                                                      cloud-init → sshd + websocat
                                                                  11. market.receipt (signed)
                                                                      attestation CID binding
                                       ◄── { receiptUri, receiptCid,
                                             submitEvent } ───────
12. verify receipt
    (signatures + proof bind)
13. SSH into guest ─────────────────────────────────────────────────→ sshd
14. market.event (vm.delete, signed)
    { receipt, payload }
                                       ──► submitEvent XRPC ──────►
                                                                  15. destroy VM/container
                                                                  16. market.receipt deleted
```

---

## Key Architectural Decisions

1. **Relay IS the registry.** No separate service discovery database. Bidders advertise via `market.offering` records; requesters discover via relay `listReposByCollection` + firehose.

2. **One offering per bidder.** `ensureOffering()` enforces exactly one `market.offering` record per bidder DID — first created rkey becomes canonical, all subsequent writes are in-place updates.

3. **Each provider owns its relay.** `hono-bidder` creates a separate relay + serve per provider (own keypair → own subdomain). No shared relay between providers.

4. **Cloud-init IS the guest contract.** Everything the guest needs (sshd config, websocat, fedproxy-client, authorized_keys) is in `buildDefaultUserData`. No hand-assembled containers. RFP flow is the only path to a live guest.

5. **Content-addressed attestation chain.** Every record in the contract graph is signed (`createSignedRepoRecord`). Receipts have an attestation CID binding accept → receipt. Verification: `verifyRecordSignatures` + `verifyRemoteProof`.

6. **OIDC for workload identity.** Guest proves possession of SSH host key → receives OIDC token. fedproxy-client uses this token for service auth to the relay. Provisioning nonce prevents replay.

7. **Firehose as pull-mode RFP discovery.** Bidder can watch firehose (subscribeRepos or jetstream) for `market.rfp` records instead of waiting for inbound `submitRfp` XRPC calls. Both paths work; firehose is the production path.

### Firehose & Bidder Discovery

**Relay architecture:** The atproto-relay maintains a Deno.Kv collection index: `["collection", NSID, did]`. It subscribes to each registered PDS's `subscribeRepos` firehose, extracts collection names from op paths, and indexes which DIDs have records in which collections. No record values stored — only the index mapping.

**Two watcher transports normalize to same `FirehoseRecordEvent`:**
- `subscribeRepos` — atproto relay firehose: `{seq, repo, ops[{action, path}]}` optionally wrapped in `RelayEnvelope {seq, frame}`
- `jetstream` — Bluesky Jetstream: `{did, kind:"commit", commit: {collection, operation, rkey, cid}}`

**Bidder discovery cascade (5 stages in `runComputeContract`):**
1. `autoDiscoverRelayUrls` — reads `market.relays` records from `$ATPROTO_DID`'s PDS repo
2. `discoverBiddersFromRelays` — `GET /xrpc/com.atproto.sync.listReposByCollection?collection=<OFFERING_NSID>` on each relay → union of DIDs
3. Vouch graph — `listRecords(pds.did, "sh.tangled.graph.vouch")` → filter kind≠denounce → extract DID from rkey
4. Live firehose offering watcher — catches offerings relay lagged/missed
5. `extraBidderDids` / `denyBidderDids` — CLI overrides

**Offering record is the discovery contract:**
- Bidder writes one `market.offering` record in own PDS with `{endpointUrl, appliesTo[], createdAt, refreshedAt}`
- Relay indexes it via firehose → `collectionIndex.add(OFFERING_NSID, did)`
- Requester queries relay index → fetches actual offering from bidder's PDS → verifies `appliesTo` match → `resolveBidderEndpoint(endpointUrl)` → `submitRfp`

**Bidder PDS registration:** `createAtprotoMarketRegistry({registryUrl}).registerPds(hostname)` → `POST /xrpc/com.atproto.sync.requestCrawl {hostname}`. Two-phase: early (before serve, with relay-assigned hostname) and deferred (after serve, with direct `127.0.0.1:{port}` for local relays).

8. **Single-process e2e test.** `compute-contract-full-flow/run_full_flow.ts` stands up dispatcher, fake PLC, bidder, requester all in one Deno process. Canonical harness for testing the full flow without external infrastructure.

9. **Relay is NOT a database.** It's a collection-indexing firehose proxy. Collection → [DIDs] only. Actual record values fetched from bidder PDS directly. No central registry authority — any relay can index any PDS.

---

## Round 2 Deep-Dive Findings

### Handler Error Taxonomy (`market-atproto/server.ts`)

All XRPC handlers share a common auth+verify+dispatch pattern. 14 distinct error paths:

| HTTP | `error` | `message` | Trigger |
|------|---------|-----------|---------|
| 400 | InvalidRequest | `invalid JSON` | Body parse failure |
| 400 | InvalidRequest | `missing rfpUri or rfpCid` | submitRfp missing fields |
| 400 | InvalidRequest | `missing uri, cid, or record` | submitBid/submitEvent missing fields |
| 400 | InvalidRequest | `missing acceptUri or acceptCid` | submitAccept missing fields |
| 400 | InvalidRequest | `expected com.publicdomainrelay.temp.market.event` | Event $type mismatch |
| 400 | InvalidRequest | `record is missing a valid badge.blue signature` | verifyRecordSignatures false |
| 400 | InvalidRequest | `missing uri` | verify handler no uri param |
| 400 | RecordNotFound | `could not resolve {uri}: ...` | Record fetch failure |
| 401 | Unauthorized | `invalid service-auth token: ...` | JWT validation failure |
| 403 | Forbidden | `service-auth token issuer must author the referenced record` | issuerDid != record author |
| 403 | (none) | `scope filter declined` | acceptScopeFilter returned false |
| 500 | (none) | `internal error` | submitRfp catch-all |
| 400 | ContractGraphError | `Accept.rfp does not match Bid.rfp` | bid.rfp != accept.rfp |
| 400 | ContractGraphError | `Bid/RFP is missing a valid badge.blue signature` | signature check in resolveContractGraph |

**Key:** submitBid, submitAccept, submitEventHandler have NO try/catch — unhandled rejections propagate as 500s through Hono's error middleware.

**Auth flow per handler (`authorize()`):**
```
extractBearer → verifyMarketServiceAuth(JWT sig + lxm + aud + exp)
  → assert issuerDid === atUriAuthority(recordUri)
  → return { issuerDid, serviceId }
```

**Attestation verification (`verifyAuthored()`):**
```
verifyRecordSignatures({ record, repositoryDid, keysForDid })
  → inlineEntries(record) → for each: verifyInlineAttestation
    → createAttestationCid(record, entry, repositoryDid)
    → verifyBytes(computed.bytes, sigBytes, pubKey)
  → first passing entry wins
  → keysForDid binding ALWAYS ON (did:web/did:plc key lookup)
    → resolves entry.issuer ?? repositoryDid DID document
    → checks entry.key (did:key) ∈ verificationMethod[].publicKeyMultibase
    → every producer must publish attestation key in its DID doc
```

**Attestation CID formula:** DAG-CBOR + SHA-256 of `{ record (sans signatures), entry metadata (sans cid+sig), repository }` → CIDv1.

### Provisioning Internals (hono-compute-provider)

**`systemctl-shim.ts`** — 632-line Deno script running as PID 1 in containers. Replaces systemd:
- Supervisor loop polls `wanted` units every 2s, spawns `bash -c {ExecStart}`, tracks PIDs
- Unit types: simple, forking, oneshot, notify (INI parser)
- Path units: watches `PathExists=`, triggers associated service when condition met
- Cloud-init: runs `/usr/bin/cloud-init` as subprocess during init
- Commands: start, stop, restart, enable, disable, status, daemon-reload, is-enabled, is-active

**Container image build** — two Dockerfile variants (Ubuntu/Fedora). Both install cloud-init + openssh-server + Deno. Entrypoint = `exec deno run -A /usr/local/bin/systemctl-shim.ts --init`.

**Container run args:**
```
run -d --name {name} --memory 512m [--memory-swap 512m docker-only]
  -v {udFile}:/tmp/user-data:ro           # cloud-init YAML
  -v {epFile}:/entrypoint.sh:ro           # generated entrypoint
  -v {systemctlShim}:/usr/local/bin/systemctl-shim.ts:ro
  -e USER_DATA_FILE=/tmp/user-data
  {tag}
```

**SSH readiness:** Container mode uses `backend.exec("ss -H -tln")` (not host TCP — macOS `container` vmnet doesn't route host→guest). VM mode uses `Deno.connect(ip, 22)` TCP probe.

**QEMU (`qemu-standalone/mod.ts`):**
- `buildImage(distro)`: skopeo copy OCI → chroot install (systemd, kernel, cloud-init, Deno, docker) → dracut initrd (dmsquash-live + overlayfs + pdroverlay) → mksquashfs → ext4 LiveOS
- `runVM(distro, userData)`: 20GB overlay + 40GB docker/containerd data disks, Cloud-Init NoCDROM HTTP server, `qemu-system-x86_64 -enable-kvm -cpu host -smp 2 -m 4G`, SSH port forwarded host:22→guest:22

**OIDC provisioning prove flow:**
```
Guest boots → provisioning-token.service runs:
  1. ssh-keygen -Y sign on provisioning OIDC token
  2. POST /v1/oidc/prove { token, signature, port }
Provider:
  1. OIDCToken.validate → extract nonce → lookup droplet
  2. ssh-keyscan guest → verify SSH signature
  3. Issue workload identity OIDC token (RS256 JWT, sub=actx:{team}:plc:{did}:role:{role})
Guest writes token to /root/secrets/digitalocean.com/serviceaccount/token
→ fedproxy-client reads it, uses for service auth to relay
```

### Relay Tunnel Internals (did-key-relay)

**Nonce challenge/response registration:**
1. Subscriber: `POST /xrpc/GET_NONCE_NSID` with service-auth JWT → receives 64-byte base64 nonce
2. Subscriber: `keypair.sign(nonceBytes)` → opens WS `/xrpc/SUBSCRIBE_NSID?registration=<JSON>`
3. Relay `onOpen`: `nonceStore.verify(key, nonce, sig)` → register `subscribers.set(subdomain, ws)`
4. Relay sends `{ $type: "...#registered", subdomain, proxyRef }`

**WebSocket frame format** — all JSON with `$type` discrimination:
- `#subscribe` / `#subscriptionOpen` / `#subscriptionData` / `#subscriptionEvent` / `#subscriptionClose` — subscription lifecycle
- `#request` / `#response` — XRPC request/response proxying
- `#subscriptionCancel` — relay→sub cancellation
- Tunnel data: `#subscriptionData` with base64-encoded bytes on subscriber side, raw ArrayBuffer on caller side

**Tunnel byte bridging (`startTunnel`):**
```
Deno.connect(127.0.0.1:22) → read 64KiB chunks → WS.send(#subscriptionData base64)
WS.onmessage(#subscriptionData) → decode base64 → writeAll(tcpConn)
```

**Reconnection:** Exponential backoff 1s→30s, only if `everRegistered` was true. Full re-registration (new nonce, new signature) on reconnect. `flushReconnectQueue` replays queued frames.

**Two transport variants:**
- **fedproxy** (default): `buildDefaultUserData` → fedproxy-client + websocat ws→tcp bridge
- **tunnel-subscriber** (newer): `buildTunnelUserData` → `deno run jsr:@publicdomainrelay/hono-did-key-relay-tunnel-subscriber` bridges relay tunnel bytes directly to sshd (no guest websocat)

### Test Harness Patterns

16 test files in `atproto-market/test/`. Key patterns:

**Fake PLC:** In-memory `Map<string, genesisOp>`. POST `/{did}` stores op. GET `/{did}` derives DID document from `op.verificationMethods` (Multikey entries stripping `did:key:` prefix) and `op.services`. `gateway_readme_smoke_test.ts` variant adds `overrideService()` for subprocess consumers.

**Port discovery (two patterns):**
- Older: `Promise.withResolvers<number>()` + `onListen: (addr) => resolve(addr.port)`
- Newer: `server.addr.port` (synchronous on returned `Deno.HttpServer`)

**Fetch interceptor:** `installFetchInterceptor()` patches `globalThis.fetch` to downgrade `https://*.localhost` → `http://{host}:{dispPort}` and redirect `plc.directory` → local fake PLC.

**Cleanup idiom:** `cleanups: Array<() => void>` — push abort controllers + restoreFetch + shutdown fns → reverse-iterate in `finally` → 200ms settle. Gateway tests use sequential dispose pattern instead.

**Subprocess readiness:** Parse JSON stdout lines for `{"event":"bidder_ready"}` and `"serve listening"` messages with `Date.now()` deadline loops.

**Canonical harness** (`bidder_container_integration_test.ts`): dispatcher + fake PLC + in-process bidder (local container provider) + in-process requester. `extraBidderDids: [atproto.did]` + `denyBidderDids: ["did:plc:centraldefaultbidder000000"]`. Spies on `pendingBids.set` to capture bids pre-deletion.

### Worker Compute Path (separate from VM)

**Diff from VM:** No relay tunnel. `WorkerManifestStore` → `WorkerInstanceRunner` → `new Worker(url, {deno: {permissions}})`. Message-passing API (`postMessage`/`onMessage`) instead of SSH.

**Manifest lifecycle:**
1. `workerManifestStore.register(payload)` — writes lock/json/bundle/permissions to PDS
2. `workerRunner.start(instanceRef, manifestRef)` — `new Worker("data:application/javascript;base64,{bundle}", {type:"module", deno:{permissions}})`
3. `workerRunner.execute(instanceRef, request)` — `postMessage({type:"request", method, path, ...})`, timeout 30s
4. `workerRunner.stop(instanceRef)` — `worker.terminate()`

**Permission model:** Three modes — `deny-all` (strip all), `allow-all` (pass through), `by-policy` (evaluate via `PermissionPolicyHandler`). Handlers: allow-net-only, worker-script, loopback HTTP, remote policy service.

### ATProto Agent + Serve + Relay Wiring

**Canonical bidder construction:**
```
Secp256k1Keypair.create()
  → privateKeyHex derived
  → loadOrGenerateKeypair(privateKeyHex) → attestationKp (pre-computed before genesis)
  → createLocalPDSAgent({keypair, serve, logger, plcDirectoryUrl, dispatcherHost})
    → createGenesisOp({verificationMethods: {atproto, attestation}}) → plc.submitOp → did:plc
    → createRepoFactory({signer, storage, publicKeyDid, attestationKeyDid}) → {app, api}
    → createXrpcRelay({signer, keypair}) → relay
    → serve.addRelay(relay)
  → createPlcDirectoryClient({plcDirectoryUrl})
  → createATProto({badgeBlueSigner: attestationKp, plcClient, agent: pdsAgent})
    → ATProto { did, signer, attestationKp, idResolver, createRecord,
                 createSignedRepoRecord, callService, resolve, ... }
  → createXrpcRelay({signer: atproto.signer, keypair}) → bidderRelay
  → createServe({tcp, relays: [bidderRelay]}) → bidderServe
  → createMarketBidder({serve: bidderServe, atproto, relay: bidderRelay, providers})
```

**`createServe` lifecycle:** `beginServe()` → start `Deno.serve` (TCP/Unix) → `relay.onServe(fetchAdapter)` for each relay (opens WS to dispatcher) → fire all `onConnected` callbacks (offering creation, OIDC mount). `shutdown()` → abort Deno.serve controller → `relay.close()` per relay.

**`createXrpcRelay`:** Wraps `createSubscriber` from did-key-relay. `onServe(fetch)` → nonce+sign+register WS → dispatcher assigns subdomain + proxyRef. `proxyRef = "did:web:{subdomain}.{dispatcherHost}"`. Lazy getters: `proxyUrl = "https://" + proxyRef.slice("did:web:".length)`.

### PDS Internals (hono-pds)

**Repo storage:** Content-addressed block store (CID → bytes) + head pointer (DID → {commit, rev}). Two backends: `MemoryStorage` (Map, tests/default) and `DenoKvStorage` (persistent, `--storage-path`).

**`applyWrites` flow:** Load MST root from prior commit → iterate writes → CBOR-encode record → SHA-256 CID → store block → MST key=`collection/rkey` → build CARv1 diff → sign commit (ES256K) → store signed commit block → update head → emit to FirehoseSequencer → notify crawlers.

**List records:** MST walk (sorted keys), filter by `collection/` prefix, alphabetical pagination via `cursor` (next key where limit hit).

**Service auth:** `signServiceAuth(signer, {aud, lxm})` → ES256K JWT (iss=signer.did, aud=target DID, exp, jti). `verifyServiceAuth` does payload-claims-only check (not crypto — trusts relay-layer verification).

**`did:web` document:** Derived from `Host` header. Service entries from `opts.didWebServices` array. `verificationMethod[]` includes `#atproto` (signing key) plus `#attestation` (attestation key) when `publicKeyDid`/`attestationKeyDid` options are set on `RepoFactoryOptions`. Served at `/.well-known/did.json`.

### Compute Contract Gateway (separate API surface)

**6 HTTP routes** behind `requireAuth` middleware (AT Protocol inter-service JWT):
- `POST /xrpc/...requestComputeVM` — full RFP flow via internal `runComputeContract`
- `POST /xrpc/...requestComputeWorkerEphemeral` — worker RFP via `payloadFactory`
- `POST /xrpc/...requestComputeWorkerPersistent` — same, empty extraBidderDids
- `POST /xrpc/...deleteCompute` — **STUB** (returns `{ok:true}` always)
- `GET /health` + `GET /.well-known/did.json`

**Key gaps:** `_caller` identity accepted but ignored — gateway always acts as its own DID. Worker routes hardcode `{did: "unknown"}`. `deleteCompute` is no-op. Caller-provided `tokens` unused.

### Cross-Cutting Concerns

**Config priority:** CLI flag → env var (`Deno.env.get(def.env)`) → `config.json` (module-adjacent or `CONFIG_PATH_*` override) → `cli-args-env.json` default.

**CONFIG_PATH_*:** Each CLI has unique name (e.g. `CONFIG_PATH_HONO_BIDDER`). When set, reads that JSON path instead of module-adjacent `config.json`. Enables multi-environment deployment.

**Logger:** Two tiers — simple `LoggerInterface` (info/warn/error/debug prefix+console) and `StructuredLoggerInterface` (JSON with ts/level/message/serviceName). Min level from `MIN_LOG_LEVEL` env, defaults to `"info"`.

**Error middleware (`registerErrorMiddleware`):** Three-tier — `err.toJSON()` (HTTPError) → `err.status` (400-599) → 500 with stack logged. Used in 12+ factories.

**Shutdown cascade (hono-bidder):**
```
SIGINT/SIGTERM → shutdown()
  → bidder.shutdown()
    → rfpWatchers[].close()        // WS disconnect
    → offeringRefresher?.stop()    // periodic timer
    → activeContracts.clear()      // in-memory state
    → providers[].teardown?.()     // fire-and-forget
    → serve.shutdown()
      → controller.abort()         // Deno.serve stops
      → relays[].close()           // WS relay disconnect (best-effort)
  → serves[].shutdown()            // provider serves
  → Deno.exit()
```

**Partial failures:**
- Bidder dies mid-provision: in-memory state lost, provider continues (no abort sent), no persistence across restart
- Requester dies mid-accept: accept never written, RFP stays open for other bidders, no timeout cancellation
- Relay disconnects: error logged, `relay.close()` best-effort, no automatic reconnect in xrpc-relay or market-bidder (manual process restart)
- No retry/timeout for contract acceptance or provisioning at app level — system relies on orchestrator (systemd/Docker restart policy)

---

## Files Referenced

| File | Lines | Role |
|------|-------|------|
| `atproto-market/lib/requester-xrpc/mod.ts` | 1064 | Full requester-side flow orchestration |
| `atproto-market/lib/market-bidder/mod.ts` | 474 | Bidder lifecycle: merge callbacks, wire routes, offering |
| `atproto-market/lib/market-bidder-compute/mod.ts` | 364 | VM bidder callbacks: onRfp, onAccept, onVmDelete |
| `atproto-market/lib/common/cloud-init-common/mod.ts` | 325 | Guest cloud-init YAML generation |
| `atproto-market/lib/market-atproto/server.ts` | ~500 | XRPC handler factories + error taxonomy |
| `atproto-market/lib/market-atproto/attest.ts` | ~200 | Attestation verification (inline + remote proof) |
| `atproto-market/lib/market-atproto/contract.ts` | ~100 | resolveContractGraph with error types |
| `atproto-market/lib/xrpc-relay/mod.ts` | 69 | Relay WS registration wrapping createSubscriber |
| `atproto-market/request-vm-ssh/mod.ts` | 239 | Requester CLI |
| `atproto-market/hono-bidder/mod.ts` | 368 | Bidder CLI |
| `atproto-market/compute-contract-full-flow/run_full_flow.ts` | 390 | Single-process e2e test |
| `atproto-market/test/` | 17 files | Integration tests + harnesses |
| `atproto-market/lib/compute-contract-gateway-xrpc/mod.ts` | ~250 | Gateway impl (wraps runComputeContract) |
| `atproto-market/lib/hono-factory-compute-contract-gateway-xrpc/mod.ts` | ~130 | Gateway Hono routes + requireAuth middleware |
| `hono-compute-provider/lib/compute-provider-local/mod.ts` | ~730 | Local container/QEMU provisioning |
| `hono-compute-provider/lib/compute-provider-local/systemctl-shim.ts` | 632 | PID 1 systemd replacement |
| `hono-compute-provider/lib/oidc-issuer-hono/mod.ts` | ~650 | OIDC issuer + provisioning enricher |
| `hono-compute-provider/lib/rbac-atproto/mod.ts` | ~200 | RBAC record management |
| `hono-compute-provider/lib/qemu-standalone/mod.ts` | ~550 | QEMU image build + VM launch |
| `hono-compute-provider/lib/container-backend-docker/mod.ts` | ~200 | Docker CLI backend |
| `hono-compute-provider/lib/container-backend-container/mod.ts` | ~150 | macOS container CLI backend |
| `did-key-relay/lib/hono-factory-did-key-relay-relayer-xrpc/mod.ts` | ~320 | Relay factory: nonce, subscriber WS, subdomain routing |
| `did-key-relay/lib/did-key-relay-subscriber-xrpc/mod.ts` | ~530 | Subscriber: register, startTunnel, tunnelOverRelay, createCaller |
| `did-key-relay/lib/abc/did-key-relay-relayer/mod.ts` | ~130 | RelayState: pure state machine, reconnect queues |
| `did-key-relay/hono-did-key-relay-tunnel-subscriber/mod.ts` | ~60 | In-VM tunnel subscriber CLI |
| `hono-pds/lib/atproto-repo-deno/repo.ts` | ~300 | Repo: applyWrites (MST + CBOR + CID + CARv1) |
| `hono-pds/lib/hono-factory-atproto-repo-deno/factory.ts` | ~240 | Repo factory: all PDS routes + WebSocket firehose |
| `hono-pds/lib/atproto-repo-deno/service-auth.ts` | ~50 | signServiceAuth: ES256K JWT minting |
| `typescript-helpers/lib/serve/mod.ts` | 120 | Composable serve handle (TCP + relays + onConnected) |
| `typescript-helpers/lib/logger/mod.ts` | ~100 | Structured + simple loggers |
| `typescript-helpers/lib/cli-args-env/mod.ts` | ~100 | Config resolution: flag→env→config.json→default |
| `typescript-helpers/lib/hono-error-middleware/mod.ts` | ~30 | Error middleware with HTTPError toJSON |
| `deno-worker-sandbox/lib/compute-deno-atproto/instance-runner.ts` | ~90 | Worker instance runner: start, execute, stop |
| `deno-worker-sandbox/lib/compute-deno-atproto/manifest-store.ts` | ~50 | Worker manifest store: register, get |
| `atproto-market/lib/market-bidder-worker/mod.ts` | ~230 | Worker bidder callbacks |
| `compute-contract/lexicons/` | 9 files | AT Protocol lexicon schemas |
| `open-architecture/lib/abc/alice-compute-contract/mod.ts` | ~120 | Docs-as-code stubs |

---

## Operational Supplement — Running the Flow

### Repo Map

15 repos under org root `/Users/johnandersen777/src/publicdomainrelay/`:

| # | Directory | GitHub | Packages | Role |
|---|-----------|--------|----------|------|
| 1 | `atproto-market/` | `publicdomainrelay/atproto-market` | 46 | **Hub** — market engine, RFP flow, requester, bidder, gateway, policy, settlement |
| 2 | `hono-compute-provider/` | `publicdomainrelay/compute-provider-digitalocean` | 16 | Compute provisioning (local container/QEMU, DO, OIDC, RBAC) |
| 3 | `did-key-relay/` | `publicdomainrelay/did-key-relay` | 11 | WebSocket relay, tunnel, subscriber |
| 4 | `typescript-helpers/` | `publicdomainrelay/typescript-helpers` | 14 | Cross-repo shared (logger, serve, CLI args, firehose) |
| 5 | `hono-pds/` | `publicdomainrelay/hono-pds` | 4 | AT Protocol PDS (repo storage, accounts) |
| 6 | `deno-worker-sandbox/` | `publicdomainrelay/deno-hono-sandbox` | 10 | Deno Worker sandbox, compute-deno XRPC |
| 7 | `deno-macos-runner-desktop/` | `publicdomainrelay/deno-macos-runner-desktop` | 16 | Desktop tray bidder, OAuth, secret stores |
| 8 | `atproto-relay/` | `publicdomainrelay/atproto-relay` | 5 | AT Protocol firehose relay |
| 9 | `hono-jsr/` | `publicdomainrelay/hono-package-registry` | 6 | JSR package registry |
| 10 | `open-architecture/` | `publicdomainrelay/open-architecture` | 8 | Docs-as-code Alice stubs |
| 11 | `compute-contract/` | `publicdomainrelay/compute-contract` | — | Lexicon schemas only |
| 12 | `compute-spa/` | `publicdomainrelay/org-root-dispatcher-typescript` | — | Browser SPA |
| 13 | `compute-contract-full-flow/` | same as #12 | — | Single-process e2e test |
| 14 | `did-key-associator/` | `publicdomainrelay/did-key-associator` | — | QR association webapp |
| 15 | `atproto-reverse-proxy/` | `publicdomainrelay/atproto-reverse-proxy` | — | Go Caddy reverse proxy |

**Cross-repo deps:** `typescript-helpers` ← all repos. `atproto-market` → `did-key-relay`, `hono-pds`, `hono-compute-provider`.

### Production Startup Order

Infrastructure MUST start before participants. Exact order:

```
1. Container runtime  (macOS: container system start, Linux: docker daemon)
2. Dispatcher         deno run -A did-key-relay/hono-did-key-relay-relayer/mod.ts --hostname xrpc.fedproxy.com
3. PLC directory      (https://plc.directory or self-hosted)
4. Compute provider   deno run -A hono-compute-provider/hono-compute-provider/mod.ts --provider local
5. Bidder             deno run -A atproto-market/hono-bidder/mod.ts \
                        --compute-provider-local --relay-dispatcher-host xrpc.fedproxy.com
6. Requester          deno run -A atproto-market/request-vm-ssh/mod.ts \
                        --dispatcher-host xrpc.fedproxy.com --bidder-dids <did>
   OR Gateway         deno run -A atproto-market/hono-compute-contract-gateway/mod.ts --port 2585
```

**Why this order:** dispatcher + PLC have zero deps. Bidder needs dispatcher for relay WS + PLC for DID resolution. Requester/gateway needs dispatcher + PLC + bidder with offering published.

### Single-Process E2E

One command, all infrastructure in-process:
```bash
cd atproto-market
deno run --allow-all compute-contract-full-flow/run_full_flow.ts
```
Starts dispatcher, fake PLC, bidder (local container), requester — drives full RFP→bid→accept→provision→SSH. Writes `SUMMARY.md`, `full-flow.log`, `atproto-records.json`.

### E2E Trace (from actual run)

**Timeline** (77.6s total):
| Time | Event |
|------|-------|
| T+0ms | Script start |
| T+43ms | All infra ready (dispatcher, PLC, bidder PDS, relays, requester) |
| T+50ms | `compute.vm` record created |
| T+51ms | `market.rfp` signed |
| T+65ms | `market.bid` signed (bidder responded in ~14ms) |
| T+15,076ms | `market.accept` signed (15s bid window) |
| T+15,084ms | `market.receipt` signed (8ms bidder processing) |
| T+77,629ms | Flow complete. `sshReady: false` |

**SSH failure root cause:** `setup-websocat.path` in cloud-init watches for `PathExists=/root/secrets/digitalocean.com/serviceaccount/token`. This DO token path never appears in local containers → websocat + fedproxy-client never installed → relay tunnel never completes → requester SSH polls time out after 60s.

### Test Commands

52 test files, ~200 tests across 9 workspaces. Key test invocations:

```bash
# Full polyrepo test suite
deno run -A scripts/test-all.ts

# Canonical bidder integration (dispatcher + fake PLC + bidder + requester in-process)
deno test --allow-all atproto-market/test/bidder_container_integration_test.ts

# Gateway VM integration
deno test --allow-all atproto-market/test/gateway_request_vm_integration_test.ts

# Cross-platform (subprocess bidder + SSH)
deno test --allow-all atproto-market/test/bidder_cross_platform_integration_test.ts

# Per-workspace tasks
deno task test                    # hono-pds, deno-worker-sandbox, hono-jsr, typescript-helpers
deno task test:all               # hono-compute-provider (all 8 integration tests)

# Prod tests (conditionally skipped, DENO_TEST_PROD=1 to force)
deno test --allow-all atproto-market/test/bidder_prod_integration_test.ts
```

**Ignored tests:** `bidder_ssh_relay_test.ts` (hard ignore — needs JSR registry harness), `bidder_prod_integration_test.ts` + `bidder_policy_only_me_integration_test.ts` (conditional — probes prod infra reachability).

### Deno Tasks

| Repo | Tasks |
|------|-------|
| `atproto-market` | `check`, `generate-lexicons`, `test:readme` |
| `hono-compute-provider` | `test`, `test:cli`, `test:integration`, `test:oidc`, `test:oidc-rbac`, `test:oidc-rbac-container`, `test:oidc-rbac-vm`, `test:integration:qemu`, `build:vm`, `test:all` |
| `deno-worker-sandbox` | `check`, `dev`, `dev:compute`, `test`, `test:sandbox`, `test:factory`, `test:compute`, `test:integration`, `test:cli`, `fmt` |
| `hono-pds` | `check`, `test`, `test:sandbox`, `test:conformance`, `test:integration`, `test:cli`, `fmt` |
| `typescript-helpers` | `test`, `test:pure`, `test:hono`, `test:cli` |
| `hono-jsr` | `test`, `test:cli` |

### CLI Entrypoints (17 total)

Every CLI follows same pattern: `cli-args-env.json` option defs → `Command("CONFIG_PATH_*")` → `config.json` → factory → `createServe` → `serve.beginServe()`.

**Compute contract flow CLIs:**

| CLI | Config Path Env | Key Flags |
|-----|----------------|-----------|
| `request-vm-ssh` | `CONFIG_PATH_REQUEST_VM_SSH` | 26 options: `--bid-window-sec`, `--exec`, `--keep-vm`, `--skip-ssh`, `--policy-mode`, `--bidder-dids` |
| `hono-bidder` | `CONFIG_PATH_HONO_BIDDER` | 28 options: `--compute-provider-local`, `--accept-scope`, `--rfp-firehose-mode`, `--offering-refresh-sec` |
| `hono-compute-contract-gateway` | `CONFIG_PATH_HONO_COMPUTE_CONTRACT_GATEWAY` | 10 options: `--port`, `--dispatcher-host`, `--fedproxy-host`, `--relay-urls` |
| `hono-compute-provider` | `CONFIG_PATH_HONO_COMPUTE_PROVIDER` | 13 options: `--provider`, `--container-mode`, `--do-token` |
| `hono-policy` | `CONFIG_PATH_HONO_POLICY` | 5 options: `--policy`, `--strict-auth` |

### Complete Env Var Reference (compute contract flow subset)

**Requester (`request-vm-ssh`):**
`PORT`, `REPO_PRIVATE_KEY_HEX`, `REPO_PRIVATE_KEY_HEX_PATH`, `PLC_DIRECTORY_URL`, `DISPATCHER_HOST`, `FEDPROXY_HOST`, `REQUESTER_LABEL`, `VM_NAME`, `BID_WINDOW_SEC`, `EXEC_PROGRAM`, `VM_READY_TIMEOUT_SEC`, `KEEP_VM`, `SKIP_SSH`, `BIDDER_DIDS`, `DENY_BIDDER_DIDS`, `RELAY_URL`, `OFFERING_FIREHOSE_MODE`, `OFFERING_FIREHOSE_URL`, `SERVE_ADDR`, `SERVE_UNIX`, `USER_DATA`, `POLICY_MODE`, `POLICY_ENGINE_ENDPOINT`, `PDS_STATE_PATH`, `SKIP_RBAC`, `ATPROTO_DID`

**Bidder (`hono-bidder`):**
`SERVICE_NAME`, `REPO_PRIVATE_KEY_HEX`, `REPO_PRIVATE_KEY_HEX_PATH`, `PLC_DIRECTORY_URL`, `RELAY_DISPATCHER_HOST`, `REGISTRY_ENDPOINT`, `ATP_HANDLE`, `ATP_PASSWORD`, `ATP_PDS_URL`, `COMPUTE_PROVIDER_DO_TOKEN`, `COMPUTE_PROVIDER_DO_BASE_URL`, `COMPUTE_PROVIDER_LOCAL_MODE`, `COMPUTE_PROVIDER_LOCAL_VM_IMAGE`, `COMPUTE_PROVIDER_LOCAL_CONTAINER_IMAGE`, `COMPUTE_PROVIDER_LOCAL_CACHE_DIR`, `WORKER_PERMISSION_MODE`, `SERVE_ADDR`, `SERVE_PORT`, `SERVE_UNIX`, `RFP_FIREHOSE_MODE`, `RFP_FIREHOSE_URL`, `NO_QR`, `PDS_STATE_PATH`, `ACCEPT_SCOPE`, `OFFERING_REFRESH_SEC`

**Direct-read env vars (bypass CLI chain — anti-pattern):**
`COMPUTE_PROVIDER_REGION`, `COMPUTE_PROVIDER_SIZE`, `COMPUTE_PROVIDER_IMAGE`, `CONTAINER_MODE`, `VM_IMAGE`, `CONTAINER_IMAGE`, `CACHE_DIR` — read in `compute-provider-local/mod.ts` directly

### Codegraph Cheatsheet

Single index at org root: 1,208 files, 16,307 nodes, 46,838 edges. One `codegraph explore` replaces 3-15 Read+Grep calls.

**Best queries per flow stage:**

| Stage | Query |
|-------|-------|
| Full architecture | `codegraph explore "whatAliceIs theInfiniteLoop puttingItTogether"` |
| Requester flow | `codegraph explore "runComputeContract createRequesterPDS"` |
| Bidder flow | `codegraph explore "createMarketBidder createVmBidderCallbacks"` |
| Provisioning | `codegraph explore "buildDefaultUserData provisionLocal runContainer"` |
| Relay tunnel | `codegraph explore "createXrpcRelay createSubscriber startTunnel"` |
| Attestation | `codegraph explore "verifyRecordSignatures verifyRemoteProof createAttestationCid"` |
| Settlement | `codegraph explore "settleFreeGrant settleX402Payment mintReceiptForAccepts"` |
| Policy | `codegraph explore "evaluateRfpPolicy createOnlyMePolicy createDirectNetworkPolicy"` |
| Discovery | `codegraph explore "discoverBiddersFromRelay offering refresh listReposByCollection"` |
| Gateway | `codegraph explore "createComputeContractGateway requestComputeVM"` |

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/find-all-package.ts` | Discover all packages across polyrepo |
| `scripts/test-all.ts` | Run all tests in parallel across workspaces |
| `scripts/commit-and-push-all.ts` | Commit+push across multiple repos |
| `scripts/install-prod.ts` | Deploy all prod services (clone, systemd, Caddyfile) |
| `scripts/poly-repo-status-report.ts` | Git status across all repos |
| `scripts/submodules-to-main.ts` | Update submodules to latest main |
| `atproto-reverse-proxy/scripts/deploy.sh` | Deploy Go fedproxy |
| `compute-spa/scripts/deploy.sh` | Deploy browser SPA |
| `did-key-associator/scripts/deploy.sh` | Deploy QR associator |
| `open-architecture/scripts/report-alice-architecture.ts` | Architecture report generator |

### Package Coverage: 137 packages across 13 repos

**57** explicitly named in flow map. **71** supplemental (common/abc/CLI/infra). **8** Alice stubs (docs-as-code, not production). **1** standalone script (`compute-contract-full-flow`).

**Coverage gaps:**
- `atproto-relay` (5 pkgs) — collection-indexing firehose proxy. NOT the same as `did-key-relay` tunnel relay. Two relay systems.
- `deno-macos-runner-desktop` (16 pkgs) — desktop identity stack: badge-blue-keys, device-key, secret-store, OAuth
- `hono-jsr` (5 pkgs) — JSR package registry (separate concept)
- `deno-worker-sandbox` (9/10 pkgs) — worker ABC packages not individually named

### Two Relay Systems (architecture clarification)

| System | Repo | Role |
|--------|------|------|
| `did-key-relay` | `did-key-relay` | **Tunnel proxy** — SNI subdomain routing, nonce auth, subscriber byte-bridging to sshd |
| `atproto-relay` | `atproto-relay` | **Collection index proxy** — subscribes to PDS firehoses, indexes `collection → [DIDs]`, serves `listReposByCollection` |

The flow map's "Relay architecture" section describes `atproto-relay` functionality (firehose subscription, Deno.Kv collection index) but previously named `did-key-relay` packages. These are distinct systems with different ABC interfaces, implementations, and CLIs.

---

## Quick Reference: Exact Commands to Run

Commands extracted from `~/.bash_history` + derived from source analysis.

### Prerequisites

```bash
# macOS container runtime
container system start

# OR Linux Docker
sudo systemctl start docker
```

### Bidder (start first, needs container runtime)

```bash
cd ~/src/publicdomainrelay/atproto-market

# Minimal bidder with local container provider + only_me scope
deno run -A hono-bidder/mod.ts \
  --accept-scope only_me \
  --private-key-hex-path ~/Documents/bidder-private-key.hex \
  --pds-state-path ~/Documents/bidder-pds-state.db \
  --compute-provider-local

# With explicit container mode
deno run -A hono-bidder/mod.ts \
  --accept-scope only_me \
  --private-key-hex-path ~/Documents/bidder-private-key.hex \
  --pds-state-path ~/Documents/bidder-pds-state.db \
  --compute-provider-local \
  --compute-provider-local-container-mode container

# Full production bidder (DO + local + firehose)
deno run -A hono-bidder/mod.ts \
  --relay-dispatcher-host xrpc.fedproxy.com \
  --plc-directory-url https://plc.directory \
  --compute-provider-local \
  --compute-provider-local-container-mode container \
  --serve-port 0 \
  --offering-refresh-sec 300
```

### Requester (start after bidder)

```bash
cd ~/src/publicdomainrelay/atproto-market

# Minimal requester with only_me policy, 3s bid window
deno run -A request-vm-ssh/mod.ts \
  --policy-mode only_me \
  --bid-window-sec 3 \
  --private-key-hex-path ~/Documents/requester-private-key.hex \
  --pds-state-path ~/Documents/requester-pds-state.db

# With longer bid window + custom exec
deno run -A request-vm-ssh/mod.ts \
  --policy-mode only_me \
  --bid-window-sec 10 \
  --exec "hostname; echo PASS; id -un"

# Skip SSH (testing)
deno run -A request-vm-ssh/mod.ts \
  --skip-ssh \
  --keep-vm \
  --bid-window-sec 3
```

### Desktop Bidder (macOS tray app)

```bash
cd ~/src/publicdomainrelay/deno-macos-runner-desktop

# Build .app bundle
./rebuild.sh

# Log tail (structured JSON streaming)
tail -n 9999999 -F /tmp/deno-macos-runner-desktop.log | \
  jq -rR --unbuffered '(fromjson? // .)'
```

### Container Management

```bash
# View logs of most recently created container
container logs -f $(container list --format json | jq -r 'sort_by(.configuration.creationDate) | last | .id')

# Kill and remove ALL containers
container kill $(container list -qa); container rm $(container list -qa)

# Docker equivalent
docker kill $(docker ps -qa); docker rm $(docker ps -qa)
```

### E2E Test (single process)

```bash
cd ~/src/publicdomainrelay/atproto-market

# Full flow: dispatcher + fake PLC + bidder + requester → provision → SSH
deno run --allow-all compute-contract-full-flow/run_full_flow.ts
```

### Integration Tests

```bash
cd ~/src/publicdomainrelay/atproto-market

# Canonical bidder integration
deno test --allow-all test/bidder_container_integration_test.ts

# Gateway VM + SSH
deno test --allow-all test/gateway_request_vm_integration_test.ts
deno test --allow-all test/gateway_ssh_integration_test.ts

# Policy
deno test --allow-all test/policy_remote_test.ts
deno test --allow-all test/policy_server_test.ts

# Cross-platform (subprocess bidder)
deno test --allow-all test/bidder_cross_platform_integration_test.ts

# Prod tests (conditional — DENO_TEST_PROD=1 to force)
deno test --allow-all test/bidder_prod_integration_test.ts

cd ~/src/publicdomainrelay/hono-compute-provider
deno task test:all

cd ~/src/publicdomainrelay
deno run -A scripts/test-all.ts
```

### Type Checking & Package Discovery

```bash
cd ~/src/publicdomainrelay

# List all packages across polyrepo
./scripts/find-all-package.ts | python3 -c "import sys,json; [print(p['name'], p['path']) for p in json.load(sys.stdin)]"

# Type-check specific modules
cd atproto-market && deno check lib/abc/market/mod.ts lib/market-atproto/mod.ts
cd hono-compute-provider && deno check lib/abc/compute-provider/mod.ts lib/compute-provider-local/mod.ts
cd hono-pds && deno task check
cd deno-worker-sandbox && deno task check

# Git status across all repos
deno run -A scripts/poly-repo-status-report.ts
```

### Codegraph Exploration

```bash
cd ~/src/publicdomainrelay

# Full architecture walk
codegraph explore "whatAliceIs theInfiniteLoop puttingItTogether"

# Requester flow
codegraph explore "runComputeContract createRequesterPDS discoverBiddersFromRelay"

# Bidder flow
codegraph explore "createMarketBidder createVmBidderCallbacks provisionLocal"

# Relay tunnel
codegraph explore "createXrpcRelay createSubscriber startTunnel tunnelOverRelay"

# Attestation chain
codegraph explore "verifyRecordSignatures verifyRemoteProof createAttestationCid"
```

### Key File Paths (relative to org root)

```
~/Documents/bidder-private-key.hex       — bidder secp256k1 key
~/Documents/requester-private-key.hex    — requester secp256k1 key
~/Documents/bidder-pds-state.db          — bidder PDS Deno.Kv store
~/Documents/requester-pds-state.db       — requester PDS Deno.Kv store
/tmp/deno-macos-runner-desktop.log       — desktop bidder structured log
~/.cache/pdr-local/                      — local provider cache (container images, temp cloud-init files)
```

### PDS (Personal Data Server)

```bash
cd ~/src/publicdomainrelay/hono-pds

# Default (port 2583, generates random keypair, no did:web services)
deno run -A main.ts

# With custom port + persisted key
deno run -A main.ts \
  --port 2583 \
  --private-key-hex <64-char-hex> \
  --public-hostname pds.example.com \
  --crawlers "https://reg.market.fedfork.com" \
  --did-web-services '[{"id":"pdr_temp_market","type":"PDRTempMarket"}]'

# CONFIG_PATH override
CONFIG_PATH_HONO_PDS=/etc/pds/prod.json deno run -A main.ts
```

**Options:** `--port` (default 2583), `--hostname` (default 127.0.0.1), `--private-key-hex`, `--did-web-services` (JSON array), `--public-hostname` (for requestCrawl), `--crawlers` (comma-separated relay URLs). Env vars: `PORT`, `HOSTNAME`, `PDS_PRIVATE_KEY_HEX`, `PDS_DID_WEB_SERVICES`, `PDS_PUBLIC_HOSTNAME`, `PDS_CRAWLERS`.

**PDS serves:** `GET /xrpc/_health`, `GET /.well-known/atproto-did`, `GET /.well-known/did.json` (if `didWebServices` set), `POST /xrpc/com.atproto.repo.createRecord`, `GET /xrpc/com.atproto.repo.getRecord`, `GET /xrpc/com.atproto.repo.listRecords`, `POST /xrpc/com.atproto.repo.applyWrites`, `POST /xrpc/com.atproto.server.createAccount`, `POST /xrpc/com.atproto.server.createSession`, `GET /xrpc/com.atproto.server.getServiceAuth`, `GET /xrpc/com.atproto.sync.getRepo` (CAR export), `GET /xrpc/com.atproto.sync.subscribeRepos` (WebSocket firehose).

**State:** Deno.Kv stored at default path (no `--storage-path` flag — uses `Deno.KvStorage.create()` without arg). Key is ephemeral unless `--private-key-hex` is set.

### JSR Package Registry

```bash
cd ~/src/publicdomainrelay/hono-jsr

# Default (local store, port 8080, passthrough to jsr.io)
deno run -A hono-package-registry/main.ts

# Serve polyrepo packages (base-dir = org root)
deno run -A hono-package-registry/main.ts \
  --store local \
  --base-dir .. \
  --port 5556

# Git-backed store
deno run -A hono-package-registry/main.ts \
  --store git \
  --git-url https://github.com/publicdomainrelay/typescript-helpers.git

# Multi-store from config file
deno run -A hono-package-registry/main.ts \
  --stores-config ./stores.json \
  --port 8080

# No passthrough (standalone, won't fall back to jsr.io)
deno run -A hono-package-registry/main.ts \
  --no-passthrough \
  --port 5556
```

**Options:** `--store` (local/git, default local), `--base-dir` (default ./packages), `--git-url`, `--stores-config` (JSON file), `--port` (default 8080), `--passthrough`/`--no-passthrough` (default true), `--fallback-version` (default 0.0.0), `--log-level` (default info). Env vars: `PORT`, `LOG_LEVEL`. Config path: `CONFIG_PATH_HONO_PACKAGE_REGISTRY`.

**Serves:** JSR-compatible package registry at `/`. Scans `base-dir` for packages with `deno.json` containing `name` + `version` + `exports`. Falls through to jsr.io when `--passthrough` (default). Emits `{"event":"registry_ready","port":N}` on stdout for test harness.

### Market Relay (AT Protocol Firehose Relay)

```bash
cd ~/src/publicdomainrelay/atproto-relay

# Default (port 2584, localhost)
deno run -A hono-atproto-relay/mod.ts

# Production
deno run -A hono-atproto-relay/mod.ts \
  --port 2584 \
  --hostname relay.example.com

# Local dev (patches fetch+WebSocket for *.localhost → dispatcher)
deno run -A hono-atproto-relay/mod.ts \
  --port 2584 \
  --local-dev-relay-port 5555
```

**Options:** `--port` (default 2584), `--hostname` (default 127.0.0.1), `--local-dev-relay-port` (patches fetch+WebSocket to route `*.localhost` through dispatcher). Env vars: `PORT`, `HOSTNAME`. Config path: `CONFIG_PATH_HONO_ATPROTO_RELAY`.

**Serves:** `POST /xrpc/com.atproto.sync.requestCrawl` (register PDS), `GET /xrpc/com.atproto.sync.listReposByCollection?collection=<NSID>` (discover DIDs with records in collection), `GET /xrpc/com.atproto.sync.subscribeRepos` (WebSocket firehose relay — replays backfill then live frames).

**State:** In-memory Deno.Kv (`Deno.openKv(":memory:")`). No persistence. Indexes `["host", hostname]`, `["account", did]`, `["collection", nsid, did]`.

### Full Local Dev Stack (all three + dispatcher)

Start in order, each in its own terminal:

```bash
# Terminal 1: Dispatcher (did-key-relay)
cd ~/src/publicdomainrelay/did-key-relay
deno run -A hono-did-key-relay-relayer/mod.ts --hostname localhost --port 5555

# Terminal 2: Market relay (atproto-relay) — indexes collections
cd ~/src/publicdomainrelay/atproto-relay
deno run -A hono-atproto-relay/mod.ts \
  --port 2584 \
  --local-dev-relay-port 5555

# Terminal 3: PDS — stores records
cd ~/src/publicdomainrelay/hono-pds
deno run -A main.ts --port 2583

# Terminal 4: JSR registry — serves packages to guest containers
cd ~/src/publicdomainrelay/hono-jsr
deno run -A hono-package-registry/main.ts \
  --base-dir .. \
  --port 5556 \
  --no-passthrough

# Terminal 5: Bidder (registers PDS with relay, watches firehose)
cd ~/src/publicdomainrelay/atproto-market
deno run -A hono-bidder/mod.ts \
  --compute-provider-local \
  --relay-dispatcher-host localhost:5555 \
  --registry-endpoint http://127.0.0.1:2584 \
  --serve-port 0

# Terminal 6: Requester (drives RFP flow)
cd ~/src/publicdomainrelay/atproto-market
deno run -A request-vm-ssh/mod.ts \
  --dispatcher-host localhost:5555 \
  --relay-url http://127.0.0.1:2584 \
  --bid-window-sec 3 \
  --exec hostname
```

Alternatively, run everything in one process:
```bash
cd ~/src/publicdomainrelay/atproto-market
deno run --allow-all compute-contract-full-flow/run_full_flow.ts
```
This script stands up dispatcher + fake PLC + atproto-relay + bidder + requester automatically.

```bash
cd ~/src/publicdomainrelay

# Deploy all services (clone repos, systemd units, Caddyfile)
deno run -A scripts/install-prod.ts

# Deploy individual services
cd atproto-reverse-proxy && bash scripts/deploy.sh    # Go fedproxy → fedproxy.com
cd compute-spa && bash scripts/deploy.sh              # Browser SPA → compute.fedfork.com
cd did-key-associator && bash scripts/deploy.sh       # QR associator → qr.fedfork.com
cd deno-macos-runner-desktop && bash scripts/deploy.sh # Tray UI → tray.fedfork.com
```

---

## Guest Tunnel Transport (did-key-ingress-proxy)

Replaces the legacy fedproxy-client + Go atprp-ssh-relay stack. Guest VMs run
the tunnel-subscriber (Deno CLI) which connects outbound to the dispatcher at
`xrpc.fedproxy.com`, registers a subdomain derived from its secp256k1 keypair,
and bridges dispatcher tunnel bytes directly to sshd on `127.0.0.1:22`.

### Files

| File | Role |
|------|------|
| `did-key-ingress-proxy/hono-did-key-ingress-proxy-tunnel-subscriber/mod.ts` | Guest-side tunnel agent CLI |
| `did-key-ingress-proxy/lib/did-key-ingress-proxy-subscriber-xrpc/mod.ts` | `createSubscriber`, `startTunnel`, `tunnelOverRelay` |
| `did-key-ingress-proxy/lib/hono-factory-did-key-ingress-proxy-xrpc/mod.ts` | Dispatcher: nonce, subscribe WS, subdomain routing |
| `atproto-market/lib/common/cloud-init-common/mod.ts` | `buildTunnelUserData`: cloud-init for tunnel-subscriber |
| `hono-compute-provider/lib/compute-provider-local/mod.ts` | Ephemeral JSR mount on provider serve |
| `hono-compute-provider/lib/oidc-issuer-hono/mod.ts` | `ProvisioningData.create`: onNetwork + JSR injection |
| `atproto-market/lib/market-bidder/mod.ts` | `/v1/on-network` endpoint, `acceptToContract` map |
| `atproto-market/lib/market-bidder-compute/mod.ts` | acceptToContract population at receipt creation |
| `atproto-market/lib/requester-xrpc/mod.ts` | Firehose onNetwork discovery, dispatcher tunnel SSH |

### Flow

```
Guest boots (cloud-init)
  → tunnel-subscriber.service starts
    → deno run jsr:@publicdomainrelay/hono-did-key-ingress-proxy-tunnel-subscriber
    → derives secp256k1 keypair from SSH host key
    → nonce challenge/response with dispatcher
    → WebSocket connect → #registered { subdomain, ingressRef }
    → writes FQDN to /run/guest-fqdn
    → bridges WebSocket ↔ Deno.connect(127.0.0.1:22)
  → provisioning-token.service → OIDC token obtained
  → guest-onnetwork.service → POST /v1/on-network { acceptUri, acceptCid, address: fqdn }

Requester SSH:
  ssh -o ProxyCommand='websocat --binary wss://<subdomain>.xrpc.fedproxy.com/...tunnel' root@<fqdn>
    → dispatcher routes by subdomain → tunnel subscriber → sshd
```

### SSH ProxyCommand

```
websocat --binary wss://did-key-<slug>.xrpc.fedproxy.com/xrpc/com.fedproxy.temp.xrpc.tunnel
```

## onNetwork Event Flow

### Guest POST → Provider → Bidder PDS → Firehose → Requester

1. Guest cloud-init `guest-onnetwork.service` (oneshot) waits for
   `/run/guest-fqdn` written by tunnel subscriber
2. Reads `accept.json` for `acceptUri`/`acceptCid`
3. Reads OIDC workload token from `/root/secrets/digitalocean.com/serviceaccount/token`
4. POSTs to provider serve `/v1/on-network` with `{ acceptUri, acceptCid, address, createdAt }`
5. Provider validates OIDC token (Bearer auth, exp check)
6. Provider creates `compute.events.vm.onNetwork` record on bidder PDS via `atproto.createRecord`
7. Provider wraps in `market.event` with receipt strongRef (from `acceptToContract` map)
8. Firehose distributes to Bluesky relay → requester's firehose watcher
9. Requester extracts FQDN from address field → resolves `vmFqdnReady` promise
10. Requester SSHes through dispatcher tunnel

### acceptToContract Map

Keyed by `acceptUri#acceptCid`, maps to `{ receiptKey, receiptUri, receiptCid, submitEventUrl }`.
Populated at receipt creation in `market-bidder-compute::onAccept`. Created in `hono-bidder`
and shared between bidder and provider serves.

## Ephemeral JSR Registry

Each compute provider mounts a hono-jsr package registry on its relay subdomain
(at provider `serve.onConnected`). Serves workspace packages from the org root
directory. Guest's tunnel subscriber pulls dependencies at boot via
`JSR_URL=https://<provider-subdomain>.<host>/` (injected into cloud-init by
`ProvisioningData.create`).
