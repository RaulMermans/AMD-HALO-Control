# Model registry

The registry is the single source of truth for **which models HALO knows about and what they are allowed to do**. It is deliberately separate from whether a model is actually running.

## A model record

| Field | Meaning |
| --- | --- |
| `id` | Stable HALO-level id that routes and workloads refer to |
| `family`, `parameterCount`, `quantization` | What the model is |
| `contextWindowTokens` | Usable context size |
| `capabilities` | `coding`, `reasoning`, `general`, `vision`, `embeddings` |
| `inputModalities` | `text`, `image`, `video` |
| `resources` | Approximate memory footprint and accelerator |
| `providerId` | The runtime that serves it; its internal model reference stays server-side |
| `enabled` | Policy switch |
| `availability` | `registered` → `available` → `loaded`, or `disabled` / `unavailable` |

Contract: [`interfaces/model.ts`](../interfaces/model.ts). Example: [`examples/synthetic-models.json`](../examples/synthetic-models.json).

## Principles

- **Registration is not availability.** A record says "HALO knows this model". Only the provider can say it's loadable or loaded, and the Control Room shows the difference.
- **Versioned and validated.** The registry is loaded from versioned configuration, validated at startup, and cross-checked against routing policy. A route that points at an unknown, disabled or incapable model is a startup error, not a runtime surprise.
- **Read-only at runtime.** Inspection endpoints expose the registry. Changes go through configuration review, not API calls.
- **Provider-neutral.** Local runtimes are reached through an OpenAI-compatible HTTP protocol. That means the wire protocol, not OpenAI models or hosting.

## Model Librarian

A read-only operator view that answers "what do we have, what can it do, and what's missing?". It reports only from the registry and doesn't call any model.
