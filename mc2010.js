// MC2010徐变系数计算函数
function calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t) {
    let t0_T = t0 * Math.exp(13.65 - 4000 / (273 + T));
    let alpha = {'32.5N': -1, '32.5R': 0, '42.5N': 0, '42.5R': 1, '52.5N': 1, '52.5R': 1}[Cs];
    let t0_adj = t0_T * Math.pow((9 / (2 + Math.pow(t0_T, 1.2))) + 1, alpha);
    let h = 2 * Ac / u;
    let alpha_fcm = Math.sqrt(35 / fcm);
    let beta_h = Math.min(1.5 * h + 250 * alpha_fcm, 1500 * alpha_fcm);
    let gamma_t0 = 1 / (2.3 + 3.5 / Math.sqrt(t0_adj));
    let beta_bc_fcm = 1.8 / Math.pow(fcm, 0.7);
    let beta_bc_t_t0 = Math.log(Math.pow(((30 / t0_adj) + 0.035), 2) * (t - t0) + 1);
    let phi_bc = beta_bc_fcm * beta_bc_t_t0;
    let beta_dc_fcm = 412 / Math.pow(fcm, 1.4);
    let beta_dc_RH = (1 - RH / 100) / Math.pow((0.1 * (h / 100)), 1/3);
    let beta_dc_t0 = 1 / (0.1 + Math.pow(t0_adj, 0.2));
    let beta_dc_t_t0 = Math.pow((t - t0) / (beta_h + (t - t0)), gamma_t0);
    let phi_dc = beta_dc_fcm * beta_dc_RH * beta_dc_t0 * beta_dc_t_t0;
    let phi = phi_bc + phi_dc;
    return phi;
}

function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        background: isDark ? '#1e1e1e' : '#ffffff',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        lineColor: isDark ? '#60a5fa' : '#2196f3'
    };
}

function plotGraphMC2010(fcm, RH, t0, Ac, u, T, Cs) {
    const maxDays = 10000;  // 计算10000天
    const tValues = Array.from({ length: maxDays }, (_, i) => t0 + i + 1);  // 从 t0 + 1 开始，每天计算一次

    const phiValues = tValues.map(t => calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t));

    const colors = getThemeColors();

    const data = [{
        x: tValues.map(t => t - t0),
        y: phiValues,
        type: 'scatter',
        mode: 'lines',
        name: '徐变系数',
        line: {
            color: colors.lineColor,
            width: 2.5,
            shape: 'spline'
        }
    }];

    const layout = {
        title: {
            text: '徐变系数-时间关系',
            font: {
                size: 18,
                color: colors.text
            },
            y: 0.95
        },
        paper_bgcolor: colors.background,
        plot_bgcolor: colors.background,
        xaxis: {
            title: 't - t0 (天)',
            type: 'linear',
            gridcolor: colors.gridColor,
            gridwidth: 1,
            zerolinecolor: colors.gridColor,
            zerolinewidth: 1,
            tickfont: {
                color: colors.textSecondary
            },
            titlefont: {
                color: colors.text
            }
        },
        yaxis: {
            title: '徐变系数 φ(t,t0)',
            gridcolor: colors.gridColor,
            gridwidth: 1,
            zerolinecolor: colors.gridColor,
            zerolinewidth: 1,
            tickfont: {
                color: colors.textSecondary
            },
            titlefont: {
                color: colors.text
            }
        },
        showlegend: false,
        margin: {
            l: 60,
            r: 30,
            t: 50,
            b: 50
        },
        hovermode: 'closest',
        hoverlabel: {
            bgcolor: colors.background,
            font: {
                color: colors.text
            }
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
            'lasso2d',
            'select2d',
            'autoScale2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian'
        ]
    };

    Plotly.newPlot('chart', data, layout, config);
}

// 添加窗口大小改变时的自动调整
window.addEventListener('resize', function() {
    Plotly.Plots.resize('chart');
});

