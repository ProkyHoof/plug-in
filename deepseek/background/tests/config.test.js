import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, MAX_CUSTOM_CSS, RANGES, validateConfig, normalizeImage, normalizeColor, hexToRgba, cssUrl, imageStyles, MAX_IMAGE_BYTES } from '../src/config.js';

test('拒绝脚本、文件路径、SVG、携带凭据的链接及超量图片', () => {
  for (const source of ['javascript:alert(1)', 'file:///C:/x.png', 'http://example.com/x.png', 'https://user:pass@example.com/x.png', 'data:image/svg+xml;base64,PHN2Zz4=', 'blob:https://example.com/123']) assert.throws(() => normalizeImage(source));
  assert.throws(() => normalizeImage(`data:image/png;base64,${'a'.repeat((MAX_IMAGE_BYTES + 3) * 4 / 3)}`), /360 KB/);
  assert.equal(normalizeImage(' https://example.com/x.png '), 'https://example.com/x.png');
});

test('参数校验防止非法数值或类型进入背景样式', () => {
  assert.deepEqual(validateConfig(DEFAULTS), DEFAULTS);
  for (const input of [{ blur: NaN }, { opacity: 101 }, { shade: -1 }, { surfaceOpacity: -5 }, { conversationOpacity: 101 }, { dialogOpacity: 101 }, { outputOpacity: -1 }, { zoom: 49 }, { zoom: 201 }, { hueRotate: -181 }, { brightness: -1 }, { saturate: 201 }, { enabled: 'true' }, { fit: 'contain;position:fixed' }, { imageName: 'x'.repeat(201) }, { maskColor: 'red' }, { maskColor: 'rgb(1,2,3)' }, { canvasColor: '#xyz' }, { customCssEnabled: 'yes' }, { customCss: 'x'.repeat(MAX_CUSTOM_CSS + 1) }]) assert.throws(() => validateConfig({ ...DEFAULTS, ...input }));
  assert.equal(validateConfig({ ...DEFAULTS, foreign: 'discarded' }).foreign, undefined);
  assert.equal(validateConfig({ ...DEFAULTS, conversationOpacity: 60 }).conversationOpacity, 60);
});

test('旧版保存的配置缺少新字段时使用默认值，不报错', () => {
  const legacy = { enabled: true, image: 'https://example.com/x.png', imageName: 'x', opacity: 50, blur: 2, shade: 10, surfaceOpacity: 70, fit: 'cover', position: 'center' };
  const config = validateConfig(legacy);
  assert.equal(config.conversationOpacity, 80);
  assert.equal(config.dialogOpacity, 80);
  assert.equal(config.outputOpacity, 100);
  assert.equal(config.surfaceOpacity, 70);
  assert.equal(config.maskColor, '#000000');
  assert.equal(config.zoom, 100);
  assert.equal(config.brightness, 100);
  assert.equal(config.contrast, 100);
  assert.equal(config.saturate, 100);
  assert.equal(config.grayscale, 0);
  assert.equal(config.sepia, 0);
  assert.equal(config.hueRotate, 0);
  assert.equal(config.canvasColor, '');
  assert.equal(config.customCssEnabled, false);
  assert.equal(config.customCss, '');
});

test('颜色只接受十六进制，遮罩颜色按透明度合成 rgba', () => {
  assert.equal(normalizeColor('#ABC'), '#aabbcc');
  assert.equal(normalizeColor('#112233'), '#112233');
  assert.equal(normalizeColor('', { allowEmpty: true }), '');
  assert.throws(() => normalizeColor(''));
  assert.throws(() => normalizeColor('#12'));
  assert.throws(() => normalizeColor('rgba(0,0,0,.1)'));
  assert.equal(hexToRgba('#ff0000', 0.2), 'rgba(255, 0, 0, 0.2)');
  assert.equal(hexToRgba('#000000', 0), 'rgba(0, 0, 0, 0)');
  // 8 位十六进制颜色自身带透明度，与遮罩强度相乘。
  assert.equal(hexToRgba('#00000080', 0.5), 'rgba(0, 0, 0, 0.251)');
});

test('自定义 CSS 可在没有背景图片时独立启用', () => {
  const config = validateConfig({ ...DEFAULTS, enabled: false, image: '', customCssEnabled: true, customCss: 'body{color:red}' });
  assert.equal(config.customCssEnabled, true);
  assert.equal(config.customCss, 'body{color:red}');
});

test('图片链接不能逃出 CSS 字符串，平铺、滤镜与缩放按设置呈现', () => {
  assert.equal(cssUrl('https://x/a"\\b\n'), 'url("https://x/a\\22 \\5c b\\a ")');
  const styles = imageStyles({ ...DEFAULTS, image: 'https://example.com/x.png', fit: 'repeat', blur: 10, opacity: 35, zoom: 120, brightness: 110, hueRotate: 90, grayscale: 30 });
  assert.equal(styles.backgroundRepeat, 'repeat');
  assert.equal(styles.backgroundSize, 'auto');
  assert.equal(styles.opacity, '0.35');
  assert.match(styles.filter, /blur\(10px\)/);
  assert.match(styles.filter, /brightness\(110%\)/);
  assert.match(styles.filter, /grayscale\(30%\)/);
  assert.match(styles.filter, /hue-rotate\(90deg\)/);
  // 模糊放大 1.05 与缩放 1.2 叠加。
  assert.equal(styles.transform, 'scale(1.26)');
  // 无模糊、无缩放时不添加 transform。
  assert.equal(imageStyles({ ...DEFAULTS, image: 'https://example.com/x.png' }).transform, 'none');
});

test('所有数值字段都在 RANGES 中登记，防止漏校验', () => {
  const numericKeys = Object.entries(DEFAULTS).filter(([, value]) => typeof value === 'number').map(([key]) => key);
  assert.deepEqual(numericKeys.sort(), Object.keys(RANGES).sort());
});
