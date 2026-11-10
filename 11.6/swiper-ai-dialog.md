# Swiper 课堂任务 · AI 协作记录与答辩材料

- 作者：白赜宇
- 创建时间：2026-11-10
- 使用模型：Trae AI Assistant（DeepSeek-V4.1-Flash）
- 对应页面：`11.6/swiper-task.html`

---

## 任务一 · 提示词工程师：让 AI 听懂需求

### 第 1 轮提示词（口语化，有遗漏）

> 帮我写一个 Swiper 的配置，id 是 wySw4，要能循环、自动播放、有圆点，初始效果是 cube。

### 第 1 轮 AI 回答

```js
new Swiper('#wySw4', {
  loop: true,
  effect: 'cube',
  pagination: { el: '#wyPag4' },
  autoplay: true
});
```

**这份答案的 3 个漏洞**

| # | 漏洞 | 后果 |
|---|---|---|
| 1 | `autoplay: true` 用的是默认 3000ms，不是要求中的 3.2 秒 | 停留时间对不上 |
| 2 | 没写 `disableOnInteraction: false`（默认是 `true`） | 用户手动拖一次，自动播放就永久停止 |
| 3 | `pagination` 少了 `clickable: true` | 圆点只能看，点不动 |

### 第 2 轮提示词（拆成参数级要求）

> 按下面 4 条硬性要求生成 `new Swiper('#wySw4', {...})` 的配置对象，只输出配置代码，不要解释：
> ① 无缝循环：`loop: true`
> ② 3.2 秒自动翻页，且用户手动操作后自动播放不停止：`autoplay: { delay: 3200, disableOnInteraction: false }`
> ③ 圆点分页器可点击：`pagination: { el: '#wyPag4', clickable: true }`
> ④ 初始效果 cube：`effect: 'cube'`

### 第 2 轮 AI 回答（已落地到页面）

```js
new Swiper('#wySw4', {
  loop: true,                                              // ① 无缝循环
  speed: 800,
  effect: 'cube',                                          // ④ 初始 cube
  pagination: { el: '#wyPag4', clickable: true },           // ③ 圆点可点
  autoplay: { delay: 3200, disableOnInteraction: false }    // ② 3.2s 且手动后不停
});
```

### 验证结果（粘进页面逐项核对）

| 需求 | 验证方法 | 结论 |
|---|---|---|
| ① 无缝循环 | 翻到最后一件展品继续翻 → 回到第一件 | 通过 |
| ② 3.2 秒自动翻页 | 静置观察，约 3.2 秒换一张 | 通过 |
| ② 手动后不停止 | 拖动一次松手，等 3.2 秒仍在自动翻 | 通过 |
| ③ 圆点可点击 | 点第 4 个圆点 → 直接跳到奋斗者号 | 通过 |
| ④ 初始 cube | 刷新页面即为 3D 立方体效果 | 通过 |

【截图：演示四 刷新后初始为 cube 效果】

### 答辩抽问

**Q1：你的第一版提示词漏掉了哪个需求？**
漏了「手动操作后不停止」和「圆点可点击」这两个隐含在需求里的细节——我只说了"自动播放""有圆点"，没说要 `disableOnInteraction: false` 和 `clickable: true`。

**Q2：你是怎么在第二轮里"说清楚"的？**
把一句口语需求拆成 4 条**参数级**要求，每条都写出参数名和取值，并限定 AI 只输出配置对象，避免它夹带解释或自作主张。

**Q3：AI 第一次给的代码错在哪？**
错在两个默认值上：`autoplay: true` 实际是 3000ms 且 `disableOnInteraction` 默认 `true`，用户一拖就停；`pagination` 没给 `clickable`，圆点不可点。

---

## 任务二 · creative 仿写：课堂没讲，AI 教你

### 提示词

> Swiper 的 `effect: 'creative'` 怎么用？我要的效果：上一张缩小左移并带一点角度，下一张放大右移进场，整体像"电影选片墙"。给出 `creativeEffect` 完整配置，并逐条解释 `prev` / `next` 里的 `translate`、`rotate`、`scale`、`origin` 分别控制什么。

### 第 1 轮 AI 回答（不完整）

```js
creativeEffect: {
  prev: { translate: ['-40%', 0, -300] },
  next: { translate: ['60%', 0, -300] }
}
```

问题：只有位移没有 `scale`（卡片不会缩小）、没有 `rotate`（没有角度）、也没给 `origin`，做不出"选片墙"的倾斜感。

### 第 2 轮提示词

> 补上三点：`prev` 要 `scale` 缩小、`rotate` 带 -14° 角度；`next` 要 `scale` 接近原大、`rotate` 带 +9°；两者都用 `origin` 指定以相邻边为支点。另外告诉我要不要 `shadow` 和 `limitProgress`。

### 最终落地配置

