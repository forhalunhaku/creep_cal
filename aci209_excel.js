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
        showFeedbackMessage('文件上传成功', 'fileFeedback');
        document.getElementById('calculateBtn').disabled = false;
    };
    
    reader.readAsArrayBuffer(file);
});

function calculatePhi(t0, H, VS, sphi, Cc, alpha, t) {
    if ([t0, H, VS, sphi, Cc, alpha, t].some(val => isNaN(val))) {
        throw new Error('输入数据包含非数字值');
    }
    
    const beta_t0 = 1.25 * Math.pow(t0, -0.118);
    const beta_RH = 1.27 - 0.0067 * H;
    const beta_VS = 2 * (1 + 1.13 * Math.exp(-0.0213 * VS)) / 3;
    const beta_sphi = 0.88 + 0.244 * sphi;
    const beta_Cc = 0.75 + 0.00061 * Cc;
    const beta_alpha = 0.46 + 9 * alpha;
    const phi_infinity = 2.35 * beta_t0 * beta_RH * beta_VS * beta_sphi * beta_Cc * beta_alpha;
    const beta_c = Math.pow(t - t0, 0.6) / (10 + Math.pow(t - t0, 0.6));
    return (beta_c * phi_infinity).toFixed(2);
}

function handleCalculate() {
    if (!fileData) {
        showFeedbackMessage('请先上传文件', 'calculationFeedback');
        return;
    }

    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartData = fileData.slice(1)
        .map(row => ({
            x: row[6] - row[0], // t-t0
            y: parseFloat(calculatePhi(...row))
        }))
        .sort((a, b) => a.x - b.x);

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

    new Chart(ctx, options);
    document.getElementById('exportBtn').disabled = false;
    showFeedbackMessage('计算完成', 'calculationFeedback');
}

function handleExport() {
    if (!fileData) {
        showFeedbackMessage('请先上传文件', 'exportFeedback');
        return;
    }

    const newData = fileData.slice(1).map(row => {
        const t = row[6];
        const t0 = row[0];
        const phiValue = calculatePhi(...row);
        const tMinusT0 = t - t0;
        return [...row, tMinusT0, phiValue];
    });

    const headers = [...fileData[0], "t-t0", "Phi"];
    const combinedData = [headers, ...newData];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(wb, ws, "Calculations");
    XLSX.writeFile(wb, "calculations.xlsx");

    showFeedbackMessage('导出成功', 'exportFeedback');
}

function showFeedbackMessage(message, elementId) {
    const feedbackElement = document.getElementById(elementId);
    feedbackElement.innerText = message;
    feedbackElement.style.display = "block";
    setTimeout(function() {
        feedbackElement.style.display = "none";
    }, 3000);
}