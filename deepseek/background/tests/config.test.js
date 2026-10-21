import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, validateConfig, normalizeImage, cssUrl, imageStyles, MAX_IMAGE_BYTES } from '../src/config.js';

test('拒绝脚本、文件路径、SVG、携带凭据的链接及超量图片', () => {
  for (const source of ['javascript:alert(1)', 'file:///C:/x.png', 'http://example.com/x.png', 'https://user:pass@example.com/x.png', 'data:image/svg+xml;base64,PHN2Zz4=', 'blob:https://example.com/123']) assert.throws(() => normalizeImage(source));
  assert.throws(() => normalizeImage(`data:image/png;base64,${'a'.repeat((MAX_IMAGE_BYTES + 3) * 4 / 3)}`), /360 KB/);
  assert.equal(normalizeImage(' https://example.com/x.png '), 'https://example.com/x.png');
});

test('参数校验防止非法数值或类型进入背景样式', () => {
  assert.deepEqual(validateConfig(DEFAULTS), DEFAULTS);
  for (const input of [{ blur: NaN }, { opacity: 101 }, { shade: -1 }, { surfaceOpacity: -5 }, { conversationOpacity: 101 }, { enabled: 'true' }, { fit: 'contain;position:fixed' }, { imageName: 'x'.repeat(201) }]) assert.throws(() => validateConfig({ ...DEFAULTS, ...input }));
  assert.equal(validateConfig({ ...DEFAULTS, foreign: 'discarded' }).foreign, undefined);
  assert.equal(validateConfig({ ...DEFAULTS, conversationOpacity: 60 }).conversationOpacity, 60);
});

test('旧版保存的配置缺少新字段时使用默认值，不报错', () => {
  const legacy = { enabled: true, image: 'https://example.com/x.png', imageName: 'x', opacity: 50, blur: 2, shade: 10, surfaceOpacity: 70, fit: 'cover', position: 'center' };
  const config = validateConfig(legacy);
  assert.equal(config.conversationOpacity, 80);
  assert.equal(config.surfaceOpacity, 70);
});

test('图片链接不能逃出 CSS 字符串，平铺和模糊按设置呈现', () => {
  assert.equal(cssUrl('https://x/a"\\b\n'), 'url("https://x/a\\22 \\5c b\\a ")');
  const styles = imageStyles({ ...DEFAULTS, image: 'https://example.com/x.png', fit: 'repeat', blur: 10, opacity: 35 });
  assert.equal(styles.backgroundRepeat, 'repeat');
  assert.equal(styles.backgroundSize, 'auto');
  assert.equal(styles.opacity, '0.35');
  assert.equal(styles.filter, 'blur(10px)');
});
