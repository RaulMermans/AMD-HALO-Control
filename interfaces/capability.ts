/**
 * HALO Control — illustrative public contracts: capability routing.
 * The selection function below is a simplified algorithm authored for this public
 * edition. It is NOT the private routing policy.
 */
import type { Capability, ModelDescriptor } from './model';
import type { TelemetrySnapshot } from './telemetry';

/** Declarative policy: which model(s) may serve a capability, in preference order. */
export interface RoutePolicy {
  capability: Capability;
  candidates: string[];
}

export type RoutingDecision =
  | { outcome: 'routed'; capability: Capability; modelId: string; reason: string; considered: RejectedCandidate[] }
  | { outcome: 'unroutable'; capability: Capability; reason: string; considered: RejectedCandidate[] };

export interface RejectedCandidate {
  modelId: string;
  reason: 'unknown_model' | 'disabled' | 'capability_mismatch' | 'unavailable' | 'insufficient_memory';
}

/**
 * Illustrative only. Walks the declared candidates in order and returns the first
 * one that is known, enabled, capable, available and fits free memory.
 * It never invents a fallback outside the declared policy.
 */
export function illustrativeRoute(
  capability: Capability,
  policy: RoutePolicy[],
  registry: ModelDescriptor[],
  telemetry: Pick<TelemetrySnapshot, 'memory'>,
): RoutingDecision {
  const route = policy.find((p) => p.capability === capability);
  const considered: RejectedCandidate[] = [];
  if (!route) return { outcome: 'unroutable', capability, reason: 'no route declared', considered };

  const freeGiB = telemetry.memory.totalGiB - telemetry.memory.usedGiB;
  for (const id of route.candidates) {
    const model = registry.find((m) => m.id === id);
    if (!model) { considered.push({ modelId: id, reason: 'unknown_model' }); continue; }
    if (!model.enabled) { considered.push({ modelId: id, reason: 'disabled' }); continue; }
    if (!model.capabilities.some((c) => c.capability === capability)) {
      considered.push({ modelId: id, reason: 'capability_mismatch' }); continue;
    }
    if (model.availability === 'unavailable' || model.availability === 'registered') {
      considered.push({ modelId: id, reason: 'unavailable' }); continue;
    }
    const alreadyResident = model.availability === 'loaded';
    if (!alreadyResident && model.resources.approxMemoryGiB > freeGiB) {
      considered.push({ modelId: id, reason: 'insufficient_memory' }); continue;
    }
    return { outcome: 'routed', capability, modelId: id, reason: alreadyResident ? 'resident' : 'fits', considered };
  }
  return { outcome: 'unroutable', capability, reason: 'no declared candidate is eligible', considered };
}
