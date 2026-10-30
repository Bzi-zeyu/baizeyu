# AGENTS.md

## 仓库概览
- 纯静态 HTML/CSS/JS 课程作业集合：**没有** `package.json`、构建、测试、lint 或 dev server，直接用浏览器打开 HTML 预览。
- 根目录本身不是站点，各目录是独立作业，分别有自己的 `index.html`：
  - `24002120503-白赜宇/webprojectbzy/24002120503-白赜宇/`：Gitee 主项目（首页 + flex/SVG/JS/iconfont 页面，`css/`、`font/`）。
  - `24002120503-白赜宇/webprojectbzy/*.html`：更早的 JS/事件练习页，返回链接指向子项目 `index.html`。
  - `项目/`：闲鱼 APP 首页响应式全页，入口 `responsive.html`，图片在 `图片/`。
  - `1/`：成绩统计 JS/DOM 课堂练习，数据在 `data.js`。
- `cdn/` 是本地化的 Font Awesome / Lucide；`skills/frontend-design/` 是视觉设计 skill。

## 强制项目规则（来自 `bzy_prompt.md`）
- **执行用户提示前**，先向 `bzy_prompt.md` 追加一条记录（时间、模型、提示词，有结果也记）。该文件是日志，不要删改历史条目。
- 新写的 CSS 类名、id、JS 变量统一用 `bzy_` 前缀；修改旧文件时沿用该文件现有风格（仓库中大量类名实际用 `bzy-` 前缀）。
- 每个新建 HTML 必须加入指向首页的入口 `<a id="bzy_homeLink" ...>← 返回首页</a>`，`href` 按页面深度指向对应 `index.html`；样式参考现有页面。
- 例外：`1/starter-level*.html` 是照课堂 `target.html` 还原的模板，类名和 DOM id 必须保持原样，不要改成 `bzy_`。

## 编辑注意
- 路径和内容含中文，统一用 UTF-8；PowerShell 控制台可能显示乱码，不代表文件损坏。
- 无打包器，全部使用相对路径。改完 HTML 后确认引用的 CSS/JS/字体确实存在（目前 `24002120503-白赜宇/webprojectbzy/24002120503-白赜宇/svg.html` 引用的 `./css/bzy-reset.css` 就缺失）。
- `项目/` 的 CSS 有加载顺序：`bzy-reset.css` → `bzy-main.css` → `bzy-responsive.css`；响应式断点在 `bzy-responsive.css` 的 721px，桌面样式覆盖移动端。
- `1/` 页面依赖 `data.js` 暴露的 `window.STUDENTS` / `window.SUBJECTS`，`<script src="data.js">` 必须先于内联脚本。

## Git / 推送
- 默认分支 `master`，远程为 Gitee。推送用：
  `powershell -ExecutionPolicy Bypass -File ".trae\skills\git-push-gitee\scripts\push.ps1" -Message "说明"`
- 脚本会 `git add -A`，推送前先看 `git status`，避免把未整理的 `1/`、docx 等一起提交。
- `.trae/` 已被忽略且内含 Gitee 私人令牌：不要把令牌写进被跟踪文件，也不要提交 `.trae/`。
- 不要在 `24002120503-白赜宇/webprojectbzy/` 内再次 `git init`（该目录曾因嵌套仓库出过问题）。

## 参考
- `bzy_prompt.md`（规则与历史）、`24002120503-白赜宇/webprojectbzy/24002120503-白赜宇/.opencode/skills/web-project/SKILL.md`（子项目结构）、`skills/frontend-design/SKILL.md`（视觉设计）、`.trae/skills/git-push-gitee/SKILL.md`（注意其写的默认分支 `main` 已过时，实际脚本是 `master`）。
