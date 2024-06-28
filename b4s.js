// Global variables to store calculated values
var t_values = [];
var epsilon_sh_values = [];
var epsilon_au_values = [];
var J_values = [];

function calculate() {
  // 清除之前的计算结果
  t_values = [];
  epsilon_sh_values = [];
  epsilon_au_values = [];
  J_values = [];

  var cementType = document.getElementById("cementType").value;
  var tPrime = parseFloat(document.getElementById("tPrime").value);
  var t0 = parseFloat(document.getElementById("t0").value);
  var T = parseFloat(document.getElementById("T").value);
  var h = parseFloat(document.getElementById("h").value);
  var fc = parseFloat(document.getElementById("fc").value);
  var vS = parseFloat(document.getElementById("vS").value);
  var aggregateType = document.getElementById("aggregateType").value;
  var specimenShape = document.getElementById("specimenShape").value;
  
  // Constants based on cement type, aggregate type, and specimen shape...
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

  // Calculate t_values
  t_values = Array.from({ length: 10000 }, (_, i) => tPrime + i);

  // Initialize arrays to store calculated values
  epsilon_sh_values = [];
  epsilon_au_values = [];
  J_values = [];

  // Calculate epsilon_sh, epsilon_au, and J for each t
  t_values.forEach(t => {
    // Your existing calculations...
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

    // For demonstration purposes, let's just push some dummy values
    epsilon_sh_values.push(epsilonSH);
    epsilon_au_values.push(epsilonAU);
    J_values.push(J);
  });

  // Plot the scatter plot
  var scatterData = [
    {
      x: t_values.map(t => t - tPrime),
      y: epsilon_sh_values,
      mode: 'markers',
      type: 'scatter',
      name: 'epsilon_sh'
    },
    {
      x: t_values.map(t => t - tPrime),
      y: epsilon_au_values,
      mode: 'markers',
      type: 'scatter',
      name: 'epsilon_au'
    },
    {
      x: t_values.map(t => t - tPrime),
      y: J_values,
      mode: 'markers',
      type: 'scatter',
      name: 'J'
    }
  ];

  var layout = {
    title: 'Concrete Properties vs t-tPrime',
    xaxis: {
      title: 't - tPrime',
      type: 'log'
    },
    yaxis: {
      title: 'Value'
    }
  };


  // 检查图表是否已初始化
  var existingPlot = document.getElementById('chart');
    if (existingPlot.data && existingPlot.data.length > 0) {
        // 图表已初始化，使用 Plotly.react 更新数据
        Plotly.react('chart', scatterData, layout);
    } else {
        // 图表未初始化，使用 Plotly.newPlot 创建新图表
        Plotly.newPlot('chart', scatterData, layout);
    }
}


function exportToExcel() {
  // Check if values are available
  if (t_values.length === 0 || epsilon_sh_values.length === 0 || epsilon_au_values.length === 0 || J_values.length === 0) {
    alert("Please calculate first before exporting to Excel.");
    return;
  }

  // Build data for Excel
  var data = [
    ['t-tPrime', 'epsilon_sh', 'epsilon_au', 'J']
  ];

  for (var i = 0; i < t_values.length; i++) {
    var rowData = [
      t_values[i] - parseFloat(document.getElementById("tPrime").value),
      epsilon_sh_values[i],
      epsilon_au_values[i],
      J_values[i]
    ];
    data.push(rowData);
  }

  // Create Excel workbook and sheet
  var ws = XLSX.utils.aoa_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Concrete Data');

  // Export Excel file
  XLSX.writeFile(wb, 'concrete_calculations.xlsx');
}