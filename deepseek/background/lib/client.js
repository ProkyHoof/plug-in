window.__ModuleLoader__.load({ id: 'dsh-background-image', factory(require) {
const module = { exports: {} }; const exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react2 = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/App.jsx
var import_react = __toESM(require("react"), 1);

// src/config.js
var NAMESPACE = "background-image";
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
  fit: "cover",
  position: "center"
});
function normalizeImage(value) {
  if (typeof value !== "string") throw new Error("\u56FE\u7247\u5730\u5740\u683C\u5F0F\u4E0D\u6B63\u786E\u3002");
  const image = value.trim();
  if (!image) return "";
  if (/^data:image\/(?:png|jpeg|webp|avif);base64,[a-zA-Z0-9+/]+={0,2}$/.test(image)) {
    const payload = image.slice(image.indexOf(",") + 1);
    const bytes = payload.length * 3 / 4 - (payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0);
    if (payload.length % 4 || bytes > MAX_IMAGE_BYTES) throw new Error("\u538B\u7F29\u540E\u7684\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC7 360 KB\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u56FE\u7247\u3002");
    return image;
  }
  if (image.length > 4096) throw new Error("\u56FE\u7247\u94FE\u63A5\u8FC7\u957F\u3002");
  let url;
  try {
    url = new URL(image);
  } catch {
    throw new Error("\u8BF7\u8F93\u5165\u6709\u6548\u7684 HTTPS \u56FE\u7247\u94FE\u63A5\uFF0C\u6216\u5BFC\u5165\u672C\u5730\u56FE\u7247\u3002");
  }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("\u56FE\u7247\u94FE\u63A5\u987B\u4F7F\u7528 HTTPS\uFF0C\u4E14\u4E0D\u80FD\u5305\u542B\u8D26\u53F7\u6216\u5BC6\u7801\u3002");
  return url.href;
}
function validateConfig(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("\u80CC\u666F\u914D\u7F6E\u683C\u5F0F\u4E0D\u6B63\u786E\u3002");
  const config = { ...DEFAULTS };
  if (typeof input.enabled !== "boolean") throw new Error("\u80CC\u666F\u5F00\u5173\u72B6\u6001\u65E0\u6548\u3002");
  config.enabled = input.enabled;
  config.image = normalizeImage(input.image);
  if (typeof input.imageName !== "string" || input.imageName.length > 200) throw new Error("\u56FE\u7247\u540D\u79F0\u6700\u591A 200 \u4E2A\u5B57\u7B26\u3002");
  config.imageName = input.imageName;
  for (const [key, max] of [["opacity", 100], ["blur", 30], ["shade", 80], ["surfaceOpacity", 100]]) {
    if (!Number.isFinite(input[key]) || input[key] < 0 || input[key] > max) throw new Error(`\u80CC\u666F\u53C2\u6570 ${key} \u8D85\u51FA\u6709\u6548\u8303\u56F4\u3002`);
    config[key] = input[key];
  }
  if (!["cover", "contain", "repeat"].includes(input.fit)) throw new Error("\u56FE\u7247\u663E\u793A\u65B9\u5F0F\u65E0\u6548\u3002");
  if (!["center", "top", "bottom", "left", "right"].includes(input.position)) throw new Error("\u56FE\u7247\u4F4D\u7F6E\u65E0\u6548\u3002");
  config.fit = input.fit;
  config.position = input.position;
  return config;
}
function cssUrl(image) {
  return `url("${image.replace(/["\\\n\r\f]/g, (char) => `\\${char.codePointAt(0).toString(16)} `)}")`;
}
function imageStyles(value) {
  const config = validateConfig(value);
  return {
    backgroundImage: config.image ? cssUrl(config.image) : "none",
    backgroundSize: config.fit === "repeat" ? "auto" : config.fit,
    backgroundRepeat: config.fit === "repeat" ? "repeat" : "no-repeat",
    backgroundPosition: config.position,
    opacity: String(config.opacity / 100),
    filter: `blur(${config.blur}px)`,
    transform: config.blur ? `scale(${1 + config.blur / 200})` : "none"
  };
}

// src/image-import.js
var SUPPORTED = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"]);
async function importImage(file) {
  if (!file || !SUPPORTED.has(file.type)) throw new Error("\u8BF7\u9009\u62E9 PNG\u3001JPEG\u3001WebP\u3001AVIF \u6216 GIF \u56FE\u7247\u3002");
  if (!file.size || file.size > MAX_SOURCE_BYTES) throw new Error("\u539F\u59CB\u56FE\u7247\u4E0D\u80FD\u4E3A\u7A7A\uFF0C\u4E14\u4E0D\u80FD\u8D85\u8FC7 20 MB\u3002");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("\u56FE\u7247\u65E0\u6CD5\u89E3\u7801\u3002");
    const ratio = Math.min(1, 2560 / Math.max(image.naturalWidth, image.naturalHeight));
    let width = Math.max(1, Math.round(image.naturalWidth * ratio));
    let height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement("canvas");
    for (let round = 0; round < 5; round++) {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("\u6D4F\u89C8\u5668\u6682\u4E0D\u652F\u6301\u56FE\u7247\u8F6C\u6362\u3002");
      context.drawImage(image, 0, 0, width, height);
      for (const quality of [0.88, 0.72, 0.55]) {
        const data = canvas.toDataURL("image/webp", quality);
        if ((data.length - data.indexOf(",") - 1) * 3 / 4 <= MAX_IMAGE_BYTES) {
          return { image: normalizeImage(data), imageName: file.name.slice(0, 200) };
        }
      }
      width = Math.max(1, Math.round(width * 0.75));
      height = Math.max(1, Math.round(height * 0.75));
    }
    throw new Error("\u56FE\u7247\u538B\u7F29\u540E\u4ECD\u7136\u8FC7\u5927\uFF0C\u8BF7\u9009\u62E9\u8F83\u5C0F\u7684\u56FE\u7247\u3002");
  } catch (error) {
    throw new Error(error.message || "\u65E0\u6CD5\u8BFB\u53D6\u56FE\u7247\uFF0C\u8BF7\u6362\u4E00\u5F20\u56FE\u7247\u91CD\u8BD5\u3002");
  } finally {
    URL.revokeObjectURL(url);
  }
}
async function checkRemoteImage(raw) {
  const source = normalizeImage(raw);
  if (!source) throw new Error("\u8BF7\u5148\u8F93\u5165\u56FE\u7247\u94FE\u63A5\u3002");
  const image = new Image();
  image.referrerPolicy = "no-referrer";
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      image.src = "";
      reject(new Error("\u56FE\u7247\u52A0\u8F7D\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u3002"));
    }, 15e3);
  });
  try {
    image.src = source;
    await Promise.race([image.decode(), timeout]);
    return source;
  } catch (error) {
    throw new Error(error.message?.includes("\u8D85\u65F6") ? error.message : "\u56FE\u7247\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u4E3A\u53EF\u76F4\u63A5\u8BBF\u95EE\u7684\u56FE\u7247\u3002");
  } finally {
    clearTimeout(timer);
  }
}

