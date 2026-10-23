---
name: web-project
description: 项目技能。用于 24002120503-白赜宇 的《高级网页设计》课堂实践项目 webProject_Bzy（index.html / review-flex.html / svg.html / css / font）。当需要了解、修改、重构或继续开发该网页项目，或需要在浏览器中预览页面、调整 CSS 布局（flex 布局、SVG 绘图、iconfont 字体图标）时使用。
---

# WebProject_Bzy 项目技能

本项目是 **24002120503-白赜宇** 的《高级网页设计》课堂实践作品，一个纯前端静态网站，无需构建步骤，直接用浏览器打开 HTML 文件即可预览。

## 项目结构

```
webprojectbzy/
├── index.html          # 主页面：课堂实践索引与 flex 布局练习
├── review-flex.html    # Flex 布局复习页
├── svg.html            # SVG 矢量图形练习页
├── css/
│   ├── flex-css.css    # 主页面与 flex 练习页样式
│   └── svg.css         # SVG 练习页样式
├── font/               # iconfont 字体图标库（阿里 iconfont）
│   ├── iconfont.css
│   ├── iconfont.js
│   ├── iconfont.json
│   ├── iconfont.ttf
│   ├── demo.css
│   └── demo_index.html
└── .opencode/skills/web-project/SKILL.md
```

## 快速开始

- 直接用浏览器打开 `index.html` 即可预览，页面间通过导航链接互相跳转。
- 无需安装依赖、无需启动服务器。

## 页面说明

### index.html
主页面，采用 CSS 变量（`:root` 中的 `--primary`、`--accent` 等）定义配色与布局常量，顶部有 `.topbar` 导航，主体由卡片网格构成，页面背景使用渐变与径向点缀图。导航栏中带有下拉菜单（`_MenuControl` 相关结构），并引入 iconfont 图标与鼠标跟随效果。

### review-flex.html
独立的 Flex 布局复习页面，样式来自 `css/flex-css.css`。

### svg.html
SVG 图形练习页，样式来自 `css/svg.svg` 对应文件（`css/svg.css`）。

## 风格约定

- 颜色全部通过 CSS 变量管理，改主题色只需修改 `index.html` 内 `:root` 变量。
- 字体栈统一使用 `"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif`。
- 图标使用 iconfont 类名（如 `iconfont icon-xxx`），新增图标需同步 `font/` 中的字体文件。
- 页面内嵌 `<style>` 与独立 css 文件并存，改动时留意对应归属。

## 开发注意事项

- 修改后刷新浏览器即可看到效果，无需打包。
- 保持响应式：`.page` 宽度使用 `min(var(--max-width), calc(100vw - 80px))`，新增内容避免写死宽度。
- 提交前可使用 `git status` 检查，确认 `font/` 等二进制资源已包含。