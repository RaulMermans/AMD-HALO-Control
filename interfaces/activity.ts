/**
 * HALO Control — illustrative public contracts: activity history.
 * Operational metadata only: never prompts, responses, embeddings, media URLs,
 * credentials, headers or raw provider payloads.
 */
import type { Capability } from './model';

export type ActivityStatus =
  | 'running'
  | 'succeeded'
  | 'denied'
  | 'inference_disabled'
  | 'provider_unavailable'
  | 'timeout'
  | 'failed';

export interface ActivityEvent {
  activityId: string;
  workloadId: string | null;
  capability: Capability | null;
  /** Filled in once routing resolves; absent for requests denied before routing. */
  modelId: string | null;
  providerId: string | null;
  status: ActivityStatus;
  startedAt: string;
  completedAt: string | null;
  latencyMs: number | null;
}

export interface ActivitySummary {
  window: '1h' | '24h' | '7d';
  total: number;
  byStatus: Partial<Record<ActivityStatus, number>>;
  byWorkload: Record<string, number>;
  p50LatencyMs: number | null;
}

/** If history storage is degraded, summaries are null — never fabricated zeros. */
export interface ActivityStoreStatus {
  status: 'healthy' | 'degraded' | 'disabled';
  historyComplete: boolean;
}
