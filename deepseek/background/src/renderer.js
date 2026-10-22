import { imageStyles, maskStyles, validateConfig } from './config.js';

const ATTRIBUTE = 'data-dsh-background-image';
const OWNED_VARIABLES = ['--dsh-bg-canvas', '--dsh-bg-sidebar', '--dsh-bg-input', '--dsh-bg-bubble', '--dsh-bg-bubble-highlight', '--dsh-bg-dialog-surface', '--dsh-bg-code', '--dsh-bg-code-banner', '--dsh-bg-menu', '--dsh-bg-surface', '--dsh-bg-titlebar', '--dsh-bg-popover', '--dsh-bg-conversation', '--dsh-bg-dialog'];

export class BackgroundRenderer {
  constructor(document) {
    this.document = document;
    this.body = document.body;
    this.previous = new Map(OWNED_VARIABLES.map(name => [name, [this.body.style.getPropertyValue(name), this.body.style.getPropertyPriority(name)]]));
    this.layer = document.createElement('div');
    this.layer.className = 'dsh-background-layer';
    this.layer.hidden = true;
    this.layer.setAttribute('aria-hidden', 'true');
    this.picture = document.createElement('div');
    this.picture.className = 'dsh-background-picture';
    this.mask = document.createElement('div');
    this.mask.className = 'dsh-background-mask';
    this.layer.append(this.picture, this.mask);
    this.body.prepend(this.layer);
    this.active = false;
    this.disposed = false;
  }

  // 读取前暂时移除本插件标记，获得宿主当前主题的原始颜色。
  captureTheme() {
    this.body.removeAttribute(ATTRIBUTE);
    const styles = this.document.defaultView.getComputedStyle(this.body);
    const dark = this.body.hasAttribute('data-ds-dark-theme');
    this.body.style.setProperty('--dsh-bg-canvas', styles.getPropertyValue('--dsw-alias-bg-base').trim() || (dark ? '#151517' : '#ffffff'));
    this.body.style.setProperty('--dsh-bg-sidebar', styles.getPropertyValue('--dsw-specific-sidebar-fill').trim() || (dark ? '#1b1b1c' : '#f9fafb'));
    this.body.style.setProperty('--dsh-bg-input', styles.getPropertyValue('--dsw-specific-input-major').trim() || (dark ? '#2c2c2e' : '#ffffff'));
    this.body.style.setProperty('--dsh-bg-bubble', styles.getPropertyValue('--dsw-specific-bubble').trim() || (dark ? '#2c2c2e' : '#edf3fe'));
    this.body.style.setProperty('--dsh-bg-bubble-highlight', styles.getPropertyValue('--dsw-specific-bubble-highlight').trim() || (dark ? '#3a4a55' : '#dce9ff'));
    this.body.style.setProperty('--dsh-bg-dialog-surface', styles.getPropertyValue('--dsw-alias-bg-layer-1').trim() || (dark ? '#26262b' : '#ffffff'));
    this.body.style.setProperty('--dsh-bg-code', styles.getPropertyValue('--dsw-alias-markdown-code-block').trim() || (dark ? '#232327' : '#f6f8fa'));
    this.body.style.setProperty('--dsh-bg-code-banner', styles.getPropertyValue('--dsw-alias-markdown-code-block-banner').trim() || (dark ? '#2b2b2f' : '#eceff3'));
    this.body.style.setProperty('--dsh-bg-menu', styles.getPropertyValue('--dsw-specific-menu').trim() || (dark ? '#43454a73' : '#f8f9fa94'));
  }

  apply(raw) {
    if (this.disposed) return;
    const config = validateConfig(raw);
    if (!config.enabled || !config.image) {
      this.hide();
      return;
    }
    this.captureTheme();
    // 自定义底色优先于主题采样色，用于完整显示/平铺时的留白区域。
    if (config.canvasColor) this.body.style.setProperty('--dsh-bg-canvas', config.canvasColor);
    Object.assign(this.picture.style, imageStyles(config));
    Object.assign(this.mask.style, maskStyles(config));
    this.body.style.setProperty('--dsh-bg-surface', `${config.surfaceOpacity}%`);
    this.body.style.setProperty('--dsh-bg-titlebar', `${config.titlebarOpacity}%`);
    this.body.style.setProperty('--dsh-bg-popover', `${config.popoverOpacity}%`);
    this.body.style.setProperty('--dsh-bg-conversation', `${config.conversationOpacity}%`);
    this.body.style.setProperty('--dsh-bg-dialog', `${config.dialogOpacity}%`);
    this.layer.hidden = false;
    this.body.setAttribute(ATTRIBUTE, '');
    this.active = true;
  }

  hide() {
    this.body.removeAttribute(ATTRIBUTE);
    this.layer.hidden = true;
    this.picture.style.backgroundImage = 'none';
    this.mask.style.backgroundColor = '';
    this.mask.style.backgroundImage = '';
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
    this.hide(); this.layer.remove(); this.disposed = true;
  }
}
