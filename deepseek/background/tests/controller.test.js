import test from 'node:test';
import assert from 'node:assert/strict';
import { BackgroundController } from '../src/controller.js';
import { createMock } from './helpers.js';

function fixture() {
  const { ctx, data } = createMock();
  const applied = [];
  const controller = new BackgroundController(ctx, { apply: value => applied.push(structuredClone(value)) });
  return { ctx, data, controller, applied };
}

test('预览与保存分离，保存使用 Host 修订号，重开控制器恢复背景', async () => {
  const { ctx, data, controller, applied } = fixture();
  await controller.load();
  controller.update({ image: 'https://example.com/image.jpg', enabled: true, blur: 8 });
  assert.equal(data.value.image, '');
  assert.equal(applied.at(-1).blur, 8);
  await controller.save();
  assert.equal(data.value.blur, 8);
  assert.equal(data.calls[0].expectedRevision, 1);
  assert.equal(controller.state.dirty, false);
  const reopened = new BackgroundController(ctx, { apply() {} });
  await reopened.load();
  assert.equal(reopened.state.value.image, 'https://example.com/image.jpg');
});

test('外部修改不覆盖未保存预览，冲突阻止保存，重新载入后可恢复', async () => {
  const { controller, data } = fixture();
  await controller.load(); controller.update({ blur: 12 });
  data.value.blur = 2; data.revision++;
  await controller.load();
  assert.equal(controller.state.value.blur, 12);
  assert.equal(controller.state.stale, true);
  await controller.save(); assert.equal(data.calls.length, 0);
  await controller.load(true);
  assert.equal(controller.state.value.blur, 2);
  assert.equal(controller.state.revision, 2);
});

test('保存失败保留错误与草稿，离开页面恢复已保存背景', async () => {
  const { controller, ctx, applied } = fixture();
  await controller.load(); controller.update({ opacity: 20 });
  ctx.remote.settings.update = async () => { throw new Error('disk full'); };
  await controller.save();
  assert.equal(controller.state.error, 'disk full');
  assert.equal(controller.state.dirty, true);
  controller.cancelPreview();
  assert.equal(applied.at(-1).opacity, 55);
});

test('只读配置不允许修改，释放后忽略迟到的读取', async () => {
  const { controller, data } = fixture();
  data.writable = false; await controller.load();
  controller.update({ opacity: 10 }); await controller.save();
  assert.equal(controller.state.value.opacity, 55);
  assert.equal(data.calls.length, 0);
  controller.dispose();
  const previous = controller.state; await controller.load();
  assert.equal(controller.state, previous);
});
