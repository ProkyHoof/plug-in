import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { DEFAULTS, RANGES } from '../src/config.js';
import * as plugin from '../lib/index.js';

test('Host 可由真实 Cordis 加载，配置为对象级 volatile，卸载释放设置策略', async () => {
  const schema = plugin.Config.toJSON();
  const root = schema.refs[schema.uid];
  assert.equal(schema.refs[root.dict.appearance].meta.volatile, true);
  const ctx = new Context();
  let count = 0;
  const withdraw = ctx.reflect.provide('settings', { configure(options) { assert.equal(options.auto, false); count++; return () => count--; } });
  const fiber = await ctx.plugin(plugin);
  assert.equal(count, 1); await fiber.dispose(); assert.equal(count, 0); await withdraw();
});

test('Host schema 字段、默认值与 DEFAULTS 完全一致，数值范围与 RANGES 同步', () => {
  const schema = plugin.Config.toJSON();
  const root = schema.refs[schema.uid];
  const appearance = schema.refs[root.dict.appearance];
  assert.deepEqual(Object.keys(appearance.dict).sort(), Object.keys(DEFAULTS).sort());
  assert.deepEqual(appearance.meta.default, { ...DEFAULTS });
  for (const [key, [min, max]] of Object.entries(RANGES)) {
    const field = schema.refs[appearance.dict[key]];
    assert.equal(field.type, 'number', `${key} 应为 number 类型`);
    assert.equal(field.meta.min, min, `${key} 最小值应同步`);
    assert.equal(field.meta.max, max, `${key} 最大值应同步`);
    assert.equal(field.meta.default, DEFAULTS[key], `${key} 默认值应同步`);
  }
});
