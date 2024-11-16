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
        'cementType': 'R',
        'aggregateType': 'Quartzite',
        'specimenShape': '2'
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
    try {
        // 清除之前的计算结果
        t_values = [];
        epsilon_sh_values = [];
        epsilon_au_values = [];
        J_values = [];

        // 获取输入值
        var cementType = document.getElementById("cementType").value;
        var tPrime = parseFloat(document.getElementById("tPrime").value);
        var t0 = parseFloat(document.getElementById("t0").value);
        var T = parseFloat(document.getElementById("T").value);
        var h = parseFloat(document.getElementById("h").value) / 100; // 转换为小数
        var fc = parseFloat(document.getElementById("fc").value);
        var vS = parseFloat(document.getElementById("vS").value);
        var aggregateType = document.getElementById("aggregateType").value;
        var specimenShape = document.getElementById("specimenShape").value;

        // 验证输入
        if (isNaN(tPrime) || isNaN(t0) || isNaN(T) || isNaN(h) || isNaN(fc) || isNaN(vS)) {
            throw new Error("请填写所有必需的数值输入项");
        }

        // 设置常数
        var tau_au_cem, r_tau_f, epsilon_au_cem, r_epsilon_f, alpha_s, r_t;
        var tau_s_cem, s_tau_f, epsilon_s_cem, s_epsilon_f;
        var p1, p5_epsilon, p5H, s2, s3, s4, s5, s2f, s3f, s4f, s5f;
        var ks, ks_epsilon_a, ks_tau_a;

        // Constants based on cement type
        switch(cementType) {
            case "R":
                tau_au_cem = 2.26; r_tau_f = 0.27; epsilon_au_cem = 78.2e-6; r_epsilon_f = 1.03; alpha_s = 1.73; r_t = -1.73;
                tau_s_cem = 0.027; s_tau_f = 0.21; epsilon_s_cem = 590e-6; s_epsilon_f = -0.51;
                p1 = 0.70; p5_epsilon =-0.85; p5H = 8; s2 = 14.2e-3; s3 = 0.976; s4 = 4.00e-3; s5 = 1.54e-3; s2f = -1.58; s3f = -1.61; s4f = -1.16; s5f = -0.45;
                break;
            case "RS":
                tau_au_cem = 2.26; r_tau_f = 0.27; epsilon_au_cem = 78.2e-6; r_epsilon_f = 1.03; alpha_s = 1.73; r_t = -1.73;
                tau_s_cem = 0.027; s_tau_f = 1.55; epsilon_s_cem = 830e-6; s_epsilon_f = -0.84;
                p1 = 0.60; p5_epsilon =-0.85; p5H = 1; s2 = 29.9e-3; s3 = 0.976; s4 = 4.00e-3; s5 = 41.8e-3; s2f = -1.58; s3f = -1.61; s4f = -1.16; s5f = -0.45;
                break;
            case "SL":
                tau_au_cem = 2.26; r_tau_f = 0.27; epsilon_au_cem = 78.2e-6; r_epsilon_f = 1.03; alpha_s = 1.73; r_t = -1.73;
                tau_s_cem = 0.032; s_tau_f = -1.84; epsilon_s_cem = 640e-6; s_epsilon_f = -0.69;
                p1 = 0.80; p5_epsilon =-0.85; p5H = 8; s2 = 11.2e-3; s3 = 0.976; s4 = 4.00e-3; s5 = 150e-3; s2f = -1.58; s3f = -1.61; s4f = -1.16; s5f = -0.45;
                break;
            default:
                throw new Error("无效的水泥类型");
        }

        // Constants based on specimen shape
        switch(specimenShape) {
            case "1": // 无限板
                ks = 1.00;
                break;
            case "2": // 无限圆柱
                ks = 1.15;
                break;
            case "3": // 无限正方形棱柱
                ks = 1.25;
                break;
            case "4": // 球体
                ks = 1.30;
                break;
            case "5": // 立方体
                ks = 1.55;
                break;
            default:
                throw new Error("无效的试件形状");
        }

        // Constants based on aggregate type
        switch(aggregateType) {
            case "Diabase": // 玄武岩
                ks_tau_a = 0.06; ks_epsilon_a = 0.76;
                break;
            case "Quartzite": // 石英岩
                ks_tau_a = 0.59; ks_epsilon_a = 0.71;
                break;
            case "Limestone": // 石灰岩
                ks_tau_a = 1.80; ks_epsilon_a = 0.95;
                break;
            case "Sandstone": // 砂岩
                ks_tau_a = 2.30; ks_epsilon_a = 1.60;
                break;
            case "Granite": // 花岗岩
                ks_tau_a = 4.00; ks_epsilon_a = 1.05;
                break;
            case "Quartz Diorite": // 石英闪长岩
                ks_tau_a = 15.0; ks_epsilon_a = 2.20;
                break;
            case "No Information": // 未知
                ks_tau_a = 1.00; ks_epsilon_a = 1.00;
                break;
            default:
                throw new Error("无效的骨料类型");
        }

        // Calculate t_values
        const maxDays = 10000;  // 计算10000天
        t_values = Array.from({ length: maxDays }, (_, i) => tPrime + i + 1);  // 从 tPrime + 1 开始，每天计算一次

        // Initialize arrays to store calculated values
        epsilon_sh_values = [];
        epsilon_au_values = [];
        J_values = [];

        // Calculate values for each time point
        t_values.forEach(t => {
            var D = 2 * vS;
            var E28 = (4734 * Math.sqrt(fc)) /1000 ;
            var tau0 = tau_s_cem * Math.pow(fc/40, s_tau_f);
            var tauSH = tau0 * ks_tau_a * Math.pow(ks * D, 2);
            var epsilon0 = epsilon_s_cem * Math.pow(fc/40, s_epsilon_f);
            var betaTh = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
            var t0Tilde = t0 * betaTh;
            var betaTs = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
            var E1 = E28 * Math.sqrt((7*betaTh + 600*betaTs) / (4+(6/7)*(7*betaTh + 600*betaTs))) ;
            var E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4+(6/7)*(t0Tilde + tauSH * betaTs)))  ;
            var epsilonSHInfinity = - epsilon0 * ks_epsilon_a * (E1/E2);
            var tTilde = (t - t0) * betaTs;
            var tPrimeHat = t0 * betaTh + (tPrime - t0) * betaTs;
            var betaTc = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
            var tHat = tPrimeHat + (t - tPrime) * betaTc;
            var S = Math.tanh(Math.sqrt(tTilde / tauSH));
            var kh = h <= 0.98 ? 1 - Math.pow(h, 3) : 12.94 * (1 - h) - 0.2;
            var epsilonSH = epsilonSHInfinity * kh * S;

            var epsilonAUInfinity = -epsilon_au_cem * Math.pow(fc/40, r_epsilon_f);
            var tauAU = tau_au_cem * Math.pow(fc/40, r_tau_f);
            var epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha_s), r_t);

            var q1 = p1 / E28 / 1000;
            var q2 = s2  * Math.pow(fc / 40, s2f)  /1000 ;
            var q3 = s3 * q2 * Math.pow(fc /40 , s3f)
            var q4 = s4 * Math.pow(fc /40 , s4f) / 1000;
            var rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
            var Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
            var Qf = Math.pow((0.086 * Math.pow(tPrimeHat, 2 / 9) + 1.21 * Math.pow(tPrimeHat, 4 / 9)), -1);
            var Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1 / rHat);
            var C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
            var q5 = s5 / 1000 * Math.pow(fc /40, s5f) * (Math.abs(kh * epsilonSHInfinity) ** p5_epsilon);
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

        // 绘制结果
        plotResults();

    } catch (error) {
        console.error('计算过程中发生错误:', error);
        alert(error.message || '计算过程中发生错误，请检查输入值');
    }
}

