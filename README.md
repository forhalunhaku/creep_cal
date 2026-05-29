# CREEP_LAB | Engineering Core

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Rust](https://img.shields.io/badge/Rust-WASM-orange?style=for-the-badge&logo=rust)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**专业混凝土徐变与收缩计算平台**

*集成四大主流国际标准 · 双引擎高性能计算 · HALUNHAKU 绿色设计系统*

[🌐 Live Demo](#) · [📖 Model Docs](#-模型文档) · [🚀 Quick Start](#-快速开始)

---

## 📖 项目简介

**CREEP_LAB** 是一个基于 Web 的混凝土徐变与收缩计算平台，面向结构工程、土木科研及教学场景。平台整合了 **4 个国际主流预测模型**，并提供 **JavaScript** 和 **Rust WebAssembly** 双引擎选择，支持单点计算、批量处理与结果导出。

视觉系统采用 [HALUNHAKU 设计规范](DESIGN.md) —— 以 **森林绿 `#2f6f4e`** 为唯一强调色，白色卡片圆润克制，营造干净、沉稳的专业工具氛围。

---

## ✨ 核心功能

### 🔬 Single Node Analysis — 单点计算
- 选择算法（ACI 209R-92 / fib MC 2010 / B4 / B4S）与引擎（Rust / JS）
- 滑块调参 + **数字直接点击编辑**，精确输入任意值
- 计算后生成交互式时间序列图表（φ 或 J 随时间变化曲线）
- 一键导出：**Export Result**（参数 + 单点 φ 值 CSV）/ **Export Time Series**（完整时间序列 CSV）

### 📦 Batch Pipeline Matrix — 批量计算
- 支持导入 **CSV / XLSX** 文件，每行为一组工况
- 动态识别所选模型所需列名，支持一键下载列头模板
- 实时处理并在表格中返回全部结果
- 批量结果一键导出 CSV

### 📚 Model Library — 模型文档
- 每个模型提供：描述 · 输入参数表 · 输出量 · 核心计算公式 · 参考文献
- 底部模型对比总览表（来源 / 输出量 / 复杂度 / 引擎）

---

## 🧮 支持模型

| 模型 | 来源 | 输出量 | 复杂度 |
|------|------|--------|--------|
| **ACI 209R-92** | 美国混凝土学会 | φ(t, t₀) 徐变系数 | ★★☆☆ |
| **fib MC 2010** | 欧洲 fib 标准 | φ(t, t₀) = φ_bc + φ_dc | ★★★☆ |
| **B4** | Bažant 西北大学 | J(t, t') 柔度函数 (1/GPa) | ★★★★ |
| **B4S** | B4 简化版 | J(t, t') 柔度函数 (1/GPa) | ★★★☆ |

所有模型均提供 **Rust WASM 高性能内核** 与 **纯 JavaScript 参考实现** 两个引擎。

---

## ⚙️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 (Vite) |
| 样式 | Tailwind CSS 3.4 + CSS 变量设计系统 |
| 设计系统 | [HALUNHAKU](DESIGN.md) — 绿色强调色、圆角卡片、药丸导航 |
| 字体 | Geist · Noto Serif SC · JetBrains Mono (Google Fonts) |
| 图标 | Material Symbols Outlined |
| 计算引擎 | Rust → WebAssembly (`wasm-pack`) |
| 图表 | Recharts |
| 数据解析 | PapaParse (CSV) · read-excel-file (XLSX) |

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 16
- **npm** ≥ 8

### 启动开发服务器

```bash
git clone https://github.com/forhalunhaku/creep_cal.git
cd creep_cal
npm install
npm run dev
# 浏览器访问 http://localhost:5173
```

### 生产构建

```bash
npm run build
# 静态文件输出至 dist/ 目录
npx serve -s dist   # 本地预览
```

### 🦀 关于 Rust 引擎

Rust WASM 引擎已预编译并随源码一起提交（位于 `src/wasm-pkg/` 目录），**无需手动重新编译 Rust** 即可直接使用所有 Rust 功能。

若需修改 Rust 源码并重新编译：

```bash
# 安装 wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 在 rust-engine/ 目录下编译
cd rust-engine
wasm-pack build --target web --out-dir ../src/wasm-pkg
```

---

## 📁 项目结构

```
creep_cal/
├── DESIGN.md                       # HALUNHAKU 绿色设计规范
├── rust-engine/                    # Rust WASM 核心源码
├── public/                         # 静态资源 (favicon, 示例数据, 文档)
│   ├── 模型示例/                    # 各模型 CSV/XLSX 示例
│   └── 模型说明/                    # 各模型 Markdown 文档
├── src/
│   ├── App.jsx                     # 根组件 & 路由
│   ├── components/
│   │   ├── SingleCalculationDashboard.jsx  # 单点计算控制面板
│   │   ├── BatchCalculator.jsx     # 批量计算模块
│   │   ├── DocsPage.jsx            # 模型文档页
│   │   ├── Aci209Calculator.js     # ACI 209R-92 (JS)
│   │   ├── RustAci209Calculator.js # ACI 209R-92 (Rust)
│   │   ├── Mc2010Calculator.js     # fib MC 2010 (JS)
│   │   ├── RustMc2010Calculator.js # fib MC 2010 (Rust)
│   │   ├── B4Calculator.js         # B4 Model (JS)
│   │   ├── RustB4Calculator.js     # B4 Model (Rust)
│   │   ├── B4sCalculator.js        # B4S Model (JS)
│   │   ├── RustB4sCalculator.js    # B4S Model (Rust)
│   │   ├── ErrorBoundary.jsx       # 错误边界
│   │   ├── LoadingSpinner.jsx      # 加载指示器
│   │   ├── MarkdownViewer.jsx      # Markdown 渲染
│   │   └── ui/                     # 通用 UI 组件
│   │       ├── Layout.jsx          # 页面骨架
│   │       ├── Header.jsx          # 药丸导航栏
│   │       ├── CalculatorWrapper.jsx  # 计算器统一容器
│   │       ├── DynamicParameters.jsx  # 参数输入 (含可编辑滑块)
│   │       ├── ResultsSidebar.jsx  # 结果面板 & 系统日志
│   │       ├── CustomSelect.jsx    # 自定义下拉选择
│   │       ├── AnimatedMetric.jsx  # 数字动效组件
│   │       └── BackgroundElements.jsx  # 背景装饰
│   ├── hooks/
│   │   └── useCalculationMotion.js # 计算动效 Hook
│   ├── math/
│   │   └── creepModels.js          # JS 引擎计算核心
│   ├── wasm/
│   │   └── creepEngine.js          # WASM 加载器
│   └── index.css                   # 设计 Token & CSS 变量
└── tailwind.config.js              # Tailwind 配置 (绿色面板)
```

---

## 🗺️ 使用指南

### 单点计算

1. 顶部导航栏点击 **Single analysis**
2. 控制栏选择**算法**（ACI / MC2010 / B4 / B4S）和**引擎**（Rust / JS）
3. 在参数面板中拖动滑块，或**直接点击数字**精确输入
4. 点击 **INITIATE CALCULATION** 按钮
5. 右侧出现徐变系数圆形仪表盘及系统日志
6. 运行后可点击 **Export Result** 导出参数+结果，或 **Export Time Series** 导出完整时间序列

### 批量计算

1. 顶部导航栏点击 **Batch matrix**
2. 下拉选择目标算法
3. 点击 **Download template** 下载对应列头的 CSV 模板
4. 填写数据后，点击 **Upload CSV / XLSX** 导入文件
5. 计算结果在页面内表格中显示，可切换 scatter/line 图表
6. 点击 **Export CSV** 下载结果

### 查看文档

1. 顶部导航栏点击 **Model docs**
2. 选择模型查看详情
3. 每个模型页面包含：参数表 · 输出说明 · 核心公式 · 引擎说明 · 参考文献

---

## 🎨 设计系统

本项目遵循 [HALUNHAKU 设计规范](DESIGN.md)，核心原则：

| 原则 | 含义 |
|------|------|
| **干净** | 背景 `#f6f8f3`，白色卡片，无多余纹理 |
| **圆润** | 卡片圆角 20-28px，按钮/标签 999px 胶囊 |
| **轻盈** | 极淡阴影，hover 仅微浮 translateY(-2px) |
| **克制** | 唯一强调色绿色，无多色系统 |
| **绿色** | 主色 `#2f6f4e`，辅助色 `#e7f1ea` / `#d7e5dc` |
| **衬线** | 标题使用 Noto Serif SC / Songti SC |

暗色模式通过 `data-theme="dark"` 自动切换，localStorage 持久化。

---

## 📚 参考文献

- **ACI 209R-92**: ACI Committee 209 (1992). *Prediction of Creep, Shrinkage, and Temperature Effects in Concrete Structures.*
- **fib MC 2010**: fib (2013). *fib Model Code for Concrete Structures 2010.* Wilhelm Ernst & Sohn.
- **B4**: Bažant Z.P., Hubler M.H., Yu Q. (2015). *Model B4 for Creep, Drying Shrinkage and Autogenous Shrinkage of Normal and High-Strength Concretes.* RILEM TC-242-MDC.
- **B4S**: Bažant Z.P., Baweja S. (2000). *Creep and Shrinkage Prediction Model for Analysis and Design of Concrete Structures: Model B3.* RILEM Recommendation.

---

## 🤝 贡献

欢迎通过 Issue 反馈问题或提交 Pull Request！

1. Fork 本仓库
2. 创建 feature 分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add your feature'`
4. Push 并创建 PR

---

## 📄 开源协议

本项目基于 **MIT License** 开源，详见 [LICENSE](LICENSE)。

---

<div align="center">

Built with ❤️ for the concrete engineering community

[⭐ Star](https://github.com/forhalunhaku/creep_cal) · [🐛 Issues](https://github.com/forhalunhaku/creep_cal/issues)

</div>
