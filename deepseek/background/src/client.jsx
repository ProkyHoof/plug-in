import React from 'react';
import { closeTopModal } from '@deepseek-ai/dsh-client-ui-primitives';
import { App, ImageIcon, SettingsRow } from './App.jsx';
import { BackgroundController } from './controller.js';
import { BackgroundRenderer } from './renderer.js';
import css from './style.css';

export const inject = ['slots', 'remote', 'remote.settings', 'layout'];

export function apply(ctx) {
  const style = document.createElement('style');
  style.dataset.dshPlugin = 'background-image';
  style.textContent = css;
  document.head.append(style);
  const renderer = new BackgroundRenderer(document);
  const controller = new BackgroundController(ctx, renderer);
  ctx.effect(() => () => { controller.dispose(); renderer.dispose(); style.remove(); });
  ctx.effect(() => {
    let frame;
    const refreshTheme = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => renderer.apply(controller.getSnapshot().value));
    };
    // 只观察宿主主题标记，避免自身样式更新造成循环回调。
    const observer = new MutationObserver(refreshTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
    const cleanups = [
      ctx.remote.$on('settings/document-updated', () => { void controller.load(); }),
      ctx.on('connection/reset', () => { void controller.load(); }),
      ctx.on('theme/change', refreshTheme),
    ];
    return () => { observer.disconnect(); cancelAnimationFrame(frame); cleanups.forEach(cleanup => cleanup()); };
  });
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'background-image', inject: () => ({ controller }) }, App));
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'background-image', order: 8, label: '背景图片' }, ImageIcon));
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({ name: 'settings.general.item', id: 'background-image', order: 12, inject: () => ({ open: () => { closeTopModal(document); ctx.layout.selectPanel('background-image'); } }) }, SettingsRow));
  void controller.load();
}
