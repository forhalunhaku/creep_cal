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
        showFeedbackMessage('文件上传成功.', 'fileFeedback');
    };
    reader.readAsArrayBuffer(file);
});


function calculateepsilonSH(cementType, t, tPrime, t0, T, h, fc, vS, specimenShape, aggregateType) {
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
    let D = 2 * vS;
    let E28 = (4734 * Math.sqrt(fc)) /1000 ;
    let tau0 = tau_s_cem * Math.pow(fc/40, s_tau_f);
    let tauSH = tau0 * ks_tau_a * Math.pow(ks * D, 2);
    let epsilon0 = epsilon_s_cem * Math.pow(fc/40, s_epsilon_f);
    let betaTh = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let t0Tilde = t0 * betaTh;
    let betaTs = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let E1 = E28 * Math.sqrt((7*betaTh + 600*betaTs) / (4+(6/7)*(7*betaTh + 600*betaTs))) ;
    let E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4+(6/7)*(t0Tilde + tauSH * betaTs)))  ;
    let epsilonSHInfinity = - epsilon0 * ks_epsilon_a * (E1/E2)
    let tTilde = (t - t0) * betaTs;
    let tPrimeHat = t0 * betaTh + (tPrime - t0) * betaTs;
    let betaTc = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let tHat = tPrimeHat + (t - tPrime) * betaTc;
    let S = Math.tanh(Math.sqrt(tTilde / tauSH));
    let kh = h <= 0.98 ? 1 - Math.pow(h, 3) : 12.94 * (1 - h) - 0.2;
    let epsilonSH = epsilonSHInfinity * kh * S;
    return epsilonSH.toFixed(8);
}
function calculateepsilonAU(cementType, t, tPrime, t0, T, h, fc, vS, specimenShape, aggregateType) {
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
    let betaTh = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let t0Tilde = t0 * betaTh;
    let betaTs = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let tTilde = (t - t0) * betaTs;
    let epsilonAUInfinity = -epsilon_au_cem * Math.pow(fc/40, r_epsilon_f);
    let tauAU = tau_au_cem * Math.pow(fc/40, r_tau_f);
    let epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha_s), r_t);
    return epsilonAU.toFixed(8);
}
function calculateJ(cementType, t, tPrime, t0, T, h, fc, vS, specimenShape, aggregateType) {
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
    let D = 2 * vS;
    let E28 = (4734 * Math.sqrt(fc)) /1000 ;
    let tau0 = tau_s_cem * Math.pow(fc/40, s_tau_f);
    let tauSH = tau0 * ks_tau_a * Math.pow(ks * D, 2);
    let epsilon0 = epsilon_s_cem * Math.pow(fc/40, s_epsilon_f);
    let betaTh = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let t0Tilde = t0 * betaTh;
    let betaTs = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let E1 = E28 * Math.sqrt((7*betaTh + 600*betaTs) / (4+(6/7)*(7*betaTh + 600*betaTs))) ;
    let E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4+(6/7)*(t0Tilde + tauSH * betaTs)))  ;
    let epsilonSHInfinity = - epsilon0 * ks_epsilon_a * (E1/E2);
    let tTilde = (t - t0) * betaTs;
    let tPrimeHat = t0 * betaTh + (tPrime - t0) * betaTs;
    let betaTc = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let tHat = tPrimeHat + (t - tPrime) * betaTc;
    let S = Math.tanh(Math.sqrt(tTilde / tauSH));
    let kh = h <= 0.98 ? 1 - Math.pow(h, 3) : 12.94 * (1 - h) - 0.2;
    let q1 = p1 / E28 / 1000;
    let q2 = s2  * Math.pow(fc / 40, s2f)  /1000 ;
    let q3 = s3 * q2 * Math.pow(fc /40 , s3f)
    let q4 = s4 * Math.pow(fc /40 , s4f) / 1000;
    let rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
    let Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
    let Qf = Math.pow((0.086 * Math.pow(tPrimeHat, 2 / 9) + 1.21 * Math.pow(tPrimeHat, 4 / 9)), -1);
    let Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1 / rHat);
    let C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
    let q5 = s5 / 1000 * Math.pow(fc /40, s5f) * (Math.abs(kh * epsilonSHInfinity) ** p5_epsilon);
    let H = 1 - (1 - h) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
    let tPrime0 = Math.max(tPrimeHat, t0Tilde);
    let Hc = 1 - (1 - h) * Math.tanh(Math.sqrt((tPrime0 - t0Tilde) / tauSH));
    let Cd = tHat >= tPrime0 ? q5 * Math.sqrt(Math.exp(-p5H * H) - Math.exp(-p5H * Hc)) : 0;
    let RT = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let J = q1 + RT * C0 + Cd;
    return J.toFixed(8);
}

function handleCalculate() {
    if (!fileData) {
        showFeedbackMessage('Please upload a file first.', 'calculationFeedback');
        return;
    }

    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extract data for chart
    // Extract data for chart
    const epsilonSHDataPoints = fileData.slice(1).map(row => ({
        x: row[1] - row[2],  // Assuming these are the correct indexes for your data
        y: parseFloat(calculateepsilonSH(...row))
    }));

    const epsilonAUDataPoints = fileData.slice(1).map(row => ({
        x: row[1] - row[2],
        y: parseFloat(calculateepsilonAU(...row))
    }));

    const JDataPoints = fileData.slice(1).map(row => ({
        x: row[1] - row[2],
        y: parseFloat(calculateJ(...row))
    }));

    // Configure chart options
    const options = {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'epsilonSH',
                    data: epsilonSHDataPoints,
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-gradient-2').trim(), // 使用E91E63
                    pointRadius: 4
                },
                {
                    label: 'epsilonAU',
                    data: epsilonAUDataPoints,
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-gradient-1').trim(), // 使用9C27B0
                    pointRadius: 4
                },
                {
                    label: 'J',
                    data: JDataPoints,
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(), // 使用4ADE80
                    pointRadius: 4
                }
            ]
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
                        text: 'Results',
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

    // Create chart with the updated options
    new Chart(ctx, options);

    showFeedbackMessage('Calculation completed.', 'calculationFeedback');
}

function handleExport() {
    if (!fileData) {
        showFeedbackMessage('Please upload a file first.', 'exportFeedback');
        return;
    }

    // 优化：预先计算所有结果
    const calculatedData = fileData.slice(1).map(row => {
        const t = row[1];
        const tPrime = row[2];
        const tMinusTPrime = t - tPrime;
        return [
            ...row,
            tMinusTPrime,
            calculateepsilonSH(...row),
            calculateepsilonAU(...row),
            calculateJ(...row)
        ];
    });

    const wb = XLSX.utils.book_new();
    const headers = [...fileData[0], "t-tPrime", "epsilonSH", "epsilonAU", "J"];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...calculatedData]);
    XLSX.utils.book_append_sheet(wb, ws, "Calculations");
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