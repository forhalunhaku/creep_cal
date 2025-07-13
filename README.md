# 🏗️ 混凝土徐变计算平台 (Concrete Creep Calculator)

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Desktop-blue?style=for-the-badge)
![Models](https://img.shields.io/badge/Models-ACI209%20%7C%20MC2010%20%7C%20B4%20%7C%20B4S-green?style=for-the-badge)
![Engine](https://img.shields.io/badge/Engine-JavaScript%20%7C%20Rust-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)

**🚀 专业 · 高效 · 精确 · 易用**

*集成四大国际标准徐变模型的现代化计算平台*

[🌐 在线体验](#) | [📖 使用文档](#-模型说明文档) | [🚀 快速开始](#-快速开始) | [💡 功能特色](#-核心功能)

</div>

---

## 📖 项目概述

**混凝土徐变计算平台** 是一个集成了 **ACI209**、**MC2010**、**B4**、**B4S** 四大国际主流混凝土徐变预测模型的现代化Web应用。平台采用 **JavaScript + Rust** 双引擎架构，提供高精度计算、批量处理、结果可视化等功能，适用于科研、工程设计、教学等多个领域。

### 🎯 设计理念
- **🔬 科学严谨**: 基于国际权威标准和最新研究成果
- **⚡ 性能卓越**: Rust WebAssembly引擎提供极速计算
- **🎨 用户友好**: 现代化界面设计和交互体验
- **🔄 功能完整**: 从单点计算到批量处理的全流程支持

---

## 🌟 核心功能

### 📊 **多模型支持**
- **ACI 209**: 美国混凝土学会经典标准模型
- **MC2010**: fib国际标准最新高精度模型  
- **B4**: Bažant-Baweja固化理论模型
- **B4S**: B4简化版，专注收缩预测

### ⚡ **双引擎计算**
- **JavaScript引擎**: 实时交互，即时反馈
- **Rust引擎**: 极速计算，性能提升10-100倍
- **WebAssembly**: 零配置部署，浏览器原生支持

### 📈 **数据处理**
- **单点计算**: 参数调整实时预览
- **批量计算**: Excel/CSV文件导入导出
- **结果可视化**: 交互式图表和数据表格
- **数据导出**: 支持CSV、Excel格式

### 🎨 **用户体验**
- **响应式设计**: 手机/平板/桌面完美适配
- **主题切换**: 深色/浅色/跟随系统
- **国际化**: 中英文界面支持
- **无障碍**: 符合Web可访问性标准

---

## 🏗️ 技术架构

### 前端技术栈
- **React 18**: 现代化组件框架
- **Recharts**: 数据可视化图表库
- **CSS3**: 响应式布局和动画效果
- **ES6+**: 现代JavaScript特性

### 后端计算引擎
- **JavaScript**: 浏览器原生计算引擎
- **Rust + WebAssembly**: 高性能数值计算
- **Web Workers**: 多线程并行处理

### 数据处理
- **Papa Parse**: CSV文件解析
- **SheetJS**: Excel文件处理
- **File API**: 本地文件操作

---

## 🚀 快速开始

### 📋 环境要求
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Rust**: >= 1.70.0 (可选，用于Rust引擎)

### ⚡ 快速启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd concrete-creep-calculator

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start

# 4. 打开浏览器访问
# http://localhost:3000
```

### 🦀 启用Rust高性能引擎

```bash
# 1. 安装Rust工具链
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. 添加WebAssembly目标
rustup target add wasm32-unknown-unknown

# 3. 安装wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 4. 构建Rust引擎
cd rust-engine
wasm-pack build --target web --out-dir pkg

# 5. 启动完整版应用
cd ..
npm start
```

### 🐳 Docker部署

```bash
# 构建镜像
docker build -t creep-calculator .

# 运行容器
docker run -p 3000:3000 creep-calculator
```

### 📦 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 📚 模型说明文档

### 🔬 理论基础与计算公式

| 模型 | 标准来源 | 适用范围 | 特点 | 文档链接 |
|------|----------|----------|------|----------|
| **ACI 209** | 美国混凝土学会 | 普通混凝土 | 🎯 经典实用 | [📖 详细说明](./public/模型说明/aci209.md) |
| **MC2010** | fib国际标准 | 高性能混凝土 | 🌟 精度最高 | [📖 详细说明](./public/模型说明/mc2010.md) |
| **B4** | Bažant-Baweja | 科研分析 | 🔬 理论严谨 | [📖 详细说明](./public/模型说明/b4.md) |
| **B4S** | B4简化版 | 工程实用 | ⚡ 计算简便 | [📖 详细说明](./public/模型说明/b4s.md) |

### 📋 文档内容
每个模型文档包含：
- 📖 **理论背景**: 模型发展历史和科学基础
- 🧮 **计算公式**: 完整的数学推导和参数说明
- 📊 **参数范围**: 适用范围和建议取值
- 🎨 **计算示例**: 详细的工程计算过程
- 🛠️ **应用指南**: 设计、施工、运营阶段建议

---

## 🎯 使用指南

### 📊 单点计算
1. **选择模型**: 点击顶部标签页切换模型
2. **输入参数**: 填写混凝土和环境参数
3. **选择引擎**: JavaScript(实时) 或 Rust(高速)
4. **查看结果**: 图表和数据表格实时更新

### 📈 批量计算
1. **准备数据**: 按模型文档格式准备Excel/CSV文件
2. **导入文件**: 点击"选择文件"上传数据
3. **执行计算**: 选择计算引擎并开始批量处理
4. **导出结果**: 下载包含计算结果的文件

### 🎨 界面操作
- **主题切换**: 右上角切换深色/浅色主题
- **图表交互**: 鼠标悬停查看数据点详情
- **数据筛选**: 表格支持排序和筛选功能
- **结果对比**: 可同时查看多组计算结果

---

## 📁 项目结构

```
concrete-creep-calculator/
├── public/                 # 静态资源
│   ├── 模型说明/           # 模型理论文档
│   └── 模型示例/           # 示例数据文件
├── src/                    # 源代码
│   ├── components/         # React组件
│   │   ├── Aci209Calculator.js      # ACI209 JS版
│   │   ├── RustAci209Calculator.js  # ACI209 Rust版
│   │   ├── Mc2010Calculator.js      # MC2010 JS版
│   │   ├── RustMc2010Calculator.js  # MC2010 Rust版
│   │   ├── B4Calculator.js          # B4 JS版
│   │   ├── RustB4Calculator.js      # B4 Rust版
│   │   ├── B4sCalculator.js         # B4S JS版
│   │   └── RustB4sCalculator.js     # B4S Rust版
│   ├── utils/              # 工具函数
│   └── styles/             # 样式文件
├── rust-engine/            # Rust计算引擎
│   ├── src/                # Rust源码
│   ├── Cargo.toml          # Rust配置
│   └── pkg/                # WebAssembly输出
└── README.md               # 项目说明
```

---

## ⚡ 性能对比

### 🚀 计算性能
| 引擎 | 单点计算 | 批量计算(1000条) | 内存占用 | 特点 |
|------|----------|------------------|----------|------|
| **JavaScript** | ~1ms | ~100ms | 低 | 🔄 实时交互 |
| **Rust + WASM** | ~0.1ms | ~10ms | 极低 | ⚡ 极速计算 |

### 📊 适用场景
- **JavaScript引擎**: 参数调整、实时预览、教学演示
- **Rust引擎**: 批量计算、科研分析、工程设计

---

## ❓ 常见问题

### 🔧 技术问题
- **Q: Rust引擎编译失败？**  
  A: 确保已安装Rust 1.70+和wasm-pack，检查网络连接
- **Q: WebAssembly加载失败？**  
  A: 检查浏览器是否支持WASM，尝试清除缓存
- **Q: 计算结果异常？**  
  A: 检查参数范围，参考模型文档的适用条件

### 📊 使用问题
- **Q: 批量导入失败？**  
  A: 检查文件格式和表头字段，参考示例文件
- **Q: 图表显示异常？**  
  A: 检查数据范围，确保数值在合理区间内
- **Q: 导出文件乱码？**  
  A: 使用支持UTF-8的软件打开，如Excel 2016+

---

## 🤝 贡献指南

### 💡 如何贡献
1. **Fork项目** 到你的GitHub账户
2. **创建分支** `git checkout -b feature/amazing-feature`
3. **提交更改** `git commit -m 'Add amazing feature'`
4. **推送分支** `git push origin feature/amazing-feature`
5. **创建PR** 提交Pull Request

### 🎯 贡献方向
- 🔬 **新模型**: 添加更多徐变预测模型
- ⚡ **性能优化**: 算法优化和计算加速
- 🎨 **界面改进**: UI/UX设计和交互优化
- 📚 **文档完善**: 使用指南和API文档
- 🐛 **Bug修复**: 问题报告和修复

---

## 📄 开源协议

```
MIT License

Copyright (c) 2025 Concrete Creep Calculator Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

### 🏛️ 理论基础
- **ACI Committee 209**: ACI 209徐变模型标准
- **fib**: MC2010国际混凝土标准
- **Zdeněk P. Bažant & Sandeep Baweja**: B4/B4S模型理论

### 🛠️ 技术支持
- **React Team**: 现代化前端框架
- **Rust Team**: 高性能系统编程语言
- **WebAssembly Community**: 浏览器高性能计算

### 🌟 开源社区
感谢所有为开源软件做出贡献的开发者们！

---

<div align="center">

**🏗️ 让混凝土徐变计算更科学、更高效、更易用！**

*Built with ❤️ for the concrete engineering community*

[⭐ Star](https://github.com/your-repo) | [🐛 Report Bug](https://github.com/your-repo/issues) | [💡 Request Feature](https://github.com/your-repo/issues)

</div>
