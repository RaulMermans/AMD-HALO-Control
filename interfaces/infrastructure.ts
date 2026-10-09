/**
 * HALO Control — illustrative public contracts: compute plane, service runtime,
 * workload reconciliation, operator approval and evidence classes.
 *
 * Re-authored for the public edition. No executable paths, arguments, ports,
 * socket paths, credential formats or policy files appear here, and none are
 * accepted by the real contracts either.
 */

/* ------------------------------------------------------------------ */
/* Service runtime                                                       */
/* ------------------------------------------------------------------ */

/** What the control plane can ask for. A registered id plus a verb; nothing else. */
export interface InfrastructureOperation {
  operationId: string; // also the idempotency key
  kind: 'inspect_service' | 'start_service' | 'stop_service' | 'restart_service';
  serviceId: string; // must exist in the daemon's own registry
}

/** Public view of a daemon-side registry entry. The executable and arguments stay daemon-side. */
export interface RegisteredService {
  serviceId: string;
  ownerApplicationId: string;
  runtime: 'managed_process'; // a future Linux provider may add a supervised-service runtime
  dependsOn: string[];
  /** Graceful stop window; on timeout the stop fails visibly instead of escalating. */
  stopTimeoutSeconds: number;
}

export type ObservedProcessState =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'exited' // observed exit; never restarted automatically
  | 'failed'
  /** A previous daemon died uncleanly and its child may still be alive. Start and stop are refused. */
  | 'unknown';

export interface ServiceObservation {
  serviceId: string;
  state: ObservedProcessState;
  /** Only handles this daemon created itself; never discovered by name, PID or port. */
  ownedByThisDaemon: boolean;
  observedAt: string;
}

/* ------------------------------------------------------------------ */
/* Workloads: desired vs observed                                        */
/* ------------------------------------------------------------------ */

/** Desired state, owned by the control plane. One declaration per registered application. */
export interface WorkloadSpec {
  applicationId: string;
  intent: 'provisioned' | 'absent';
  storage?: { logicalName: string; storageClass: string }[];
  database?: { logicalName: string };
  jobs?: { jobTypes: string[] };
  services: string[]; // registered service ids
}

export type ResourceTruth = 'satisfied' | 'unsatisfied' | 'blocked' | 'unknown';

/** Produced by a pure planner. Planning is never approval and never execution. */
export interface ReconciliationPlan {
  applicationId: string;
  specDigest: string;
  planDigest: string;
  outcome: 'ready' | 'blocked' | 'no_changes';
  /** Fixed order: storage → database → job runtime → services. */
  steps: { phase: 'storage' | 'database' | 'jobs' | 'services'; action: string; truth: ResourceTruth }[];
}

/* ------------------------------------------------------------------ */
/* Operator governance                                                   */
/* ------------------------------------------------------------------ */

export type PermissionClass = 'read' | 'mutating' | 'destructive';

export interface InfrastructureActionProposal {
  proposalId: string;
  action: 'reconcile_workload' | 'cancel_queued_job' | 'create_recovery_point';
  target: string;
  permissionClass: PermissionClass;
  /** Digests of the state the operator reviewed; any change at execution time invalidates the approval. */
  expectedDigests: Record<string, string>;
  policyVersion: string;
  proposalDigest: string;
  expiresAt: string;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'executing'
    | 'succeeded'
    | 'failed'
    | 'expired'
    | 'invalidated'
    | 'interrupted';
}

/* ------------------------------------------------------------------ */
/* Evidence                                                              */
/* ------------------------------------------------------------------ */

/** Canonical evidence families used in project reporting (telemetry signals use the narrower EvidenceClass). A higher class is never inferred from a lower one. */
export type ProjectEvidenceClass =
  | 'mocked'
  | 'local-real'
  | 'local-real-protocol'
  | 'local-real-service-runtime'
  | 'durability-local-real'
  | 'security-local-real'
  | 'recovery-local-real'
  | 'control-room-local-real'
  | 'application-real'
  | 'model-runtime-real'
  | 'halo-real'
  | 'deferred-to-hardware-phase'
  | 'unverified'
  | 'not-implemented';
