import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createMock } from './helpers.js';

test('实际 Client 包完成注册、调节、保存和资源清理', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="root"></div></body>', { url: 'http://127.0.0.1:3080', runScripts: 'outside-only', pretendToBeVisual: true });
  const previous = { window: globalThis.window, document: globalThis.document };
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = createRequire(import.meta.url)('react-dom/client');
  let plugin;
  let modalClosed = false, selectedPanel;
  dom.window.__ModuleLoader__ = { load(value) { assert.equal(value.id, 'dsh-background-image'); plugin = value.factory(name => {
    if (name === 'react') return React;
    assert.equal(name, '@deepseek-ai/dsh-client-ui-primitives');
    return { closeTopModal: () => { modalClosed = true; } };
  }); } };
  dom.window.eval(await readFile(new URL('../lib/client.js', import.meta.url), 'utf8'));
  const { ctx, data } = createMock();
  data.value.image = 'https://example.com/background.jpg'; data.value.enabled = true;
  const effects = [], listeners = new Set(), slots = new Map();
  ctx.effect = handler => { effects.push(handler()); };
  ctx.on = (_, callback) => { listeners.add(callback); return () => listeners.delete(callback); };
  ctx.remote.$on = ctx.on;
  ctx.layout = { selectPanel(id) { selectedPanel = id; } };
  ctx.slots = { inject: (_, handler) => { effects.push(handler()); }, register: (options, component) => { slots.set(options.name, { options, component }); return () => slots.delete(options.name); } };
  plugin.apply(ctx);
  assert.equal(slots.get('sidebar.panellist').options.label, '背景图片');
  assert.ok(slots.has('settings.general.item'));
  slots.get('settings.general.item').options.inject().open();
  assert.equal(modalClosed, true);
  assert.equal(selectedPanel, 'background-image');
  const root = createRoot(document.getElementById('root'));
  const main = slots.get('main'); const controller = main.options.inject().controller;
  const button = label => [...document.querySelectorAll('button')].find(item => item.textContent === label);
  const slider = label => document.querySelector(`input[type=range][aria-label="${label}"]`);
  const setRange = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set;
  try {
    await act(async () => { await controller.load(); root.render(React.createElement(main.component, { controller })); });
    assert.equal(document.body.hasAttribute('data-dsh-background-image'), true);
    await act(async () => button('平铺').click());
    assert.equal(data.value.fit, 'cover');
    assert.equal(document.querySelector('.dsh-background-picture').style.backgroundRepeat, 'repeat');
    await act(async () => button('保存背景').click());
    assert.equal(data.value.fit, 'repeat');
    await act(async () => button('移除图片').click());
    assert.equal(document.body.hasAttribute('data-dsh-background-image'), false);
    assert.equal(data.value.enabled, true, '移除预览不立刻改写持久化数据');
    await act(async () => button('重新载入').click());
    assert.equal(document.body.hasAttribute('data-dsh-background-image'), true);
    // 滤镜滑块经 UI 调整后可保存。
    const brightness = slider('亮度');
    await act(async () => { setRange.call(brightness, '130'); brightness.dispatchEvent(new dom.window.Event('input', { bubbles: true })); });
    await act(async () => button('保存背景').click());
    assert.equal(data.value.brightness, 130);
    assert.match(document.querySelector('.dsh-background-picture').style.filter, /brightness\(130%\)/);
    // 渐变遮罩：选择“底部加深”后遮罩层出现底部渐变并保存。
    assert.equal(document.querySelector('.dsh-background-mask').style.backgroundImage, 'none');
    await act(async () => button('底部加深').click());
    assert.match(document.querySelector('.dsh-background-mask').style.backgroundImage, /to top/);
    await act(async () => button('保存背景').click());
    assert.equal(data.value.gradient, 'bottom');
    // 界面透明度滑块：标题栏、文本框、对话框分别写入对应参数。
    const setSlider = async (label, next) => { const el = slider(label); await act(async () => { setRange.call(el, String(next)); el.dispatchEvent(new dom.window.Event('input', { bubbles: true })); }); };
    await setSlider('标题栏透明度', 45);
    await setSlider('文本框透明度', 35);
    await setSlider('对话框透明度', 25);
    await act(async () => button('保存背景').click());
    assert.equal(data.value.titlebarOpacity, 45);
    assert.equal(data.value.conversationOpacity, 35);
    assert.equal(data.value.dialogOpacity, 25);
    // 旧的自定义 CSS 能力已移除，界面不再出现自定义样式开关。
    assert.equal(document.querySelector('[aria-label="启用自定义 CSS"]'), null);
    assert.equal(document.querySelector('textarea[aria-label="自定义 CSS 代码"]'), null);
  } finally {
    await act(async () => root.unmount());
    effects.reverse().forEach(dispose => dispose?.());
    assert.equal(document.querySelector('.dsh-background-layer'), null);
    assert.equal(document.querySelector('style[data-dsh-plugin]'), null);
    assert.equal(listeners.size, 0); assert.equal(slots.size, 0);
    assert.equal(document.body.hasAttribute('data-dsh-background-image'), false);
    dom.window.close();
    globalThis.window = previous.window; globalThis.document = previous.document;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
