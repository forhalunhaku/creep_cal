# 混凝土徐变计算工具

一个专业的混凝土徐变预测与分析工具，支持多种国际标准模型。该工具提供了直观的用户界面，支持单点计算和Excel批量计算两种模式。

## 特性

- 🌐 支持多种国际标准模型
  - B4S
  - ACI209
  - B4
  - MC2010

- 💡 两种计算模式
  - 单点计算：适用于快速计算和参数调整
  - Excel批量计算：支持大量数据的批量处理

- 🎨 现代化界面
  - 响应式设计，支持各种设备
  - 智能深色/浅色主题系统
    - 主题设置自动同步
    - 主题切换动画
    - 主题状态持久化
  - 实时数据可视化

- 📊 数据可视化
  - 使用Plotly.js绘制徐变系数曲线
  - 清晰直观的数据展示
  - 支持图表交互和导出

## 使用方法

### 单点计算模式

1. 在主页选择需要使用的计算模型
2. 输入相关参数
3. 点击计算按钮获取结果
4. 查看徐变系数曲线和计算结果

### Excel批量计算模式

1. 选择Excel模式
2. 上传按照模板格式准备的Excel文件
3. 点击计算按钮进行批量计算
4. 导出计算结果

## 技术栈

- 前端框架：原生JavaScript
- UI组件：自定义CSS组件
- 图表库：Plotly.js
- Excel处理：XLSX.js
- 主题系统：CSS变量 + JavaScript

## 使用方式

### 在线使用

访问 [https://forhalunhaku.github.io/creep_cal/](https://forhalunhaku.github.io/creep_cal/)

### 本地运行

1. 克隆仓库
```bash
git clone https://github.com/forhalunhaku/creep_cal.git
```

2. 使用本地服务器运行（比如 VS Code 的 Live Server 插件）

## 贡献

欢迎提交问题和改进建议！

## 联系方式

如果你有任何问题或建议，欢迎通过以下方式联系：

- GitHub Issues: [https://github.com/forhalunhaku/creep_cal/issues](https://github.com/forhalunhaku/creep_cal/issues)
