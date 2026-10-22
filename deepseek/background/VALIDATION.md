# 验证记录

日期：2026-10-21。环境：Windows、Node.js 24.20.0、Harness 0.2.1-rc.2。

- `npm run check`：11 项测试通过。
- Host 在真实 Cordis 4.0.5 中加载和卸载，确认对象级 volatile 配置和设置策略的释放。
- 打包后的 Client 经 ModuleLoader 加载，测试调节、预览、保存、重新载入及事件、样式、DOM 的清理。
- 覆盖参数校验、危险或不受支持的图片地址、配置冲突、只读配置、保存失败、原样式恢复与主题切换。
- 使用桌面版自带 CLI 创建独立测试 profile，安装 `.tgz` 并运行真实 Harness；不需要模型账号。
- 通过浏览器导入 1280 × 800 的测试 PNG，验证 Canvas 解码和压缩、背景即时显示、配置文件持久化及页面重新加载后恢复。
- 在会话页确认背景可见，输入区 opacity 为 1，背景层不拦截鼠标。
- 重新启动服务后，背景自动从配置文件恢复。
- 通过通用设置切换深色主题，确认背景采样的主题底色更新为 `#151517`。
- 点击「设置背景 →」后设置弹窗正确关闭，并进入背景管理页。
- 关闭背景并保存后，确认背景标记和自定义底色已移除，背景层隐藏，宿主主题恢复；重新启用后显示正常。

截图使用程序生成的抽象测试图，不包含用户私人图片。原生桌面外壳的窗口边框未单独测试；实测运行时来自本机桌面版安装。

## 追加记录：对话透明度参数

日期：2026-10-21。在 1.0.0 基础上新增「对话透明度」调节项：

- 新增 `conversationOpacity` 参数（默认 80%，与原外观一致），单独控制消息气泡和输入框的透明程度；侧边栏等面板仍由「面板不透明度」控制。
- 校验覆盖范围检查、渲染变量设置与关闭/卸载后的恢复、打包后 Client 的整体注册与调节流程。
- `npm run check` 全部测试通过（11 项）。

## 追加记录：旧配置兼容修复

日期：2026-10-21。修复新版本加载旧版保存配置时报「conversationOpacity 超出有效范围」的问题：

- 校验逻辑对缺省数值参数回退到默认值，旧配置缺少 `conversationOpacity` 时按默认 80% 载入，不再报错，界面恢复可写。
- 新增专项测试（旧版配置缺少新字段时使用默认值），`npm run check` 12 项全部通过。

## 追加记录：对话框与输出内容透明度

日期：2026-10-21。新增两个独立调节项：

- 新增 `dialogOpacity`（对话框透明度，默认 80%）控制对话区域（消息气泡与 AI 回复卡片），`outputOpacity`（输出内容透明度，默认 100% 保持原样）控制代码块与工具结果；「对话透明度」收窄为只调节输入框。
- 渲染层新增气泡高亮、对话表面、代码块等颜色的采样与恢复；设置页自身使用采样到的实色表面，避免随透明度设置变透。
- 覆盖参数校验、渲染变量设置与恢复、旧配置兼容；`npm run check` 12 项全部通过。

## 追加记录：1.1.0 持久化修复与样式定制扩展

日期：2026-10-21。环境：Windows、Node.js v22.23.2、npm 10.9.8、Harness 0.2.1-rc.2（桌面版自带 CLI）。

- **修复持久化 bug**：Host schema（`src/index.js`）缺少 `conversationOpacity/dialogOpacity/outputOpacity` 等字段。实测 schemastery 3.18.5 的普通 `parse` 虽保留未知键，但保存配置时经过的 `simplify()` 会丢弃未声明字段，导致这些参数重启后回退默认值。重写为所有字段由 `src/config.js` 的 `DEFAULTS/RANGES` 派生声明，并新增 `tests/host.test.js` 回归：schema 字段、默认值与 `DEFAULTS` 完全一致，数值范围与 `RANGES` 同步。
- **新增样式能力**：图片滤镜（亮度、对比度、饱和度 0–200%，灰度、褐化 0–100%，色相旋转 -180–180°）、图片缩放 50–200%、遮罩颜色 `maskColor`、可选背景底色 `canvasColor`、自定义 CSS（开关 + 最长 10000 字符，独立 `<style data-dsh-background-custom>` 注入，关闭背景后仍生效，关闭开关或卸载即移除）。颜色统一为十六进制并展开短写，非法字符串无法进入样式。
- 设置页重组为 01 图片来源、02 布局、03 颜色与遮罩、04 滤镜、05 氛围、06 自定义 CSS 六张卡片。
- 自动化测试扩到 18 项，覆盖颜色归一化与 rgba 合成、滤镜与缩放 transform、自定义 CSS 注入/移除/独立生效、schema 同步、打包客户端全流程；`npm run check` 18 项全部通过，`npm pack` 生成 `dsh-background-image-1.1.0.tgz`（9 个文件）。
- **真实 Harness 验证**（独立测试 profile，web 模板与桌面壳同构，未改动真实 desktop profile）：用桌面版自带 CLI 安装本地 tgz，浏览器实测——
  - 六张卡片全部渲染，上传 1280×800 测试 PNG 成功并即时预览；
  - 设置缩放 120%、亮度 130%、灰度 20%、遮罩色 `#1a3a5c`、底色 `#101828`、启用渐变遮罩自定义 CSS，保存后读取 profile 的 `cordis.patch.yml`，确认全部新增字段（含三个透明度字段与自定义 CSS）均已写入磁盘；
  - 重启服务后刷新，图片、滤镜、遮罩、底色与自定义 CSS 全部自动恢复，确认 schema 修复生效；
  - 背景层 `z-index:-1`、`pointer-events:none`，中心区域命中的是输入控件而非背景层，鼠标交互不受影响；
  - 关闭背景开关后背景层隐藏、宿主样式恢复，关闭自定义 CSS 开关后对应 style 元素立即移除，重新开启并保存均正常；
  - 切换深色主题后设置页与背景底色正常，更新了设置页截图（现为 `docs/settings.png`）与 `docs/chat-preview.png`。