// src/App.jsx
function ImageIcon({ size = 20 }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ import_react.default.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "4", stroke: "currentColor", strokeWidth: "1.6" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "8.5", cy: "8.5", r: "1.5", fill: "currentColor" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "m4 17 5-5 4 4 3-3 5 5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }));
}
function Slider({ label, description, value, max = 100, unit = "%", disabled, onChange }) {
  return /* @__PURE__ */ import_react.default.createElement("label", { className: "bgp-slider" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "bgp-control-title" }, label, /* @__PURE__ */ import_react.default.createElement("output", null, value, unit)), /* @__PURE__ */ import_react.default.createElement("span", { className: "bgp-caption" }, description), /* @__PURE__ */ import_react.default.createElement("input", { "aria-label": label, type: "range", min: "0", max, value, disabled, onChange: (event) => onChange(Number(event.target.value)) }));
}
function App({ controller }) {
  const state = (0, import_react.useSyncExternalStore)(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const fileInput = (0, import_react.useRef)(null);
  const [url, setUrl] = (0, import_react.useState)("");
  const [working, setWorking] = (0, import_react.useState)(false);
  const [dragging, setDragging] = (0, import_react.useState)(false);
  const [imageError, setImageError] = (0, import_react.useState)("");
  const mounted = (0, import_react.useRef)(true);
  const value = state.value;
  const disabled = state.loading || state.busy || working || !state.writable;
  const hasImage = !!value.image;
  (0, import_react.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.cancelPreview();
    };
  }, [controller]);
  async function acceptFile(file) {
    if (disabled || !file) return;
    setWorking(true);
    setImageError("");
    try {
      const result = await importImage(file);
      if (mounted.current) controller.update({ ...result, enabled: true });
    } catch (error) {
      if (mounted.current) setImageError(error.message);
    } finally {
      if (mounted.current) setWorking(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function loadUrl(event) {
    event.preventDefault();
    if (disabled) return;
    setWorking(true);
    setImageError("");
    try {
      const image = await checkRemoteImage(url);
      if (mounted.current) {
        controller.update({ image, imageName: "\u5728\u7EBF\u80CC\u666F\u56FE\u7247", enabled: true });
        setUrl("");
      }
    } catch (error) {
      if (mounted.current) setImageError(error.message);
    } finally {
      if (mounted.current) setWorking(false);
    }
  }
  const change = (key) => (next) => controller.update({ [key]: next });
  return /* @__PURE__ */ import_react.default.createElement("main", { className: "bgp" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "bgp-header" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-eyebrow" }, /* @__PURE__ */ import_react.default.createElement(ImageIcon, { size: 14 }), "\u5DE5\u4F5C\u533A\u5916\u89C2"), /* @__PURE__ */ import_react.default.createElement("h1", null, "\u80CC\u666F\u56FE\u7247", /* @__PURE__ */ import_react.default.createElement("span", null, "BACKGROUND")), /* @__PURE__ */ import_react.default.createElement("p", null, "\u9009\u62E9\u4E00\u5F20\u559C\u6B22\u7684\u56FE\u7247\uFF0C\u8C03\u6574\u6210\u8212\u9002\u7684\u5DE5\u4F5C\u80CC\u666F\u3002")), /* @__PURE__ */ import_react.default.createElement("label", { className: "bgp-enable" }, /* @__PURE__ */ import_react.default.createElement("span", null, value.enabled ? "\u80CC\u666F\u5DF2\u5F00\u542F" : "\u80CC\u666F\u5DF2\u5173\u95ED"), /* @__PURE__ */ import_react.default.createElement("input", { type: "checkbox", role: "switch", "aria-label": "\u542F\u7528\u80CC\u666F\u56FE\u7247", checked: value.enabled, disabled: disabled || !hasImage, onChange: (event) => controller.update({ enabled: event.target.checked }) }), /* @__PURE__ */ import_react.default.createElement("i", null))), (state.error || imageError) && /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-banner bgp-error", role: "alert" }, imageError || state.error), state.stale && /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-banner bgp-warning", role: "alert" }, "\u5176\u4ED6\u7A97\u53E3\u5DF2\u4FEE\u6539\u80CC\u666F\uFF0C\u8BF7\u70B9\u51FB\u201C\u91CD\u65B0\u8F7D\u5165\u201D\u540E\u518D\u7F16\u8F91\u3002"), state.notice && /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-banner", role: "status" }, state.notice), !state.writable && !state.loading && /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-banner bgp-warning" }, "\u5F53\u524D Harness \u914D\u7F6E\u4E3A\u53EA\u8BFB\uFF0C\u65E0\u6CD5\u4FEE\u6539\u80CC\u666F\u3002"), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-grid" }, /* @__PURE__ */ import_react.default.createElement("section", { className: "bgp-left" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-card" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-section-title" }, /* @__PURE__ */ import_react.default.createElement("h2", null, "\u4F60\u7684\u80CC\u666F"), /* @__PURE__ */ import_react.default.createElement("span", null, "01 / \u56FE\u7247\u6765\u6E90")), /* @__PURE__ */ import_react.default.createElement("input", { ref: fileInput, className: "bgp-file", type: "file", accept: "image/png,image/jpeg,image/webp,image/avif,image/gif", "aria-label": "\u9009\u62E9\u672C\u5730\u80CC\u666F\u56FE\u7247", onChange: (event) => acceptFile(event.target.files?.[0]), disabled }), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: `bgp-upload ${dragging ? "is-dragging" : ""} ${hasImage ? "has-image" : ""}`, disabled, onClick: () => fileInput.current?.click(), onDragOver: (event) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  }, onDragLeave: () => setDragging(false), onDrop: (event) => {
    event.preventDefault();
    setDragging(false);
    void acceptFile(event.dataTransfer.files[0]);
  } }, hasImage ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("img", { src: value.image, alt: "\u5F53\u524D\u80CC\u666F\u56FE\u7247", referrerPolicy: "no-referrer", onError: () => setImageError("\u80CC\u666F\u56FE\u7247\u6682\u65F6\u65E0\u6CD5\u52A0\u8F7D\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u56FE\u7247\u6216\u68C0\u67E5\u94FE\u63A5\u3002") }), /* @__PURE__ */ import_react.default.createElement("span", { className: "bgp-upload-replace" }, /* @__PURE__ */ import_react.default.createElement(ImageIcon, { size: 17 }), " \u66F4\u6362\u80CC\u666F\u56FE\u7247")) : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("span", { className: "bgp-upload-icon" }, /* @__PURE__ */ import_react.default.createElement(ImageIcon, { size: 28 })), /* @__PURE__ */ import_react.default.createElement("strong", null, working ? "\u6B63\u5728\u5904\u7406\u56FE\u7247\u2026" : "\u70B9\u51FB\u4E0A\u4F20\uFF0C\u6216\u5C06\u56FE\u7247\u62D6\u5230\u8FD9\u91CC"), /* @__PURE__ */ import_react.default.createElement("span", null, "PNG\u3001JPEG\u3001WebP\u3001AVIF\u3001GIF \xB7 \u6700\u5927 20 MB"), /* @__PURE__ */ import_react.default.createElement("small", null, "\u81EA\u52A8\u7F29\u653E\u538B\u7F29\uFF0C\u672C\u5730\u56FE\u7247\u65E0\u9700\u56FE\u5E8A"))), hasImage && /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-image-info" }, /* @__PURE__ */ import_react.default.createElement("span", { title: value.imageName }, value.imageName || "\u80CC\u666F\u56FE\u7247"), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", disabled, onClick: () => controller.update({ image: "", imageName: "", enabled: false }) }, "\u79FB\u9664\u56FE\u7247")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-divider" }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u6216\u4F7F\u7528\u56FE\u7247\u94FE\u63A5")), /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: loadUrl, className: "bgp-url" }, /* @__PURE__ */ import_react.default.createElement("input", { type: "url", "aria-label": "HTTPS \u56FE\u7247\u94FE\u63A5", placeholder: "https://example.com/wallpaper.jpg", value: url, onChange: (event) => setUrl(event.target.value), disabled }), /* @__PURE__ */ import_react.default.createElement("button", { type: "submit", disabled: disabled || !url.trim() }, working ? "\u8F7D\u5165\u4E2D\u2026" : "\u8F7D\u5165")), /* @__PURE__ */ import_react.default.createElement("p", { className: "bgp-note" }, "\u672C\u5730\u56FE\u7247\u4F1A\u538B\u7F29\u540E\u4FDD\u5B58\u5230\u5F53\u524D profile\u3002GIF \u5C06\u4FDD\u5B58\u4E3A\u9759\u6001\u56FE\u7247\u3002")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-card bgp-layout" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-section-title" }, /* @__PURE__ */ import_react.default.createElement("h2", null, "\u663E\u793A\u65B9\u5F0F"), /* @__PURE__ */ import_react.default.createElement("span", null, "02 / \u5E03\u5C40")), /* @__PURE__ */ import_react.default.createElement("fieldset", { disabled: disabled || !hasImage }, /* @__PURE__ */ import_react.default.createElement("legend", null, "\u56FE\u7247\u9002\u914D"), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-segments" }, [["cover", "\u94FA\u6EE1"], ["contain", "\u5B8C\u6574\u663E\u793A"], ["repeat", "\u5E73\u94FA"]].map(([id, label]) => /* @__PURE__ */ import_react.default.createElement("button", { key: id, type: "button", "aria-pressed": value.fit === id, onClick: () => controller.update({ fit: id }) }, label)))), /* @__PURE__ */ import_react.default.createElement("label", { className: "bgp-position" }, "\u56FE\u7247\u4F4D\u7F6E", /* @__PURE__ */ import_react.default.createElement("select", { "aria-label": "\u56FE\u7247\u4F4D\u7F6E", disabled: disabled || !hasImage, value: value.position, onChange: (event) => controller.update({ position: event.target.value }) }, /* @__PURE__ */ import_react.default.createElement("option", { value: "center" }, "\u5C45\u4E2D"), /* @__PURE__ */ import_react.default.createElement("option", { value: "top" }, "\u9876\u90E8"), /* @__PURE__ */ import_react.default.createElement("option", { value: "bottom" }, "\u5E95\u90E8"), /* @__PURE__ */ import_react.default.createElement("option", { value: "left" }, "\u5DE6\u4FA7"), /* @__PURE__ */ import_react.default.createElement("option", { value: "right" }, "\u53F3\u4FA7"))))), /* @__PURE__ */ import_react.default.createElement("section", { className: "bgp-right" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-preview-top" }, /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("i", null), "\u5B9E\u65F6\u9884\u89C8"), /* @__PURE__ */ import_react.default.createElement("span", null, state.dirty ? "\u6B63\u5728\u9884\u89C8 \xB7 \u5C1A\u672A\u4FDD\u5B58" : "\u5DF2\u4FDD\u5B58\u7684\u80CC\u666F")), /* @__PURE__ */ import_react.default.createElement("div", { className: `bgp-preview ${hasImage && value.enabled ? "is-active" : ""}` }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-preview-photo", style: hasImage && value.enabled ? imageStyles(value) : { backgroundImage: "none" } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-preview-shade", style: { opacity: hasImage && value.enabled ? value.shade / 100 : 0 } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-preview-chrome" }, /* @__PURE__ */ import_react.default.createElement("span", null), /* @__PURE__ */ import_react.default.createElement("span", null), /* @__PURE__ */ import_react.default.createElement("span", null), /* @__PURE__ */ import_react.default.createElement("small", null, "DeepSeek Harness")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-mini-sidebar", style: { backgroundColor: `color-mix(in srgb, var(--bgp-surface) ${hasImage && value.enabled ? value.surfaceOpacity : 100}%, transparent)` } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-mini-logo" }, "\u25C7"), /* @__PURE__ */ import_react.default.createElement("div", null), /* @__PURE__ */ import_react.default.createElement("div", null), /* @__PURE__ */ import_react.default.createElement("div", null), /* @__PURE__ */ import_react.default.createElement("span", null), /* @__PURE__ */ import_react.default.createElement("div", null)), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-mini-main" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "bgp-preview-label" }, "\u4F60\u7684\u5DE5\u4F5C\u533A\uFF0C\u6362\u4E00\u5E45\u98CE\u666F"), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-mini-message" }, "\u4ECA\u5929\u60F3\u505A\u4E9B\u4EC0\u4E48\uFF1F"), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-mini-response" }, "\u4ECE\u4E00\u4E2A\u65B0\u60F3\u6CD5\u5F00\u59CB\u3002", /* @__PURE__ */ import_react.default.createElement("span", null), /* @__PURE__ */ import_react.default.createElement("span", null)), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-mini-input", style: { opacity: 0.7 + value.surfaceOpacity / 400 } }, "\u63CF\u8FF0\u4F60\u60F3\u8981\u6784\u5EFA\u7684\u5185\u5BB9 ", /* @__PURE__ */ import_react.default.createElement("span", null, "\u2191"))), !hasImage && /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-preview-empty" }, /* @__PURE__ */ import_react.default.createElement(ImageIcon, { size: 29 }), /* @__PURE__ */ import_react.default.createElement("span", null, "\u5BFC\u5165\u56FE\u7247\u540E\u9884\u89C8\u6548\u679C"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-preview-caption" }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u6587\u5B57\u4E0E\u63A7\u4EF6\u4FDD\u6301\u6E05\u6670"), /* @__PURE__ */ import_react.default.createElement("span", null, "\u9884\u89C8\u6BD4\u4F8B\u968F\u7A97\u53E3\u53D8\u5316")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-card bgp-adjustments" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-section-title" }, /* @__PURE__ */ import_react.default.createElement("h2", null, "\u7EC6\u8282\u8C03\u8282"), /* @__PURE__ */ import_react.default.createElement("span", null, "03 / \u6C1B\u56F4")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-slider-grid" }, /* @__PURE__ */ import_react.default.createElement(Slider, { label: "\u56FE\u7247\u4E0D\u900F\u660E\u5EA6", description: "\u964D\u4F4E\u6570\u503C\uFF0C\u8BA9\u80CC\u666F\u66F4\u8F7B\u67D4", value: value.opacity, disabled: disabled || !hasImage, onChange: change("opacity") }), /* @__PURE__ */ import_react.default.createElement(Slider, { label: "\u80CC\u666F\u6A21\u7CCA", description: "\u67D4\u5316\u7EC6\u8282\uFF0C\u51CF\u5C11\u89C6\u89C9\u5E72\u6270", value: value.blur, max: 30, unit: "px", disabled: disabled || !hasImage, onChange: change("blur") }), /* @__PURE__ */ import_react.default.createElement(Slider, { label: "\u6697\u8272\u906E\u7F69", description: "\u538B\u4F4E\u4EAE\u90E8\uFF0C\u7A81\u51FA\u524D\u666F\u5185\u5BB9", value: value.shade, max: 80, disabled: disabled || !hasImage, onChange: change("shade") }), /* @__PURE__ */ import_react.default.createElement(Slider, { label: "\u9762\u677F\u4E0D\u900F\u660E\u5EA6", description: "\u8C03\u8282\u4FA7\u8FB9\u680F\u3001\u8F93\u5165\u6846\u548C\u6C14\u6CE1", value: value.surfaceOpacity, disabled: disabled || !hasImage, onChange: change("surfaceOpacity") }))))), /* @__PURE__ */ import_react.default.createElement("footer", { className: "bgp-footer" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", { className: "bgp-status-dot" }), state.loading ? "\u6B63\u5728\u8BFB\u53D6\u80CC\u666F\u8BBE\u7F6E\u2026" : state.busy ? "\u6B63\u5728\u4FDD\u5B58\u2026" : state.dirty ? "\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u4EC5\u7528\u4E8E\u5F53\u524D\u7A97\u53E3\u9884\u89C8" : "\u8BBE\u7F6E\u4FDD\u5B58\u5728\u5F53\u524D Harness profile"), /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-footer-actions" }, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "bgp-button", disabled, onClick: () => controller.update({ ...DEFAULTS, image: value.image, imageName: value.imageName, enabled: hasImage }) }, "\u91CD\u7F6E\u53C2\u6570"), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "bgp-button", disabled: state.busy || working || state.loading, onClick: () => {
    setImageError("");
    void controller.load(true);
  } }, "\u91CD\u65B0\u8F7D\u5165"), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "bgp-button bgp-primary", disabled: disabled || !state.dirty || state.stale, onClick: () => controller.save() }, state.busy ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u4FDD\u5B58\u80CC\u666F"))));
}
function SettingsRow({ open }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "bgp-settings-row" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "\u80CC\u666F\u56FE\u7247"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u5BFC\u5165\u80CC\u666F\uFF0C\u8C03\u6574\u900F\u660E\u5EA6\u3001\u6A21\u7CCA\u548C\u5E03\u5C40\u3002")), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", onClick: open }, "\u8BBE\u7F6E\u80CC\u666F \u2192"));
}

