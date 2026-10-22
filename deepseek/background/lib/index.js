// src/index.js
import z from "@deepseek-ai/schemastery";

// src/config.js
var MAX_IMAGE_BYTES = 360 * 1024;
var MAX_SOURCE_BYTES = 20 * 1024 * 1024;
var GRADIENTS = Object.freeze(["none", "bottom", "top", "both"]);
var DEFAULTS = Object.freeze({
  enabled: false,
  image: "",
  imageName: "",
  // 图片层
  opacity: 55,
  blur: 0,
  shade: 15,
  gradient: "none",
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
  // 界面各表面透明度
  surfaceOpacity: 80,
  // 侧边栏
  titlebarOpacity: 100,
  // 顶部标题栏
  popoverOpacity: 100,
  // 弹层、菜单、设置卡片
  conversationOpacity: 80,
  // 底部文本输入框
  dialogOpacity: 80,
  // 对话气泡、代码块与工具结果卡片
  // 布局
  fit: "cover",
  position: "center"
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
  titlebarOpacity: [0, 100],
  popoverOpacity: [0, 100],
  conversationOpacity: [0, 100],
  dialogOpacity: [0, 100]
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
    gradient: z.union(GRADIENTS).default(DEFAULTS.gradient),
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
    titlebarOpacity: numberField("titlebarOpacity"),
    popoverOpacity: numberField("popoverOpacity"),
    conversationOpacity: numberField("conversationOpacity"),
    dialogOpacity: numberField("dialogOpacity"),
    fit: z.union(["cover", "contain", "repeat"]).default(DEFAULTS.fit),
    position: z.union(["center", "top", "bottom", "left", "right"]).default(DEFAULTS.position)
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