```js
creativeEffect: {
  limitProgress: 2,
  shadowPerProgress: true,
  prev: {                                   // 左边"已翻过"的那一张
    shadow: true,
    origin: 'right center',
    translate: ['-36%', 0, -260],
    scale: 0.72,
    rotate: [0, 0, -14],
    opacity: 0.72
  },
  next: {                                   // 右边"还没轮到"的那一张
    shadow: true,
    origin: 'left center',
    translate: ['56%', 0, -120],
    scale: 0.9,
    rotate: [0, 0, 9],
    opacity: 0.85
  }
}
```

### prev / next 的 transform 各控制什么（用自己的话）

- **prev**：控制"当前这张左边、已经翻过去的那一张"在画面里的样子。
- **next**：控制"当前这张右边、还没轮到的下一张"的样子。
- **translate**：`[x, y, z]` 位移。x 用百分号时是**相对 slide 自身宽度**，y 的百分比**相对 slide 自身高度**，z 是 px，负数表示后退（配合透视产生"变小、离得远"的景深）。
- **rotate**：`[x, y, z]` 角度（度），绕 `origin` 指定的支点旋转。
- **scale**：缩放倍数，1 是原始大小，0.72 即缩到 72%。
- **origin**：`transform-origin` 支点。`right center` 表示以右边缘中点为轴倾斜，所以左侧卡片的倾斜看起来像书页/选片墙。
- **shadow / shadowPerProgress / limitProgress**：给侧边卡片加投影，并按距离递减阴影强度，最多影响 2 张。

### 答辩抽问

**Q1：`transform` 里的百分号是相对谁的？**
相对 **slide 自己的宽/高**（x 相对宽度、y 相对高度），不是相对容器，也不是相对视口。

**Q2：改一个数值让卡片转 20 度试试？**
把 `prev.rotate` 的第三个分量改成 20：`rotate: [0, 0, -20]`（想要顺时针就写 `20`）。改完左卡片倾斜角变大，选片墙更夸张。

---

## 任务三 · 综合创作 + 技术答辩

### ① 第六件展品：爱达·魔都号

**AI 绘图提示词**

> Website carousel slide image, 16:9 cinematic: A majestic large white-and-blue Chinese-built ocean cruise ship (Adora Magic City) sailing on the open sea at golden hour, aerial drone perspective, dramatic warm sunlight and long wake trail, photorealistic, ultra detailed.

生成结果：`swiper-imgs/aida_modu_1.jpg`（横版 16:9），已作为第六张 slide 加入演示一 ~ 演示四，`alt` 与图注齐全：

```html
<div class="swiper-slide">
  <img src="swiper-imgs/aida_modu_1.jpg" alt="爱达·魔都号">
  <div class="wy-cap"><h3>爱达·魔都号</h3><p>2024 年 1 月首航 · 首艘国产大型邮轮</p></div>
</div>
```

### ② 超纲能力：keyboard 键盘控制

**提示词**

> Swiper 除了鼠标拖动，还能用键盘控制吗？我想让演示四支持方向键 ← → 切换，但又不希望页面滚到别处时方向键还乱触发。给出配置。

**AI 第 1 轮回答（有问题）**

```js
keyboard: true
```

问题：`keyboard` 在 Swiper 里是**对象**参数不是布尔值，写 `true` 不生效；而且没加 `onlyInViewport`，页面其它位置按方向键也会翻页。

**第 2 轮 / 最终落地**

```js
keyboard: { enabled: true, onlyInViewport: true }
```

### 答辩四连问

**Q1：这段代码什么意思？**
打开 Swiper 的键盘模块并只在该轮播处于视口内时响应方向键：`enabled: true` 启用，`onlyInViewport: true` 限制作用范围为可视区域，避免用户在页面其它地方按 ← → 时误翻。

**Q2：AI 第一次给的哪里不对、你改了什么？**
第一次给的是 `keyboard: true`，类型错了（要对象）；也没提 `onlyInViewport`。我改成对象写法并补上 `onlyInViewport: true`。

**Q3：新参数的作用？**
`enabled` —— 键盘控制的开关；`onlyInViewport` —— 只在轮播进入视口时生效，防止全局劫持方向键。

**Q4：现场把 delay 改成指定值，并解释预期变化？**
`autoplay.delay` 单位是毫秒。例如改成 `delay: 5000`，每张停留 5 秒后自动翻页（比现在 3.2 秒更慢）；改成 `delay: 1000` 则 1 秒一翻，但此时已小于 `speed: 800` 交给动画的时长，观感会显得急促——`delay` 必须大于 `speed`，否则动画还没播完就切下一张。

---

## 页面改动清单

| 文件 | 改动 |
|---|---|
| `11.6/swiper-task.html` | 四个演示各加第六件展品「爱达·魔都号」；演示四新增第 7 个按钮 `creative 电影墙`；新增 `bzy_getSw4Config()` 统一配置生成（含 `creativeEffect`、`keyboard`）；`bzy_applySw4()` 负责 destroy + 重建；初始效果改为 cube |
| `11.6/swiper-imgs/aida_modu_1.jpg` | AI 生成的爱达·魔都号 16:9 图片 |
| `11.6/swiper-ai-dialog.md` | 本文档（AI 协作记录 + 答辩材料） |
