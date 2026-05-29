# HALUNHAKU — Design System

> 本文档约束后续 Agent / Codex 在该项目中的 UI 修改行为。
> 修改 UI 前必须先阅读本文档。
> 如果设计规范和现有代码冲突，优先保持当前项目的一致性，再最小幅度修正规范。

---

## 1. Design Philosophy

本项目是一个**个人内容博客 + 轻量管理后台**，视觉方向介于**文学阅读站点**与**工具产品**之间。

它不是传统博客模板（没有纸纹、水彩、厚重纹理），也不是 SaaS Dashboard（没有数据面板、多色图表、企业级导航）。

核心气质：**干净、圆润、克制、有产品感的个人内容空间**。绿色作为唯一强调色，白色/浅绿背景为主，少量阴影和圆角增加精致感，但不做过度装饰。

前台页面与后台页面共享同一套视觉系统，但在使用倾向上有区分：
- **前台（博客页面）**偏文学阅读感：宽松排版、衬线标题、大号展示文字
- **后台（管理页面）**偏工具效率：紧凑信息密度、无衬线标题、状态徽章
- 两者使用相同的颜色 token、圆角规则、间距系统和阴影规则，不拆分独立主题

---

## 2. Visual Keywords

| 关键词 | 在本项目中的含义 |
|---|---|
| **干净** | 背景 `#f6f8f3`，白色卡片，无噪点纹理，无重复背景图案 |
| **圆润** | 卡片圆角 20-28px，按钮/标签 999px，头像/图标 50% |
| **轻盈** | 阴影 `0 18px 50px rgba(37,58,43,0.08)` 极淡，hover 仅微浮 |
| **克制** | 唯一强调色绿色，无多色系统；hover 仅变色/微位移，无缩放/闪烁 |
| **绿色** | 主色 `#2f6f4e`，辅助色 `#e7f1ea`/`#d7e5dc`，无彩色标签 |
| **留白** | Section 间距 40px，卡片 padding 20-24px，内容最大宽度 1120px |
| **衬线** | 标题使用 Noto Serif SC / Songti SC，正文使用无衬线体 |
| **纸页感** | 无封面文章的默认图为 SVG 纸页线框图标，不是纯色块 |
| **产品感** | 导航为悬浮药丸，按钮为胶囊，卡片有统一圆角和阴影 |
| **文学感** | 文章阅读宽度 720px，行高 1.9，衬线标题，温和引用块 |

---

## 3. Color System

### 3.1 Core Palette

```css
/* Light mode */
--bg: #f6f8f3           /* 页面背景：暖白浅绿 */
--surface: #ffffff       /* 卡片/面板背景：纯白 */
--surface-soft: #f9fbf6  /* 次级表面：更暖的浅绿 */
--text: #1f2722          /* 正文：深绿黑 */
--text-muted: #66736b    /* 弱文本：灰绿 */
--text-faint: #9aa59e    /* 极弱文本：浅灰绿 */
--green: #2f6f4e          /* 强调色：森林绿 */
--green-dark: #1f5138     /* 强调色深：hover/active */
--green-soft: #e7f1ea     /* 强调色淡：背景/标签/hover */
--green-border: #d7e5dc   /* 绿色边框 */
--line: #e5ebe4           /* 分割线/淡边框 */
```

### 3.2 Dark Mode

```css
--bg: #111214            /* 深色背景：近黑 */
--surface: #1a1d1c       /* 深色卡片 */
--surface-soft: #1e2120
--text: #ececec          /* 高对比亮白 */
--text-muted: #9a9e9a
--text-faint: #5d635d
--green: #4a9e6e          /* 深色模式下绿色提亮 */
--green-dark: #3a8a5e
--green-soft: #1a2e24
--green-border: #2a4038
--line: rgba(232,235,230,0.08)
```

### 3.3 Shadow

```css
--shadow: 0 18px 50px rgba(37,58,43,0.08)
--shadow-sm: 0 4px 16px rgba(37,58,43,0.05)
--shadow-hover: 0 24px 60px rgba(37,58,43,0.12)
```

