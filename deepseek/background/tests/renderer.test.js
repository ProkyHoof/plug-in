import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { BackgroundRenderer } from '../src/renderer.js';
import { DEFAULTS } from '../src/config.js';

test('关闭和卸载恢复原样式；保留宿主和其他插件的样式', () => {
  const dom = new JSDOM('<!doctype html><body style="--dsh-bg-canvas: hotpink !important; --unrelated: 123; color: blue"><main>正文</main></body>');
  const document = dom.window.document;
  document.body.style.setProperty('--dsh-bg-canvas', 'hotpink', 'important');
  const originalCss = document.body.style.cssText;
  const renderer = new BackgroundRenderer(document);
  assert.equal(renderer.layer.hidden, true);
  renderer.apply({ ...DEFAULTS, image: 'https://example.com/test.png', enabled: true, opacity: 42 });
  assert.equal(document.body.hasAttribute('data-dsh-background-image'), true);
  assert.equal(renderer.picture.style.opacity, '0.42');
  assert.equal(document.querySelector('main').style.opacity, '');
  renderer.apply({ ...DEFAULTS });
  assert.equal(document.body.hasAttribute('data-dsh-background-image'), false);
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-canvas'), 'hotpink');
  renderer.dispose();
  assert.equal(document.querySelector('.dsh-background-layer'), null);
  assert.equal(document.body.style.getPropertyValue('--unrelated'), '123');
  assert.equal(document.body.style.color, 'blue');
  assert.equal(document.body.style.cssText, originalCss);
  dom.window.close();
});

test('主题切换重新采样宿主颜色，不把透明值写回原主题', () => {
  const dom = new JSDOM('<!doctype html><head><style>body{--dsw-alias-bg-base:#fff}body[data-ds-dark-theme]{--dsw-alias-bg-base:#151517}</style></head><body></body>');
  const renderer = new BackgroundRenderer(dom.window.document);
  const config = { ...DEFAULTS, enabled: true, image: 'https://example.com/a.jpg' };
  renderer.apply(config);
  assert.equal(dom.window.document.body.style.getPropertyValue('--dsh-bg-canvas'), '#fff');
  dom.window.document.body.setAttribute('data-ds-dark-theme', '');
  renderer.apply(config);
  assert.equal(dom.window.document.body.style.getPropertyValue('--dsh-bg-canvas'), '#151517');
  renderer.dispose(); dom.window.close();
});
