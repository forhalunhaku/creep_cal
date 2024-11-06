let fileData = null;

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        fileData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        showFeedbackMessage('File uploaded and read successfully.', 'fileFeedback');
    };
    reader.readAsArrayBuffer(file);
});

function calculatePhi(fcm, RH, t0, Ac, u, T, Cs, t) {
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
    return phi.toFixed(2);
}

function handleCalculate() {
    if (!fileData) {
        showFeedbackMessage('请先上传文件', 'calculationFeedback');
        return;
    }

    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 提取数据并按 t-t0 排序
    const chartData = fileData.slice(1)
        .map(row => ({
            x: row[7] - row[2],  // t-t0
            y: parseFloat(calculatePhi(...row))
        }))
        .sort((a, b) => a.x - b.x);  // 按 x 值排序

    // 配置图表选项
    const options = {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Phi',
                data: chartData,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    border: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    },
                    title: {
                        display: true,
                        text: '持荷时间',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    border: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    },
                    title: {
                        display: true,
                        text: '徐变系数',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    }
                }
            }
        }
    };

    // 创建图表
    new Chart(ctx, options);

    showFeedbackMessage('计算完成', 'calculationFeedback');
}

function handleExport() {
    if (!fileData) {
        showFeedbackMessage('Please upload a file first.', 'exportFeedback');
        return;
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for calculations including t-t0
    const newData = fileData.slice(1).map(row => {
        const t = row[7];
        const t0 = row[2];
        const phiValue = calculatePhi(...row);
        const tMinusT0 = t - t0;
        return [...row, tMinusT0, phiValue];
    });

    // Add headers for Phi and t-t0
    const headers = [...fileData[0], "t-t0", "Phi"];
    
    // Combine headers with data
    const combinedData = [headers, ...newData];

    // Add a worksheet for calculations
    const ws = XLSX.utils.aoa_to_sheet(combinedData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Calculations");

    // Save the workbook as an Excel file
    XLSX.writeFile(wb, "calculations.xlsx");

    showFeedbackMessage('Results exported.', 'exportFeedback');
}

function showFeedbackMessage(message, elementId) {
    const feedbackElement = document.getElementById(elementId);
    feedbackElement.innerText = message;
    feedbackElement.style.display = "block";
    setTimeout(function() {
        feedbackElement.style.display = "none";
    }, 1000);
}