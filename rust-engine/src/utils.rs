use wasm_bindgen::prelude::*;

/// 生成时间点序列（优化版本）
pub fn generate_time_points(max_time: usize) -> Vec<f64> {
    (0..=max_time).map(|t| t as f64).collect()
}

/// 性能计时器
#[wasm_bindgen]
pub struct PerformanceTimer {
    start_time: f64,
}

#[wasm_bindgen]
impl PerformanceTimer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> PerformanceTimer {
        PerformanceTimer {
            start_time: js_sys::Date::now(),
        }
    }
    
    #[wasm_bindgen]
    pub fn elapsed(&self) -> f64 {
        js_sys::Date::now() - self.start_time
    }
    
    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.start_time = js_sys::Date::now();
    }
}

/// 数值计算工具函数
pub fn safe_pow(base: f64, exp: f64) -> f64 {
    if base.is_finite() && exp.is_finite() {
        base.powf(exp)
    } else {
        f64::NAN
    }
}

pub fn safe_exp(x: f64) -> f64 {
    if x.is_finite() && x < 700.0 { // 避免溢出
        x.exp()
    } else if x >= 700.0 {
        f64::INFINITY
    } else {
        f64::NAN
    }
}

pub fn safe_sqrt(x: f64) -> f64 {
    if x >= 0.0 && x.is_finite() {
        x.sqrt()
    } else {
        f64::NAN
    }
}

/// 批量数据验证
pub fn validate_batch_data(data: &[f64]) -> bool {
    data.iter().all(|&x| x.is_finite())
}

/// 内存使用情况（WebAssembly特定）
#[wasm_bindgen]
pub fn get_memory_usage() -> usize {
    // 简化的内存使用情况获取
    // 在WebAssembly中，我们返回一个估算值
    1024 * 1024 // 1MB 作为示例
}
