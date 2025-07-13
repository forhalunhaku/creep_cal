use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

// 导入JavaScript的console.log用于调试
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// 定义宏简化console.log调用
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// 公共数据结构
#[derive(Serialize, Deserialize)]
pub struct TimeSeriesPoint {
    pub t: f64,
    pub phi: f64,
}

#[derive(Serialize, Deserialize)]
pub struct B4Result {
    pub t: f64,
    pub j: f64,
    pub epsilon_sh: f64,
    pub epsilon_au: f64,
}

#[derive(Serialize, Deserialize)]
pub struct B4sResult {
    pub t: f64,
    pub j: f64,
    pub epsilon_sh: f64,
    pub epsilon_au: f64,
}

// ACI209模型参数
#[derive(Serialize, Deserialize)]
pub struct Aci209Params {
    pub t0: f64,
    pub h: f64,
    pub vs: f64,
    pub s_phi: f64,
    pub cc: f64,
    pub alpha: f64,
}

// MC2010模型参数
#[derive(Serialize, Deserialize)]
pub struct Mc2010Params {
    pub fcm: f64,
    pub rh: f64,
    pub t0: f64,
    pub ac: f64,
    pub u: f64,
    pub t: f64,
    pub cement_type: String,
}

// 模块声明
mod aci209;
mod mc2010;
mod b4;
mod b4s;
mod utils;

pub use aci209::*;
pub use mc2010::*;
pub use b4::*;
pub use b4s::*;
pub use utils::*;

// 初始化函数
#[wasm_bindgen(start)]
pub fn main() {
    console_log!("Rust计算引擎已加载");
}

// 性能测试函数
#[wasm_bindgen]
pub fn benchmark_calculation(model: &str, iterations: usize) -> f64 {
    let start = js_sys::Date::now();

    match model {
        "aci209" => {
            for _ in 0..iterations {
                let params = Aci209Params {
                    t0: 28.0,
                    h: 70.0,
                    vs: 100.0,
                    s_phi: 0.5,
                    cc: 350.0,
                    alpha: 0.08,
                };
                // 使用内部函数避免序列化开销
                let _ = aci209::calculate_aci209_single_internal(&params, 365.0);
            }
        }
        _ => console_log!("未知模型: {}", model),
    }

    js_sys::Date::now() - start
}
