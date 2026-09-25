# Telemetry

Telemetry answers "what is the machine doing?" without overstating what is known.

## Signals

| Signal | Notes |
| --- | --- |
| CPU utilization, logical cores | Short-interval sampling |
| GPU utilization | Reported only when a provider can observe it reliably |
| Unified memory used / total, GPU-reserved share | APU-style shared memory is a first-class concept |
| Package temperature | Optional; reported as unavailable when it can't be read |
| Active model, tokens/second, queued and in-flight requests | From the inference boundary |
| Model-store disk usage | Capacity planning for model files |

Contract: [`interfaces/telemetry.ts`](../interfaces/telemetry.ts). Example: [`examples/synthetic-telemetry.json`](../examples/synthetic-telemetry.json).

## Evidence classes

Every observation is tagged with how it is known:

| Class | Meaning | What it can't prove |
| --- | --- | --- |
| `mocked` | Synthetic fixture | Any real behaviour |
| `local-real` | Real software on a development machine | Compatibility with the target hardware |
| `halo-real` | Observed on the target AMD Halo machine | Anything beyond what was executed |
| `unavailable` | The provider can't observe this signal | — |

This discipline carries through to project reporting as well. The sub-classes used there are `local-real-ui` (the Control Room against a real local core), `application-real` (a real workload request reached the core), and `model-runtime-real` (a real model answered).

## Privacy of telemetry

Telemetry never includes usernames, home-directory contents, mounted-filesystem inventories, environment variables, process command lines, serial numbers, MAC addresses or IP inventories.

## Hardware providers

Telemetry comes from pluggable providers: a generic provider for any development machine, a mock provider for tests, and a target-specific provider. The target-specific provider is used only when the running machine positively matches the expected target, so the system never assumes it is on the target hardware.
