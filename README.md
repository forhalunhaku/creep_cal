# CREEP_LAB | Engineering Core

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Rust](https://img.shields.io/badge/Rust-WASM-orange?style=for-the-badge&logo=rust)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**专业混凝土徐变与收缩计算平台**

*集成四大主流国际标准 · 双引擎高性能计算 · 现代玻璃拟态仪表盘*

[🌐 Live Demo](#) · [📖 Model Docs](#-模型文档) · [🚀 Quick Start](#-快速开始)

</div>

---

## 📖 项目简介

**CREEP_LAB** 是一个基于 Web 的混凝土徐变与收缩计算平台，面向结构工程、土木科研及教学场景。平台整合了 **4 个国际主流预测模型**，并提供 **JavaScript** 和 **Rust WebAssembly** 双引擎选择，支持单点计算、批量处理与结果导出。

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
| 前端框架 | React 19 (Create React App) |
| 样式 | Tailwind CSS 3.4 + 自定义 glassmorphism 设计系统 |
| 字体 | Space Grotesk · Manrope (Google Fonts) |
| 图标 | Material Symbols Outlined |
| 计算引擎 | Rust → WebAssembly (`wasm-pack`) |
| 图表 | Recharts |
| 数据解析 | PapaParse (CSV) · SheetJS/xlsx (Excel) |

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
npm start
# 浏览器访问 http://localhost:3000
```

### 生产构建

```bash
npm run build
# 静态文件输出至 build/ 目录
npx serve -s build   # 本地预览
```

### 🦀 关于 Rust 引擎

Rust WASM 引擎已预编译并随源码一起提交（位于 `public/` 目录下的 `.wasm` 和 `_bg.wasm` 文件），**无需手动重新编译 Rust** 即可直接使用所有 Rust 功能。

若需修改 Rust 源码并重新编译：

```bash
# 安装 wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 在 rust-engine/ 目录下编译
cd rust-engine
wasm-pack build --target web --out-dir ../public/pkg
```

---

## 📁 项目结构

```
creep_cal/
├── public/
│   └── pkg/                        # 预编译的 Rust WASM 产物
├── src/
│   ├── App.js                      # 根组件 & 路由
│   ├── components/
│   │   ├── Aci209Calculator.js     # ACI 209R-92 (JS)
│   │   ├── RustAci209Calculator.js # ACI 209R-92 (Rust)
│   │   ├── Mc2010Calculator.js     # fib MC 2010 (JS)
│   │   ├── RustMc2010Calculator.js # fib MC 2010 (Rust)
│   │   ├── B4Calculator.js         # B4 Model (JS)
│   │   ├── RustB4Calculator.js     # B4 Model (Rust)
│   │   ├── B4sCalculator.js        # B4S Model (JS)
│   │   ├── RustB4sCalculator.js    # B4S Model (Rust)
│   │   ├── BatchCalculator.js      # 批量计算模块
│   │   ├── SingleCalculationDashboard.js  # 单点计算控制面板
│   │   ├── DocsPage.js             # 模型文档页
│   │   └── ui/                     # 通用 UI 组件
│   │       ├── Layout.js           # 页面骨架
│   │       ├── Sidebar.js          # 侧边栏导航
│   │       ├── Header.js           # 顶部栏
│   │       ├── CalculatorWrapper.js# 计算器统一容器
│   │       ├── DynamicParameters.js# 参数输入 (含可编辑滑块)
│   │       └── ResultsSidebar.js   # 结果面板 & 系统日志
└── README.md
```

---

## 🗺️ 使用指南

### 单点计算

1. 侧边栏点击 **Single Node Analysis**
2. 顶部控制栏选择**算法**（ACI / MC2010 / B4 / B4S）和**引擎**（Rust / JS）
3. 在参数面板中拖动滑块，或**直接点击数字**精确输入
4. 点击 **INITIATE CALCULATION** 按钮
5. 右侧出现徐变系数圆形仪表盘及系统日志
6. 运行后可点击 **Export Result** 导出参数+结果，或 **Export Time Series** 导出完整时间序列

### 批量计算

1. 侧边栏点击 **Batch Pipeline Matrix**
2. 下拉选择目标算法
3. 点击 **Extract Template** 下载对应列头的 CSV 模板
4. 填写数据后，点击 **Upload Set** 导入文件
5. 点击 **RUN PIPELINE** 执行计算，结果在页面内表格中显示
6. 点击 **Export Results** 下载结果 CSV

### 查看文档

1. 侧边栏点击 **Docs & Models**
2. 顶部 Tab 切换模型
3. 每个模型页面包含：参数表 · 输出说明 · 核心公式 · 引擎说明 · 参考文献

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
