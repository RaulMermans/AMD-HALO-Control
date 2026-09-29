# Workload management

HALO serves several local AI workloads. It treats them as **abstract consumers** with identities and permissions; their own implementations live in their own projects.

| Workload | Kind | Typical capabilities |
| --- | --- | --- |
| IRIS OS | Personal AI operating system | general, reasoning, embeddings |
| Open VS Code Agent | Local coding agent | coding, reasoning |
| Clipping Agents | Media pipeline | vision, general |
| Publishing Agents | Content pipeline | general |

(Capability grants shown here are illustrative. Example: [`examples/synthetic-workloads.json`](../examples/synthetic-workloads.json).)

## Application registry

Each workload is registered with an id, an enabled flag and a **capability allowlist**. On each request HALO:

1. **authenticates** the workload with its own local credential,
2. **authorizes** it: enabled, and granted the requested capability,
3. only then routes and runs inference, and records the outcome.

Credentials are never shown by inspection endpoints or in the Control Room.

## Compute plane and managed services

HALO also manages local services, such as starting or stopping a model runtime or a workload's worker, through a separate compute plane:

- The control plane sends a **typed operation on a registered service id**. It can't express a command, executable, arguments, environment or process id.
- A local daemon resolves the id against its **own** service registry and runs only what is registered there.
- The daemon tracks the child processes it started itself. It never adopts processes by searching for PIDs, names or ports.
- Start, stop and restart are serialized per service.
- The daemon runs behind a local-only, authenticated channel with no network listener.
- If the daemon is down, the control plane reports infrastructure as unavailable and keeps serving everything else.

Contract: [`interfaces/workload.ts`](../interfaces/workload.ts).