### 3.4 使用规则

- **不要**新增第二种强调色（如蓝色、橙色）
- **不要**使用多色标签系统
- **不要**大面积使用红色，删除按钮用 `#c97c5d`（陶土色）而非亮红
- 所有颜色值必须从 CSS 变量引用，不要硬编码
- 新组件必须先检查是否有现成 token 可用

---

## 4. Typography

### 4.1 字体栈

```css
--serif: "Noto Serif SC", "Songti SC", "STSong", "Source Han Serif SC", Georgia, serif
--sans: "Geist", "Noto Sans SC", "PingFang SC", "Helvetica Neue", system-ui, sans-serif
--mono: "SFMono-Regular", "Menlo", "Consolas", monospace
```

### 4.2 用法

| 用途 | 字体 | 大小 | 字重 |
|---|---|---|---|
| Hero 大标题 | serif | `clamp(72px,10vw,132px)` | 400 |
| 页面标题 (h1) | serif | 1.8rem | 400 |
| Section 标题 | sans | 1.5rem | 500 |
| 文章标题 | serif | 1.35rem / 1.2rem | 400 |
| 文章正文 | sans | 1rem / 0.95rem | 400 |
| 卡片标题 | sans | 0.95rem | 500 |
| Section 小标签 | sans | 0.75rem | 600 |
| 导航项 | sans | 0.875rem | 450 |
| 标签/徽章 | sans | 0.75rem | 450 |
| 日期/元信息 | mono | 0.7-0.75rem | 400 |

### 4.3 阅读宽度

- 文章正文最大宽度：**720px**
- 行高：**1.9**
- 引文：左侧绿色竖线（2px），斜体，浅灰色文字

---

## 5. Layout & Spacing

### 5.1 页面最大宽度

```css
--content-max: 1120px;
```

### 5.2 Section 间距

```css
.section { padding: 40px 0; }          /* 桌面 */
@media (max-width: 768px) { padding: 32px 0; }
```

### 5.3 卡片间距

- 卡片间 gap：16-24px（桌面），12-16px（移动端）
- 卡片内部 padding：20-24px（桌面），16-20px（移动端）
- 圆角：20px（小卡片），24px（中卡片），28px（主文章卡片）

### 5.4 移动端断点

```css
/* 平板 */
@media (max-width: 1024px) { ... }
/* 手机 */
@media (max-width: 768px) { ... }
/* 小屏手机 */
@media (max-width: 480px) { ... }
```

---

## 6. Page Types

本项目的页面分为三类，各有侧重，但共享同一套视觉 token。

### 6.1 Public Blog Pages（前台页面）

包括：首页、文章列表、文章详情、分类页、标签页、关于页。

**设计倾向：文学阅读感**
- 大号衬线标题（Hero / 文章标题）
- 宽松行高（1.8-1.9）
- 最大阅读宽度 720px（文章正文）
- 使用 `.section` + `.section-content` 标准布局
- 绿色仅作为点缀色，不占据大面积
- 卡片 hover 浮起（`translateY(-2~-4px)`）

**约束**：
- 不显示 admin 相关元素
- 不使用 `mono` 字体作为正文
- 不出现 `font-size < 0.75rem` 的文字（除日期/标签外）

### 6.2 Admin Pages（后台页面）

包括：工作台、文章管理、资产管理、分类标签页、设置页。

**设计倾向：工具效率**
- 信息密度更高，卡片 padding 可略小（16-20px）
- 标题使用无衬线体，字号可缩小（1.4-1.8rem）
- 表格/列表支持筛选、搜索、分页
- 使用 `pageClass="admin-page"` 在 `<body>` 上添加样式隔离
- 状态徽章（已发布/草稿/首页/项目屋）突出显示

**约束**：
- **不要**做成独立的设计系统——玻璃拟态、暗色侧边栏、霓虹强调色
- **不要**改变 `<body>` 背景色（保持 `var(--bg)`）
- 所有操作按钮仍使用胶囊圆角
- 统计卡片保持绿色数字 + muted 标签

### 6.3 Editor Pages（编辑页面）

