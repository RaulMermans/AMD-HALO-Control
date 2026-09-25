# Local-first design

HALO is designed to run on one local AI workstation, not as a cloud service. That choice comes with trade-offs.

| Priority | Why | Trade-off accepted |
| --- | --- | --- |
| **Local execution** | Code, documents and media stay on the machine | Capacity is bounded by one machine |
| **Open-weight models** | Models can be chosen, quantized, pinned and audited | Usually weaker than frontier APIs, so workloads must be designed for them |
| **Privacy** | No third-party inference; activity history stores metadata only | Less history available for debugging |
| **Predictable infrastructure** | Versioned registry and routing, deterministic behaviour, no silent fallback | Changes need a config review and restart instead of happening live |
| **Workload isolation** | Per-workload identity and capability grants; the compute plane runs only registered services | More configuration up front |
| **Hardware-aware routing** | Unified memory is shared between CPU and GPU, so model placement matters | Needs reliable telemetry; still a design goal (see [capability-routing.md](capability-routing.md)) |
| **Centralized observability** | One place to see models, workloads, activity and machine health across all consumers | One more service to run |

## Why a control plane at all?

Without one, every workload (assistant, coding agent, media pipeline) configures its own model endpoint, keeps its own logs, and competes for the same memory without knowing about the others. HALO centralizes the decisions that affect everyone: which models exist, who may use them for what, what ran, and whether the machine is healthy. Each workload keeps its own logic.
