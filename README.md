# 插件仓库

按平台和功能文件夹管理插件，界面、使用说明和源码注释使用中文。

GitHub 仓库：[ProkyHoof/plug-in](https://github.com/ProkyHoof/plug-in)。

## 插件列表

| 平台 | 插件 | 目录 | 说明 |
| --- | --- | --- | --- |
| DeepSeek Harness | 背景图片 | [`deepseek/background`](deepseek/background/) | 本地图片、HTTPS 图片链接、透明度、模糊、遮罩和显示方式 |

## 从 GitHub 安装

需要先将插件提交并推送至 GitHub。仓库根目录是插件集合，安装时使用 `#path:/deepseek/background` 指定插件目录。

桌面版使用 **DeepSeek Harness 桌面程序自带的 CLI**：

```powershell
dsh plugin --profile desktop add "github:ProkyHoof/plug-in#path:/deepseek/background"
```

如果 `dsh` 不在 PATH 中，或提示 `desktop` 是保留 profile，请直接调用桌面安装目录中的入口。Windows 示例，执行前替换安装路径：

```powershell
$dshCli = 'C:\实际安装目录\Deepseek\resources\runtime\cli\bin\dsh.cmd'
& $dshCli plugin --profile desktop add "github:ProkyHoof/plug-in#path:/deepseek/background"
```

Web 版：

```powershell
npx @deepseek-ai/dsh plugin --profile web add "github:ProkyHoof/plug-in#path:/deepseek/background"
```

安装后重新启动对应的 Harness，在左侧打开「背景图片」，导入图片并点击「保存背景」。适配版本、效果截图、本地打包、更新与卸载见 [背景图片插件说明](deepseek/background/README.md)。

## 维护与上传

在仓库根目录执行：

```powershell
git add README.md deepseek
git commit -m "添加 DeepSeek Harness 背景图片插件和中文说明"
git push -u origin HEAD
```

提交前用 `git status` 检查文件清单。GitHub 安装命令读取远程仓库的默认分支，请确认推送分支与 GitHub 默认分支一致。

源码变动后，先在 `deepseek/background` 中执行 `npm ci`、`npm run check`，再一并提交源码和 `lib/` 构建产物。直接从 GitHub 安装需要包含 `lib/`、`package.json` 和 `cordis.patch.yml`。

`node_modules/`、`.reference/` 和 `*.tgz` 已在插件目录中忽略；打包文件可以单独作为 GitHub Release 附件上传。

安装语法依据：[Harness 插件安装](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)、[pnpm Git 子目录安装](https://pnpm.io/package-sources#install-from-a-subdirectory-of-a-git-repository)。
