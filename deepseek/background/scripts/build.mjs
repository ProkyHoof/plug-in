import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));
await mkdir('lib', { recursive: true });
await build({ entryPoints: ['src/index.js'], outfile: 'lib/index.js', bundle: true, format: 'esm', platform: 'node', packages: 'external', target: 'node22', legalComments: 'none' });
const client = await build({ entryPoints: ['src/client.jsx'], bundle: true, format: 'cjs', platform: 'browser', external: ['react', '@deepseek-ai/dsh-client-ui-primitives'], loader: { '.css': 'text' }, write: false, target: 'es2022', legalComments: 'none' });
// 浏览器端由 Harness ModuleLoader 加载，React 复用宿主实例。
await writeFile('lib/client.js', `window.__ModuleLoader__.load({ id: 'dsh-background-image', factory(require) {\nconst module = { exports: {} }; const exports = module.exports;\n${client.outputFiles[0].text}\nreturn module.exports;\n} });\n`);
console.log('背景插件 Host / Client 构建完成。');
