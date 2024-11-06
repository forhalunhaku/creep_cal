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

function plotGraphMC2010(fcm, RH, t0, Ac, u, T, Cs) {
    const numPoints = 1000;
    const tValues = Array.from({ length: numPoints }, (_, i) => {
        return t0 + Math.exp(Math.log(1) + (Math.log(100000) - Math.log(1)) * i / numPoints);
    });
    const phiValues = tValues.map(t => calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t));

    const data = [{
        x: tValues.map(t => t - t0),
        y: phiValues,
        type: 'scatter',
        mode: 'lines',
        name: '徐变系数',
        line: {
            color: '#4ADE80',
            width: 2.5,
            shape: 'spline'
        }
    }];

    const layout = {
        title: {
            text: 'MC2010徐变系数计算结果',
            font: {
                size: 18,
                color: '#333333'
            },
            y: 0.95
        },
        paper_bgcolor: 'rgba(255,255,255,0.98)',
        plot_bgcolor: 'rgba(255,255,255,0.98)',
        xaxis: {
            title: 't - t₀ (天)',
            type: 'log',
            gridcolor: 'rgba(200,200,200,0.3)',
            gridwidth: 1,
            zerolinecolor: 'rgba(200,200,200,0.5)',
            zerolinewidth: 1,
            title_font: {
                size: 14,
                color: '#333333'
            },
            tickfont: {
                size: 12,
                color: '#333333'
            },
            showgrid: true,
            range: [0, 5],
            dtick: 1,
            tickformat: "3",
            showline: true,
            linecolor: 'rgba(200,200,200,0.5)',
            mirror: true
        },
        yaxis: {
            title: 'φ(t,t₀)',
            gridcolor: 'rgba(200,200,200,0.3)',
            gridwidth: 1,
            zerolinecolor: 'rgba(200,200,200,0.5)',
            zerolinewidth: 1,
            title_font: {
                size: 14,
                color: '#333333'
            },
            tickfont: {
                size: 12,
                color: '#333333'
            },
            showgrid: true,
            showline: true,
            linecolor: 'rgba(200,200,200,0.5)',
            mirror: true
        },
        autosize: true,
        margin: {
            l: 60,
            r: 40,
            t: 60,
            b: 60
        },
        showlegend: false,
        hovermode: 'closest',
        hoverlabel: {
            bgcolor: '#FFF',
            bordercolor: '#4ADE80',
            font: {
                size: 13,
                color: '#333333'
            }
        },
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            xanchor: 'right',
            y: 1,
            yanchor: 'top',
            text: `t₀ = ${t0}天`,
            showarrow: false,
            font: {
                size: 12,
                color: '#666666'
            },
            bgcolor: 'rgba(255,255,255,0.8)',
            borderpad: 4
        }]
    };

    const config = {
        responsive: true,
        displayModeBar: false,
        staticPlot: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'MC2010徐变系数图',
            height: 800,
            width: 1200,
            scale: 2
        }
    };

    // 创建或更新图表
    Plotly.newPlot('chart', data, layout, config);
}

function calculateMC2010() {
    try {
        const inputs = {
            'fcm': { value: document.getElementById('fcm').value, min: 0, max: 150, name: '混凝土强度' },
            'RH': { value: document.getElementById('RH').value, min: 0, max: 101, name: '相对湿度' },
            't0': { value: document.getElementById('t0').value, min: 0, max: 10000, name: '加载龄期' },
            'Ac': { value: document.getElementById('Ac').value, min: 0, max: 10000000, name: '截面面积' },
            'u': { value: document.getElementById('u').value, min: 0, max: 10000, name: '周长' },
            'T': { value: document.getElementById('T').value, min: -20, max: 160, name: '温度' }
        };

        // 验证所有输入
        for (let key in inputs) {
            const input = inputs[key];
            const value = parseFloat(input.value);
            
            if (isNaN(value)) {
                throw new Error(`${input.name}必须是有效的数字`);
            }
            if (value < input.min || value > input.max) {
                throw new Error(`${input.name}必须在${input.min}到${input.max}之间`);
            }
            inputs[key] = value;
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
        alert(error.message);
        console.error('计算错误:', error);
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

        const numPoints = 1000;
        const tValues = Array.from({ length: numPoints }, (_, i) => {
            return t0 + Math.exp(Math.log(1) + (Math.log(100000) - Math.log(1)) * i / numPoints);
        });
        const phiValues = tValues.map(t => calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t));
        const timeValues = tValues.map(t => t - t0);

        let csvContent = "data:text/csv;charset=utf-8," + "t-t0,Phi\n";
        timeValues.forEach((time, index) => {
            let row = time + "," + phiValues[index] + "\n";
            csvContent += row;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "phi_data_mc2010.csv");
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

// 添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (calculateBtn) calculateBtn.addEventListener('click', calculateMC2010);
    if (exportBtn) exportBtn.addEventListener('click', exportToExcelMC2010);
    
    // 为输入框添加回车键监听器
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateMC2010();
            }
        });
    });
});