# Project profile — 22 November 2026

HALO Control is a **single-host, local-first AI compute control plane** on AMD Halo hardware. The complete implementation is private; this public edition contains an architecture-oriented explanation, synthetic demonstrations and a [sanitized acceptance summary](PHYSICAL_ACCEPTANCE_2026-11-22.md).

**Evidence scale:** 0 Missing · 1 Researched · 2 Canonicalized · 3 Specified · 4 Implemented · 5 Evaluated within a stated boundary · 6 Production proven.

**Important:** Level 5 does not mean externally audited or production ready. No capability is assigned 6 based on this pilot. An observed hardware test does not imply ongoing availability or multi-host behavior.

| Dimension | Current evidence |
| --- | --- |
| Architecture | Headless control plane + separate compute-plane daemon; policy, workload, admission, operations and UI have distinct authorities |
| Runtime | Operator-reviewed local pilot on AMD Halo; real local inference and a governed two-runtime lifecycle were physically exercised |
| Last sanitized sync | 22 November 2026 (internal acceptance stages completed that morning) |
| External availability | No public production service; full runtime is not published |

## Capability maturity

| Capability | Evidence tier | Scope and constraint |
| --- | ---: | --- |
| Application identity and capability authorization | 5 | Evaluated in local and isolated tests; no outside customer audit |
| Model registry and deterministic routing | 5 | Requests to two approved model definitions exercised sequentially on hardware |
| Local inference provider boundary | 5 | Real Qwen3 4B-class model request completed through HALO |
| Admission control and occupancy awareness | 5 | Bounded, conservative physical tests; no capacity benchmark |
| Per-runtime resource observation | 5 | Process identity and VRAM evidence measured; missing values remain explicit |
| Governed multi-runtime start, reuse and stop | 5 | 14B-class model started, reused and safely stopped; in-flight stop refused |
| Request-to-runtime pin and dispatch lease | 5 | Sequential requests correctly attributed; stale route refusal covered by isolation tests |
| Coordinated Core/compute release activation | 5 | Physically activated a compatible pair; full rollback execution not in acceptance |
| Local activity and operator inspection | 5 | Operational state observed during physical qualification |
| Managed service runtime and reconciler | 5 | Evaluated in prior local/isolated scenarios |
| Durable work queue and recovery | 5 | Isolated fault/recovery suites; not equivalent to all reboot scenarios |
| PostgreSQL management | 4 | Implemented; acceptance of every live-database scenario not re-established in this scope |
| General capacity-aware placement | 3 | Not a dynamic scheduler; only conservative observed-headroom gating exercised |
| systemd and reboot resilience | 4 | Service restart and runtime restore observed; unattended reboot acceptance not established |
| Long-duration, multi-user or external production operation | 0 | Not claimed |

## Safety and verification

- Models and workloads do not acquire authority to approve lifecycle changes.
- Registered models are not assumed to be installed, granted, resident or ready.
- Start checks live headroom; no automatic eviction of other workloads.
- Stale runtime generations are rejected rather than silently redirected.
- Stops require an idle backend and zero conflicting dispatch leases; refusal is a successful safety outcome.
- Evaluations distinguish deterministic fixtures, isolated process failures, physical device observations and external production evidence.

**Latest bounded acceptance:** internal records report all VC-06B stages passing on 22 November 2026, including sequential routing to two resident model instances, zero duplicate runtime starts in the exercised case, an in-flight stop refusal and safe VRAM release. The suites recorded 58/58 deterministic infrastructure scenarios and 9/9 local process-fault scenarios passing. These are **project-maintained** results; private raw artifacts are not published.

## Open gaps

Independent reproducibility of private hardware evidence; sustained load and endurance data; multi-user authorization and administration; end-to-end disaster recovery; independent security review; adoption beyond the developer's machine.

**Scope:** This public edition does not distribute the implementation, exact policies, runtime configuration, binary digests, resource inventory, private endpoints, credentials or host logs. The sample code and screenshots remain synthetic.