包括：文章新建/编辑页。

**设计倾向：写作专注**
- 桌面端双栏布局（编辑器左侧占 1fr，设置面板右侧 320px）
- 移动端单栏（设置面板折叠到编辑器下方）
- Markdown 输入框使用 `var(--mono)` 字体
- 工具栏轻量，仅一排图标按钮
- 保存/发布/预览/返回四个主操作集中在顶部

**约束**：
- **不要**使用富文本编辑器（WYSIWYG）
- **不要**在编辑器区域放置广告或无关信息
- 封面上传/选择/移除操作在右侧设置面板中完成
- 图片弹窗通过遮罩层打开，不离开编辑页

---

## 7. Components

### 6.1 Header / Navigation

**应该**：
- 悬浮药丸样式（`position: sticky; top: 16px; border-radius: 999px; backdrop-filter: blur(18px)`）
- 三段式布局：左(logo+品牌) + 中(导航项) + 右(主题切换+菜单)
- 导航项为胶囊按钮（`border-radius: 999px; padding: 8px 14px;`）
- hover/active：`background: var(--green-soft); color: var(--green-dark)`
- 移动端隐藏中间导航，右侧显示汉堡菜单按钮
- `.mobile-nav` 使用毛玻璃抽屉（`backdrop-filter: blur`）

**不应该**：
- 普通网站顶部 bar（无 blur、无圆角、左 logo 右链接）
- 下划线式导航（本项目中 `::after` 下划线风格已被废除）
- 桌面端显示汉堡菜单按钮

### 6.2 Hero Section

**应该**：
- 单栏文本布局（已移除右侧插画）
- 大号衬线标题 `clamp(72px,10vw,132px)`
- 标题左对齐，文本区最大宽度 680px
- 使用 `.hero-badge`（绿色小标签）+ `.hero-subtitle`（绿色） + `.hero-desc`（灰绿正文）
- 按钮使用 `.btn-primary` + `.btn-secondary`

**不应该**：
- 右侧出现任何插画/圆形/水纹图形（已移除）
- 文字居中
- 标题小于 2.5rem

### 6.3 Cards

所有卡片遵循统一结构：

```css
background: var(--surface);
border: 1px solid var(--line);
border-radius: 20px;    /* 最小 20px */
box-shadow: var(--shadow-sm);
```

**hover 行为**（如果卡片可交互）：
```css
transform: translateY(-2px);  /* 微浮，不超过 4px */
border-color: var(--green-border);
box-shadow: var(--shadow);
```

多类型卡片：
- `.category-card` — 20px 圆角，14-18px padding
- `.post-card-featured` — 28px 圆角，16/9 封面，20-24px padding
- `.post-card-mini` — 网格布局 `56px 1fr auto`，14px gap
- `.archive-item` — 24px 圆角，200px 缩略图 + 正文
- `.taxonomy-card` — 20px 圆角，自适应网格
- `.admin-nav-card` — 20px 圆角，flex 图标+文字

### 6.4 Buttons

| 类型 | 样式 |
|---|---|
| **主按钮** | `background: var(--green); color: white; border-radius: 999px; padding: 10px 24px;` hover: 更深绿色 + `translateY(-2px)` + shadow |
| **次按钮** | `background: var(--surface); border: 1px solid var(--green-border); color: var(--green-dark); border-radius: 999px;` |
| **删除按钮** | `border: 1px solid rgba(201,124,93,0.3); color: #c97c5d;` 弱危险色，hover 增强 |
| **滤镜按钮** | `border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px;` active: 绿色背景 |
| **分页按钮** | `border: 1px solid var(--line); border-radius: 999px; min-width: 36px; height: 36px;` active: 绿色背景 |

**不应该**：
- 使用直角按钮（圆角小于 8px）
- 使用填充色过重的次按钮
- 使用大面积红色

### 6.5 Inputs / Textarea

```css
border-radius: 12px;     /* 普通输入框 */
border-radius: 999px;    /* 搜索框/select */
border: 1px solid var(--line);
background: var(--surface-soft);
padding: 10px 14px;
font-size: 0.9rem;
focus: border-color: var(--green-border);
```

