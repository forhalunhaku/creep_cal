use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::{Aci209Params, TimeSeriesPoint};

/// ACI209模型单点计算
#[wasm_bindgen]
pub fn calculate_aci209_single(params: &JsValue, t: f64) -> Result<f64, JsValue> {
    let params: Aci209Params = serde_wasm_bindgen::from_value(params.clone())?;
    
    // 计算修正系数
    let beta_t0 = 1.25 * params.t0.powf(-0.118);
    let beta_rh = 1.27 - 0.0067 * params.h;
    let beta_vs = (2.0 * (1.0 + 1.13 * (-0.0213 * params.vs).exp())) / 3.0;
    let beta_s_phi = 0.88 + 0.244 * params.s_phi;
    let beta_cc = 0.75 + 0.00061 * params.cc;
    let beta_alpha = 0.46 + 9.0 * params.alpha;
    
    // 计算最终徐变系数
    let phi_infinity = 2.35 * beta_t0 * beta_rh * beta_vs * beta_s_phi * beta_cc * beta_alpha;
    
    // 时间函数 - 使用 (t-t0) 而不是 t
    let t_diff = t - params.t0;
    let beta_c = if t_diff <= 0.0 {
        0.0
    } else {
        t_diff.powf(0.6) / (10.0 + t_diff.powf(0.6))
    };
    let phi = beta_c * phi_infinity;
    
    Ok(phi)
}

/// ACI209模型时间序列计算（优化版本）
#[wasm_bindgen]
pub fn calculate_aci209_series(params: &JsValue, max_time: usize) -> Result<JsValue, JsValue> {
    let params: Aci209Params = serde_wasm_bindgen::from_value(params.clone())?;
    
    // 预计算常量
    let beta_t0 = 1.25 * params.t0.powf(-0.118);
    let beta_rh = 1.27 - 0.0067 * params.h;
    let beta_vs = (2.0 * (1.0 + 1.13 * (-0.0213 * params.vs).exp())) / 3.0;
    let beta_s_phi = 0.88 + 0.244 * params.s_phi;
    let beta_cc = 0.75 + 0.00061 * params.cc;
    let beta_alpha = 0.46 + 9.0 * params.alpha;
    let phi_infinity = 2.35 * beta_t0 * beta_rh * beta_vs * beta_s_phi * beta_cc * beta_alpha;
    
    // 使用向量化计算
    let mut results = Vec::with_capacity(max_time + 1);
    
    for t in 0..=max_time {
        let t_f = t as f64;
        // 对于时间序列，直接使用 t（从加载时刻开始的时间）
        let beta_c = if t_f <= 0.0 {
            0.0
        } else {
            t_f.powf(0.6) / (10.0 + t_f.powf(0.6))
        };
        let phi = beta_c * phi_infinity;

        results.push(TimeSeriesPoint { t: t_f, phi });
    }
    
    serde_wasm_bindgen::to_value(&results).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// ACI209模型批量计算（并行优化）
#[wasm_bindgen]
pub fn calculate_aci209_batch(batch_data: &JsValue) -> Result<JsValue, JsValue> {
    #[derive(Deserialize, Serialize)]
    struct BatchItem {
        t0: f64,
        #[serde(alias = "H", alias = "相对湿度", alias = "RH")]
        #[serde(rename = "H")]
        h: Option<f64>,
        #[serde(alias = "VS", alias = "体积表面积比", alias = "V/S")]
        #[serde(rename = "VS")]
        vs: Option<f64>,
        #[serde(alias = "sPhi", alias = "坍落度", alias = "s/φ")]
        #[serde(rename = "sPhi")]
        s_phi: Option<f64>,
        #[serde(alias = "Cc", alias = "水泥用量", alias = "cement")]
        #[serde(rename = "Cc")]
        cc: Option<f64>,
        #[serde(alias = "alpha", alias = "徐变参数", alias = "α")]
        alpha: Option<f64>,
        #[serde(alias = "t", alias = "时间", alias = "龄期")]
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
            let params = Aci209Params {
                t0: item.t0,
                h: item.h.unwrap_or(70.0),
                vs: item.vs.unwrap_or(100.0),
                s_phi: item.s_phi.unwrap_or(0.5),
                cc: item.cc.unwrap_or(350.0),
                alpha: item.alpha.unwrap_or(0.08),
            };
            
            let phi = calculate_aci209_single_internal(&params, item.t);
            
            BatchResult {
                phi,
                original: serde_json::to_value(&item).unwrap_or_default(),
            }
        })
        .collect();
    
    serde_wasm_bindgen::to_value(&results).map_err(|e| JsValue::from_str(&e.to_string()))
}

// 内部计算函数，避免序列化开销
pub fn calculate_aci209_single_internal(params: &Aci209Params, t: f64) -> f64 {
    let beta_t0 = 1.25 * params.t0.powf(-0.118);
    let beta_rh = 1.27 - 0.0067 * params.h;
    let beta_vs = (2.0 * (1.0 + 1.13 * (-0.0213 * params.vs).exp())) / 3.0;
    let beta_s_phi = 0.88 + 0.244 * params.s_phi;
    let beta_cc = 0.75 + 0.00061 * params.cc;
    let beta_alpha = 0.46 + 9.0 * params.alpha;
    let phi_infinity = 2.35 * beta_t0 * beta_rh * beta_vs * beta_s_phi * beta_cc * beta_alpha;

    // 使用 (t-t0) 而不是 t，与原始 ACI209 实现保持一致
    let t_diff = t - params.t0;
    let beta_c = if t_diff <= 0.0 {
        0.0
    } else {
        t_diff.powf(0.6) / (10.0 + t_diff.powf(0.6))
    };
    beta_c * phi_infinity
}
