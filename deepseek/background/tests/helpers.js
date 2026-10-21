import { DEFAULTS, NAMESPACE } from '../src/config.js';
export function createMock() {
  const data = { value: { ...DEFAULTS }, revision: 1, writable: true, calls: [] };
  const section = () => ({ ns: NAMESPACE, value: { appearance: structuredClone(data.value) }, revision: data.revision });
  const ctx = { remote: { settings: {
    async describe() { return { ok: true, value: { writable: data.writable, namespaces: [section()] } }; },
    async update(ns, patch, expectedRevision) {
      data.calls.push({ ns, patch, expectedRevision });
      if (expectedRevision !== data.revision) return { ok: false, error: { code: 'settings/conflict', message: 'revision conflict' } };
      data.value = structuredClone(patch.appearance); data.revision++;
      return { ok: true, value: section() };
    },
  } } };
  return { ctx, data };
}