### 6.6 Tags / Badges

```css
.post-tag {
  display: inline-flex;
  padding: 3px 12px;
  font-size: 0.75rem;
  font-weight: 450;
  color: var(--green-dark);
  background: var(--green-soft);
  border-radius: 999px;
}
```

### 6.7 Empty State

- 居中布局，padding 48px
- 标题 `font-size: 1.1rem; color: var(--text-muted);`
- 描述 `font-size: 0.9rem; color: var(--text-faint);`
- 可用 `border: 1px dashed var(--line)` 虚线框

### 6.8 Admin Dashboard

**应该**：
- 统计卡片 2x2 网格（移动端）
- 导航卡片 flex 图标+文字
- 最近文章列表紧凑排列
- 数字用绿色 `var(--serif)` 突出
- 标题使用 `Admin` 绿色小标签

**不应该**：
- 复杂图表（本项目中仅柱状图，单色绿色）
- 多色进度条
- 企业级 dashboard 布局（左侧导航 + 顶部搜索 + 右侧面板）

### 6.9 Editor Page

**应该**：
- 左侧编辑器 + 右侧设置面板（桌面端双栏）
- 工具栏在编辑器上方，轻量圆形按钮
- 设置面板分卡片：发布设置 / 封面设置 / 首页与项目屋
- 封面可上传、选择、移除，预览显示默认纸页图

**不应该**：
- 富文本编辑器（使用 Markdown textarea）
- 右侧面板跑到下方（移动端才允许）
- 过多设置项塞在一个卡片里

### 6.10 Modal / Dialog

**应该**：
- `border-radius: 28px`
- `background: var(--surface)`
- 半透明遮罩 `rgba(0,0,0,0.4)`
- 最大宽度 480-640px
- 关闭按钮：圆形淡背景
- 点击遮罩或 Esc 关闭

---

## 7. Illustration & Image Direction

### 7.1 封面默认图

无封面文章使用 `DefaultPostCover` 组件：
- 浅绿色渐变背景（`radial-gradient + linear-gradient`）
- SVG 纸页线框图标：圆角矩形 + 标题线 + 正文线 + 装饰圆点 + 叶子路径
- 透明度 0.045-0.26 的绿色，极轻
- 不显示标题文字、分类文字

### 7.2 氛围插画的使用条件

Hero 区域**可以**放置极简、透明、低存在感的氛围插画，但必须满足：

- SVG 或纯 CSS 实现，不使用外部图片资源
- 颜色仅使用绿色（`rgba(47,111,78,0.02-0.15)`），透明度需极低
- 图形不能干扰标题可读性（标题/Hero 文本必须在插画上方或左侧清晰显示）
- 不能出现大面积填充、明显轮廓线、复杂细节
- 推荐：淡绿色渐变圆、水面弧线、散点装饰
- 不推荐：具象插画（岛屿/灯塔/树）、密集图形、高对比度线条

**适用场景**：Hero 右侧背景装饰
**不适用场景**：Section 标题区、文章卡片、导航、弹窗

### 7.3 禁止使用的插画风格

- ❌ 厚重 3D 插画
- ❌ 强商业 SaaS 插画（人物/办公室/图表）
- ❌ 多色渐变
- ❌ 玻璃拟态（backdrop-filter 仅用于导航和弹窗遮罩）
- ❌ 纸纹/水彩/噪点纹理背景
- ❌ Emoji 作为分类图标（已移除）

---

## 8. Motion & Interaction

- **hover**: 仅 border-color + 微浮（translateY(-2px)），无缩放
- **transition**: `0.2s ease` 或 `0.25s ease`
- **页面进入**: `reveal-up` 动画（`translateY(20px) → 0`, `opacity 0→1`, `0.6s`）
- **按钮反馈**: hover 变色 + 微浮 + 阴影增强
- **链接**: 颜色变化或 gap 变化（`→` 箭头右移）
- **图表**: 柱状图高度变化 `0.5s ease`
- **reduce motion**: 全部动画在 `prefers-reduced-motion` 下禁用