// src/controller.js
function unwrap(answer) {
  if (!answer?.ok) throw new Error(answer?.error?.message || "\u65E0\u6CD5\u8FDE\u63A5 Harness\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
  return answer.value;
}
var BackgroundController = class {
  constructor(ctx, renderer) {
    this.ctx = ctx;
    this.renderer = renderer;
    this.listeners = /* @__PURE__ */ new Set();
    this.generation = 0;
    this.disposed = false;
    this.state = { value: { ...DEFAULTS }, saved: { ...DEFAULTS }, revision: void 0, loading: true, busy: false, dirty: false, stale: false, writable: false, error: "", notice: "" };
    this.getSnapshot = () => this.state;
    this.subscribe = (listener) => {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    };
  }
  patch(values) {
    if (this.disposed) return;
    this.state = { ...this.state, ...values };
    this.listeners.forEach((listener) => listener());
  }
  async load(discard = false) {
    if (this.disposed || this.state.busy) return;
    const generation = ++this.generation;
    try {
      const result = unwrap(await this.ctx.remote.settings.describe());
      if (generation !== this.generation || this.disposed) return;
      const section = result.namespaces.find((item) => item.ns === NAMESPACE);
      if (!section) throw new Error("\u672A\u627E\u5230\u80CC\u666F\u914D\u7F6E\uFF0C\u8BF7\u68C0\u67E5 bundle \u4E2D\u7684\u914D\u7F6E\u9879\u7F16\u53F7\u662F\u5426\u4E3A background-image\u3002");
      const saved = validateConfig(section.value.appearance);
      if (this.state.dirty && !discard) {
        this.patch({ saved, stale: section.revision !== this.state.revision, writable: result.writable });
        return;
      }
      this.renderer.apply(saved);
      this.patch({ saved, value: { ...saved }, revision: section.revision, loading: false, dirty: false, stale: false, writable: result.writable, error: "" });
    } catch (error) {
      if (generation === this.generation) this.patch({ loading: false, error: error.message });
    }
  }
  update(values) {
    if (this.state.loading || this.state.busy || !this.state.writable) return;
    try {
      const value = validateConfig({ ...this.state.value, ...values });
      this.renderer.apply(value);
      this.patch({ value, dirty: JSON.stringify(value) !== JSON.stringify(this.state.saved), error: "", notice: "" });
    } catch (error) {
      this.patch({ error: error.message });
    }
  }
  cancelPreview() {
    if (this.state.busy) return;
    this.renderer.apply(this.state.saved);
    this.patch({ value: { ...this.state.saved }, dirty: false, stale: false });
    void this.load(true);
  }
  async save() {
    if (this.state.busy || this.state.loading || !this.state.dirty || !this.state.writable || this.state.stale) return;
    const value = validateConfig(this.state.value);
    this.generation++;
    this.patch({ busy: true, error: "", notice: "" });
    try {
      const answer = await this.ctx.remote.settings.update(NAMESPACE, { appearance: value }, this.state.revision);
      if (!answer.ok && answer.error?.code === "settings/conflict") {
        this.patch({ stale: true });
        throw new Error("\u5176\u4ED6\u7A97\u53E3\u5DF2\u4FEE\u6539\u80CC\u666F\uFF0C\u8BF7\u91CD\u65B0\u8F7D\u5165\u540E\u518D\u4FDD\u5B58\u3002");
      }
      const section = unwrap(answer);
      const saved = validateConfig(section.value.appearance);
      this.renderer.apply(saved);
      this.patch({ value: { ...saved }, saved, revision: section.revision, dirty: false, stale: false, notice: "\u80CC\u666F\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\uFF0C\u91CD\u542F\u540E\u4F1A\u81EA\u52A8\u6062\u590D\u3002" });
    } catch (error) {
      this.patch({ error: error.message });
    } finally {
      this.patch({ busy: false });
      void this.load();
    }
  }
  dispose() {
    this.disposed = true;
    this.generation++;
    this.listeners.clear();
  }
};

// src/renderer.js
var ATTRIBUTE = "data-dsh-background-image";
var OWNED_VARIABLES = ["--dsh-bg-canvas", "--dsh-bg-sidebar", "--dsh-bg-input", "--dsh-bg-bubble", "--dsh-bg-surface"];
var BackgroundRenderer = class {
  constructor(document2) {
    this.document = document2;
    this.body = document2.body;
    this.previous = new Map(OWNED_VARIABLES.map((name) => [name, [this.body.style.getPropertyValue(name), this.body.style.getPropertyPriority(name)]]));
    this.layer = document2.createElement("div");
    this.layer.className = "dsh-background-layer";
    this.layer.hidden = true;
    this.layer.setAttribute("aria-hidden", "true");
    this.picture = document2.createElement("div");
    this.picture.className = "dsh-background-picture";
    this.mask = document2.createElement("div");
    this.mask.className = "dsh-background-mask";
    this.layer.append(this.picture, this.mask);
    this.body.prepend(this.layer);
    this.active = false;
    this.disposed = false;
  }
  // 读取前暂时移除本插件标记，获得宿主当前主题的原始颜色。
  captureTheme() {
    this.body.removeAttribute(ATTRIBUTE);
    const styles = this.document.defaultView.getComputedStyle(this.body);
    const dark = this.body.hasAttribute("data-ds-dark-theme");
    this.body.style.setProperty("--dsh-bg-canvas", styles.getPropertyValue("--dsw-alias-bg-base").trim() || (dark ? "#151517" : "#ffffff"));
    this.body.style.setProperty("--dsh-bg-sidebar", styles.getPropertyValue("--dsw-specific-sidebar-fill").trim() || (dark ? "#1b1b1c" : "#f9fafb"));
    this.body.style.setProperty("--dsh-bg-input", styles.getPropertyValue("--dsw-specific-input-major").trim() || (dark ? "#2c2c2e" : "#ffffff"));
    this.body.style.setProperty("--dsh-bg-bubble", styles.getPropertyValue("--dsw-specific-bubble").trim() || (dark ? "#2c2c2e" : "#edf3fe"));
  }
  apply(raw) {
    if (this.disposed) return;
    const config = validateConfig(raw);
    if (!config.enabled || !config.image) {
      this.hide();
      return;
    }
    this.captureTheme();
    Object.assign(this.picture.style, imageStyles(config));
    this.mask.style.backgroundColor = `rgba(0, 0, 0, ${config.shade / 100})`;
    this.body.style.setProperty("--dsh-bg-surface", `${config.surfaceOpacity}%`);
    this.layer.hidden = false;
    this.body.setAttribute(ATTRIBUTE, "");
    this.active = true;
  }
  hide() {
    this.body.removeAttribute(ATTRIBUTE);
    this.layer.hidden = true;
    this.picture.style.backgroundImage = "none";
    this.restoreVariables();
    this.active = false;
  }
  restoreVariables() {
    for (const [name, [value, priority]] of this.previous) {
      if (value) this.body.style.setProperty(name, value, priority);
      else this.body.style.removeProperty(name);
    }
  }
  dispose() {
    this.hide();
    this.layer.remove();
    this.disposed = true;
  }
};

// src/style.css
var style_default = '/* \u80CC\u666F\u5C42\u72EC\u7ACB\u4E8E\u5185\u5BB9\u5C42\uFF0C\u6587\u5B57\u3001\u6309\u94AE\u548C\u8F93\u5165\u533A\u4E0D\u4F1A\u6574\u4F53\u53D8\u900F\u660E\u3002 */\r\n.dsh-background-layer{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}.dsh-background-layer[hidden]{display:none}.dsh-background-picture,.dsh-background-mask{position:absolute;inset:0;pointer-events:none}.dsh-background-picture{transform-origin:center}.dsh-background-mask{background:transparent}body[data-dsh-background-image]{isolation:isolate;background-color:var(--dsh-bg-canvas)!important;--dsw-alias-bg-base:transparent!important;--dsw-specific-sidebar-fill:color-mix(in srgb,var(--dsh-bg-sidebar) var(--dsh-bg-surface),transparent)!important;--dsw-specific-input-major:color-mix(in srgb,var(--dsh-bg-input) var(--dsh-bg-surface),transparent)!important;--dsw-specific-bubble:color-mix(in srgb,var(--dsh-bg-bubble) var(--dsh-bg-surface),transparent)!important}\r\n/* \u8BBE\u7F6E\u9875\u9762\u4F7F\u7528\u5C40\u90E8\u7C7B\u540D\uFF1B\u5F39\u7A97\u3001\u4EE3\u7801\u5757\u7B49\u5BBF\u4E3B\u914D\u8272\u4FDD\u6301\u4E3B\u9898\u539F\u503C\u3002 */\r\n.bgp{--bgp-text:var(--dsw-alias-label-primary,#1d3039);--bgp-muted:var(--dsw-alias-label-tertiary,#839098);--bgp-line:var(--dsw-alias-border-l2,#e5eaea);--bgp-surface:var(--dsw-alias-bg-layer-1,#fff);--bgp-soft:var(--dsw-alias-bg-layer-2,#f6f8f8);--bgp-accent:#148c7d;--bgp-tint:#eaf5f2;box-sizing:border-box;color:var(--bgp-text);font:13px/1.6 Inter,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;width:100%;height:100%;overflow:auto;padding:36px 40px 22px;background:color-mix(in srgb,var(--bgp-surface) 85%,transparent)}.bgp *{box-sizing:border-box}.bgp button,.bgp input,.bgp select{font:inherit}.bgp button{cursor:pointer;color:inherit}.bgp button:disabled,.bgp input:disabled,.bgp select:disabled{cursor:not-allowed;opacity:.4}.bgp button:focus-visible,.bgp input:focus-visible,.bgp select:focus-visible{outline:2px solid var(--bgp-accent);outline-offset:3px}.bgp-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}.bgp-eyebrow{display:flex;align-items:center;gap:7px;color:var(--bgp-accent);font-size:11px;letter-spacing:1px}.bgp h1{font-size:28px;line-height:1.4;letter-spacing:-.6px;margin:7px 0 8px;font-weight:650}.bgp h1 span{font-size:9px;font-weight:500;color:var(--bgp-muted);letter-spacing:2px;margin-left:14px;vertical-align:middle}.bgp-header p{font-size:12px;color:var(--bgp-muted);margin:0}.bgp-enable{display:flex;align-items:center;gap:11px;font-size:11px;cursor:pointer;position:relative;flex-shrink:0}.bgp-enable input{position:absolute;right:0;width:34px;height:20px;opacity:0;cursor:pointer}.bgp-enable i{display:block;width:34px;height:20px;background:#ccd3d4;border-radius:20px;padding:3px;pointer-events:none}.bgp-enable i:after{content:"";display:block;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0002;transition:transform .2s}.bgp-enable input:checked+i{background:var(--bgp-accent)}.bgp-enable input:checked+i:after{transform:translateX(14px)}.bgp-enable input:focus-visible+i{outline:2px solid var(--bgp-accent);outline-offset:4px}.bgp-enable input:disabled+i{opacity:.4}.bgp-grid{display:grid;grid-template-columns:minmax(270px,.85fr) minmax(340px,1.35fr);gap:26px;max-width:1220px}.bgp-left,.bgp-right{min-width:0}.bgp-card{background:var(--bgp-surface);border:1px solid var(--bgp-line);border-radius:14px;padding:22px;margin-bottom:20px;box-shadow:0 3px 14px #12312c02}.bgp-section-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}.bgp-section-title h2{font-size:14px;font-weight:600;margin:0}.bgp-section-title>span{color:var(--bgp-muted);font-size:9px;letter-spacing:.8px}.bgp-file{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}.bgp-upload{display:flex;position:relative;width:100%;height:214px;flex-direction:column;align-items:center;justify-content:center;gap:10px;border:1px dashed #b9d8cf;border-radius:10px;background:linear-gradient(140deg,#f0f8f5,#fafcfa);overflow:hidden;transition:border-color .2s,background .2s}.bgp-upload:hover,.bgp-upload.is-dragging{border-color:var(--bgp-accent);background:#e7f5ee}.bgp-upload strong{font-size:12px;font-weight:500}.bgp-upload>span:not(.bgp-upload-icon):not(.bgp-upload-replace){font-size:9px;color:#86988f}.bgp-upload small{font-size:9px;color:#86988f}.bgp-upload-icon{width:55px;height:55px;display:grid;place-items:center;background:#fff9;border:1px solid #d5e9df;color:#529c85;border-radius:16px;margin-bottom:4px}.bgp-upload.has-image{border-style:solid;background:#e5eded}.bgp-upload img{width:100%;height:100%;object-fit:cover}.bgp-upload-replace{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:7px;align-items:center;white-space:nowrap;background:#ffffffdf;color:#263d35;border-radius:6px;padding:6px 10px;font-size:10px;box-shadow:0 2px 8px #102a2010}.bgp-image-info{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:10px;font-size:10px;color:var(--bgp-muted)}.bgp-image-info>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bgp-image-info button{border:0;background:transparent;color:#b56b64;white-space:nowrap;font-size:10px}.bgp-divider{display:flex;align-items:center;gap:10px;color:var(--bgp-muted);font-size:10px;margin:19px 0 14px}.bgp-divider:before,.bgp-divider:after{content:"";height:1px;flex:1;background:var(--bgp-line)}.bgp-url{display:flex;gap:8px}.bgp-url input{width:100%;min-width:0;background:var(--bgp-surface);color:var(--bgp-text);border:1px solid var(--bgp-line);border-radius:7px;padding:9px 10px;font-size:10px}.bgp-url button{border:1px solid var(--bgp-line);border-radius:7px;background:var(--bgp-soft);font-size:11px;padding:7px 12px;flex-shrink:0}.bgp-note{font-size:9px;color:var(--bgp-muted);margin:13px 0 0;line-height:1.8}.bgp-layout{padding-bottom:20px}.bgp-layout fieldset{border:0;margin:0 0 16px;padding:0}.bgp-layout legend{font-size:11px;color:var(--bgp-muted);margin-bottom:9px}.bgp-segments{display:flex;gap:6px;padding:4px;background:var(--bgp-soft);border-radius:8px}.bgp-segments button{flex:1;white-space:nowrap;border:1px solid transparent;border-radius:5px;background:transparent;font-size:11px;padding:7px 5px}.bgp-segments button[aria-pressed=true]{background:var(--bgp-surface);border-color:var(--bgp-line);color:var(--bgp-accent);box-shadow:0 1px 4px #172c2810}.bgp-position{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--bgp-muted);gap:20px}.bgp-position select{width:150px;max-width:65%;border:1px solid var(--bgp-line);background:var(--bgp-surface);color:var(--bgp-text);padding:7px 10px;border-radius:7px;font-size:11px}.bgp-preview-top{display:flex;justify-content:space-between;align-items:center;font-size:10px;color:var(--bgp-muted);margin:2px 0 12px}.bgp-preview-top>span:first-child{display:flex;align-items:center;gap:7px;color:var(--bgp-text);font-weight:500}.bgp-preview-top i,.bgp-status-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#43a18b}.bgp-preview{height:275px;position:relative;overflow:hidden;background:var(--bgp-surface);border:1px solid var(--bgp-line);border-radius:13px;box-shadow:0 12px 30px #162e2809;isolation:isolate}.bgp-preview-photo,.bgp-preview-shade{position:absolute;inset:0;z-index:-1}.bgp-preview-shade{background:#000}.bgp-preview-chrome{display:flex;align-items:center;gap:4px;height:28px;padding:0 11px;border-bottom:1px solid var(--bgp-line);background:#ffffff15}.bgp-preview-chrome>span{width:5px;height:5px;border-radius:50%;background:#9caea74d}.bgp-preview-chrome small{color:var(--bgp-muted);font-size:7px;margin:0 auto}.bgp-mini-sidebar{position:absolute;left:0;top:28px;bottom:0;width:88px;border-right:1px solid #80948d12;padding:12px 10px}.bgp-mini-logo{color:var(--bgp-accent);font-size:24px;line-height:1.2;margin-bottom:15px}.bgp-mini-sidebar>div:not(.bgp-mini-logo){height:5px;border-radius:3px;background:#77908725;margin-bottom:11px;width:75%}.bgp-mini-sidebar>div:nth-child(3){width:95%;background:#148c7d27}.bgp-mini-sidebar>span{display:block;height:12px}.bgp-mini-main{margin-left:88px;padding:20px 24px;position:relative;height:247px}.bgp-preview-label{font-size:9px;color:var(--bgp-muted);display:block;text-align:center;letter-spacing:1px;margin-bottom:20px}.bgp-mini-message{padding:7px 12px;background:#729b8e26;max-width:60%;width:fit-content;margin-left:auto;border-radius:8px 8px 2px;font-size:8px}.bgp-mini-response{font-size:8px;color:var(--bgp-text);margin-top:16px}.bgp-mini-response>span{display:block;width:70%;height:4px;border-radius:3px;background:#78968b30;margin-top:8px}.bgp-mini-response>span:last-child{width:48%}.bgp-mini-input{position:absolute;left:24px;right:24px;bottom:17px;background:var(--bgp-surface);border:1px solid var(--bgp-line);border-radius:10px;padding:10px 11px;color:var(--bgp-muted);font-size:7px}.bgp-mini-input>span{float:right;color:var(--bgp-accent)}.bgp-preview-empty{position:absolute;inset:28px 0 0 88px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;background:color-mix(in srgb,var(--bgp-surface) 90%,transparent);color:var(--bgp-muted);font-size:11px}.bgp-preview-caption{display:flex;justify-content:space-between;font-size:9px;color:var(--bgp-muted);margin:12px 0 24px}.bgp-adjustments{margin-bottom:0}.bgp-slider-grid{display:grid;grid-template-columns:1fr 1fr;gap:23px 28px}.bgp-slider{display:flex;flex-direction:column;min-width:0}.bgp-control-title{display:flex;align-items:center;justify-content:space-between;font-size:11px;gap:8px}.bgp-control-title output{font-size:10px;font-variant-numeric:tabular-nums;color:var(--bgp-accent);background:var(--bgp-tint);border-radius:4px;padding:1px 6px}.bgp-caption{font-size:9px;color:var(--bgp-muted);margin:5px 0 12px}.bgp-slider input{accent-color:var(--bgp-accent);width:100%;height:5px;margin:3px 0 0;cursor:pointer}.bgp-footer{display:flex;align-items:center;justify-content:space-between;gap:18px;max-width:1220px;padding-top:21px;border-top:1px solid var(--bgp-line);margin-top:10px}.bgp-footer>div:first-child{display:flex;align-items:center;gap:7px;color:var(--bgp-muted);font-size:10px}.bgp-footer-actions{display:flex;gap:8px;flex-shrink:0}.bgp-button{border:1px solid var(--bgp-line);border-radius:7px;background:var(--bgp-surface);padding:8px 13px;font-size:11px!important;color:var(--bgp-text)}.bgp-primary{background:var(--bgp-accent);color:#fff!important;border-color:var(--bgp-accent);box-shadow:0 3px 8px #148c7d20}.bgp-banner{background:#2c937e10;border:1px solid #2c937e25;color:#25836e;padding:10px 13px;border-radius:8px;font-size:11px;margin-bottom:15px;overflow-wrap:anywhere}.bgp-error{background:#bf5b5410;border-color:#bf5b5430;color:#bc584f}.bgp-warning{background:#b67d2010;border-color:#b67d2030;color:#ac7c2c}.bgp-settings-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 0;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaea);font:13px/1.6 system-ui;color:var(--dsw-alias-label-primary,#1d3039)}.bgp-settings-row strong{font-size:14px;font-weight:500}.bgp-settings-row p{font-size:12px;color:var(--dsw-alias-label-tertiary,#839098);margin:4px 0 0}.bgp-settings-row button{cursor:pointer;background:transparent;color:var(--dsw-alias-label-primary,#1d3039);border:1px solid var(--dsw-alias-border-l2,#e5eaea);border-radius:8px;font:12px system-ui;padding:8px 12px;white-space:nowrap}body[data-ds-dark-theme] .bgp{--bgp-tint:#153c34}body[data-ds-dark-theme] .bgp-upload{background:linear-gradient(130deg,#18332c,#202b26);border-color:#34584a}body[data-ds-dark-theme] .bgp-upload-icon{background:#233a30;border-color:#34584a}body[data-ds-dark-theme] .bgp-upload strong{color:#bed8ca}\r\n@media(max-width:1100px){.bgp{padding:28px 24px}.bgp-grid{gap:18px;grid-template-columns:minmax(240px,1fr) minmax(290px,1.2fr)}.bgp-card{padding:18px}.bgp-slider-grid{gap:20px 16px}.bgp-mini-main{padding-left:18px;padding-right:18px}.bgp-footer{align-items:flex-start;flex-wrap:wrap}}@media(max-width:800px){.bgp{padding:23px 18px}.bgp-grid{grid-template-columns:1fr}.bgp-header{gap:12px}.bgp h1{font-size:25px}.bgp h1 span{display:none}.bgp-upload{height:190px}.bgp-preview{height:280px}.bgp-mini-main{height:252px}.bgp-footer-actions{margin-left:auto}.bgp-preview-top{margin-top:4px}}@media(prefers-reduced-motion:reduce){.bgp-enable i:after{transition:none}}\r\n';

// src/client.jsx
var inject = ["slots", "remote", "remote.settings", "layout"];
function apply(ctx) {
  const style = document.createElement("style");
  style.dataset.dshPlugin = "background-image";
  style.textContent = style_default;
  document.head.append(style);
  const renderer = new BackgroundRenderer(document);
  const controller = new BackgroundController(ctx, renderer);
  ctx.effect(() => () => {
    controller.dispose();
    renderer.dispose();
    style.remove();
  });
  ctx.effect(() => {
    let frame;
    const refreshTheme = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => renderer.apply(controller.getSnapshot().value));
    };
    const observer = new MutationObserver(refreshTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
    const cleanups = [
      ctx.remote.$on("settings/document-updated", () => {
        void controller.load();
      }),
      ctx.on("connection/reset", () => {
        void controller.load();
      }),
      ctx.on("theme/change", refreshTheme)
    ];
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      cleanups.forEach((cleanup) => cleanup());
    };
  });
  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "background-image", inject: () => ({ controller }) }, App));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: "background-image", order: 8, label: "\u80CC\u666F\u56FE\u7247" }, ImageIcon));
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({ name: "settings.general.item", id: "background-image", order: 12, inject: () => ({ open: () => {
    (0, import_dsh_client_ui_primitives.closeTopModal)(document);
    ctx.layout.selectPanel("background-image");
  } }) }, SettingsRow));
  void controller.load();
}

return module.exports;
} });