// 监听主题变化
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-theme') {
            calculateMC2010(); // 重新绘制图表以更新颜色
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认值
    setDefaultValues();
    
    // 绑定计算按钮事件
    document.getElementById('calculateBtn').addEventListener('click', function() {
        window.calculateButtonClicked = true;
        calculateMC2010();
    });
    
    // 绑定导出按钮事件
    document.getElementById('exportBtn').addEventListener('click', exportToExcelMC2010);
    
    // 为输入框添加回车键监听器
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.calculateButtonClicked = true;
                calculateMC2010();
            }
        });
    });
});

// 设置默认值
function setDefaultValues() {
    const defaults = {
        'fcm': '',  // 不设置默认值，等待用户输入
        'RH': '60',
        't0': '',   // 不设置默认值，等待用户输入
        'Ac': '100000',
        'u': '1000',
        'T': '20',
        'Cs': '42.5N'
    };

    // 设置默认值
    for (let id in defaults) {
        const element = document.getElementById(id);
        if (element && !element.value) {
            element.value = defaults[id];
        }
    }
}

function calculateMC2010() {
    try {
        // 只在点击计算按钮时才验证
        if (!window.calculateButtonClicked) {
            return;
        }

        // 获取所有输入值
        const inputs = {
            'fcm': { value: document.getElementById('fcm').value.trim(), min: 0, max: 150, name: '混凝土强度', unit: 'MPa' },
            'RH': { value: document.getElementById('RH').value.trim(), min: 0, max: 100, name: '相对湿度', unit: '%' },
            't0': { value: document.getElementById('t0').value.trim(), min: 1, max: 1000, name: '加载龄期', unit: '天' },
            'Ac': { value: document.getElementById('Ac').value.trim(), min: 1000, max: 10000000, name: '截面面积', unit: 'mm²' },
            'u': { value: document.getElementById('u').value.trim(), min: 100, max: 100000, name: '周长', unit: 'mm' },
            'T': { value: document.getElementById('T').value.trim(), min: -20, max: 100, name: '温度', unit: '℃' }
        };

        // 检查必填字段
        const requiredFields = [
            { id: 't0', name: '加载龄期' },
            { id: 'fcm', name: '混凝土强度' }
        ];
        
        for (let field of requiredFields) {
            if (!inputs[field.id].value) {
                alert(`请输入${field.name}`);
                document.getElementById(field.id).focus();
                return;
            }
        }

        // 验证数值范围
        for (let key in inputs) {
            const input = inputs[key];
            const value = parseFloat(input.value);
            
            if (isNaN(value)) {
                alert(`${input.name}必须是有效的数字`);
                document.getElementById(key).focus();
                return;
            }
            if (value < input.min || value > input.max) {
                alert(`${input.name}必须在${input.min}到${input.max}${input.unit}之间`);
                document.getElementById(key).focus();
                return;
            }
            inputs[key] = value;  // 存储转换后的数值
        }

        const Cs = document.getElementById('Cs').value;

        plotGraphMC2010(
            inputs.fcm,
            inputs.RH,
            inputs.t0,
            inputs.Ac,
            inputs.u,
            inputs.T,
            Cs
        );
    } catch (error) {
        console.error('计算过程中发生错误:', error);
        alert('计算过程中发生错误，请检查输入值');
    }
}

function exportToExcelMC2010() {
    try {
        const fcm = parseFloat(document.getElementById('fcm').value);
        const RH = parseFloat(document.getElementById('RH').value);
        const t0 = parseFloat(document.getElementById('t0').value);
        const Ac = parseFloat(document.getElementById('Ac').value);
        const u = parseFloat(document.getElementById('u').value);
        const T = parseFloat(document.getElementById('T').value);
        const Cs = document.getElementById('Cs').value;

        // 生成时间点
        const maxDays = 10000;  // 计算10000天
        const times = Array.from({ length: maxDays }, (_, i) => t0 + i + 1);  // 从 t0 + 1 开始，每天计算一次
        const phis = times.map(t => calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t));

        // 创建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            ['时间 (天)', '徐变系数'],
            ...times.map((t, i) => [t - t0, phis[i]])
        ]);

        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, 'MC2010徐变系数');

        // 保存文件
        XLSX.writeFile(wb, 'MC2010_creep_coefficient.xlsx');
    } catch (error) {
        console.error('导出过程中发生错误:', error);
        alert('导出过程中发生错误，请检查输入值');
    }
}