---

## 9. Accessibility

- 对比度：正文文本颜色 `--text`（`#1f2722`）在 `--bg`（`#f6f8f3`）上满足 WCAG AA
- focus-visible：所有可交互元素应有 focus 样式（默认 outline 或自定义）
- 表单 label：所有 input/textarea 有对应 `<label>` 或 `aria-label`
- 图片 alt：封面图、文章插图必须有 alt 文本
- 语义化 HTML：使用 `<nav>`, `<main>`, `<article>`, `<section>`, `aria-label`
- 暗色模式：通过 `data-theme="dark"` 切换，localStorage 持久化

---

## 10. Agent Rules

**硬性规则，必须遵守**：

1. **不要引入新的视觉风格**，除非用户明确要求。不要擅自添加玻璃拟态、霓虹色、渐变文字、粒子背景等。

2. **不要随意新增颜色**。所有颜色必须使用现有 CSS 变量。如需新增，必须先在 DESIGN.md 和 CSS variables 中统一定义。

3. **不要增加重阴影、大渐变、多色系统**。保持轻盈、单色强调、淡阴影的现有风格。

4. **不要破坏文章阅读体验**。阅读宽度 720px、行高 1.9、衬线标题、无干扰装饰。

5. **不要把后台做成普通 SaaS Dashboard 风格**。后台使用前台同款设计语言：绿色强调、圆角卡片、淡边框、轻阴影。

6. **新组件必须先匹配现有设计规范**：spacing（20-24px 卡片 padding）、radius（20-28px 卡片，999px 按钮/标签）、border（1px solid var(--line)）、typography（参考第 4 节）。

7. **修改 UI 前必须先阅读 DESIGN.md**。如果在 Agent 上下文中找不到本文档，必须调用 `read_file` 重新加载。

8. **如果 DESIGN.md 与现有代码冲突**，优先保持当前项目的一致性。然后可以提出修正 DESIGN.md 的建议，但不要单方面按规范改代码。

9. **常规颜色必须使用 CSS 变量**。禁止 `color: #333`、`background: #f0f0f0` 等硬编码值。但**遮罩、阴影、悬停透明叠加层**等需要精细透明度控制的场合，可以使用 `rgba(r,g,b,opacity)` 或 `#rrggbbaa` 格式。使用时优先从 CSS 变量取值，例如 `rgba(47,111,78,0.08)`（对应 `var(--green)` 的透明版本）。

10. **hover 状态要克制**：仅 border-color 变化 + 可选 translateY(1-2px)。不要用 scale、brightness、大幅位移。

11. **修改样式前先检查是否有现成的 class** 可用，不要每次都写 inline style。

12. **admin 页面使用 pageClass="admin-page" 做样式隔离**。新 admin 页面必须在 BaseLayout 中传递此 class。

---

## 11. Examples

### ✅ 推荐的写法

```css
/* 使用 CSS 变量 */
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 20px 24px;
}

/* hover 轻量反馈 */
.card:hover {
  border-color: var(--green-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

/* 按钮统一风格 */
.btn {
  border-radius: 999px;
  padding: 10px 24px;
}
```

```html
<!-- 使用现有组件类 -->
<section class="section">
  <div class="section-content">
    <div class="section-header">
      <div class="section-header-left">
        <p class="section-label">LABEL</p>
        <h2 class="section-title">标题</h2>
      </div>
      <a class="section-link" href="/">查看全部 <span class="arrow">→</span></a>
    </div>
  </div>
</section>
```

### ❌ 避免的写法

```css
/* 不要硬编码颜色 */
.card {
  background: #f0f0f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* 不要使用直角 */
.button {
  border-radius: 4px;
}

/* 不要新增强调色 */
.success { color: #22c55e; }
.warning { color: #f59e0b; }
.error { color: #ef4444; }
```

```html
<!-- 不要反复写 inline style -->
<div style="background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 16px 20px;">
```

```js
// 不要用 JS 设置 hover 效果
button.onmouseover = () => { button.style.background = '...'; };
```
