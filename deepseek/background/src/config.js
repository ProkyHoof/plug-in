export const PACKAGE = 'dsh-background-image';
export const NAMESPACE = 'background-image';
export const MAX_IMAGE_BYTES = 360 * 1024;
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const DEFAULTS = Object.freeze({
  enabled: false, image: '', imageName: '', opacity: 55, blur: 0,
  shade: 15, surfaceOpacity: 80, conversationOpacity: 80, fit: 'cover', position: 'center',
});

export function normalizeImage(value) {
  if (typeof value !== 'string') throw new Error('图片地址格式不正确。');
  const image = value.trim();
  if (!image) return '';
  if (/^data:image\/(?:png|jpeg|webp|avif);base64,[a-zA-Z0-9+/]+={0,2}$/.test(image)) {
    const payload = image.slice(image.indexOf(',') + 1);
    const bytes = payload.length * 3 / 4 - (payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0);
    if (payload.length % 4 || bytes > MAX_IMAGE_BYTES) throw new Error('压缩后的图片不能超过 360 KB，请重新选择图片。');
    return image;
  }
  if (image.length > 4096) throw new Error('图片链接过长。');
  let url;
  try { url = new URL(image); } catch { throw new Error('请输入有效的 HTTPS 图片链接，或导入本地图片。'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('图片链接须使用 HTTPS，且不能包含账号或密码。');
  return url.href;
}

export function validateConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('背景配置格式不正确。');
  const config = { ...DEFAULTS };
  if (typeof input.enabled !== 'boolean') throw new Error('背景开关状态无效。');
  config.enabled = input.enabled;
  config.image = normalizeImage(input.image);
  if (typeof input.imageName !== 'string' || input.imageName.length > 200) throw new Error('图片名称最多 200 个字符。');
  config.imageName = input.imageName;
  for (const [key, max] of [['opacity', 100], ['blur', 30], ['shade', 80], ['surfaceOpacity', 100], ['conversationOpacity', 100]]) {
    if (!Number.isFinite(input[key]) || input[key] < 0 || input[key] > max) throw new Error(`背景参数 ${key} 超出有效范围。`);
    config[key] = input[key];
  }
  if (!['cover', 'contain', 'repeat'].includes(input.fit)) throw new Error('图片显示方式无效。');
  if (!['center', 'top', 'bottom', 'left', 'right'].includes(input.position)) throw new Error('图片位置无效。');
  config.fit = input.fit;
  config.position = input.position;
  return config;
}

// CSS 字符串用转义处理引号、反斜线和控制字符，防止图片链接破坏样式。
export function cssUrl(image) {
  return `url("${image.replace(/["\\\n\r\f]/g, char => `\\${char.codePointAt(0).toString(16)} `)}")`;
}

export function imageStyles(value) {
  const config = validateConfig(value);
  return {
    backgroundImage: config.image ? cssUrl(config.image) : 'none',
    backgroundSize: config.fit === 'repeat' ? 'auto' : config.fit,
    backgroundRepeat: config.fit === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundPosition: config.position,
    opacity: String(config.opacity / 100),
    filter: `blur(${config.blur}px)`,
    transform: config.blur ? `scale(${1 + config.blur / 200})` : 'none',
  };
}
