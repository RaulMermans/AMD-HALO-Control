/**
 * HALO Control — illustrative public contracts: hardware telemetry.
 * Deliberately excludes hostnames, serial numbers, MAC/IP addresses, usernames and paths.
 */

/** How a value is known. Nothing is reported as observed unless it was. */
export type EvidenceClass = 'mocked' | 'local-real' | 'halo-real' | 'unavailable';

export interface Metric<T> {
  value: T | null;
  evidence: EvidenceClass;
}

export interface TelemetrySnapshot {
  sampledAt: string;
  cpu: { logicalCores: Metric<number>; utilizationPct: Metric<number> };
  gpu: { utilizationPct: Metric<number> };
  memory: { totalGiB: number; usedGiB: number; gpuReservedGiB: Metric<number> };
  thermal: { packageCelsius: Metric<number> };
  inference: {
    activeModelId: string | null;
    tokensPerSecond: Metric<number>;
    queuedRequests: number;
    inFlightRequests: number;
  };
  modelStore: { usedPct: Metric<number> };
}

export type HealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'disabled';

export interface SystemHealth {
  core: HealthStatus;
  inference: HealthStatus;
  activity: HealthStatus;
  computePlane: HealthStatus;
  /** Honest limitations, e.g. "GPU telemetry unavailable on this provider". */
  limitations: string[];
}
