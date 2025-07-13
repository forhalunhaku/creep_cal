use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::{B4Result, B4sResult};

#[derive(Serialize, Deserialize)]
pub struct B4sParams {
    pub t0: f64,
    pub t_prime: f64,
    pub t_temp: f64,
    pub h: f64,
    pub fc: f64,
    pub v_s: f64,
    pub cement_type: String,
    pub aggregate_type: String,
    pub specimen_shape: String,
}

// B4S 水泥参数结构
#[derive(Clone)]
struct B4sCementParams {
    tau_au_cem: f64,
    r_tau_f: f64,
    epsilon_au_cem: f64,
    r_epsilon_f: f64,
    tau_s_cem: f64,
    s_tau_f: f64,
    epsilon_s_cem: f64,
    s_epsilon_f: f64,
    p1: f64,
    p5_epsilon: f64,
    p5h: f64,
    s2: f64,
    s3: f64,
    s4: f64,
    s5: f64,
    s2f: f64,
    s3f: f64,
    s4f: f64,
    s5f: f64,
}

// B4S 骨料参数结构
#[derive(Clone)]
struct B4sAggregateParams {
    ks_tau_a: f64,
    ks_epsilon_a: f64,
}

// B4S 形状参数结构
#[derive(Clone)]
struct B4sShapeParams {
    ks: f64,
}

// 获取 B4S 水泥参数
fn get_b4s_cement_params(cement_type: &str) -> B4sCementParams {
    match cement_type {
        "R" => B4sCementParams {
            tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03,
            tau_s_cem: 0.027, s_tau_f: 0.21, epsilon_s_cem: 590e-6, s_epsilon_f: -0.51,
            p1: 0.70, p5_epsilon: -0.85, p5h: 8.0,
            s2: 14.2e-3, s3: 0.976, s4: 4.00e-3, s5: 1.54e-3,
            s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45
        },
        "RS" => B4sCementParams {
            tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03,
            tau_s_cem: 0.027, s_tau_f: 1.55, epsilon_s_cem: 830e-6, s_epsilon_f: -0.84,
            p1: 0.60, p5_epsilon: -0.85, p5h: 1.0,
            s2: 29.9e-3, s3: 0.976, s4: 4.00e-3, s5: 41.8e-3,
            s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45
        },
        "SL" => B4sCementParams {
            tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03,
            tau_s_cem: 0.032, s_tau_f: -1.84, epsilon_s_cem: 640e-6, s_epsilon_f: -0.69,
            p1: 0.80, p5_epsilon: -0.85, p5h: 8.0,
            s2: 11.2e-3, s3: 0.976, s4: 4.00e-3, s5: 150e-3,
            s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45
        },
        _ => get_b4s_cement_params("R") // 默认使用 R 型
    }
}

// 获取 B4S 骨料参数
fn get_b4s_aggregate_params(aggregate_type: &str) -> B4sAggregateParams {
    match aggregate_type {
        "Diabase" => B4sAggregateParams { ks_tau_a: 0.06, ks_epsilon_a: 0.76 },
        "Quartzite" => B4sAggregateParams { ks_tau_a: 0.59, ks_epsilon_a: 0.71 },
        "Limestone" => B4sAggregateParams { ks_tau_a: 1.80, ks_epsilon_a: 0.95 },
        "Sandstone" => B4sAggregateParams { ks_tau_a: 2.30, ks_epsilon_a: 1.60 },
        "Granite" => B4sAggregateParams { ks_tau_a: 4.00, ks_epsilon_a: 1.05 },
        "Quartz Diorite" => B4sAggregateParams { ks_tau_a: 15.0, ks_epsilon_a: 2.20 },
        "No Information" => B4sAggregateParams { ks_tau_a: 1.00, ks_epsilon_a: 1.00 },
        _ => B4sAggregateParams { ks_tau_a: 1.00, ks_epsilon_a: 1.00 }
    }
}

// 获取 B4S 形状参数
fn get_b4s_shape_params(specimen_shape: &str) -> B4sShapeParams {
    match specimen_shape {
        "1" => B4sShapeParams { ks: 1.00 },
        "2" => B4sShapeParams { ks: 1.15 },
        "3" => B4sShapeParams { ks: 1.25 },
        "4" => B4sShapeParams { ks: 1.30 },
        "5" => B4sShapeParams { ks: 1.55 },
        _ => B4sShapeParams { ks: 1.15 } // 默认圆柱体
    }
}

