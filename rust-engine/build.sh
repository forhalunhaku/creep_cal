#!/bin/bash

# Rust WebAssembly 构建脚本

echo "🦀 开始构建 Rust WebAssembly 模块..."

# 检查 wasm-pack 是否安装
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack 未安装，正在安装..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# 检查 Rust 工具链
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust 未安装，请先安装 Rust"
    exit 1
fi

# 添加 wasm32 目标
rustup target add wasm32-unknown-unknown

echo "📦 构建 WebAssembly 包..."

# 构建 WebAssembly 包
wasm-pack build --target web --out-dir ../src/wasm-pkg --scope creep-calculator

if [ $? -eq 0 ]; then
    echo "✅ WebAssembly 构建成功！"
    echo "📁 输出目录: ../src/wasm-pkg"
    
    # 显示生成的文件
    echo "📄 生成的文件:"
    ls -la ../src/wasm-pkg/
    
    echo ""
    echo "🚀 现在可以在 React 应用中导入 Rust 模块："
    echo "   import init, { calculate_aci209_single } from './wasm-pkg/creep_calculator_engine.js';"
    
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
