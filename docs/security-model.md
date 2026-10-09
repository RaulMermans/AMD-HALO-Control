# Security model

> Summary of principles. Exact rules, configuration and credential handling are private.

## Trust boundaries

1. **Workloads → control plane.** Each workload has its own local credential. Authentication can be switched off for development, but deployments on the target machine are meant to require it.
2. **Control plane → inference runtime.** A narrow provider boundary with timeouts. Endpoints and credentials stay server-side.
3. **Control plane → compute plane.** A local-only authenticated channel. Operations name registered service ids, never commands.
4. **Browser → control plane.** The Control Room validates every response. Nothing it fetches, and no credential, is kept in browser storage.
5. **Operator → infrastructure.** Mutations require an authenticated local operator session. Workload credentials are refused on every operator route, even when valid.

## Operator governance

Six questions are answered separately and never collapsed into one flag:

| Question | Answered by |
| --- | --- |
| Who is the operator? | Local operator credential exchanged for a short-lived session |
| May they request this action now? | A deterministic, versioned action policy over a code-owned action registry |
| Did they approve this exact proposal? | A durable approval bound to the proposal digest and policy version |
| Did they accept a destructive action? | A typed confirmation derived server-side |
| Did it run? | The existing executor (reconciler, job queue, backup coordinator) |
| Did it work? | Independent re-observation of the postcondition |

- **Policy can only remove authority.** It can enable or disable registered actions; it can't lower a risk class, waive approval or add an action without an executor.
- **Execution-time revalidation.** Right before the side effect, session, policy, approval binding, expiry and the reviewed state are checked again. Any change invalidates the approval with zero mutations, and only one concurrent caller can execute.
- **Crash-safe.** An action interrupted mid-execution is marked interrupted on restart and never replayed; it's resolved only from authoritative records.
- **Force-read-only.** A global switch that outranks sessions, policy and approvals. Reads and diagnostics stay available, and no UI control can turn it off.
- **Admission is not authority.** Mutation routes also require a loopback peer and same-origin browser requests; when the service is bound beyond loopback, the mutation surface is disabled.
- **No model authority.** Agents may in future *create* proposals; humans and deterministic policy remain the authority.

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

This public edition contains no configuration files, environment variables, credential formats or locations, network details, session parameters, or the exact authorization and operator policies.
