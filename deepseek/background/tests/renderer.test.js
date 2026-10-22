import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { BackgroundRenderer } from '../src/renderer.js';
import { DEFAULTS, maskStyles } from '../src/config.js';

test('关闭和卸载恢复原样式；保留宿主和其他插件的样式', () => {
  const dom = new JSDOM('<!doctype html><body style="--dsh-bg-canvas: hotpink !important; --unrelated: 123; color: blue"><main>正文</main></body>');
  const document = dom.window.document;
  document.body.style.setProperty('--dsh-bg-canvas', 'hotpink', 'important');
  const originalCss = document.body.style.cssText;
  const renderer = new BackgroundRenderer(document);
  assert.equal(renderer.layer.hidden, true);
  renderer.apply({ ...DEFAULTS, image: 'https://example.com/test.png', enabled: true, opacity: 42, conversationOpacity: 42, dialogOpacity: 36, popoverOpacity: 70, titlebarOpacity: 60, maskColor: '#ff0000', shade: 20, canvasColor: '#123456' });
  assert.equal(document.body.hasAttribute('data-dsh-background-image'), true);
  assert.equal(renderer.picture.style.opacity, '0.42');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-conversation'), '42%');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-dialog'), '36%');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-popover'), '70%');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-titlebar'), '60%');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-surface'), '80%');
  // 遮罩颜色与底色生效。
  assert.equal(renderer.mask.style.backgroundColor, 'rgba(255, 0, 0, 0.2)');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-canvas'), '#123456');
  assert.equal(document.querySelector('main').style.opacity, '');
  renderer.apply({ ...DEFAULTS });
  assert.equal(document.body.hasAttribute('data-dsh-background-image'), false);
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-canvas'), 'hotpink');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-conversation'), '');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-dialog'), '');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-popover'), '');
  assert.equal(document.body.style.getPropertyValue('--dsh-bg-titlebar'), '');
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

test('遮罩层：纯色与上下渐变样式正确', () => {
  const base = { ...DEFAULTS, enabled: true, image: 'https://example.com/a.jpg', maskColor: '#000000', shade: 40 };
  const dom = new JSDOM('<!doctype html><body></body>');
  const renderer = new BackgroundRenderer(dom.window.document);
  renderer.apply({ ...base, gradient: 'none' });
  assert.equal(renderer.mask.style.backgroundImage, 'none');
  assert.equal(renderer.mask.style.backgroundColor, 'rgba(0, 0, 0, 0.4)');
  renderer.apply({ ...base, gradient: 'both' });
  assert.equal(renderer.mask.style.backgroundColor, 'transparent');
  assert.equal(renderer.mask.style.backgroundImage.split('linear-gradient').length - 1, 2);
  renderer.apply({ ...base, gradient: 'bottom' });
  assert.equal(renderer.mask.style.backgroundImage.split('linear-gradient').length - 1, 1);
  assert.match(renderer.mask.style.backgroundImage, /to top/);
  renderer.dispose(); dom.window.close();
});

test('maskStyles 工具函数输出与方向一致', () => {
  const base = { ...DEFAULTS, maskColor: '#112233', shade: 50 };
  assert.equal(maskStyles({ ...base, gradient: 'none' }).backgroundImage, 'none');
  assert.equal(maskStyles({ ...base, gradient: 'top' }).backgroundImage.includes('to bottom'), true);
  assert.equal(maskStyles({ ...base, gradient: 'both' }).backgroundImage.includes('rgba(17, 34, 51, 0)'), true);
});

test('样式表包含 Windows 自定义标题栏 frame 透明修复与标题栏透明度规则', () => {
  const css = readFileSync(fileURLToPath(new URL('../src/style.css', import.meta.url)), 'utf8');
  // 宿主规则 [data-windows-titlebar] .BynINW_frame 会把 frame 背景改成侧边栏填充色，
  // 导致 Windows 桌面端中间区域不透明、背景图被完全遮挡。插件必须覆盖该规则。
  assert.match(css, /html\[data-windows-titlebar\]\s*body\[data-dsh-background-image\]\s*\.BynINW_frame\s*\{\s*background\s*:\s*transparent\s*!important\s*\}/);
  // 标题栏条透明度由独立参数控制。
  assert.match(css, /\.BynINW_frame::before\s*\{background:color-mix\(in srgb,var\(--dsh-bg-sidebar\) var\(--dsh-bg-titlebar\),transparent\)!important\}/);
  // 对话框透明度统一作用于气泡与代码块（原“输出内容透明度”已合并）。
  assert.match(css, /--dsw-alias-markdown-code-block:color-mix\(in srgb,var\(--dsh-bg-code\) var\(--dsh-bg-dialog\),transparent\)!important/);
  // 弹层菜单透明度映射到菜单与浮层表面变量。
  assert.match(css, /--dsw-specific-menu:color-mix\(in srgb,var\(--dsh-bg-menu\) var\(--dsh-bg-popover\),transparent\)!important/);
  // AI 回复内容卡片由对话框透明度控制。
  assert.match(css, /\[class\*="v5IAXa_body"\][^}]*background:color-mix\(in srgb,var\(--dsh-bg-dialog-surface\) var\(--dsh-bg-dialog\),transparent\)!important/);
  // 设置页预览面板固定（sticky）。
  assert.match(css, /\.bgp-preview-panel\{[^}]*position:sticky/);
});
