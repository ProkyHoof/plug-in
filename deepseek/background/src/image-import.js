import { MAX_IMAGE_BYTES, MAX_SOURCE_BYTES, normalizeImage } from './config.js';

const SUPPORTED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']);

// 本地图片先缩放、压缩为静态 WebP；不保存本地路径，不依赖临时 Blob 地址。
export async function importImage(file) {
  if (!file || !SUPPORTED.has(file.type)) throw new Error('请选择 PNG、JPEG、WebP、AVIF 或 GIF 图片。');
  if (!file.size || file.size > MAX_SOURCE_BYTES) throw new Error('原始图片不能为空，且不能超过 20 MB。');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('图片无法解码。');
    const ratio = Math.min(1, 2560 / Math.max(image.naturalWidth, image.naturalHeight));
    let width = Math.max(1, Math.round(image.naturalWidth * ratio));
    let height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement('canvas');
    for (let round = 0; round < 5; round++) {
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('浏览器暂不支持图片转换。');
      context.drawImage(image, 0, 0, width, height);
      for (const quality of [0.88, 0.72, 0.55]) {
        const data = canvas.toDataURL('image/webp', quality);
        if ((data.length - data.indexOf(',') - 1) * 3 / 4 <= MAX_IMAGE_BYTES) {
          return { image: normalizeImage(data), imageName: file.name.slice(0, 200) };
        }
      }
      width = Math.max(1, Math.round(width * 0.75));
      height = Math.max(1, Math.round(height * 0.75));
    }
    throw new Error('图片压缩后仍然过大，请选择较小的图片。');
  } catch (error) {
    throw new Error(error.message || '无法读取图片，请换一张图片重试。');
  } finally { URL.revokeObjectURL(url); }
}

export async function checkRemoteImage(raw) {
  const source = normalizeImage(raw);
  if (!source) throw new Error('请先输入图片链接。');
  const image = new Image();
  image.referrerPolicy = 'no-referrer';
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => { image.src = ''; reject(new Error('图片加载超时，请检查链接。')); }, 15000);
  });
  try { image.src = source; await Promise.race([image.decode(), timeout]); return source; }
  catch (error) { throw new Error(error.message?.includes('超时') ? error.message : '图片加载失败，请检查链接是否为可直接访问的图片。'); }
  finally { clearTimeout(timer); }
}
