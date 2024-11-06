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
    };
    reader.readAsArrayBuffer(file);
});


function calculateepsilonSH(cementType, t, tPrime, t0, T, h, fc, vS, c, wC, aC, specimenShape, aggregateType) {
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
    let D = 2 * vS;
    let E28 = (4734 * Math.sqrt(fc)) /1000 ;
    let tau0 = tau_cem * Math.pow(aC / 6, p_tau_a) * Math.pow(wC / 0.38, p_tau_w) * Math.pow((6.5 * c) / 2350, p_tau_c);
    let tauSH = tau0 * ks_tau_a * Math.pow(ks * D, 2);
    let epsilon0 = epsilon_cem * Math.pow(aC  / 6, p_epsilon_a) * Math.pow(wC / 0.38, p_epsilon_w) * Math.pow((6.5 * c) / 2350, p_epsilon_c);
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
function calculateepsilonAU(cementType, t, tPrime, t0, T, h, fc, vS, c, wC, aC, specimenShape, aggregateType) {
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
    let betaTh = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let t0Tilde = t0 * betaTh;
    let betaTs = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    let tTilde = (t - t0) * betaTs;
    let epsilonAUInfinity = -epsilon_au_cem * Math.pow(aC / 6, r_epsilon_a) * Math.pow(wC / 0.38, r_epsilon_w);
    let tauAU = tau_au_cem * Math.pow(wC / 0.38, r_tau_w);
    let alpha = r_alpha * (wC / 0.38);
    let epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha), r_t);
    return epsilonAU.toFixed(8);
}
function calculateJ(cementType, t, tPrime, t0, T, h, fc, vS, c, wC, aC, specimenShape, aggregateType) {
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
    let D = 2 * vS;
    let E28 = (4734 * Math.sqrt(fc)) /1000 ;
    let tau0 = tau_cem * Math.pow(aC / 6, p_tau_a) * Math.pow(wC / 0.38, p_tau_w) * Math.pow((6.5 * c) / 2350, p_tau_c);
    let tauSH = tau0 * ks_tau_a * Math.pow(ks * D, 2);
    let epsilon0 = epsilon_cem * Math.pow(aC  / 6, p_epsilon_a) * Math.pow(wC / 0.38, p_epsilon_w) * Math.pow((6.5 * c) / 2350, p_epsilon_c);
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
    let q1 = p1 / E28 / 1000;
    let q2 = p2  * Math.pow(wC / 0.38, p2w)  /1000 ;
    let q3 = p3 * q2 * Math.pow(aC / 6, p3a) * Math.pow(wC / 0.38, p3w);
    let q4 = p4 * Math.pow(aC / 6, p4a) * Math.pow(wC / 0.38, p4w) / 1000;
    let rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
    let Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
    let Qf = Math.pow((0.086 * Math.pow(tPrimeHat, 2 / 9) + 1.21 * Math.pow(tPrimeHat, 4 / 9)), -1);
    let Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1 / rHat);
    let C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
    let q5 = p5 / 1000 * Math.pow(aC / 6, p5a) * Math.pow(wC / 0.38, p5w) * (Math.abs(kh * epsilonSHInfinity) ** p5_epsilon);
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

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for calculations including t-t0
    const newData = fileData.slice(1).map(row => {
        const t = row[1]; // Assuming the seventh column is 't'
        const tPrime = row[2]; // Assuming the first column is 't0'
        const epsilonSHValue = calculateepsilonSH(...row);
        const epsilonAUValue = calculateepsilonAU(...row);
        const JValue = calculateJ(...row);
        const tMinusTPrime = t - tPrime; // Calculate t-t0
        return [...row, tMinusTPrime, epsilonSHValue, epsilonAUValue, JValue]; // Append Phi value and t-t0 to the row
    });

    // Add headers for Phi and t-t0
    const headers = [...fileData[0], "t-tPrime", "epsilonSH", "epsilonAU", "J"];
    
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