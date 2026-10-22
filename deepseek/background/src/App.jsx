import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DEFAULTS, maskStyles, imageStyles } from './config.js';
import { importImage, checkRemoteImage } from './image-import.js';

export function ImageIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" /><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /><path d="m4 17 5-5 4 4 3-3 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Slider({ label, description, value, min = 0, max = 100, unit = '%', disabled, onChange }) {
  return <label className="bgp-slider"><span className="bgp-control-title">{label}<output>{value}{unit}</output></span><span className="bgp-caption">{description}</span><input aria-label={label} type="range" min={min} max={max} value={value} disabled={disabled} onChange={event => onChange(Number(event.target.value))} /></label>;
}

function Segments({ label, options, current, disabled, onSelect }) {
  return <fieldset disabled={disabled}><legend>{label}</legend><div className="bgp-segments">{options.map(([id, text]) => <button key={id} type="button" aria-pressed={current === id} onClick={() => onSelect(id)}>{text}</button>)}</div></fieldset>;
}

export function App({ controller }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const fileInput = useRef(null);
  const [url, setUrl] = useState('');
  const [working, setWorking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState('');
  const mounted = useRef(true);
  const value = state.value;
  const disabled = state.loading || state.busy || working || !state.writable;
  const hasImage = !!value.image;
  const previewActive = hasImage && value.enabled;
  const darkShell = typeof document !== 'undefined' && document.body.hasAttribute('data-ds-dark-theme');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.cancelPreview(); }; }, [controller]);
  async function acceptFile(file) {
    if (disabled || !file) return;
    setWorking(true); setImageError('');
    try {
      const result = await importImage(file);
      if (mounted.current) controller.update({ ...result, enabled: true });
    } catch (error) { if (mounted.current) setImageError(error.message); }
    finally { if (mounted.current) setWorking(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  async function loadUrl(event) {
    event.preventDefault();
    if (disabled) return;
    setWorking(true); setImageError('');
    try {
      const image = await checkRemoteImage(url);
      if (mounted.current) { controller.update({ image, imageName: '在线背景图片', enabled: true }); setUrl(''); }
    } catch (error) { if (mounted.current) setImageError(error.message); }
    finally { if (mounted.current) setWorking(false); }
  }
  const change = key => next => controller.update({ [key]: next });
  return <main className="bgp">
    <header className="bgp-header"><div><div className="bgp-eyebrow"><ImageIcon size={14} />工作区外观</div><h1>背景图片<span>BACKGROUND</span></h1><p>选择一张喜欢的图片，拖动滑块即可调节背景、滤镜与每一块界面的透明度。</p></div><label className="bgp-enable"><span>{value.enabled ? '背景已开启' : '背景已关闭'}</span><input type="checkbox" role="switch" aria-label="启用背景图片" checked={value.enabled} disabled={disabled || !hasImage} onChange={event => controller.update({ enabled: event.target.checked })} /><i /></label></header>
    {(state.error || imageError) && <div className="bgp-banner bgp-error" role="alert">{imageError || state.error}</div>}
    {state.stale && <div className="bgp-banner bgp-warning" role="alert">其他窗口已修改背景，请点击“重新载入”后再编辑。</div>}
    {state.notice && <div className="bgp-banner" role="status">{state.notice}</div>}
    {!state.writable && !state.loading && <div className="bgp-banner bgp-warning">当前 Harness 配置为只读，无法修改背景。</div>}
    <div className="bgp-grid">
      <section className="bgp-left">
        <div className="bgp-card"><div className="bgp-section-title"><h2>你的背景</h2><span>01 / 图片来源</span></div>
          <input ref={fileInput} className="bgp-file" type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" aria-label="选择本地背景图片" onChange={event => acceptFile(event.target.files?.[0])} disabled={disabled} />
          <button type="button" className={`bgp-upload ${dragging ? 'is-dragging' : ''} ${hasImage ? 'has-image' : ''}`} disabled={disabled} onClick={() => fileInput.current?.click()} onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void acceptFile(event.dataTransfer.files[0]); }}>
            {hasImage ? <><img src={value.image} alt="当前背景图片" referrerPolicy="no-referrer" onError={() => setImageError('背景图片暂时无法加载，请重新选择图片或检查链接。')} /><span className="bgp-upload-replace"><ImageIcon size={17} /> 更换背景图片</span></> : <><span className="bgp-upload-icon"><ImageIcon size={28} /></span><strong>{working ? '正在处理图片…' : '点击上传，或将图片拖到这里'}</strong><span>PNG、JPEG、WebP、AVIF、GIF · 最大 20 MB</span><small>自动缩放压缩，本地图片无需图床</small></>}
          </button>
          {hasImage && <div className="bgp-image-info"><span title={value.imageName}>{value.imageName || '背景图片'}</span><button type="button" disabled={disabled} onClick={() => controller.update({ image: '', imageName: '', enabled: false })}>移除图片</button></div>}
          <div className="bgp-divider"><span>或使用图片链接</span></div>
          <form onSubmit={loadUrl} className="bgp-url"><input type="url" aria-label="HTTPS 图片链接" placeholder="https://example.com/wallpaper.jpg" value={url} onChange={event => setUrl(event.target.value)} disabled={disabled} /><button type="submit" disabled={disabled || !url.trim()}>{working ? '载入中…' : '载入'}</button></form>
          <p className="bgp-note">本地图片会压缩后保存到当前 profile。GIF 将保存为静态图片。</p>
        </div>
        <div className="bgp-card bgp-layout"><div className="bgp-section-title"><h2>显示方式</h2><span>02 / 布局</span></div>
          <Segments label="图片适配" disabled={disabled || !hasImage} current={value.fit} onSelect={id => controller.update({ fit: id })} options={[['cover', '铺满'], ['contain', '完整显示'], ['repeat', '平铺']]} />
          <label className="bgp-position">图片位置<select aria-label="图片位置" disabled={disabled || !hasImage} value={value.position} onChange={event => controller.update({ position: event.target.value })}><option value="center">居中</option><option value="top">顶部</option><option value="bottom">底部</option><option value="left">左侧</option><option value="right">右侧</option></select></label>
          <Slider label="图片缩放" description="放大图片减少留白，或缩小查看全貌" value={value.zoom} min={50} max={200} disabled={disabled || !hasImage} onChange={change('zoom')} />
        </div>
        <div className="bgp-card bgp-colors"><div className="bgp-section-title"><h2>颜色与遮罩</h2><span>03 / 色调</span></div>
          <Segments label="渐变遮罩" disabled={disabled || !hasImage} current={value.gradient} onSelect={id => controller.update({ gradient: id })} options={[['none', '关闭'], ['bottom', '底部加深'], ['top', '顶部加深'], ['both', '上下加深']]} />
          <label className="bgp-color-row"><span>遮罩颜色<b>与暗色遮罩强度叠加</b></span><input type="color" aria-label="遮罩颜色" value={value.maskColor} disabled={disabled || !hasImage} onChange={event => change('maskColor')(event.target.value)} /></label>
          <label className="bgp-color-row"><span>背景底色<b>完整显示/平铺时的留白区域</b></span><span className="bgp-color-controls"><input type="checkbox" aria-label="启用自定义背景底色" checked={!!value.canvasColor} disabled={disabled} onChange={event => change('canvasColor')(event.target.checked ? (darkShell ? '#151517' : '#ffffff') : '')} /><input type="color" aria-label="背景底色" value={value.canvasColor || '#151517'} disabled={disabled || !value.canvasColor} onChange={event => change('canvasColor')(event.target.value)} /></span></label>
        </div>
      </section>
      <section className="bgp-right">
        <div className="bgp-preview-top"><span><i />实时预览</span><span>{state.dirty ? '正在预览 · 尚未保存' : '已保存的背景'}</span></div>
        <div className={`bgp-preview ${previewActive ? 'is-active' : ''}`} style={previewActive && value.canvasColor ? { backgroundColor: value.canvasColor } : undefined}>
          <div className="bgp-preview-photo" style={previewActive ? imageStyles(value) : { backgroundImage: 'none' }} />
          <div className="bgp-preview-shade" style={previewActive ? maskStyles(value) : { backgroundImage: 'none', backgroundColor: 'transparent' }} />
          <div className="bgp-preview-chrome" style={{ backgroundColor: `color-mix(in srgb, #eef2f4 ${previewActive ? value.titlebarOpacity : 100}%, transparent)` }}><span /><span /><span /><small>DeepSeek Harness</small></div>
          <div className="bgp-mini-sidebar" style={{ backgroundColor: `color-mix(in srgb, var(--bgp-surface) ${previewActive ? value.surfaceOpacity : 100}%, transparent)` }}><div className="bgp-mini-logo">◇</div><div /><div /><div /><span /><div /></div>
          <div className="bgp-mini-main"><span className="bgp-preview-label">你的工作区，换一幅风景</span><div className="bgp-mini-message" style={{ backgroundColor: `color-mix(in srgb, #729b8e ${previewActive ? value.dialogOpacity : 100}%, transparent)` }}>今天想做些什么？</div><div className="bgp-mini-response" style={{ backgroundColor: `color-mix(in srgb, var(--bgp-surface) ${previewActive ? value.dialogOpacity : 100}%, transparent)` }}>从一个新想法开始。<span /><span /></div><div className="bgp-mini-input" style={{ opacity: 0.7 + value.conversationOpacity / 400 }}>描述你想要构建的内容 <span>↑</span></div></div>
          {!hasImage && <div className="bgp-preview-empty"><ImageIcon size={29} /><span>导入图片后预览效果</span></div>}
        </div>
        <div className="bgp-preview-caption"><span>文字与控件保持清晰</span><span>预览比例随窗口变化</span></div>
        <div className="bgp-card bgp-filters"><div className="bgp-section-title"><h2>图片滤镜</h2><span>04 / 滤镜</span></div><div className="bgp-slider-grid">
          <Slider label="亮度" description="提亮或压暗背景图片" value={value.brightness} max={200} disabled={disabled || !hasImage} onChange={change('brightness')} />
          <Slider label="对比度" description="增强或减弱明暗反差" value={value.contrast} max={200} disabled={disabled || !hasImage} onChange={change('contrast')} />
          <Slider label="饱和度" description="控制色彩浓淡" value={value.saturate} max={200} disabled={disabled || !hasImage} onChange={change('saturate')} />
          <Slider label="灰度" description="转为黑白照片质感" value={value.grayscale} disabled={disabled || !hasImage} onChange={change('grayscale')} />
          <Slider label="褐化" description="怀旧胶片色调" value={value.sepia} disabled={disabled || !hasImage} onChange={change('sepia')} />
          <Slider label="色相旋转" description="整体偏移画面色彩" value={value.hueRotate} min={-180} max={180} unit="°" disabled={disabled || !hasImage} onChange={change('hueRotate')} />
        </div></div>
        <div className="bgp-card bgp-adjustments"><div className="bgp-section-title"><h2>背景氛围</h2><span>05 / 氛围</span></div><div className="bgp-slider-grid">
          <Slider label="图片不透明度" description="降低数值，让背景更轻柔" value={value.opacity} disabled={disabled || !hasImage} onChange={change('opacity')} />
          <Slider label="背景模糊" description="柔化细节，减少视觉干扰" value={value.blur} max={30} unit="px" disabled={disabled || !hasImage} onChange={change('blur')} />
          <Slider label="暗色遮罩" description="配合遮罩颜色压低亮部" value={value.shade} max={80} disabled={disabled || !hasImage} onChange={change('shade')} />
        </div></div>
        <div className="bgp-card bgp-surfaces"><div className="bgp-section-title"><h2>界面透明度</h2><span>06 / 面板</span></div><div className="bgp-slider-grid">
          <Slider label="侧边栏透明度" description="调节左侧导航栏的透明程度" value={value.surfaceOpacity} disabled={disabled || !hasImage} onChange={change('surfaceOpacity')} />
          <Slider label="标题栏透明度" description="调节窗口顶部标题栏的透明程度" value={value.titlebarOpacity} disabled={disabled || !hasImage} onChange={change('titlebarOpacity')} />
          <Slider label="弹层菜单透明度" description="调节下拉菜单、弹窗与设置卡片" value={value.popoverOpacity} disabled={disabled || !hasImage} onChange={change('popoverOpacity')} />
          <Slider label="文本框透明度" description="调节底部输入框的透明程度" value={value.conversationOpacity} disabled={disabled || !hasImage} onChange={change('conversationOpacity')} />
          <Slider label="对话框透明度" description="调节对话气泡、代码块与工具结果卡片" value={value.dialogOpacity} disabled={disabled || !hasImage} onChange={change('dialogOpacity')} />
        </div></div>
      </section>
    </div>
    <footer className="bgp-footer"><div><span className="bgp-status-dot" />{state.loading ? '正在读取背景设置…' : state.busy ? '正在保存…' : state.dirty ? '未保存的修改仅用于当前窗口预览' : '设置保存在当前 Harness profile'}</div><div className="bgp-footer-actions"><button type="button" className="bgp-button" disabled={disabled} onClick={() => controller.update({ ...DEFAULTS, image: value.image, imageName: value.imageName, enabled: hasImage })}>重置参数</button><button type="button" className="bgp-button" disabled={state.busy || working || state.loading} onClick={() => { setImageError(''); void controller.load(true); }}>重新载入</button><button type="button" className="bgp-button bgp-primary" disabled={disabled || !state.dirty || state.stale} onClick={() => controller.save()}>{state.busy ? '正在保存…' : '保存背景'}</button></div></footer>
  </main>;
}

export function SettingsRow({ open }) {
  return <div className="bgp-settings-row"><div><strong>背景图片</strong><p>导入背景，拖动滑块调节背景、滤镜、遮罩与各界面透明度。</p></div><button type="button" onClick={open}>设置背景 →</button></div>;
}
