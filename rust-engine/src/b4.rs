use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::B4Result;

#[derive(Serialize, Deserialize)]
pub struct B4Params {
    pub t0: f64,
    pub t_prime: f64,
    pub t_temp: f64,
    pub h: f64,
    pub fc: f64,
    pub v_s: f64,
    pub c: f64,
    pub w_c: f64,
    pub a_c: f64,
    pub cement_type: String,
    pub aggregate_type: String,
    pub specimen_shape: String,
}

// 水泥参数结构
#[derive(Clone)]
struct CementParams {
    tau_cem: f64,
    epsilon_cem: f64,
    tau_au_cem: f64,
    epsilon_au_cem: f64,
    p1: f64,
    p2: f64,
    p3: f64,
    p4: f64,
    p5: f64,
    p5h: f64,
    p2w: f64,
    p3a: f64,
    p3w: f64,
    p4a: f64,
    p4w: f64,
    p5a: f64,
    p5w: f64,
    p5_epsilon: f64,
    r_epsilon_a: f64,
    r_epsilon_w: f64,
    r_tau_w: f64,
    r_alpha: f64,
    r_t: f64,
    p_tau_a: f64,
    p_tau_w: f64,
    p_tau_c: f64,
    p_epsilon_a: f64,
    p_epsilon_w: f64,
    p_epsilon_c: f64,
}

// 骨料参数结构
#[derive(Clone)]
struct AggregateParams {
    ks_tau_a: f64,
    ks_epsilon_a: f64,
}

// 形状参数结构
#[derive(Clone)]
struct ShapeParams {
    ks: f64,
}

// 获取水泥参数
fn get_cement_params(cement_type: &str) -> CementParams {
    match cement_type {
        "R" => CementParams {
            tau_cem: 0.016, epsilon_cem: 360e-6, tau_au_cem: 1.0, epsilon_au_cem: 210e-6,
            p1: 0.70, p2: 58.6e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 777e-6, p5h: 8.00,
            p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1.0, p5w: 0.78,
            p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3.0,
            r_alpha: 1.0, r_t: -4.5, p_tau_a: -0.33, p_tau_w: -0.06, p_tau_c: -0.1,
            p_epsilon_a: -0.8, p_epsilon_w: 1.1, p_epsilon_c: 0.11
        },
        "RS" => CementParams {
            tau_cem: 0.08, epsilon_cem: 860e-6, tau_au_cem: 41.0, epsilon_au_cem: -84.0e-6,
            p1: 0.60, p2: 17.4e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 94.6e-6, p5h: 1.00,
            p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1.0, p5w: 0.78,
            p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3.0,
            r_alpha: 1.4, r_t: -4.5, p_tau_a: -0.33, p_tau_w: -2.4, p_tau_c: -2.7,
            p_epsilon_a: -0.8, p_epsilon_w: -0.27, p_epsilon_c: 0.11
        },
        "SL" => CementParams {
            tau_cem: 0.01, epsilon_cem: 410e-6, tau_au_cem: 1.0, epsilon_au_cem: 0.0,
            p1: 0.8, p2: 40.5e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 496e-6, p5h: 8.00,
            p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1.0, p5w: 0.78,
            p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3.0,
            r_alpha: 1.0, r_t: -4.5, p_tau_a: -0.33, p_tau_w: 3.55, p_tau_c: 3.8,
            p_epsilon_a: -0.8, p_epsilon_w: 1.0, p_epsilon_c: 0.11
        },
        _ => get_cement_params("R") // 默认使用 R 型
    }
}

// 获取骨料参数
fn get_aggregate_params(aggregate_type: &str) -> AggregateParams {
    match aggregate_type {
        "辉绿岩" | "Dolerite" => AggregateParams { ks_tau_a: 0.06, ks_epsilon_a: 0.76 },
        "石英岩" | "Quartz" => AggregateParams { ks_tau_a: 0.59, ks_epsilon_a: 0.71 },
        "石灰岩" | "Limestone" => AggregateParams { ks_tau_a: 1.80, ks_epsilon_a: 0.95 },
        "砂岩" | "Sandstone" => AggregateParams { ks_tau_a: 2.30, ks_epsilon_a: 1.60 },
        "花岗岩" | "Granite" => AggregateParams { ks_tau_a: 4.00, ks_epsilon_a: 1.05 },
        "石英闪长岩" | "Quartz Diorite" => AggregateParams { ks_tau_a: 15.0, ks_epsilon_a: 2.20 },
        "无信息" | "No Information" => AggregateParams { ks_tau_a: 1.00, ks_epsilon_a: 1.00 },
        _ => AggregateParams { ks_tau_a: 1.00, ks_epsilon_a: 1.00 }
    }
}

