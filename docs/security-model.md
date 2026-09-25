# Security model

> Summary of principles. Exact rules, configuration and credential handling are private.

## Trust boundaries

1. **Workloads → control plane.** Each workload has its own local credential. Authentication can be switched off for development, but deployments on the target machine are meant to require it.
2. **Control plane → inference runtime.** A narrow provider boundary with timeouts. Endpoints and credentials stay server-side.
3. **Control plane → compute plane.** A local-only authenticated channel. Operations name registered service ids, never commands.
4. **Browser → control plane.** The Control Room is read-only and validates every response. Nothing it fetches, and no credential, is kept in browser storage.

## Principles

- **Local by default.** The service binds to the local machine and is not designed to be exposed publicly.
- **Authorize before work.** Capability checks happen before routing or inference.
- **Least privilege per workload.** Capability allowlists; disabled workloads are refused.
- **No arbitrary execution.** The compute plane runs only pre-registered services, without a shell.
- **Media URLs.** Media URLs are denied by default and allowed only for HTTPS hosts on an exact allowlist. HALO doesn't fetch, cache or store media.
- **Content minimization.** Activity records hold metadata only: no prompts, outputs, embeddings, URLs, headers or credentials.
- **Telemetry hygiene.** No identifiers such as serials, MAC or IP addresses, usernames or paths.
- **Truthful failure.** Degraded or disabled components report their state rather than returning defaults.

## Out of scope for this repository

This public edition contains no configuration files, environment variables, credential formats, network details, or the exact authorization rules.
