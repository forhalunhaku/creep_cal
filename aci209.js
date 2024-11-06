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

function plotGraph(t0, H, VS, sphi, Cc, alpha) {
    const numPoints = 1000;
    const tValues = Array.from({ length: numPoints }, (_, i) => {
        return t0 + Math.exp(Math.log(1) + (Math.log(100000) - Math.log(1)) * i / numPoints);
    });
    const phiValues = tValues.map(t => calculatePhi(t0, H, VS, sphi, Cc, alpha, t));

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
            text: '徐变系数-时间关系',
            font: {
                size: 18,
                color: '#333333'
            },
            y: 0.95
        },
        paper_bgcolor: 'rgba(255,255,255,0.98)',
        plot_bgcolor: 'rgba(255,255,255,0.98)',
        xaxis: {
            title: 't - t0 (天)',
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
            filename: '徐变系数图',
            height: 800,
            width: 1200,
            scale: 2
        }
    };

    Plotly.newPlot('chart', data, layout, config);
}

// 添加窗口大小改变时的自动调整
window.addEventListener('resize', function() {
    Plotly.Plots.resize('chart');
});

function calculate() {
    try {
        const inputs = {
            't0': { value: document.getElementById('t0').value, min: 1, max: 1000, name: '加载龄期' },
            'H': { value: document.getElementById('H').value, min: 0, max: 1, name: '环境相对湿度' },
            'VS': { value: document.getElementById('VS').value, min: 0, max: 1000, name: '体表比' },
            'sphi': { value: document.getElementById('sphi').value, min: 0, max: 1, name: '砂率' },
            'Cc': { value: document.getElementById('Cc').value, min: 0, max: 1000, name: '水泥含量' },
            'alpha': { value: document.getElementById('alpha').value, min: 0.06, max: 0.1, name: '空气含量' }
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

        plotGraph(
            inputs.t0,
            inputs.H,
            inputs.VS,
            inputs.sphi,
            inputs.Cc,
            inputs.alpha
        );
    } catch (error) {
        alert(error.message);
        console.error('计算错误:', error);
    }
}

function exportToExcel() {
    try {
        const t0 = parseFloat(document.getElementById('t0').value);
        const H = parseFloat(document.getElementById('H').value);
        const VS = parseFloat(document.getElementById('VS').value);
        const sphi = parseFloat(document.getElementById('sphi').value);
        const Cc = parseFloat(document.getElementById('Cc').value);
        const alpha = parseFloat(document.getElementById('alpha').value);
        
        const tValues = Array.from({ length: 1000 }, (_, i) => t0 + i * 10);
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

// 添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calculateBtn').addEventListener('click', calculate);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
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