// 获取形状参数
fn get_shape_params(specimen_shape: &str) -> ShapeParams {
    match specimen_shape {
        "无限平板" | "infinite slab" => ShapeParams { ks: 1.00 },
        "无限圆柱体" | "infinite cylinder" => ShapeParams { ks: 1.15 },
        "无限方柱体" | "infinite square prism" => ShapeParams { ks: 1.25 },
        "球体" | "sphere" => ShapeParams { ks: 1.30 },
        "立方体" | "cube" => ShapeParams { ks: 1.55 },
        _ => ShapeParams { ks: 1.15 } // 默认圆柱体
    }
}

/// B4模型单点计算（完整版本）
#[wasm_bindgen]
pub fn calculate_b4_single(params: &JsValue, t: f64) -> Result<JsValue, JsValue> {
    let params: B4Params = serde_wasm_bindgen::from_value(params.clone())?;

    // 参数验证
    if params.fc <= 0.0 || params.t0 <= 0.0 || params.v_s <= 0.0 ||
       params.w_c <= 0.0 || params.a_c <= 0.0 || params.c <= 0.0 {
        return Ok(serde_wasm_bindgen::to_value(&B4Result {
            t,
            j: f64::NAN,
            epsilon_sh: f64::NAN,
            epsilon_au: f64::NAN,
        })?);
    }

    // 基本参数
    let d = 2.0 * params.v_s;
    let e28 = (4734.0 * params.fc.sqrt()) / 1000.0;
    let beta_th = (4000.0 * (1.0/293.0 - 1.0/(params.t_temp + 273.0))).exp();
    let beta_ts = beta_th;
    let beta_tc = beta_th;

    let t0_tilde = params.t0 * beta_th;
    let t_prime_hat = params.t0 * beta_th + (params.t_prime - params.t0) * beta_ts;

    // 获取材料参数
    let cement = get_cement_params(&params.cement_type);
    let aggregate = get_aggregate_params(&params.aggregate_type);
    let shape = get_shape_params(&params.specimen_shape);

    // 计算基本参数
    let tau0 = cement.tau_cem * (params.a_c / 6.0).powf(cement.p_tau_a) *
               (params.w_c / 0.38).powf(cement.p_tau_w) *
               ((6.5 * params.c) / 2350.0).powf(cement.p_tau_c);
    let tau_sh = tau0 * aggregate.ks_tau_a * (shape.ks * d).powi(2);

    let epsilon0 = cement.epsilon_cem * (params.a_c / 6.0).powf(cement.p_epsilon_a) *
                   (params.w_c / 0.38).powf(cement.p_epsilon_w) *
                   ((6.5 * params.c) / 2350.0).powf(cement.p_epsilon_c);

    let e1 = e28 * ((7.0 * beta_th + 600.0 * beta_ts) /
                    (4.0 + (6.0/7.0) * (7.0 * beta_th + 600.0 * beta_ts))).sqrt();
    let e2 = e28 * ((t0_tilde + tau_sh * beta_ts) /
                    (4.0 + (6.0/7.0) * (t0_tilde + tau_sh * beta_ts))).sqrt();
    let epsilon_sh_inf = -epsilon0 * aggregate.ks_epsilon_a * (e1 / e2);

    // 湿度修正
    let h_decimal = params.h / 100.0;
    let kh = if h_decimal <= 0.98 {
        1.0 - h_decimal.powi(3)
    } else {
        12.94 * (1.0 - h_decimal) - 0.2
    };

    // 检查时间条件
    if t <= params.t_prime {
        return Ok(serde_wasm_bindgen::to_value(&B4Result {
            t,
            j: f64::NAN,
            epsilon_sh: f64::NAN,
            epsilon_au: f64::NAN,
        })?);
    }

    // 时间计算
    let t_tilde = (t - params.t0) * beta_ts;
    let t_hat = t_prime_hat + (t - params.t_prime) * beta_tc;

    // 收缩应变
    let s = (t_tilde / tau_sh).sqrt().tanh();
    let epsilon_sh = epsilon_sh_inf * kh * s;

    // 徐变函数计算
    let q1 = cement.p1 / (e28 * 1000.0);
    let q2 = (cement.p2 * (params.w_c / 0.38).powf(cement.p2w)) / 1000.0;
    let q3 = cement.p3 * q2 * (params.a_c / 6.0).powf(cement.p3a) *
             (params.w_c / 0.38).powf(cement.p3w);
    let q4 = (cement.p4 * (params.a_c / 6.0).powf(cement.p4a) *
              (params.w_c / 0.38).powf(cement.p4w)) / 1000.0;

    let r_hat = 1.7 * t_prime_hat.powf(0.12) + 8.0;
    let z = t_prime_hat.powf(-0.5) * (1.0 + (t_hat - t_prime_hat).powf(0.1)).ln();
    let qf = 1.0 / (0.086 * t_prime_hat.powf(2.0/9.0) + 1.21 * t_prime_hat.powf(4.0/9.0));
    let q = qf * (1.0 + (qf / z).powf(r_hat)).powf(-1.0/r_hat);
    let c0 = q2 * q + q3 * (1.0 + (t_hat - t_prime_hat).powf(0.1)).ln() +
             q4 * (t_hat / t_prime_hat).ln();

    let rt = (4000.0 * (1.0/293.0 - 1.0/(params.t_temp + 273.0))).exp();
    let q5 = (cement.p5 * (params.a_c / 6.0).powf(cement.p5a) *
              (params.w_c / 0.38).powf(cement.p5w) *
              (kh * epsilon_sh_inf).abs().powf(cement.p5_epsilon)) / 1000.0;

    let h_val = 1.0 - (1.0 - h_decimal) * ((t_hat - t0_tilde) / tau_sh).sqrt().tanh();
    let t0_prime = t_prime_hat.max(t0_tilde);
    let hc = 1.0 - (1.0 - h_decimal) * ((t0_prime - t0_tilde) / tau_sh).sqrt().tanh();
    let cd = if t_hat >= t0_prime {
        q5 * ((-cement.p5h * h_val).exp() - (-cement.p5h * hc).exp()).sqrt()
    } else {
        0.0
    };

    let j = q1 + rt * c0 + cd;

    // 自生收缩
    let epsilon_au_infinity = -cement.epsilon_au_cem * (params.a_c / 6.0).powf(cement.r_epsilon_a) *
                              (params.w_c / 0.38).powf(cement.r_epsilon_w);
    let tau_au = cement.tau_au_cem * (params.w_c / 0.38).powf(cement.r_tau_w);
    let alpha = cement.r_alpha * (params.w_c / 0.38);
    let epsilon_au = epsilon_au_infinity *
                     (1.0 + (tau_au / (t_tilde + t0_tilde)).powf(alpha)).powf(cement.r_t);

    let result = B4Result {
        t,
        j,
        epsilon_sh,
        epsilon_au,
    };

    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}



