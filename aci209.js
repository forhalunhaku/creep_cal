function calculatePhi(t0, H, VS, sphi, Cc, alpha, t) {
    const betaT0 = 1.25 * Math.pow(t0, -0.118);
    const betaRH = 1.27 - 0.0067 * H;
    const betaVS = 2 * (1 + 1.13 * Math.exp(-0.0213 * VS)) / 3;
    const betaSphi = 0.88 + 0.244 * sphi;
    const betaCc = 0.75 + 0.00061 * Cc;
    const betaAlpha = 0.46 + 9 * alpha;
    const phiInfinity = 2.35 * betaT0 * betaRH * betaVS * betaSphi * betaCc * betaAlpha;
    const betaC = Math.pow(t - t0, 0.6) / (10 + Math.pow(t - t0, 0.6));
    const phi = betaC * phiInfinity;
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

function plotGraph(t0, H, VS, sphi, Cc, alpha) {
    const numPoints = 10000;
    const tValues = Array.from({ length: numPoints }, (_, i) => t0 + i + 1);
    const phiValues = tValues.map(t => calculatePhi(t0, H, VS, sphi, Cc, alpha, t));

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
            calculate(); // 重新绘制图表以更新颜色
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
        calculate();
    });
    
    // 绑定导出按钮事件
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
    // 初始化主题
    initTheme();
    
    // 为输入框添加回车键监听器
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculate();
            }
        });
    });
});

// 设置默认值
function setDefaultValues() {
    const defaults = {
        't0': '',  // 不设置默认值，等待用户输入
        'H': '60',
        'VS': '33',
        'sphi': '0.42',
        'Cc': '',  // 不设置默认值，等待用户输入
        'alpha': '0.08'
    };

    // 设置默认值
    for (let id in defaults) {
        const element = document.getElementById(id);
        if (element && !element.value) {
            element.value = defaults[id];
        }
    }
}

function calculate() {
    // 只在点击计算按钮时才验证
    if (!window.calculateButtonClicked) {
        return;
    }

    // 获取所有输入值
    const t0 = document.getElementById('t0').value.trim();
    const H = document.getElementById('H').value.trim();
    const VS = document.getElementById('VS').value.trim();
    const sphi = document.getElementById('sphi').value.trim();
    const Cc = document.getElementById('Cc').value.trim();
    const alpha = document.getElementById('alpha').value.trim();

    // 检查是否有空值
    const requiredFields = [
        { id: 't0', name: '加载龄期' },
        { id: 'Cc', name: '水泥含量' }
    ];
    
    for (let field of requiredFields) {
        const value = document.getElementById(field.id).value.trim();
        if (!value) {
            alert(`请输入${field.name}`);
            document.getElementById(field.id).focus();
            return;
        }
    }

    // 转换为数字并验证
    const inputs = {
        't0': { value: parseFloat(t0), min: 1, max: 1000, name: '加载龄期', unit: '天' },
        'H': { value: parseFloat(H), min: 0, max: 100, name: '环境相对湿度', unit: '%' },
        'VS': { value: parseFloat(VS), min: 0, max: 1000, name: '体表比', unit: 'mm' },
        'sphi': { value: parseFloat(sphi), min: 0, max: 1, name: '砂率', unit: '' },
        'Cc': { value: parseFloat(Cc), min: 0, max: 1000, name: '水泥含量', unit: 'kg/m³' },
        'alpha': { value: parseFloat(alpha), min: 0.06, max: 0.1, name: '空气含量', unit: '' }
    };

    // 验证每个输入值
    for (let key in inputs) {
        const input = inputs[key];
        if (isNaN(input.value)) {
            alert(`${input.name}必须是有效的数字`);
            document.getElementById(key).focus();
            return;
        }
        if (input.value < input.min || input.value > input.max) {
            alert(`${input.name}必须在${input.min}到${input.max}${input.unit}之间`);
            document.getElementById(key).focus();
            return;
        }
    }

    // 所有验证通过，执行计算
    plotGraph(
        inputs.t0.value,
        inputs.H.value,
        inputs.VS.value,
        inputs.sphi.value,
        inputs.Cc.value,
        inputs.alpha.value
    );
}

function exportToExcel() {
    try {
        const t0 = parseFloat(document.getElementById('t0').value);
        const H = parseFloat(document.getElementById('H').value);
        const VS = parseFloat(document.getElementById('VS').value);
        const sphi = parseFloat(document.getElementById('sphi').value);
        const Cc = parseFloat(document.getElementById('Cc').value);
        const alpha = parseFloat(document.getElementById('alpha').value);

        const tValues = Array.from({ length: 10000 }, (_, i) => t0 + i + 1);
        const phiValues = tValues.map(t => calculatePhi(t0, H, VS, sphi, Cc, alpha, t));
        const timeValues = tValues.map(t => t - t0);

        let csvContent = "data:text/csv;charset=utf-8," + "t-t0,Phi\n";
        timeValues.forEach((time, index) => {
            let row = time + "," + phiValues[index] + "\n";
            csvContent += row;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "phi_data_aci209.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert('导出过程中发生错误，请检查输入值');
        console.error('导出错误:', error);
    }
}

function initTheme() {
    // 初始化主题
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}