function plotResults() {
    const colors = getThemeColors();
    const data = [
        {
            x: t_values.map(t => t - t_values[0]),
            y: epsilon_sh_values,
            name: '干燥收缩',
            type: 'scatter',
            mode: 'lines',
            line: { 
                color: '#4ADE80',
                width: 2.5,
                shape: 'spline'
            }
        },
        {
            x: t_values.map(t => t - t_values[0]),
            y: epsilon_au_values,
            name: '自生收缩',
            type: 'scatter',
            mode: 'lines',
            line: { 
                color: '#60A5FA',
                width: 2.5,
                shape: 'spline'
            }
        },
        {
            x: t_values.map(t => t - t_values[0]),
            y: J_values,
            name: '总收缩',
            type: 'scatter',
            mode: 'lines',
            line: { 
                color: '#F472B6',
                width: 2.5,
                shape: 'spline'
            }
        }
    ];

    const layout = {
        title: {
            text: 'B4S 混凝土收缩计算结果',
            font: {
                size: 24,
                color: colors.text
            }
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
            title: {
                text: '收缩应变',
                font: {
                    size: 14,
                    color: colors.text
                }
            },
            gridcolor: colors.gridColor,
            gridwidth: 1,
            zerolinecolor: colors.gridColor,
            zerolinewidth: 1,
            tickfont: {
                size: 12,
                color: colors.text
            }
        },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1,
            bgcolor: 'rgba(0,0,0,0)',
            bordercolor: 'rgba(0,0,0,0)',
            font: {
                size: 12,
                color: colors.text
            }
        },
        margin: {
            l: 60,
            r: 40,
            t: 60,
            b: 60
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('chart', data, layout, config);
}

function exportToExcel() {
    try {
        let csvContent = "data:text/csv;charset=utf-8," + 
            "t-t0,epsilon_sh,epsilon_au,J\n";
        
        t_values.forEach((t, index) => {
            let row = [
                t - document.getElementById("tPrime").value,
                epsilon_sh_values[index],
                epsilon_au_values[index],
                J_values[index]
            ];

            csvContent += row.join(",");
            csvContent += "\n";
        });

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "B4S_calculation_results.csv");
        link.click();
    } catch (error) {
        console.error('导出过程中发生错误:', error);
        alert('导出过程中发生错误，请重试');
    }
}

// 添加窗口大小改变时的自动调整
window.addEventListener('resize', function() {
    Plotly.Plots.resize('chart');
});