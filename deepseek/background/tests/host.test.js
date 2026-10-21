import test from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
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
