use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::{Mc2010Params, TimeSeriesPoint};

// 水泥类型映射
fn get_cement_alpha(cement_type: &str) -> i32 {
    match cement_type {
        "32.5N" => -1,
        "32.5R" => 0,
        "42.5N" => 0,
        "42.5R" => 1,
        "52.5N" => 1,
        "52.5R" => 1,
        _ => 0,
    }
}

/// MC2010模型单点计算 - 接受实际时间 t，内部计算 t_diff
#[wasm_bindgen]
pub fn calculate_mc2010_single(params: &JsValue, t: f64) -> Result<f64, JsValue> {
    let params: Mc2010Params = serde_wasm_bindgen::from_value(params.clone())?;

    let alpha = get_cement_alpha(&params.cement_type) as f64;
    let t0_t = params.t0 * (13.65 - 4000.0 / (273.0 + params.t)).exp();
    let t0_adj = t0_t * ((9.0 / (2.0 + t0_t.powf(1.2))) + 1.0).powf(alpha);

    let h = (2.0 * params.ac) / params.u; // mm
    let alpha_fcm = (35.0 / params.fcm).sqrt();
    let beta_h = (1.5 * h + 250.0 * alpha_fcm).min(1500.0 * alpha_fcm);

    let t_diff = t - params.t0;
    if t_diff < 0.0 {
        return Ok(f64::NAN);
    }

    let phi = calculate_phi_mc2010(
        params.fcm, params.rh, params.t0, params.ac, params.u,
        params.t, &params.cement_type, t0_adj, h, alpha_fcm, beta_h, t_diff
    );

    Ok(phi)
}

/// MC2010模型时间序列计算
#[wasm_bindgen]
pub fn calculate_mc2010_series(params: &JsValue, max_time: usize) -> Result<JsValue, JsValue> {
    let params: Mc2010Params = serde_wasm_bindgen::from_value(params.clone())?;

    let alpha = get_cement_alpha(&params.cement_type) as f64;
    let t0_t = params.t0 * (13.65 - 4000.0 / (273.0 + params.t)).exp();
    let t0_adj = t0_t * ((9.0 / (2.0 + t0_t.powf(1.2))) + 1.0).powf(alpha);

    let h = (2.0 * params.ac) / params.u;
    let alpha_fcm = (35.0 / params.fcm).sqrt();
    let beta_h = (1.5 * h + 250.0 * alpha_fcm).min(1500.0 * alpha_fcm);

    let mut results = Vec::with_capacity(max_time + 1);

    for t in 0..=max_time {
        let t_f = t as f64;
        // 对于时间序列，t_diff 就是 t（从0开始）
        let t_diff = t_f;

        let phi = if t_diff <= 0.0 {
            0.0
        } else {
            calculate_phi_mc2010(
                params.fcm, params.rh, params.t0, params.ac, params.u,
                params.t, &params.cement_type, t0_adj, h, alpha_fcm, beta_h, t_diff
            )
        };

        results.push(TimeSeriesPoint { t: t_f, phi });
    }

    serde_wasm_bindgen::to_value(&results).map_err(|e| JsValue::from_str(&e.to_string()))
}

// MC2010核心计算函数 - 完全按照原始实现
fn calculate_phi_mc2010(
    fcm: f64, rh: f64, _t0: f64, _ac: f64, _u: f64, _t: f64,
    _cement_type: &str, t0_adj: f64, h: f64, _alpha_fcm: f64, beta_h: f64, t_diff: f64
) -> f64 {
    // 基本徐变
    let beta_bc_fcm = 1.8 / fcm.powf(0.7);
    let beta_bc_t_t0 = (((30.0 / t0_adj) + 0.035).powi(2) * t_diff + 1.0).ln();
    let phi_bc = beta_bc_fcm * beta_bc_t_t0;

    // 干燥徐变
    let beta_dc_fcm = 412.0 / fcm.powf(1.4);
    let beta_dc_rh = (1.0 - rh / 100.0) / (0.1 * (h / 100.0)).powf(1.0 / 3.0); // h/100, 单位cm
    let beta_dc_t0 = 1.0 / (0.1 + t0_adj.powf(0.2));
    let gamma_t0 = 1.0 / (2.3 + 3.5 / t0_adj.sqrt());
    let beta_dc_t_t0 = (t_diff / (beta_h + t_diff)).powf(gamma_t0);
    let phi_dc = beta_dc_fcm * beta_dc_rh * beta_dc_t0 * beta_dc_t_t0;

    phi_bc + phi_dc
}

/// MC2010模型批量计算
#[wasm_bindgen]
pub fn calculate_mc2010_batch(batch_data: &JsValue) -> Result<JsValue, JsValue> {
    #[derive(Deserialize, Serialize)]
    struct BatchItem {
        fcm: f64,
        #[serde(rename = "RH")]
        rh: f64,
        t0: f64,
        #[serde(rename = "Ac")]
        ac: f64,
        u: f64,
        #[serde(rename = "T")]
        t_temp: f64,
        #[serde(rename = "Cs")]
        cement_type: String,
        t: f64,
    }
    
    #[derive(Serialize)]
    struct BatchResult {
        phi: f64,
        #[serde(flatten)]
        original: serde_json::Value,
    }
    
    let batch: Vec<BatchItem> = serde_wasm_bindgen::from_value(batch_data.clone())?;
    
    let results: Vec<BatchResult> = batch
        .into_iter()
        .map(|item| {
            let params = Mc2010Params {
                fcm: item.fcm,
                rh: item.rh,
                t0: item.t0,
                ac: item.ac,
                u: item.u,
                t: item.t_temp,
                cement_type: item.cement_type.clone(),
            };

            let phi = calculate_mc2010_single_internal(&params, item.t);

            BatchResult {
                phi,
                original: serde_json::to_value(&item).unwrap_or_default(),
            }
        })
        .collect();
    
    serde_wasm_bindgen::to_value(&results).map_err(|e| JsValue::from_str(&e.to_string()))
}

// 内部计算函数 - 接受实际时间 t
pub fn calculate_mc2010_single_internal(params: &Mc2010Params, t: f64) -> f64 {
    let alpha = get_cement_alpha(&params.cement_type) as f64;
    let t0_t = params.t0 * (13.65 - 4000.0 / (273.0 + params.t)).exp();
    let t0_adj = t0_t * ((9.0 / (2.0 + t0_t.powf(1.2))) + 1.0).powf(alpha);

    let h = (2.0 * params.ac) / params.u;
    let alpha_fcm = (35.0 / params.fcm).sqrt();
    let beta_h = (1.5 * h + 250.0 * alpha_fcm).min(1500.0 * alpha_fcm);

    let t_diff = t - params.t0;
    if t_diff < 0.0 {
        return f64::NAN;
    }

    calculate_phi_mc2010(
        params.fcm, params.rh, params.t0, params.ac, params.u,
        params.t, &params.cement_type, t0_adj, h, alpha_fcm, beta_h, t_diff
    )
}
