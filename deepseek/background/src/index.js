import z from '@deepseek-ai/schemastery';
import { DEFAULTS, GRADIENTS, RANGES } from './config.js';

export const name = 'background-image';
// 对象级 volatile 保证图片与显示参数一起保存，并在重启后恢复。
// 字段必须与 config.js 的 DEFAULTS 一一对应；host.test.js 会对两者做一致性回归。
const numberField = key => z.number().min(RANGES[key][0]).max(RANGES[key][1]).default(DEFAULTS[key]);

export const Config = z.object({
  appearance: z.object({
    enabled: z.boolean().default(DEFAULTS.enabled),
    image: z.string().default(DEFAULTS.image),
    imageName: z.string().default(DEFAULTS.imageName),
    opacity: numberField('opacity'),
    blur: numberField('blur'),
    shade: numberField('shade'),
    gradient: z.union(GRADIENTS).default(DEFAULTS.gradient),
    maskColor: z.string().default(DEFAULTS.maskColor),
    zoom: numberField('zoom'),
    brightness: numberField('brightness'),
    contrast: numberField('contrast'),
    saturate: numberField('saturate'),
    grayscale: numberField('grayscale'),
    sepia: numberField('sepia'),
    hueRotate: numberField('hueRotate'),
    canvasColor: z.string().default(DEFAULTS.canvasColor),
    surfaceOpacity: numberField('surfaceOpacity'),
    titlebarOpacity: numberField('titlebarOpacity'),
    popoverOpacity: numberField('popoverOpacity'),
    conversationOpacity: numberField('conversationOpacity'),
    dialogOpacity: numberField('dialogOpacity'),
    fit: z.union(['cover', 'contain', 'repeat']).default(DEFAULTS.fit),
    position: z.union(['center', 'top', 'bottom', 'left', 'right']).default(DEFAULTS.position),
  }).default({ ...DEFAULTS }).volatile(),
});

export function apply(ctx) {
  ctx.inject(['settings'], child => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });
}
