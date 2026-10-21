import { DEFAULTS, NAMESPACE, validateConfig } from './config.js';

function unwrap(answer) {
  if (!answer?.ok) throw new Error(answer?.error?.message || '无法连接 Harness，请稍后重试。');
  return answer.value;
}

export class BackgroundController {
  constructor(ctx, renderer) {
    this.ctx = ctx; this.renderer = renderer;
    this.listeners = new Set(); this.generation = 0; this.disposed = false;
    this.state = { value: { ...DEFAULTS }, saved: { ...DEFAULTS }, revision: undefined, loading: true, busy: false, dirty: false, stale: false, writable: false, error: '', notice: '' };
    this.getSnapshot = () => this.state;
    this.subscribe = listener => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  }
  patch(values) {
    if (this.disposed) return;
    this.state = { ...this.state, ...values }; this.listeners.forEach(listener => listener());
  }
  async load(discard = false) {
    if (this.disposed || this.state.busy) return;
    const generation = ++this.generation;
    try {
      const result = unwrap(await this.ctx.remote.settings.describe());
      if (generation !== this.generation || this.disposed) return;
      const section = result.namespaces.find(item => item.ns === NAMESPACE);
      if (!section) throw new Error('未找到背景配置，请检查 bundle 中的配置项编号是否为 background-image。');
      const saved = validateConfig(section.value.appearance);
      if (this.state.dirty && !discard) {
        this.patch({ saved, stale: section.revision !== this.state.revision, writable: result.writable });
        return;
      }
      this.renderer.apply(saved);
      this.patch({ saved, value: { ...saved }, revision: section.revision, loading: false, dirty: false, stale: false, writable: result.writable, error: '' });
    } catch (error) { if (generation === this.generation) this.patch({ loading: false, error: error.message }); }
  }
  update(values) {
    if (this.state.loading || this.state.busy || !this.state.writable) return;
    try {
      const value = validateConfig({ ...this.state.value, ...values });
      this.renderer.apply(value);
      this.patch({ value, dirty: JSON.stringify(value) !== JSON.stringify(this.state.saved), error: '', notice: '' });
    } catch (error) { this.patch({ error: error.message }); }
  }
  cancelPreview() {
    if (this.state.busy) return;
    this.renderer.apply(this.state.saved);
    this.patch({ value: { ...this.state.saved }, dirty: false, stale: false });
    void this.load(true);
  }
  async save() {
    if (this.state.busy || this.state.loading || !this.state.dirty || !this.state.writable || this.state.stale) return;
    const value = validateConfig(this.state.value);
    this.generation++;
    this.patch({ busy: true, error: '', notice: '' });
    try {
      const answer = await this.ctx.remote.settings.update(NAMESPACE, { appearance: value }, this.state.revision);
      if (!answer.ok && answer.error?.code === 'settings/conflict') { this.patch({ stale: true }); throw new Error('其他窗口已修改背景，请重新载入后再保存。'); }
      const section = unwrap(answer);
      const saved = validateConfig(section.value.appearance);
      this.renderer.apply(saved);
      this.patch({ value: { ...saved }, saved, revision: section.revision, dirty: false, stale: false, notice: '背景设置已保存，重启后会自动恢复。' });
    } catch (error) { this.patch({ error: error.message }); }
    finally { this.patch({ busy: false }); void this.load(); }
  }
  dispose() { this.disposed = true; this.generation++; this.listeners.clear(); }
}