/// B4模型时间序列计算
#[wasm_bindgen]
pub fn calculate_b4_series(params: &JsValue, max_time: usize) -> Result<JsValue, JsValue> {
    let params: B4Params = serde_wasm_bindgen::from_value(params.clone())?;

    let mut results = Vec::with_capacity(max_time + 1);

    // 从 t_prime + 1 开始计算，与原始实现保持一致
    let start_day = (params.t_prime as usize) + 1;

    for t in start_day..=(start_day + max_time - 1) {
        let t_f = t as f64;
        let result_js = calculate_b4_single(&serde_wasm_bindgen::to_value(&params)?, t_f)?;
        let result: B4Result = serde_wasm_bindgen::from_value(result_js)?;

        // 调整时间为相对于 t_prime 的时间
        let adjusted_result = B4Result {
            t: t_f - params.t_prime,
            j: result.j,
            epsilon_sh: result.epsilon_sh,
            epsilon_au: result.epsilon_au,
        };

        results.push(adjusted_result);
    }

    serde_wasm_bindgen::to_value(&results).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// B4模型内部计算函数
pub fn calculate_b4_single_internal(params: &B4Params, t: f64) -> B4Result {
    match calculate_b4_single(&serde_wasm_bindgen::to_value(params).unwrap(), t) {
        Ok(result_js) => serde_wasm_bindgen::from_value(result_js).unwrap_or(B4Result {
            t,
            j: f64::NAN,
            epsilon_sh: f64::NAN,
            epsilon_au: f64::NAN,
        }),
        Err(_) => B4Result {
            t,
            j: f64::NAN,
            epsilon_sh: f64::NAN,
            epsilon_au: f64::NAN,
        }
    }
}
