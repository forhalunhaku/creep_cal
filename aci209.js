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
    const numPoints = 10000;
    const tValues = Array.from({ length: numPoints }, (_, i) => t0 + i);
    const phiValues = tValues.map(t => calculatePhi(t0, H, VS, sphi, Cc, alpha, t));

    const data = [{
        x: tValues.map(t => t - t0), // x轴数据
        y: phiValues, // y轴数据
        type: 'scatter', // 图表类型
        mode: 'markers',
        name: 'Phi',
        line: {color: 'blue'} // 线条颜色
    }];

    const layout = {
        title: '徐变系数',
        xaxis: {
            title: 't - t0',
            type: 'log', // 设置x轴为对数轴
        },
        yaxis: {
            title: 'Phi',
        },
        width: 600, // 或根据您的需求调整
        height: 400, // 或根据您的需求调整
    };

    Plotly.newPlot('chart', data, layout); // 'chart'是绘图容器的ID
}

function calculate() {
    const t0 = parseFloat(document.getElementById('t0').value);
    const H = parseFloat(document.getElementById('H').value);
    const VS = parseFloat(document.getElementById('VS').value);
    const sphi = parseFloat(document.getElementById('sphi').value);
    const Cc = parseFloat(document.getElementById('Cc').value);
    const alpha = parseFloat(document.getElementById('alpha').value);
    plotGraph(t0, H, VS, sphi, Cc, alpha); 
}

function exportToExcel() {
    const t0 = parseFloat(document.getElementById('t0').value);
    const H = parseFloat(document.getElementById('H').value);
    const VS = parseFloat(document.getElementById('VS').value);
    const sphi = parseFloat(document.getElementById('sphi').value);
    const Cc = parseFloat(document.getElementById('Cc').value);
    const alpha = parseFloat(document.getElementById('alpha').value);
    
    const tValues = Array.from({ length: 10000 }, (_, i) => t0 + i);
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
}