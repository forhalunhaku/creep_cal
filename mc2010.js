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
    let numPoints = 10000;
    let tValues = Array.from({ length: numPoints }, (_, i) => t0 + i);
    let phiValues = tValues.map(t => calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t));

    // Plotly图表数据
    let data = [{
        x: tValues.map(t => t - t0), // x轴数据
        y: phiValues, // y轴数据
        type: 'scatter', // 图表类型为散点图
        mode: 'markers', 
        name: 'Phi',
        line: { color: 'blue' } // 线条颜色
    }];

    // Plotly图表布局配置
    let layout = {
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

    // 使用Plotly绘制图表
    Plotly.newPlot('chart', data, layout);
}

function calculateMC2010() {
    let fcm = parseFloat(document.getElementById('fcm').value);
    let RH = parseFloat(document.getElementById('RH').value);
    let t0 = parseFloat(document.getElementById('t0').value);
    let Ac = parseFloat(document.getElementById('Ac').value);
    let u = parseFloat(document.getElementById('u').value);
    let T = parseFloat(document.getElementById('T').value);
    let Cs = document.getElementById('Cs').value;
    plotGraphMC2010(fcm, RH, t0, Ac, u, T, Cs);
}

function exportToExcelMC2010() {
    let fcm = parseFloat(document.getElementById('fcm').value);
    let RH = parseFloat(document.getElementById('RH').value);
    let t0 = parseFloat(document.getElementById('t0').value);
    let Ac = parseFloat(document.getElementById('Ac').value);
    let u = parseFloat(document.getElementById('u').value);
    let T = parseFloat(document.getElementById('T').value);
    let Cs = document.getElementById('Cs').value;

    let t_values = Array.from({ length: 10000 }, (_, i) => t0 + i);
    let phi_values = t_values.map(t => calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t));
    let time_values = t_values.map(t => t - t0);

    let csvContent = "data:text/csv;charset=utf-8,"
        + "t-t0,Phi\n";
    time_values.forEach((time, index) => {
        let row = time + "," + phi_values[index] + "\n";
        csvContent += row;
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "phi_data_mc2010.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}