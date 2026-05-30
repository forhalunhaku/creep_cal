# CREEP_LAB

专业混凝土徐变与收缩计算平台。集成 ACI 209R-92、fib MC 2010、B4、B4S 四大国际标准模型，提供 JavaScript 和 Rust WebAssembly 双引擎。

视觉系统采用 [HALUNHAKU 设计规范](DESIGN.md)：森林绿 #2f6f4e 为唯一强调色，白色卡片、圆角克制，暗色模式自动切换。

---

## 功能

**单点计算** — 选择算法与引擎，滑块调参或直接点击编辑数字，生成交互式时间序列图表，支持导出 CSV。

**批量计算** — 导入 CSV / XLSX 文件，每行一组工况，表格返回全部结果，支持 scatter/line 图表切换。

**模型文档** — 每个模型提供描述、输入参数表、输出量、核心公式、参考文献。

---

## 支持模型

| 模型 | 来源 | 输出量 |
|------|------|--------|
| ACI 209R-92 | 美国混凝土学会 | φ(t, t₀) 徐变系数 |
| fib MC 2010 | 欧洲 fib 标准 | φ(t, t₀) = φ_bc + φ_dc |
| B4 | Bažant 西北大学 | J(t, t') 柔度函数 (1/GPa) |
| B4S | B4 简化版 | J(t, t') 柔度函数 (1/GPa) |

每个模型均有 Rust WASM 内核与纯 JavaScript 参考实现两个引擎。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 (Vite) |
| 样式 | Tailwind CSS 3.4 + CSS 变量 |
| 字体 | Geist, Noto Serif SC, JetBrains Mono |
| 图标 | Material Symbols Outlined |
| 图表 | Recharts |
| 引擎 | Rust → WebAssembly, JavaScript |
| 数据 | PapaParse (CSV), read-excel-file (XLSX) |

---

## 快速开始

```bash
git clone https://github.com/forhalunhaku/creep_cal.git
cd creep_cal
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`。

生产构建：

```bash
npm run build
npx serve -s dist
```

Rust WASM 引擎已预编译于 `src/wasm-pkg/`，无需手动编译即可使用。如需修改 Rust 源码：

```bash
cd rust-engine
wasm-pack build --target web --out-dir ../src/wasm-pkg
```

---

## 项目结构

```text
creep_cal/
  DESIGN.md
  package.json
  tailwind.config.js
  rust-engine/
  public/
  src/
    index.css
    App.jsx
    components/
      ui/
        Layout.jsx
        Header.jsx
        CalculatorWrapper.jsx
        DynamicParameters.jsx
        ResultsSidebar.jsx
        CustomSelect.jsx
        AnimatedMetric.jsx
        BackgroundElements.jsx
      SingleCalculationDashboard.jsx
      BatchCalculator.jsx
      DocsPage.jsx
      Aci209Calculator.js
      RustAci209Calculator.js
      Mc2010Calculator.js
      RustMc2010Calculator.js
      B4Calculator.js
      RustB4Calculator.js
      B4sCalculator.js
      RustB4sCalculator.js
      ErrorBoundary.jsx
      LoadingSpinner.jsx
      MarkdownViewer.jsx
    hooks/
      useCalculationMotion.js
    math/
      creepModels.js
    wasm/
      creepEngine.js
```

---

## 使用

1. 顶部导航栏选择 Single analysis / Batch matrix / Model docs
2. 单点计算：选择算法和引擎，调节参数，点击计算
3. 批量计算：导入 CSV/XLSX，自动计算并展示结果表格与图表
4. 模型文档：查阅各模型公式与参数说明

---

## 参考文献

- ACI 209R-92: ACI Committee 209 (1992).
- fib MC 2010: fib (2013). fib Model Code for Concrete Structures 2010.
- B4: Bažant Z.P., Hubler M.H., Yu Q. (2015). RILEM TC-242-MDC.
- B4S: Bažant Z.P., Baweja S. (2000). Model B3. RILEM Recommendation.

---

## 协议

MIT License
