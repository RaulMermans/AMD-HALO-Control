/**
 * HALO Control — illustrative public contracts: workloads (application registry)
 * and managed services. Workloads are abstract consumers; their internals live elsewhere.
 */
import type { Capability } from './model';

export interface Workload {
  id: string;
  displayName: string;
  kind: 'assistant' | 'coding-agent' | 'media-pipeline' | 'content-pipeline' | 'other';
  enabled: boolean;
  /** Capability allowlist: a workload can only request what it is granted. */
  allowedCapabilities: Capability[];
  state: 'active' | 'queued' | 'idle' | 'disabled';
}

/** Identity is proven per request; authorization is checked before any routing or inference. */
export type AccessDecision =
  | { decision: 'allowed'; workloadId: string; capability: Capability }
  | { decision: 'denied'; reason: 'unauthenticated' | 'workload_disabled' | 'capability_not_allowed' };

/**
 * Control says what should run; the compute plane runs only pre-registered services and
 * reports what actually happened. Requests name a registered service id — never a command,
 * executable, arguments, environment or process id.
 */
export interface ServiceOperation {
  operationId: string;
  targetServiceId: string;
  action: 'start' | 'stop' | 'restart' | 'status';
  requestedBy: string;
}

export interface ObservedServiceState {
  serviceId: string;
  state: 'running' | 'stopped' | 'starting' | 'stopping' | 'failed' | 'unknown';
  observedAt: string;
  /** Set when the compute plane is unreachable; control never invents observed state. */
  stale: boolean;
}
