// src/index.js
import z from "@deepseek-ai/schemastery";

// src/config.js
var MAX_IMAGE_BYTES = 360 * 1024;
var MAX_SOURCE_BYTES = 20 * 1024 * 1024;
var MAX_CUSTOM_CSS = 1e4;
var DEFAULTS = Object.freeze({
  enabled: false,
  image: "",
  imageName: "",
  // 图片层
  opacity: 55,
  blur: 0,
  shade: 15,
  maskColor: "#000000",
  zoom: 100,
  // 图片滤镜
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  // 图片后方的底色，空字符串表示跟随宿主主题
  canvasColor: "",
  // 前景面板透明度
  surfaceOpacity: 80,
  conversationOpacity: 80,
  dialogOpacity: 80,
  outputOpacity: 100,
  // 布局
  fit: "cover",
  position: "center",
  // 高级自定义样式
  customCssEnabled: false,
  customCss: ""
});
var RANGES = Object.freeze({
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
  outputOpacity: [0, 100]
});

// src/index.js
var name = "background-image";
var numberField = (key) => z.number().min(RANGES[key][0]).max(RANGES[key][1]).default(DEFAULTS[key]);
var Config = z.object({
  appearance: z.object({
    enabled: z.boolean().default(DEFAULTS.enabled),
    image: z.string().default(DEFAULTS.image),
    imageName: z.string().default(DEFAULTS.imageName),
    opacity: numberField("opacity"),
    blur: numberField("blur"),
    shade: numberField("shade"),
    maskColor: z.string().default(DEFAULTS.maskColor),
    zoom: numberField("zoom"),
    brightness: numberField("brightness"),
    contrast: numberField("contrast"),
    saturate: numberField("saturate"),
    grayscale: numberField("grayscale"),
    sepia: numberField("sepia"),
    hueRotate: numberField("hueRotate"),
    canvasColor: z.string().default(DEFAULTS.canvasColor),
    surfaceOpacity: numberField("surfaceOpacity"),
    conversationOpacity: numberField("conversationOpacity"),
    dialogOpacity: numberField("dialogOpacity"),
    outputOpacity: numberField("outputOpacity"),
    fit: z.union(["cover", "contain", "repeat"]).default(DEFAULTS.fit),
    position: z.union(["center", "top", "bottom", "left", "right"]).default(DEFAULTS.position),
    customCssEnabled: z.boolean().default(DEFAULTS.customCssEnabled),
    customCss: z.string().max(MAX_CUSTOM_CSS).default(DEFAULTS.customCss)
  }).default({ ...DEFAULTS }).volatile()
});
function apply(ctx) {
  ctx.inject(["settings"], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });
}
export {
  Config,
  apply,
  name
};
