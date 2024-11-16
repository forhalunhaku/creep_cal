// Global variables to store calculated values
var t_values = [];
var epsilon_sh_values = [];
var epsilon_au_values = [];
var J_values = [];

// 获取主题颜色
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认值
    setDefaultValues();
    
    // 绑定计算按钮事件
    document.getElementById('calculateBtn').addEventListener('click', function() {
        window.calculateButtonClicked = true;
        calculate();
        window.calculateButtonClicked = false;
    });
    
    // 绑定导出按钮事件
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
    // 为输入框添加回车键监听器
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.calculateButtonClicked = true;
                calculate();
                window.calculateButtonClicked = false;
            }
        });
    });

    // 监听主题变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme') {
                updateChartTheme();
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});

// 更新图表主题
function updateChartTheme() {
    if (t_values.length > 0) {
        plotResults();
    }
}

// 设置默认值
function setDefaultValues() {
    const defaults = {
        't0': '',  // 不设置默认值，等待用户输入
        'tPrime': '7',
        'T': '20',
        'h': '60',
        'fc': '',  // 不设置默认值，等待用户输入
        'vS': '0.5',
        'c': '350',
        'wC': '0.5',
        'aC': '4',
        'cementType': 'R',
        'aggregateType': 'Quartz',
        'specimenShape': 'infinite cylinder'
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
    // 清除之前的计算结果
    t_values = [];
    epsilon_sh_values = [];
    epsilon_au_values = [];
    J_values = [];

    // 获取并验证输入值
    const inputs = {
        't0': { value: document.getElementById('t0').value.trim(), min: 1, max: 1000, name: '加载龄期', unit: '天' },
        'tPrime': { value: document.getElementById('tPrime').value.trim(), min: 0, max: 100, name: '养护时间', unit: '天' },
        'T': { value: document.getElementById('T').value.trim(), min: -20, max: 100, name: '温度', unit: '℃' },
        'h': { value: document.getElementById('h').value.trim(), min: 0, max: 100, name: '相对湿度', unit: '%' },
        'fc': { value: document.getElementById('fc').value.trim(), min: 0, max: 100, name: '混凝土强度', unit: 'MPa' },
        'vS': { value: document.getElementById('vS').value.trim(), min: 0, max: 100, name: '体积表面比', unit: '' },
        'c': { value: document.getElementById('c').value.trim(), min: 0, max: 1000, name: '水泥含量', unit: 'kg/m³' },
        'wC': { value: document.getElementById('wC').value.trim(), min: 0.2, max: 1, name: '水胶比', unit: '' },
        'aC': { value: document.getElementById('aC').value.trim(), min: 0, max: 10, name: '养护系数', unit: '' }
    };

    // 检查必填字段
    const requiredFields = [
        { id: 't0', name: '加载龄期' },
        { id: 'fc', name: '混凝土强度' }
    ];
    
    for (let field of requiredFields) {
        if (!inputs[field.id].value) {
            alert(`请输入${field.name}`);
            document.getElementById(field.id).focus();
            return;
        }
    }

    // 验证数值
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
        inputs[key].value = value;  // 存储转换后的数值
    }

    // 获取选择值
    const cementType = document.getElementById("cementType").value;
    const aggregateType = document.getElementById("aggregateType").value;
    const specimenShape = document.getElementById("specimenShape").value;

    // 直接使用解析后的数值，并将相对湿度转换为小数
    var tPrime = inputs['tPrime'].value;
    var t0 = inputs['t0'].value;
    var T = inputs['T'].value;
    var h = inputs['h'].value / 100;  // 转换为小数
    var fc = inputs['fc'].value;
    var vS = inputs['vS'].value;
    var c = inputs['c'].value;
    var wC = inputs['wC'].value;
    var aC = inputs['aC'].value;

    // Constants based on cement type, aggregate type, and specimen shape...
    switch(cementType) {
        case "R":
            tau_cem = 0.016; p_tau_a = -0.33; p_tau_w = -0.06; p_tau_c = -0.1;
            epsilon_cem = 360e-6; p_epsilon_a = -0.8; p_epsilon_w = 1.1; p_epsilon_c = 0.11;
            tau_au_cem = 1; r_tau_w = 3; r_t = -4.5; r_alpha = 1;
            epsilon_au_cem = 210e-6; r_epsilon_a = -0.75; r_epsilon_w = -3.5;
            p1 = 0.70; p2 = 58.6e-3; p3 = 39.3e-3; p4 = 3.4e-3; p5 = 777e-6; p5H = 8.00; p2w = 3.00; p3a = -1.10; p3w = 0.40; p4a = -0.90; p4w = 2.45; p5_epsilon = -0.85; p5a = -1; p5w = 0.78;
            break;
        case "RS":
            tau_cem = 0.08; p_tau_a = -0.33; p_tau_w = -2.4; p_tau_c = -2.7;
            epsilon_cem = 860e-6; p_epsilon_a = -0.8; p_epsilon_w = -0.27; p_epsilon_c = 0.11;
            tau_au_cem = 41; r_tau_w = 3; r_t = -4.5; r_alpha = 1.4;
            epsilon_au_cem = -84.0e-6; r_epsilon_a = -0.75; r_epsilon_w = -3.5;
            p1 = 0.60; p2 = 17.4e-3; p3 = 39.3e-3; p4 = 3.4e-3; p5 = 94.6e-6; p5H = 1.00; p2w = 3.00; p3a = -1.10; p3w = 0.40; p4a = -0.90; p4w = 2.45; p5_epsilon = -0.85; p5a = -1; p5w = 0.78;
            break;
        case "SL":
            tau_cem = 0.01; p_tau_a = -0.33; p_tau_w = 3.55; p_tau_c = 3.8;
            epsilon_cem = 410e-6; p_epsilon_a = -0.8; p_epsilon_w = 1; p_epsilon_c = 0.11;
            tau_au_cem = 1; r_tau_w = 3; r_t = -4.5; r_alpha = 1;
            epsilon_au_cem = 0.00e-6; r_epsilon_a = -0.75; r_epsilon_w = -3.5;
            p1 = 0.8; p2 = 40.5e-3; p3 = 39.3e-3; p4 = 3.4e-3; p5 = 496e-6; p5H = 8.00; p2w = 3.00; p3a = -1.10; p3w = 0.40; p4a = -0.90; p4w = 2.45; p5_epsilon = -0.85; p5a = -1; p5w = 0.78;
            break;
        default:
            alert("Invalid cement type");
    }
  
    // Set constants based on specimen shape
    switch(specimenShape) {
        case "infinite slab":
            ks = 1.00;
            break;
        case "infinite cylinder":
            ks = 1.15;
            break;
        case "infinite square prism":
            ks = 1.25;
            break;
        case "sphere":
            ks = 1.30;
            break;
        case "cube":
            ks = 1.55;
            break;
        default:
            alert("Invalid specimen shape");
    }
  

    // Set constants based on aggregate type
    switch(aggregateType) {
        case "Diabase":
            ks_tau_a = 0.06; ks_epsilon_a = 0.76;
            break;
        case "Quartzite":
            ks_tau_a = 0.59; ks_epsilon_a = 0.71;
            break;
        case "Limestone":
            ks_tau_a = 1.80; ks_epsilon_a = 0.95;
            break;
        case "Sandstone":
            ks_tau_a = 2.30; ks_epsilon_a = 1.60;
            break;
        case "Granite":
            ks_tau_a = 4.00; ks_epsilon_a = 1.05;
            break;
        case "Quartz Diorite":
            ks_tau_a = 15.0; ks_epsilon_a = 2.20;
            break;
        case "No Information":
            ks_tau_a = 1.00; ks_epsilon_a = 1.00;
            break;
        default:
            alert("Invalid aggregate type");
    }

    // Calculate t_values
    const maxDays = 10000;  // 计算10000天
    t_values = Array.from({ length: maxDays }, (_, i) => tPrime + i + 1);  // 从 tPrime + 1 开始，每天计算一次

    // Initialize arrays to store calculated values
    epsilon_sh_values = [];
    epsilon_au_values = [];
    J_values = [];

    // Calculate epsilon_sh, epsilon_au, and J for each t
    t_values.forEach(t => {
        var D = 2 * vS;  // 有效厚度
        var E28 = (4734 * Math.sqrt(fc)) / 1000;  // 28天弹性模量
        var tau0 = tau_cem * Math.pow(aC / 6, p_tau_a) * Math.pow(wC / 0.38, p_tau_w) * Math.pow((6.5 * c) / 2350, p_tau_c);
        var tauSH = tau0 * ks_tau_a * Math.pow(ks * D, 2);
        var epsilon0 = epsilon_cem * Math.pow(aC / 6, p_epsilon_a) * Math.pow(wC / 0.38, p_epsilon_w) * Math.pow((6.5 * c) / 2350, p_epsilon_c);
        var betaTh = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));  // 温度影响系数
        var t0Tilde = t0 * betaTh;  // 修正加载龄期
        var betaTs = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));  // 温度影响系数
        var E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7) * (7 * betaTh + 600 * betaTs)));
        var E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7) * (t0Tilde + tauSH * betaTs)));
        var epsilonSHInfinity = -epsilon0 * ks_epsilon_a * (E1 / E2);
        var tTilde = (t - t0) * betaTs;  // 修正时间间隔
        var tPrimeHat = t0 * betaTh + (tPrime - t0) * betaTs;  // 修正养护时间
        var betaTc = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));  // 温度影响系数
        var tHat = tPrimeHat + (t - tPrime) * betaTc;  // 修正总时间
        
        // 收缩应变计算
        var S = Math.tanh(Math.sqrt(tTilde / tauSH));
        var kh = h <= 0.98 ? 1 - Math.pow(h, 3) : 12.94 * (1 - h) - 0.2;
        var epsilonSH = epsilonSHInfinity * kh * S;

        // 自生收缩应变计算
        var epsilonAUInfinity = -epsilon_au_cem * Math.pow(aC / 6, r_epsilon_a) * Math.pow(wC / 0.38, r_epsilon_w);
        var tauAU = tau_au_cem * Math.pow(wC / 0.38, r_tau_w);
        var alpha = r_alpha * (wC / 0.38);
        var epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha), r_t);

        // 徐变函数计算
        var q1 = p1 / E28 / 1000;
        var q2 = p2 * Math.pow(wC / 0.38, p2w) / 1000;
        var q3 = p3 * q2 * Math.pow(aC / 6, p3a) * Math.pow(wC / 0.38, p3w);
        var q4 = p4 * Math.pow(aC / 6, p4a) * Math.pow(wC / 0.38, p4w) / 1000;
        var rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
        var Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
        var Qf = Math.pow((0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9)), -1);
        var Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1 / rHat);
        var C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
        var q5 = p5 / 1000 * Math.pow(aC / 6, p5a) * Math.pow(wC / 0.38, p5w) * Math.pow(Math.abs(kh * epsilonSHInfinity), p5_epsilon);
        var H = 1 - (1 - h) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
        var tPrime0 = Math.max(tPrimeHat, t0Tilde);
        var Hc = 1 - (1 - h) * Math.tanh(Math.sqrt((tPrime0 - t0Tilde) / tauSH));
        var Cd = tHat >= tPrime0 ? q5 * Math.sqrt(Math.exp(-p5H * H) - Math.exp(-p5H * Hc)) : 0;
        var RT = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
        var J = q1 + RT * C0 + Cd;

        epsilon_sh_values.push(epsilonSH);
        epsilon_au_values.push(epsilonAU);
        J_values.push(J);
    });

    plotResults();
}

