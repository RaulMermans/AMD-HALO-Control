# Service runtime

> Public edition. Describes behaviour and boundaries; commands, paths, ports and configuration are private.

HALO needs to start and stop local processes (a model runtime, a workload's worker) without becoming a general process launcher. The service runtime is the narrow piece that does this.

## What is registered

The compute-plane daemon owns a strict, versioned **service registry**. Each entry binds a service id to an owning application, an absolute executable with an explicit argument list, a dependency list and a graceful-stop window. The registry shipped with the code is empty; a machine-local registry is optional and loaded only by the daemon.

Runtime state is held separately from that configuration, and is never written back into it.

## What is allowed to run

Only registered services. The control plane can send exactly four operations, each naming a registered id:

| Operation | Effect |
| --- | --- |
| `inspect_service` | Report observed state |
| `start_service` | Start the registered process if it isn't running |
| `stop_service` | Graceful stop with a bounded wait |
| `restart_service` | Stop, then start |

A request can't carry an executable, arguments, a shell string, environment variables, a working directory or a process id. There is no endpoint where those could be expressed.

## Identity and ownership

- **Service identity** is the registry id, resolved daemon-side. The caller never supplies what the id means.
- **Lifecycle ownership** belongs to the daemon that created the process. It keeps the exact child handle, observes exits, and only ever signals processes it started itself. It never adopts a process by searching for a name, PID or port.
- Processes start without a shell and without inheriting the daemon's environment. Workload bindings (storage, database and job references) are passed through a fixed renderer as references, never as secrets, paths or caller-chosen variables.
- Lifecycle mutations are serialized per service.

## Desired vs observed state

Two different facts, owned by two different planes:

- **Desired**: the control plane's workload registry says which services an application should have.
- **Observed**: the daemon reports what is actually running, stopped, exited, failed or unknown.

The control plane never invents observed state. If the daemon is unreachable, infrastructure is reported as unavailable and every unrelated API keeps working.

Operators don't press "start" on a service. The governed path is: change desired state → preview a reconciliation plan → approve it → the reconciler applies it and re-observes after every step. See [operations-and-recovery.md](operations-and-recovery.md).

## Authorization

- Control plane ↔ daemon: an authenticated, local-only IPC channel with no network listener.
- Operator mutations: an authenticated local operator session, a deterministic action policy, a durable approval bound to the exact proposal, and revalidation at execution time (see [security-model.md](security-model.md)).
- Workload credentials can request inference capabilities; they can never reach an infrastructure mutation.

## Failures

| Situation | Behaviour |
| --- | --- |
| Process exits | Observed and reported as exited. Never restarted automatically. |
| Graceful stop times out | Typed failure; no silent escalation to a hard kill |
| Daemon died uncleanly while a child may be alive | A durable service-process ledger marks that service `unknown`; start and stop are refused until an operator inspects it. "No owned state" is never reported for it. |
| Reconciliation interrupted mid-apply | Marked interrupted on startup, never resumed blindly; the next run re-observes everything |

## Deliberately not supported

Arbitrary shell execution, `sudo`/root, systemd units, automatic restart policies, log streaming, process discovery, and anonymous lifecycle endpoints. A future Linux provider may implement the same interface on systemd once it can be exercised on the target machine.

## Why no shell

A shell or a generic "run this" API would make the service registry meaningless as an authority boundary: any caller able to reach it could run anything. Restricting the vocabulary to *registered id + verb* means the worst a compromised caller can do is start or stop something the owner already registered.

## Evidence

Local, real child processes managed by the real daemon over the real local channel (`local-real-service-runtime`): start, inspect, stop, restart, crash observation, stop timeout and unclean-daemon-loss handling. Not verified: systemd supervision, reboot recovery, production workloads, and anything on the AMD Halo target.

Contract: [`interfaces/infrastructure.ts`](../interfaces/infrastructure.ts).
