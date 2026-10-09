# Project profile

A one-page maturity statement for the private HALO Control system. Updated with each public sync.

**Evidence scale:** 0 Missing · 1 Researched · 2 Canonicalized · 3 Specified · 4 Implemented · 5 Evaluated · 6 Production proven

| | |
| --- | --- |
| **Architecture** | Headless control plane + separate compute-plane daemon and job worker on one machine; SQLite state; operator UI as a client |
| **Current target maturity** | Pre-Halo baseline: architecture implemented and evaluated on a development machine, frozen pending hardware bring-up |
| **Last synced** | Private state as of October 2026 (pre-Halo baseline + Control Room UX pass) |

## Required capabilities

| Capability | Evidence | Note |
| --- | --- | --- |
| Application identity + capability authorization | 5 | `local-real` |
| Model registry, deterministic capability routing | 5 | `local-real` |
| Inference provider boundary | 4 | Fake upstream only; no model has answered through HALO |
| Activity history | 5 | `durability-local-real` |
| Service runtime (registered managed processes) | 5 | `local-real-service-runtime` |
| Workload registry + deterministic reconciliation | 5 | |
| Durable job queue + worker | 5 | Real crash recovery locally |
| Operator auth, approval gates, force-read-only | 5 | `security-local-real` |
| Observability + diagnostics | 5 | |
| Control Room (read-first operator UI) | 5 | `control-room-local-real` |

## Conditional capabilities

| Capability | Evidence | Note |
| --- | --- | --- |
| Governed storage allocation | 5 | |
| PostgreSQL provisioning | 4 | Real-server acceptance deferred to hardware phase |
| Recovery points + staging restore | 5 | Production restore not enabled |
| Resource & Capacity Manager | 3 | Specified only; built from real hardware measurements |
| Resource-aware routing | 3 | Illustrative code in this repo |
| systemd supervision / reboot recovery | 1 | Hardware phase |

## Evidence state

Nothing is at level 6. Nothing is `halo-real`: the target AMD Halo machine hasn't been brought up, and no model runtime has answered a real request through HALO. Real applications (assistant, publishing, clipping) have reached HALO and been authorized, routed and recorded (`application-real`), but with inference disabled.

## Known gaps

- Hardware bring-up and the fresh-install acceptance on the target.
- Real PostgreSQL acceptance, systemd supervision, reboot recovery.
- Capacity-aware scheduling, model load/unload management.

## Production limitations

Single local operator, loopback only; remote/LAN administration is not designed in. Production restore and all destructive infrastructure actions are disabled.