/// B4S模型单点计算（完整版本）
#[wasm_bindgen]
pub fn calculate_b4s_single(params: &JsValue, t: f64) -> Result<JsValue, JsValue> {
    let params: B4sParams = serde_wasm_bindgen::from_value(params.clone())?;
    
    // 基本参数
    let h_val = if params.h > 1.0 { params.h / 100.0 } else { params.h };
    let e28 = (4734.0 * params.fc.sqrt()) / 1000.0;
    let beta_th = (4000.0 * (1.0/293.0 - 1.0/(params.t_temp + 273.0))).exp();
    let beta_ts = beta_th;
    let beta_tc = beta_th;
    
    let t0_tilde = params.t0 * beta_th;
    let d = 2.0 * params.v_s;
    
    // 获取材料参数
    let cement = get_b4s_cement_params(&params.cement_type);
    let aggregate = get_b4s_aggregate_params(&params.aggregate_type);
    let shape = get_b4s_shape_params(&params.specimen_shape);

    // 计算tau和epsilon参数
    let tau0 = cement.tau_s_cem * (params.fc / 40.0).powf(cement.s_tau_f);
    let tau_sh = tau0 * aggregate.ks_tau_a * (shape.ks * d).powi(2);

    let epsilon0 = cement.epsilon_s_cem * (params.fc / 40.0).powf(cement.s_epsilon_f);
    let e1 = e28 * ((7.0 * beta_th + 600.0 * beta_ts) /
                    (4.0 + (6.0/7.0) * (7.0 * beta_th + 600.0 * beta_ts))).sqrt();
    let e2 = e28 * ((t0_tilde + tau_sh * beta_ts) /
                    (4.0 + (6.0/7.0) * (t0_tilde + tau_sh * beta_ts))).sqrt();
    let epsilon_sh_inf = -epsilon0 * aggregate.ks_epsilon_a * (e1 / e2);
    
    // 湿度修正
    let kh = if params.h <= 98.0 {
        1.0 - (params.h / 100.0).powi(3)
    } else {
        12.94 * (1.0 - params.h / 100.0) - 0.2
    };
    
    // 时间计算
    let t_tilde = (t - params.t0) * beta_ts;
    let t_prime_hat = t0_tilde + (params.t_prime - params.t0) * beta_ts;
    let t_hat = t_prime_hat + (t - params.t_prime) * beta_tc;
    
    if t <= params.t_prime {
        return Ok(serde_wasm_bindgen::to_value(&B4sResult {
            t,
            j: f64::NAN,
            epsilon_sh: f64::NAN,
            epsilon_au: f64::NAN,
        })?);
    }
    
    // 收缩应变
    let s = (t_tilde / tau_sh).sqrt().tanh();
    let epsilon_sh = epsilon_sh_inf * kh * s;
    
    // 自生收缩
    let epsilon_au_inf = -cement.epsilon_au_cem * (params.fc / 40.0).powf(cement.r_epsilon_f);
    let tau_au = cement.tau_au_cem * (params.fc / 40.0).powf(cement.r_tau_f);
    let alpha_s = 1.73;
    let r_t = -1.73;
    let epsilon_au = epsilon_au_inf * (1.0 + (tau_au / (t_tilde + t0_tilde)).powf(alpha_s)).powf(r_t);
    
    // 徐变函数计算（完整版本）
    let q1 = cement.p1 / (e28 * 1000.0);
    let q2 = cement.s2 * (params.fc / 40.0).powf(cement.s2f) / 1000.0;
    let q3 = cement.s3 * q2 * (params.fc / 40.0).powf(cement.s3f);
    let q4 = cement.s4 * (params.fc / 40.0).powf(cement.s4f) / 1000.0;

    let r_hat = 1.7 * t_prime_hat.powf(0.12) + 8.0;
    let z = t_prime_hat.powf(-0.5) * (1.0 + (t_hat - t_prime_hat).powf(0.1)).ln();
    let qf = 1.0 / (0.086 * t_prime_hat.powf(2.0/9.0) + 1.21 * t_prime_hat.powf(4.0/9.0));
    let q = qf * (1.0 + (qf / z).powf(r_hat)).powf(-1.0/r_hat);
    let c0 = q2 * q + q3 * (1.0 + (t_hat - t_prime_hat).powf(0.1)).ln() +
             q4 * (t_hat / t_prime_hat).ln();

    let rt = (4000.0 * (1.0/293.0 - 1.0/(params.t_temp + 273.0))).exp();
    let q5 = cement.s5 * (params.fc / 40.0).powf(cement.s5f) *
             (kh * epsilon_sh_inf).abs().powf(cement.p5_epsilon) / 1000.0;

    let h_val_calc = 1.0 - (1.0 - params.h / 100.0) * ((t_hat - t0_tilde) / tau_sh).sqrt().tanh();
    let t_prime0 = t_prime_hat.max(t0_tilde);
    let hc = 1.0 - (1.0 - params.h / 100.0) * ((t_prime0 - t0_tilde) / tau_sh).sqrt().tanh();
    let cd = if t_hat >= t_prime0 {
        q5 * ((-cement.p5h * h_val_calc).exp() - (-cement.p5h * hc).exp()).sqrt()
    } else {
        0.0
    };

    let j = q1 + rt * c0 + cd;
    
    let result = B4sResult {
        t,
        j,
        epsilon_sh,
        epsilon_au,
    };
    
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// B4S模型时间序列计算
#[wasm_bindgen]
pub fn calculate_b4s_series(params: &JsValue, days: usize) -> Result<JsValue, JsValue> {
    let params: B4sParams = serde_wasm_bindgen::from_value(params.clone())?;

    let mut results = Vec::new();

    for day in 0..days {
        let t = params.t_prime + (day + 1) as f64;
        match calculate_b4s_single(&serde_wasm_bindgen::to_value(&params)?, t) {
            Ok(result_js) => {
                let result: B4sResult = serde_wasm_bindgen::from_value(result_js)?;
                results.push(result);
            }
            Err(_) => {
                results.push(B4sResult {
                    t,
                    j: f64::NAN,
                    epsilon_sh: f64::NAN,
                    epsilon_au: f64::NAN,
                });
            }
        }
    }

    serde_wasm_bindgen::to_value(&results).map_err(|e| JsValue::from_str(&e.to_string()))
}




