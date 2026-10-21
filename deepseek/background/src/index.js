import z from '@deepseek-ai/schemastery';
import { DEFAULTS } from './config.js';

export const name = 'background-image';
// 对象级 volatile 保证图片与显示参数一起保存，并在重启后恢复。
export const Config = z.object({
  appearance: z.object({
    enabled: z.boolean().default(DEFAULTS.enabled),
    image: z.string().default(''),
    imageName: z.string().default(''),
    opacity: z.number().min(0).max(100).default(DEFAULTS.opacity),
    blur: z.number().min(0).max(30).default(DEFAULTS.blur),
    shade: z.number().min(0).max(80).default(DEFAULTS.shade),
    surfaceOpacity: z.number().min(0).max(100).default(DEFAULTS.surfaceOpacity),
    fit: z.union(['cover', 'contain', 'repeat']).default(DEFAULTS.fit),
    position: z.union(['center', 'top', 'bottom', 'left', 'right']).default(DEFAULTS.position),
  }).default({ ...DEFAULTS }).volatile(),
});

export function apply(ctx) {
  ctx.inject(['settings'], child => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });
}
