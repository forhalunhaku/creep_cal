# B4S 简化徐变与收缩模型说明

本文档与当前应用的计算逻辑一致。B4S 是当前应用中基于强度参数的简化版本，输出柔度函数 `J(t,t')` 与干燥收缩应变 `epsilonSH`。它不需要 B4 中的水泥用量、水胶比和骨胶比。

## 输入参数

| 界面含义 | 批量列名 | 单位 | 说明 |
| --- | --- | --- | --- |
| 开始干燥龄期 | `t0` | d | 收缩起算龄期 |
| 加载龄期 | `tPrime` | d | 徐变加载龄期 |
| 温度 | `T` | C | 环境温度 |
| 相对湿度 | `h` | - 或 % | 可输入 0-1 或 0-100，超过 1 时自动除以 100 |
| 抗压强度 | `fc` | MPa | 混凝土抗压强度 |
| 体积表面积比 | `vS` | mm | 应用中取 `D = 2vS` |
| 水泥类型 | `cementType` | - | `R`、`RS`、`SL` |
| 骨料类型 | `aggregateType` | - | 见骨料系数表 |
| 试件形状 | `specimenShape` | - | `1` 到 `5` |
| 计算时间 | `t` | d | 从浇筑起算的目标龄期 |

当 `t < tPrime` 时，应用返回无效值。

## 基础变量

```math
h_d=\begin{cases}
h/100, & h>1\\
h, & h\le 1
\end{cases}
```

```math
D=2vS
```

```math
E_{28}=\frac{4734\sqrt{f_c}}{1000}
```

```math
\beta_T=e^{4000(\frac{1}{293}-\frac{1}{T+273})}
```

```math
t_{0T}=t_0\beta_T
```

```math
\hat{t'}=t_{0T}+(t'-t_0)\beta_T
```

```math
\hat{t}=\hat{t'}+(t-t')\beta_T
```

## 收缩参数

```math
\tau_0=\tau_{s,cem}\left(\frac{f_c}{40}\right)^{s_{\tau f}}
```

```math
\tau_{SH}=\tau_0k_{s\tau a}(k_sD)^2
```

```math
\epsilon_0=\epsilon_{s,cem}\left(\frac{f_c}{40}\right)^{s_{\epsilon f}}
```

```math
E_1=E_{28}\sqrt{\frac{7\beta_T+600\beta_T}{4+\frac{6}{7}(7\beta_T+600\beta_T)}}
```

```math
E_2=E_{28}\sqrt{\frac{t_{0T}+\tau_{SH}\beta_T}{4+\frac{6}{7}(t_{0T}+\tau_{SH}\beta_T)}}
```

```math
\epsilon_{SH,\infty}=-\epsilon_0k_{s\epsilon a}\frac{E_1}{E_2}
```

```math
k_h=\begin{cases}
1-h_d^3, & h_d\le 0.98\\
12.94(1-h_d)-0.2, & h_d>0.98
\end{cases}
```

干燥收缩：

```math
\epsilon_{SH}
=\epsilon_{SH,\infty}k_h
\tanh\sqrt{\frac{\max(0,(t-t_0)\beta_T)}{\tau_{SH}}}
```

## 柔度函数

```math
q_1=\frac{p_1}{1000E_{28}}
```

```math
q_2=\frac{s_2(f_c/40)^{s_{2f}}}{1000}
```

```math
q_3=s_3q_2(f_c/40)^{s_{3f}}
```

```math
q_4=\frac{s_4(f_c/40)^{s_{4f}}}{1000}
```

```math
\hat{r}=1.7\hat{t'}^{0.12}+8
```

```math
Z=\hat{t'}^{-0.5}\ln(1+(\hat{t}-\hat{t'})^{0.1})
```

若 `tHat <= tpHat`，应用取 `Z = 0.001`。

```math
Q_f=\frac{1}{0.086\hat{t'}^{2/9}+1.21\hat{t'}^{4/9}}
```

```math
Q=Q_f\left[1+\left(\frac{Q_f}{\max(0.0001,Z)}\right)^{\hat{r}}\right]^{-1/\hat{r}}
```

```math
C_0=q_2Q+q_3\ln(1+\max(0,\hat{t}-\hat{t'})^{0.1})
+q_4\ln(\max(1,\hat{t}/\hat{t'}))
```

```math
q_5=\frac{s_5(f_c/40)^{s_{5f}}|k_h\epsilon_{SH,\infty}|^{p_{5e}}}{1000}
```

```math
H=1-(1-h_d)\tanh\sqrt{\frac{\max(0,\hat{t}-t_{0T})}{\tau_{SH}}}
```

```math
t'_0=\max(\hat{t'},t_{0T})
```

```math
H_c=1-(1-h_d)\tanh\sqrt{\frac{\max(0,t'_0-t_{0T})}{\tau_{SH}}}
```

```math
C_d=q_5\sqrt{\max(0,e^{-p_{5H}H}-e^{-p_{5H}H_c})}
```

若 `tHat < tp0`，应用取 `Cd = 0`。

```math
J(t,t')=q_1+\beta_T C_0+C_d
```

## 系数表

水泥类型：

| 类型 | tau_s_cem | s_tau_f | eps_s_cem | s_eps_f | p1 | p5H | s2 | s3 | s4 | s5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| R | 0.027 | 0.21 | 590e-6 | -0.51 | 0.70 | 8 | 14.2e-3 | 0.976 | 4.00e-3 | 1.54e-3 |
| RS | 0.027 | 1.55 | 830e-6 | -0.84 | 0.60 | 1 | 29.9e-3 | 0.976 | 4.00e-3 | 41.8e-3 |
| SL | 0.032 | -1.84 | 640e-6 | -0.69 | 0.80 | 8 | 11.2e-3 | 0.976 | 4.00e-3 | 150e-3 |

各水泥类型共享：

| 参数 | 值 |
| --- | ---: |
| `p5e` | -0.85 |
| `s2f` | -1.58 |
| `s3f` | -1.61 |
| `s4f` | -1.16 |
| `s5f` | -0.45 |

骨料类型：

| 类型 | `ksτa` | `ksεa` |
| --- | ---: | ---: |
| Quartzite | 0.59 | 0.71 |
| Limestone | 1.80 | 0.95 |
| Sandstone | 2.30 | 1.60 |
| Granite | 4.00 | 1.05 |
| Diabase | 0.06 | 0.76 |
| Quartz Diorite | 15.00 | 2.20 |
| No Information | 1.00 | 1.00 |

试件形状：

| `specimenShape` | `ks` |
| --- | ---: |
| `1` | 1.00 |
| `2` | 1.15 |
| `3` | 1.25 |
| `4` | 1.30 |
| `5` | 1.55 |

## 输出

| 输出 | 单位 | 说明 |
| --- | --- | --- |
| `J` | 1/GPa | 柔度函数，界面与批量结果按 `1/GPa` 标注 |
| `epsilonSH` | strain | 干燥收缩应变，通常为负值 |

当前实现不对输入范围做规范适用性裁剪，超出常规工程范围时结果仅代表公式外推。