截图使用程序生成的抽象测试图，不包含用户私人图片。

## 追加记录：1.1.1 Windows 桌面端会话页背景遮挡修复

日期：2026-10-22。1.1.0 安装到真实桌面版后，侧边栏出现「背景图片」入口、背景层与图片均已注入，但会话页（聊天对话页）整体仍是不透明背景。

- 以 `--remote-debugging-port=9222` 启动桌面版 Electron（0.2.1-rc.2，Chrome 152）后用 CDP 检查 DOM：背景层激活、图片数据完好，而祖先链中第一个不透明元素为 `.BynINW_frame`。
- 定位到宿主规则：Windows 自定义标题栏下 `[data-windows-titlebar] .BynINW_frame { background: var(--dsw-specific-sidebar-fill); }` 与 `.BynINW_centerCol { background: var(--dsw-alias-bg-base); }`；插件只把后者用到的 `--dsw-alias-bg-base` 改为透明，frame 仍为不透明侧边栏填充色，盖住整个中间区域。Web 模板无 `data-windows-titlebar` 标记，因此之前的 Web 验证未暴露此问题。
- 修复：新增 `html[data-windows-titlebar] body[data-dsh-background-image] .BynINW_frame { background: transparent !important; }`。侧边栏列 `.BynINW_sidebarCol` 与标题栏条 `.BynINW_frame::before` 各自独立绘制填充，窗口控件与侧边栏外观不受影响；macOS 宿主的 frame 本身透明，规则不产生作用。
- 在运行中的真实桌面端注入修复样式确认：会话页背景图完整显示，侧边栏与标题栏保持原填充；新增样式表回归测试，`npm run check` 19 项全部通过。

## 追加记录：1.2.0 设置模块重构（参数合并 / 移除自定义 CSS / 新增模块）

日期：2026-10-22。按用户要求重构设置模型：

- 用 CDP 枚举桌面端（Electron 44.7 / Chrome 152）宿主 402 个 `--dsw-*` 变量，确定可手动控制的表面：`--dsw-specific-menu` 与 `--dsw-menu-surface-fill`（菜单/弹层，浅色值 `#f8f9fa94` 且自带 `blur(40px) saturate(150%)` 背景模糊）、`--dsw-alias-bg-layer-1/2/3`（浮层、提示、历史、设置卡片）、`--dsw-alias-settings-card-fill`（设置卡片）、标题栏条 `.BynINW_frame::before`（Windows 下使用侧边栏填充）。
- 合并透明度：删除 `outputOpacity`，对话框透明度 `dialogOpacity` 同时驱动气泡（`--dsw-specific-bubble`/`-highlight`）、浮层表面（`--dsw-alias-bg-layer-1`）与代码块（`--dsw-alias-markdown-code-block`/`-banner`）；`conversationOpacity` 保留字段名以兼容已保存配置，UI 更名为「文本框透明度」。
- 新增手动参数：`titlebarOpacity`（标题栏条，0–100，默认 100）、`popoverOpacity`（菜单与弹层卡片，0–100，默认 100，菜单自带背景模糊，调低后仍可读）、`gradient`（渐变遮罩：`none`/`bottom`/`top`/`both`，与遮罩颜色、暗色遮罩强度叠加）。
- 移除自定义 CSS：删除 `customCssEnabled`/`customCss` 字段、注入逻辑、设置卡片与测试；旧配置中的废弃字段被校验逻辑忽略，旧版缺少 `gradient` 等新字段时回退默认值。
- 测试：重写 renderer/config/client 测试，覆盖渐变遮罩样式、五档透明度变量、废弃字段迁移与新 UI 交互；`npm run check` 19 项全部通过。
- 真机验证：桌面端重装 1.2.0 后，通过 CDP 在真实运行的界面逐项调整：标题栏 / 弹层菜单 / 文本框 / 对话框滑块写入正确（`--dsh-bg-titlebar/popover/conversation/dialog` 与宿主 `--dsw-*` color-mix 即时生效），底部渐变遮罩输出为 `linear-gradient`；模型下拉菜单在弹层 30% 时保持毛玻璃且可读；旧 `--dsh-bg-output` 变量与 `style[data-dsh-background-custom]` 均不存在；设置页全量截图更新为 `docs/settings.png`（使用程序生成的抽象测试图，不含用户私人图片）。
