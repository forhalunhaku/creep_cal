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
  const numPoints = 1000;
  t_values = Array.from({ length: numPoints }, (_, i) => {
      return tPrime + Math.exp(Math.log(1) + (Math.log(100000) - Math.log(1)) * i / numPoints);
  });

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

 // 创建图表数据
 const data = [
  {
      x: t_values.map(t => t - tPrime),
      y: epsilon_sh_values,
      type: 'scatter',
      mode: 'lines',
      name: '收缩应变',
      line: {
          color: '#4ADE80',
          width: 2.5,
          shape: 'spline'
      }
  },
  {
      x: t_values.map(t => t - tPrime),
      y: epsilon_au_values,
      type: 'scatter',
      mode: 'lines',
      name: '自生收缩应变',
      line: {
          color: '#60A5FA',
          width: 2.5,
          shape: 'spline'
      }
  },
  {
      x: t_values.map(t => t - tPrime),
      y: J_values,
      type: 'scatter',
      mode: 'lines',
      name: '徐变应变',
      line: {
          color: '#F472B6',
          width: 2.5,
          shape: 'spline'
      }
  }
];

const layout = {
  title: {
      text: 'B4S模型计算结果',
      font: {
          size: 18,
          color: '#333333'
      },
      y: 0.95
  },
  paper_bgcolor: 'rgba(255,255,255,0.98)',
  plot_bgcolor: 'rgba(255,255,255,0.98)',
  xaxis: {
      title: 't - t\' (天)',
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
      title: '数值',
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
  showlegend: true,
  legend: {
      x: 1,
      xanchor: 'right',
      y: 1,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: 'rgba(200,200,200,0.5)',
      borderwidth: 1
  },
  hovermode: 'closest',
  hoverlabel: {
      bgcolor: '#FFF',
      bordercolor: '#4ADE80',
      font: {
          size: 13,
          color: '#333333'
      }
  }
};

const config = {
  responsive: true,
  displayModeBar: false,
  staticPlot: false,
  toImageButtonOptions: {
      format: 'png',
      filename: 'B4S模型计算结果',
      height: 800,
      width: 1200,
      scale: 2
  }
};

// 创建或更新图表
Plotly.newPlot('chart', data, layout, config);
}
// 添加窗口大小改变时的自动调整
window.addEventListener('resize', function() {
Plotly.Plots.resize('chart');
});

// 修改导出函数，改为CSV格式
function exportToExcel() {
try {
    let csvContent = "data:text/csv;charset=utf-8," + 
        "t-tPrime,epsilon_sh,epsilon_au,J\n";
    
    t_values.forEach((t, index) => {
        let row = [
            t - document.getElementById("tPrime").value,
            epsilon_sh_values[index],
            epsilon_au_values[index],
            J_values[index]
        ].join(",") + "\n";
        csvContent += row;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "b4s_calculation_results.csv");
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