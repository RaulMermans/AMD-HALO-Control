<div align="center">

# HALO Control

**The local control plane for an AMD Halo AI workstation.**

It tracks the hardware, the models, which workload may use which capability, how requests are routed to local inference, which services, storage and jobs each workload is allowed to have, and what actually ran, all on one machine with no cloud dependency.

![Status: public architecture edition](https://img.shields.io/badge/status-public%20architecture%20edition-555) ![Docs: CC BY 4.0](https://img.shields.io/badge/docs-CC%20BY%204.0-lightgrey) ![Code: MIT](https://img.shields.io/badge/code-MIT-lightgrey) ![Target hardware: not yet verified](https://img.shields.io/badge/target%20hardware-not%20yet%20verified-b58900)

![HALO Control Room — synthetic demo state](screenshots/control-room.png)

<sub>Control Room, recreated for this public edition with fully synthetic state and the project's real design tokens. No real machine, network or workload data is shown.</sub>

</div>

---

> **Public edition.** This repository is the public architecture and engineering edition of a private local-infrastructure project. It contains design documentation, illustrative contracts, a small illustrative routing function and synthetic data. It does **not** contain the production implementation, configuration or any infrastructure details. [Scope](#public-repository-scope).

## Architecture

```mermaid
flowchart TB
  HW[[AMD Halo hardware<br/>CPU · GPU · unified memory]] --> TEL[Telemetry layer<br/>evidence-tagged providers]
  TEL --> CORE

  subgraph CORE["Control plane (headless local service)"]
    direction LR
    REG[Model registry]
    INF[Inference provider boundary]
    RT[Capability router]
    APP[App registry]
    WRG[Workload registry]
    GOVN[Operator governance]
    AUTH[Authorization]
    ACT[(Activity store)]
  end

  CORE --> UI[Control Room<br/>read-first operator UI]

  subgraph CPL["Compute plane (separate local daemon)"]
    direction LR
    SVC[Service runtime<br/>registered processes only]
    REC[Reconciler]
    JOB[Durable jobs + worker]
    STO[Storage · database providers]
    BAK[Recovery points]
  end

  CORE <-->|desired state · approved operations / observed state| CPL
  INF <--> LLM[(Local runtime<br/>OpenAI-compatible)]

  J[IRIS OS] & V[Open VS Code Agent] & C[Clipping Agents] & P[Publishing Agents] -->|capability requests| AUTH
```

→ [docs/architecture.md](docs/architecture.md)

## Why HALO exists

Several local AI workloads share one machine: a personal AI operating system, a coding agent, media and publishing pipelines. Without a control plane, each one configures its own model endpoint, keeps its own logs, and competes for the same unified memory blindly. HALO centralizes the shared decisions (which models exist, who may use them for what, where requests go, what ran, whether the machine is healthy) and leaves each workload's logic to the workload.

It is infrastructure. It is not a chatbot or an agent, and it doesn't do any reasoning of its own.

## Major subsystems

| Subsystem | Responsibility |
| --- | --- |
| **Telemetry** | Machine health with an explicit evidence class per signal |
| **Model registry** | Versioned inventory of models, capabilities, context sizes and resource needs |
| **Inference boundary** | Provider-neutral local inference (disabled / mock / OpenAI-compatible HTTP) |
| **Capability router** | Capability → model, deterministic, declared policy, no silent fallback |
| **Application registry + authorization** | Per-workload identity and capability allowlists |
| **Activity store** | Local SQLite history of what ran; metadata only |
| **Workload registry** | Desired state per application: storage, database, job types, services |
| **Compute plane** | A separate daemon that owns execution and observed state: service runtime, reconciler, durable jobs, storage and database providers, recovery points |
| **Operator governance** | Local operator session, durable proposals and approvals, execution-time revalidation, global force-read-only |
| **Control Room** | Read-first operator UI that validates every response it renders; mutations go through approvals |

## Local inference

Workloads never call a model runtime directly. HALO resolves the capability to a registered model, checks that the model is enabled and capable, and calls the runtime through an OpenAI-compatible HTTP boundary with a timeout. The endpoints and internal model references stay server-side. Inference is **off by default** and has to be enabled explicitly. → [docs/local-first-design.md](docs/local-first-design.md)

## Model registry

Each model record holds its family, size, quantization, context window, capabilities, input modalities, approximate memory and provider. **Registration is not availability**: the registry says what HALO knows about, and the provider says what is actually loadable or loaded. → [docs/model-registry.md](docs/model-registry.md)

## Capability routing

```
Task → required capability → declared candidates → eligibility + resource checks → selected model & runtime
```

Today routing is deterministic and driven by versioned policy that is cross-checked against the registry at startup. An unroutable request is an explicit error. Resource-aware selection is the next step, and it is shown by a small illustrative router you can run:

```bash
node --experimental-strip-types examples/route-demo.ts
```

→ [docs/capability-routing.md](docs/capability-routing.md)

## Compute plane and service runtime

The control plane decides what *should* exist; a separate daemon executes and reports what *does*. It accepts a small set of typed operations on registered ids (no commands, no shell), tracks only processes it started, never restarts anything automatically, and reports a possibly orphaned process as `unknown` rather than guessing. Workload changes go through a previewed, digest-guarded, journalled reconciliation that an operator approves. → [docs/service-runtime.md](docs/service-runtime.md) · [docs/operations-and-recovery.md](docs/operations-and-recovery.md)

## Telemetry

CPU, GPU, unified memory (including the GPU-reserved share), temperature, active model, throughput and queue depth. Every signal carries an evidence class (`mocked`, `local-real`, `halo-real` or `unavailable`), so the Control Room never shows a guess as a measurement. Project reporting uses the same discipline with a wider vocabulary, and a higher class is never inferred from a lower one. → [docs/telemetry.md](docs/telemetry.md)

## Workloads

IRIS OS, Open VS Code Agent, Clipping Agents and Publishing Agents are registered as **abstract consumers**. Each has an id, an enabled flag and a capability allowlist, and the pipeline is authenticate → authorize → route → infer → record. → [docs/workload-management.md](docs/workload-management.md)

## Security model

- Local-only by design.
- Per-workload credentials, and authorization before any routing or inference.
- The compute plane accepts operations on registered service ids only: no commands, no shell.
- Infrastructure mutations need an authenticated local operator, a durable approval of the exact proposal, and revalidation at execution time. Workload credentials can't reach them.
- A global force-read-only switch outranks every session, policy and existing approval.
- Destructive actions, including production restore, are not enabled.
- Activity history stores metadata only.
- Telemetry excludes all identifiers.
- Media URLs are denied by default.

→ [docs/security-model.md](docs/security-model.md) · [SECURITY.md](SECURITY.md)

## Example synthetic state

| File | Contents |
| --- | --- |
| [`synthetic-telemetry.json`](examples/synthetic-telemetry.json) | A machine snapshot with utilization series |
| [`synthetic-models.json`](examples/synthetic-models.json) | Five example models across all capabilities |
| [`synthetic-workloads.json`](examples/synthetic-workloads.json) | Four workloads with capability grants |
| [`synthetic-activity.json`](examples/synthetic-activity.json) | Recent activity, including a denied request |

The Control Room image above is rendered from exactly these files.

## Current development status

The private implementation has reached a frozen **pre-Halo baseline**: everything that can be built and verified without the target machine is implemented and evaluated on a development workstation. The target hardware has not been brought up yet.

| Area | Status | Evidence |
| --- | --- | --- |
| Headless control plane, contracts, health/version/system APIs | Implemented | `local-real` |
| Model registry + inspection | Implemented (development example entries) | `local-real` |
| Deterministic capability routing | Implemented | `local-real` |
| Application identity + capability authorization | Implemented | `local-real` |
| SQLite activity history | Implemented | `durability-local-real` |
| Compute-plane daemon + service runtime (registered managed processes) | Implemented | `local-real-service-runtime` |
| Workload registry + deterministic reconciliation | Implemented | `local-real` |
| Durable job queue + separate worker | Implemented | `local-real`, crash recovery `recovery-local-real` |
| Governed storage allocation | Implemented | `local-real` |
| PostgreSQL provisioning | Implemented; real-server acceptance deferred | `deferred-to-hardware-phase` |
| Infrastructure audit events + diagnostics | Implemented | `local-real` |
| Recovery points + staging restore | Implemented; **production restore not enabled** | `local-real` |
| Operator auth, approval gates, force-read-only | Implemented | `security-local-real` |
| Failure-injection eval suites | 49/49 deterministic, 9/9 local real-fault (development workstation) | `mocked` / `local-real` |
| Control Room (read-first, infrastructure views, governed actions) | Implemented | `control-room-local-real` |
| Real workload requests reaching HALO (assistant, publishing, clipping) | Demonstrated, inference disabled | `application-real` |
| Real model runtime answering through HALO | **Not yet verified** | `unverified` |
| Running on the AMD Halo target hardware | **Not yet verified**: hardware bring-up pending | `unverified` |
| Resource & Capacity Manager, resource-aware routing | Specified; built from real hardware measurements | Illustrative code only |
| systemd supervision, reboot recovery | Hardware phase | `not-implemented` |

Maturity by capability on a 0–6 evidence scale: [docs/PROJECT_PROFILE.md](docs/PROJECT_PROFILE.md).

## Public repository scope

This is a public architecture and engineering edition of a private local-infrastructure project, and **the complete production implementation is not included**.

**Included:** design documentation written for this edition, illustrative TypeScript contracts, one illustrative routing function with a runnable demo, synthetic example data, and a Control Room recreation rendered from that data.

**Intentionally not included:** source code, configuration files, environment variables, ports, socket and filesystem paths, credentials and credential formats, network or machine details, bootstrap and hardware-detection scripts, the service registry, exact authorization and operator policies, the private routing policy, database schemas, and real activity, telemetry or audit logs.

This repository has its own history. It was not forked, mirrored or filtered from the private one.

---

<sub>© Raul Mermans · docs CC BY 4.0, code MIT (see [LICENSE](LICENSE)) · [SECURITY.md](SECURITY.md)</sub>
