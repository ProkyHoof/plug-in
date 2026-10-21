// src/index.js
import z from "@deepseek-ai/schemastery";

// src/config.js
var MAX_IMAGE_BYTES = 360 * 1024;
var MAX_SOURCE_BYTES = 20 * 1024 * 1024;
var DEFAULTS = Object.freeze({
  enabled: false,
  image: "",
  imageName: "",
  opacity: 55,
  blur: 0,
  shade: 15,
  surfaceOpacity: 80,
  conversationOpacity: 80,
  dialogOpacity: 80,
  outputOpacity: 100,
  fit: "cover",
  position: "center"
});

// src/index.js
var name = "background-image";
var Config = z.object({
  appearance: z.object({
    enabled: z.boolean().default(DEFAULTS.enabled),
    image: z.string().default(""),
    imageName: z.string().default(""),
    opacity: z.number().min(0).max(100).default(DEFAULTS.opacity),
    blur: z.number().min(0).max(30).default(DEFAULTS.blur),
    shade: z.number().min(0).max(80).default(DEFAULTS.shade),
    surfaceOpacity: z.number().min(0).max(100).default(DEFAULTS.surfaceOpacity),
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
