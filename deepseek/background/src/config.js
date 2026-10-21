export const PACKAGE = 'dsh-background-image';
export const NAMESPACE = 'background-image';
export const MAX_IMAGE_BYTES = 360 * 1024;
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const MAX_CUSTOM_CSS = 10000;

export const DEFAULTS = Object.freeze({
  enabled: false,
  image: '',
  imageName: '',
  // 图片层
  opacity: 55,
  blur: 0,
  shade: 15,
  maskColor: '#000000',
  zoom: 100,
  // 图片滤镜
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  // 图片后方的底色，空字符串表示跟随宿主主题
  canvasColor: '',
  // 前景面板透明度
  surfaceOpacity: 80,
  conversationOpacity: 80,
  dialogOpacity: 80,
  outputOpacity: 100,
  // 布局
  fit: 'cover',
  position: 'center',
  // 高级自定义样式
  customCssEnabled: false,
  customCss: '',
});

// 数值参数的允许范围：最小值、最大值。Host schema 与校验逻辑共用，避免两处不一致。
export const RANGES = Object.freeze({
  opacity: [0, 100],
  blur: [0, 30],
  shade: [0, 80],
  zoom: [50, 200],
  brightness: [0, 200],
  contrast: [0, 200],
  saturate: [0, 200],
  grayscale: [0, 100],
  sepia: [0, 100],
  hueRotate: [-180, 180],
  surfaceOpacity: [0, 100],
  conversationOpacity: [0, 100],
  dialogOpacity: [0, 100],
  outputOpacity: [0, 100],
});

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

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

// 颜色只允许十六进制写法，防止把任意字符串拼进样式；allowEmpty 时返回空串表示跟随主题。
export function normalizeColor(value, { allowEmpty = false } = {}) {
  if (typeof value !== 'string') throw new Error('颜色值格式不正确。');
  const color = value.trim();
  if (!color) {
    if (allowEmpty) return '';
    throw new Error('颜色值不能为空。');
  }
  if (!HEX_COLOR.test(color)) throw new Error('颜色需要使用 #RRGGBB 形式的十六进制值。');
  // 统一展开为 6 位或 8 位，保证 <input type="color"> 等控件能正确读取。
  let h = color.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map(char => char + char).join('');
  return `#${h.toLowerCase()}`;
}

// 将十六进制颜色与 0~1 的透明度合成为 rgba()，用于遮罩层。
export function hexToRgba(hex, alpha) {
  let h = hex.replace(/^#/, '');
  if (h.length === 3 || h.length === 4) h = [...h].map(char => char + char).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const colorAlpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 * alpha : alpha;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(colorAlpha * 1000) / 1000})`;
}

export function validateConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('背景配置格式不正确。');
  const config = { ...DEFAULTS };
  if (typeof input.enabled !== 'boolean') throw new Error('背景开关状态无效。');
  config.enabled = input.enabled;
  config.image = normalizeImage(input.image);
  if (typeof input.imageName !== 'string' || input.imageName.length > 200) throw new Error('图片名称最多 200 个字符。');
  config.imageName = input.imageName;
  for (const [key, [min, max]] of Object.entries(RANGES)) {
    if (input[key] === undefined) continue; // 旧版本保存的配置缺少新字段时，保留默认值。
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) throw new Error(`背景参数 ${key} 超出有效范围。`);
    config[key] = input[key];
  }
  if (input.maskColor !== undefined) config.maskColor = normalizeColor(input.maskColor);
  if (input.canvasColor !== undefined) config.canvasColor = normalizeColor(input.canvasColor, { allowEmpty: true });
  if (input.customCssEnabled !== undefined) {
    if (typeof input.customCssEnabled !== 'boolean') throw new Error('自定义 CSS 开关状态无效。');
    config.customCssEnabled = input.customCssEnabled;
  }
  if (input.customCss !== undefined) {
    if (typeof input.customCss !== 'string' || input.customCss.length > MAX_CUSTOM_CSS) throw new Error(`自定义 CSS 内容无效，或长度超过 ${MAX_CUSTOM_CSS} 个字符。`);
    config.customCss = input.customCss;
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
  // 模糊会产生边缘羽化，因此模糊时自动轻微放大；缩放与滤镜可叠加。
  const filter = [
    `blur(${config.blur}px)`,
    `brightness(${config.brightness}%)`,
    `contrast(${config.contrast}%)`,
    `saturate(${config.saturate}%)`,
    `grayscale(${config.grayscale}%)`,
    `sepia(${config.sepia}%)`,
    `hue-rotate(${config.hueRotate}deg)`,
  ].join(' ');
  const scale = (1 + config.blur / 200) * (config.zoom / 100);
  return {
    backgroundImage: config.image ? cssUrl(config.image) : 'none',
    backgroundSize: config.fit === 'repeat' ? 'auto' : config.fit,
    backgroundRepeat: config.fit === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundPosition: config.position,
    opacity: String(config.opacity / 100),
    filter,
    transform: scale !== 1 ? `scale(${Number(scale.toFixed(4))})` : 'none',
  };
}