// 绘制结果
function plotResults() {
    const colors = getThemeColors();
    const tPrime = parseFloat(document.getElementById("tPrime").value);
    
    const data = [
        {
            x: t_values.map(t => t - tPrime),
            y: epsilon_sh_values,
            type: 'scatter',
            mode: 'lines',
            name: '收缩应变',
            line: { color: '#4ADE80', width: 2 }
        },
        {
            x: t_values.map(t => t - tPrime),
            y: epsilon_au_values,
            type: 'scatter',
            mode: 'lines',
            name: '自生收缩应变',
            line: { color: '#60A5FA', width: 2 }
        },
        {
            x: t_values.map(t => t - tPrime),
            y: J_values,
            type: 'scatter',
            mode: 'lines',
            name: '徐变函数',
            line: { color: '#F472B6', width: 2 }
        }
    ];

    const layout = {
        title: {
            text: 'B4模型计算结果',
            font: { size: 18, color: colors.text }
        },
        paper_bgcolor: colors.background,
        plot_bgcolor: colors.background,
        xaxis: {
            title: 't - t₀ (天)',
            gridcolor: colors.gridColor,
            zerolinecolor: colors.gridColor,
            title_font: { size: 14, color: colors.text },
            tickfont: { size: 12, color: colors.text },
            showgrid: true,
            showline: true,
            linecolor: colors.gridColor
        },
        yaxis: {
            title: '应变/徐变函数',
            gridcolor: colors.gridColor,
            zerolinecolor: colors.gridColor,
            title_font: { size: 14, color: colors.text },
            tickfont: { size: 12, color: colors.text },
            showgrid: true,
            showline: true,
            linecolor: colors.gridColor
        },
        autosize: true,
        margin: { l: 60, r: 40, t: 60, b: 60 },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1,
            font: { size: 12, color: colors.text }
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
            'zoom2d',
            'pan2d',
            'select2d',
            'lasso2d',
            'zoomIn2d',
            'zoomOut2d',
            'autoScale2d',
            'resetScale2d',
            'toggleSpikelines'
        ]
    };

    Plotly.newPlot('chart', data, layout, config);
}

// 修改导出函数，改为CSV格式
function exportToExcel() {
    try {
        let csvContent = "data:text/csv;charset=utf-8," + 
            "t-tPrime,epsilon_sh,epsilon_au,J\n";
        
        t_values.forEach((t, index) => {
            let row = [
                t - document.getElementById("tPrime").value,
                epsilon_sh_values[index],
                epsilon_au_values[index],
                J_values[index]
            ].join(",") + "\n";
            csvContent += row;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "b4_calculation_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert('导出过程中发生错误，请检查输入值');
        console.error('导出错误:', error);
    }
}

// 添加窗口大小改变时的自动调整
window.addEventListener('resize', function() {
    Plotly.Plots.resize('chart');
});