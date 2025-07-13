# 🦀 Rust WebAssembly 集成指南

本文档介绍如何在混凝土徐变计算平台中集成和使用 Rust WebAssembly 高性能计算引擎。

## 🎯 性能优势

Rust WebAssembly 版本相比 JavaScript 版本具有以下优势：

- **计算速度提升 2-10倍**：特别是在大批量数据处理时
- **内存使用更高效**：更好的内存管理和垃圾回收
- **数值计算精度更高**：Rust 的数值计算库更加精确
- **并行处理能力**：支持多线程并行计算（未来版本）

## 📦 安装依赖

### 1. 安装 Rust 工具链

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 重新加载环境变量
source ~/.cargo/env

# 添加 WebAssembly 目标
rustup target add wasm32-unknown-unknown
```

### 2. 安装 wasm-pack

```bash
# 使用官方安装脚本
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 或者使用 cargo 安装
cargo install wasm-pack
```

### 3. 验证安装

```bash
rustc --version
wasm-pack --version
```

## 🔨 构建 WebAssembly 模块

### Windows 用户

```cmd
cd rust-engine
build.bat
```

### Linux/macOS 用户

```bash
cd rust-engine
chmod +x build.sh
./build.sh
```

### 手动构建

```bash
cd rust-engine
wasm-pack build --target web --out-dir ../src/wasm-pkg --scope creep-calculator
```

构建成功后，会在 `src/wasm-pkg/` 目录下生成以下文件：

- `creep_calculator_engine.js` - JavaScript 绑定
- `creep_calculator_engine_bg.wasm` - WebAssembly 二进制文件
- `package.json` - 包配置文件

## 🚀 使用方法

### 1. 启动开发服务器

```bash
npm install
npm start
```

### 2. 访问 Rust 版本

在浏览器中打开应用后，点击 "🦀 ACI209-Rust" 标签页即可使用 Rust 版本的计算器。

### 3. 性能测试

点击 "🏁 性能测试" 标签页可以对比 JavaScript 和 Rust 版本的性能差异。

## 📊 功能特性

### ACI209 Rust 版本

- ✅ 单点计算
- ✅ 时间序列计算（10000点）
- ✅ 批量数据处理
- ✅ Excel/CSV 导入导出
- ✅ 实时性能监控

### 性能基准测试

- ✅ 时间序列计算对比
- ✅ 批量计算对比
- ✅ 大数据量处理对比
- ✅ 可视化性能图表

## 🔧 开发指南

### 添加新的计算模型

1. 在 `rust-engine/src/` 下创建新的模块文件
2. 实现计算函数并导出为 WebAssembly 接口
3. 在 `lib.rs` 中添加模块引用
4. 创建对应的 React 组件
5. 在 `App.js` 中添加新的 Tab

### 示例：添加 MC2010 Rust 版本

```rust
// rust-engine/src/mc2010.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_mc2010_single(params: &JsValue, t: f64) -> Result<f64, JsValue> {
    // 实现 MC2010 计算逻辑
    Ok(result)
}
```

```javascript
// src/components/RustMc2010Calculator.js
import { calculate_mc2010_single } from '../wasm-pkg/creep_calculator_engine.js';

const result = calculate_mc2010_single(params, t);
```

## 🐛 故障排除

### 常见问题

1. **WebAssembly 模块加载失败**
   - 确保已正确构建 WebAssembly 模块
   - 检查 `src/wasm-pkg/` 目录是否存在
   - 尝试重新构建：`cd rust-engine && ./build.sh`

2. **构建失败**
   - 确保 Rust 和 wasm-pack 已正确安装
   - 检查网络连接（可能需要下载依赖）
   - 尝试清理缓存：`cargo clean`

3. **性能没有提升**
   - 确保使用 Release 模式构建
   - 检查浏览器是否支持 WebAssembly
   - 对比大数据量计算（小数据量差异不明显）

### 调试技巧

1. **启用 Rust 日志**
   ```rust
   console_log!("调试信息: {}", value);
   ```

2. **性能分析**
   ```javascript
   const timer = new wasmModule.PerformanceTimer();
   // 执行计算
   console.log(`耗时: ${timer.elapsed()}ms`);
   ```

3. **内存使用监控**
   ```javascript
   const memoryUsage = wasmModule.get_memory_usage();
   console.log(`内存使用: ${memoryUsage} bytes`);
   ```

## 📈 性能优化建议

1. **批量处理**：尽量使用批量计算函数而不是循环调用单点计算
2. **数据预处理**：在 Rust 端进行数据验证和预处理
3. **内存管理**：避免频繁的 JavaScript-WebAssembly 数据传递
4. **并行计算**：未来版本将支持多线程并行处理

## 🔮 未来计划

- [ ] 实现 MC2010、B4、B4S 模型的 Rust 版本
- [ ] 添加多线程并行计算支持
- [ ] 优化内存使用和数据传递
- [ ] 添加更多性能基准测试
- [ ] 支持 GPU 加速计算（WebGPU）

## 📄 许可证

本 Rust 集成遵循与主项目相同的 MIT 许可证。
