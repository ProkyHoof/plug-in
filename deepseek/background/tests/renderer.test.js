import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { BackgroundRenderer } from '../src/renderer.js';
import { DEFAULTS } from '../src/config.js';

test('样式表包含 Windows 自定义标题栏 frame 透明修复，避免遮挡整幅背景', () => {
  const css = readFileSync(fileURLToPath(new URL('../src/style.css', import.meta.url)), 'utf8');
  // 宿主规则 [data-windows-titlebar] .BynINW_frame 会把 frame 背景改成侧边栏填充色，
  // 导致 Windows 桌面端中间区域不透明、背景图被完全遮挡。插件必须覆盖该规则。
  assert.match(css, /html\[data-windows-titlebar\]\s*body\[data-dsh-background-image\]\s*\.BynINW_frame\s*\{\s*background\s*:\s*transparent\s*!important\s*\}/);
});

const CUSTOM_STYLE = 'style[data-dsh-background-custom]';

test('关闭和卸载恢复原样式；保留宿主和其他插件的样式', () => {
  const dom = new JSDOM('<!doctype html><body style="--dsh-bg-canvas: hotpink !important; --unrelated: 123; color: blue"><main>正文</main></body>');
  const document = dom.window.document;
  document.body.style.setProperty('--dsh-bg-canvas', 'hotpink', 'important');
  const originalCss = document.body.style.cssText;
  const renderer = new BackgroundRenderer(document);
  assert.equal(renderer.layer.hidden, true);
  renderer.apply({ ...DEFAULTS, image: 'https://example.com/test.png', enabled: true, opacity: 42, conversationOpacity: 42, dialogOpacity: 36, outputOpacity: 70, maskColor: '#ff0000', shade: 20, canvasColor: '#123456' });
  assert.equal(document.body.hasAttribute('data-dsh-background-image'), true);
  assert.equal(renderer.picture.style.opacity, '0.42');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-conversation'), '42%');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-dialog'), '36%');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-output'), '70%');
  // 遮罩颜色与底色生效。
  assert.equal(renderer.mask.style.backgroundColor, 'rgba(255, 0, 0, 0.2)');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-canvas'), '#123456');
  assert.equal(document.querySelector('main').style.opacity, '');
  renderer.apply({ ...DEFAULTS });
  assert.equal(document.body.hasAttribute('data-dsh-background-image'), false);
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-canvas'), 'hotpink');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-conversation'), '');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-dialog'), '');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-output'), '');
  assert.equal(renderer.mask.style.backgroundColor, '');
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

test('自定义 CSS 随开关注入与移除，关闭背景或卸载时清理', () => {
  const dom = new JSDOM('<!doctype html><body></body>');
  const document = dom.window.document;
  const renderer = new BackgroundRenderer(document);
  const css = '.dsh-background-mask{background:red!important}';
  renderer.apply({ ...DEFAULTS, enabled: true, image: 'https://example.com/a.jpg', customCssEnabled: true, customCss: css });
  let style = document.querySelector(CUSTOM_STYLE);
  assert.ok(style);
  assert.equal(style.textContent, css);
  // 停用自定义样式后整段移除。
  renderer.apply({ ...DEFAULTS, enabled: true, image: 'https://example.com/a.jpg', customCssEnabled: false, customCss: css });
  assert.equal(document.querySelector(CUSTOM_STYLE), null);
  renderer.dispose();
  dom.window.close();
});

test('自定义 CSS 不依赖背景图片，停用后恢复', () => {
  const dom = new JSDOM('<!doctype html><body></body>');
  const document = dom.window.document;
  const renderer = new BackgroundRenderer(document);
  // 没有开启背景图，自定义样式仍注入。
  renderer.apply({ ...DEFAULTS, enabled: false, image: '', customCssEnabled: true, customCss: 'body{color:red}' });
  assert.equal(document.body.hasAttribute('data-dsh-background-image'), false);
  assert.ok(document.querySelector(CUSTOM_STYLE));
  // 空白 CSS 不注入 style 元素。
  renderer.apply({ ...DEFAULTS, enabled: false, image: '', customCssEnabled: true, customCss: '   ' });
  assert.equal(document.querySelector(CUSTOM_STYLE), null);
  renderer.dispose();
  assert.equal(document.querySelector(CUSTOM_STYLE), null);
  dom.window.close();
});
