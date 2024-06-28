// Global variables to store calculated values
var t_values = [];
var epsilon_sh_values = [];
var epsilon_au_values = [];
var J_values = [];

function calculate() {
  var cementType = document.getElementById("cementType").value;
  var tPrime = parseFloat(document.getElementById("tPrime").value);
  var t0 = parseFloat(document.getElementById("t0").value);
  var T = parseFloat(document.getElementById("T").value);
  var h = parseFloat(document.getElementById("h").value);
  var fc = parseFloat(document.getElementById("fc").value);
  var vS = parseFloat(document.getElementById("vS").value);
  var c = parseFloat(document.getElementById("c").value);
  var wC = parseFloat(document.getElementById("wC").value);
  var aC = parseFloat(document.getElementById("aC").value);
  var aggregateType = document.getElementById("aggregateType").value;
  var specimenShape = document.getElementById("specimenShape").value;
  
  // Constants based on cement type, aggregate type, and specimen shape...
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
    var tau0 = tau_cem * Math.pow(aC / 6, p_tau_a) * Math.pow(wC / 0.38, p_tau_w) * Math.pow((6.5 * c) / 2350, p_tau_c);
    var tauSH = tau0 * ks_tau_a * Math.pow(ks * D, 2);
    var epsilon0 = epsilon_cem * Math.pow(aC  / 6, p_epsilon_a) * Math.pow(wC / 0.38, p_epsilon_w) * Math.pow((6.5 * c) / 2350, p_epsilon_c);
    var betaTh = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    var t0Tilde = t0 * betaTh;
    var betaTs = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    var E1 = E28 * Math.sqrt((7*betaTh + 600*betaTs) / (4+(6/7)*(7*betaTh + 600*betaTs))) ;
    var E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4+(6/7)*(t0Tilde + tauSH * betaTs)))  ;
    var epsilonSHInfinity = - epsilon0 * ks_epsilon_a * (E1/E2)
    var tTilde = (t - t0) * betaTs;
    var tPrimeHat = t0 * betaTh + (tPrime - t0) * betaTs;
    var betaTc = Math.exp(4000 * (1 / 293 - 1 / (T + 273)));
    var tHat = tPrimeHat + (t - tPrime) * betaTc;
    var S = Math.tanh(Math.sqrt(tTilde / tauSH));
    var kh = h <= 0.98 ? 1 - Math.pow(h, 3) : 12.94 * (1 - h) - 0.2;
    var epsilonSH = epsilonSHInfinity * kh * S;

    var epsilonAUInfinity = -epsilon_au_cem * Math.pow(aC / 6, r_epsilon_a) * Math.pow(wC / 0.38, r_epsilon_w);
    var tauAU = tau_au_cem * Math.pow(wC / 0.38, r_tau_w);
    var alpha = r_alpha * (wC / 0.38);
    var epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha), r_t);

    var q1 = p1 / E28 / 1000;
    var q2 = p2  * Math.pow(wC / 0.38, p2w)  /1000 ;
    var q3 = p3 * q2 * Math.pow(aC / 6, p3a) * Math.pow(wC / 0.38, p3w);
    var q4 = p4 * Math.pow(aC / 6, p4a) * Math.pow(wC / 0.38, p4w) / 1000;
    var rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
    var Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
    var Qf = Math.pow((0.086 * Math.pow(tPrimeHat, 2 / 9) + 1.21 * Math.pow(tPrimeHat, 4 / 9)), -1);
    var Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1 / rHat);
    var C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
    var q5 = p5 / 1000 * Math.pow(aC / 6, p5a) * Math.pow(wC / 0.38, p5w) * (Math.abs(kh * epsilonSHInfinity) ** p5_epsilon);
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
    title: 'b4计算结果',
    xaxis: {
      title: 't - tPrime',
      type: 'log'
    },
    yaxis: {
      title: 'Value'
    },
    width: 600, // 或根据您的需求调整
    height: 400, // 或根据您的需求调整
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