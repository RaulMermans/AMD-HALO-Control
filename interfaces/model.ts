/**
 * HALO Control — illustrative public contracts: models & inference providers.
 * Written from scratch for the public edition; not the private schemas.
 */

export type Capability = 'coding' | 'reasoning' | 'general' | 'vision' | 'embeddings';

export type InputModality = 'text' | 'image' | 'video';

/** What a model *record* claims. Registration is configured knowledge, not proof the model runs. */
export interface ModelDescriptor {
  /** Stable HALO-level id that workloads and routes refer to. */
  id: string;
  displayName: string;
  family: string;
  parameterCountBillions: number | null;
  quantization: string | null;
  contextWindowTokens: number | null;
  capabilities: ModelCapability[];
  inputModalities: InputModality[];
  resources: ResourceRequirements;
  /** Which inference provider serves it. The provider-specific model reference stays server-side. */
  providerId: string;
  enabled: boolean;
  availability: ModelAvailability;
}

export interface ModelCapability {
  capability: Capability;
  /** Optional qualitative note, e.g. "long context", "fast". Not a score. */
  notes?: string;
}

export interface ResourceRequirements {
  approxMemoryGiB: number;
  accelerator: 'cpu' | 'gpu';
}

/**
 * Availability is observed, not assumed:
 * - registered: known to the registry only
 * - available: provider reports it can be loaded
 * - loaded: resident and serving
 * - disabled: switched off by policy
 * - unavailable: provider unreachable or model missing
 */
export type ModelAvailability = 'registered' | 'available' | 'loaded' | 'disabled' | 'unavailable';

export type ProviderMode = 'disabled' | 'mock' | 'openai_compatible_http';

/** A local inference runtime behind a narrow boundary. HALO never exposes provider endpoints or credentials. */
export interface InferenceProvider {
  id: string;
  mode: ProviderMode;
  status: 'ready' | 'degraded' | 'unavailable' | 'disabled';
  supports: { chat: boolean; embeddings: boolean; imageInput: boolean; videoInput: boolean };
  timeoutMs: number;
}

export interface ChatRequest {
  capability: Exclude<Capability, 'embeddings'>;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
}

export type InferenceOutcome =
  | { status: 'succeeded'; modelId: string; providerId: string; latencyMs: number }
  | { status: 'inference_disabled' | 'provider_unavailable' | 'timeout' | 'invalid_response'; modelId?: string };
