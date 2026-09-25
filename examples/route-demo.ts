/**
 * Runs the illustrative router over the synthetic registry and telemetry.
 *   node --experimental-strip-types examples/route-demo.ts
 */
import { readFileSync } from 'node:fs';
import { illustrativeRoute, type RoutePolicy } from '../interfaces/capability.ts';
import type { Capability, ModelDescriptor } from '../interfaces/model.ts';

const raw = JSON.parse(readFileSync(new URL('./synthetic-models.json', import.meta.url), 'utf8'));
const tel = JSON.parse(readFileSync(new URL('./synthetic-telemetry.json', import.meta.url), 'utf8'));

const registry: ModelDescriptor[] = raw.models.map((m: any) => ({
  ...m,
  capabilities: m.capabilities.map((c: Capability) => ({ capability: c })),
  providerId: m.provider,
}));

const policy: RoutePolicy[] = [
  { capability: 'coding', candidates: ['coder-large'] },
  { capability: 'reasoning', candidates: ['reasoner-xl', 'generalist'] },
  { capability: 'general', candidates: ['generalist'] },
  { capability: 'vision', candidates: ['vision-small'] },
  { capability: 'embeddings', candidates: ['embedder'] },
];

const memory = { totalGiB: tel.memory.unifiedTotalGiB, usedGiB: tel.memory.usedGiB, gpuReservedGiB: { value: null, evidence: 'mocked' as const } };

for (const cap of ['coding', 'reasoning', 'general', 'vision', 'embeddings'] as Capability[]) {
  const d = illustrativeRoute(cap, policy, registry, { memory });
  const skipped = d.considered.map((c) => `${c.modelId}:${c.reason}`).join(', ');
  console.log(`${cap.padEnd(11)} → ${d.outcome === 'routed' ? d.modelId : 'UNROUTABLE'}  (${d.reason})${skipped ? `  skipped: ${skipped}` : ''}`);
}
