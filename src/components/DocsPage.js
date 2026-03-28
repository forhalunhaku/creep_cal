import React from 'react';

const MODELS = [
  {
    id: 'aci209',
    name: 'ACI 209R-92',
    category: 'North American Standard',
    engine: ['JS', 'RUST'],
    color: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
    textColor: 'text-cyan-300',
    description: 'The ACI 209R-92 model is a widely adopted empirical framework for predicting concrete creep and shrinkage developed by the American Concrete Institute. It uses power-law formulations scaled by correction factors for humidity, specimen size, cement content, slump, and age at loading.',
    params: [
      { name: 't0', description: 'Age at loading (days)' },
      { name: 'H', description: 'Ambient relative humidity (%)' },
      { name: 'VS', description: 'Volume-to-surface ratio (mm)' },
      { name: 'sPhi', description: 'Slump (0–1 normalized)' },
      { name: 'Cc', description: 'Cement content (kg/m³)' },
      { name: 'alpha', description: 'Creep parameter α' },
    ],
    output: 'φ(t, t₀) — Creep Coefficient (dimensionless)',
    reference: 'ACI Committee 209 (1992). Prediction of Creep, Shrinkage, and Temperature Effects in Concrete Structures. ACI 209R-92.',
    formulas: [
      { label: 'Creep Coefficient', expr: 'φ(t, t₀) = β_c(t−t₀) · φ_∞' },
      { label: 'Time Function', expr: 'β_c = (t−t₀)^0.6 / [10 + (t−t₀)^0.6]' },
      { label: 'Ultimate Creep', expr: 'φ_∞ = 2.35 · γ_t₀ · γ_RH · γ_VS · γ_s · γ_cc · γ_α' },
      { label: 'Age Factor', expr: 'γ_t₀ = 1.25 · t₀^(−0.118)' },
      { label: 'Humidity Factor', expr: 'γ_RH = 1.27 − 0.0067 · RH' },
      { label: 'V/S Factor', expr: 'γ_VS = 2/3 · [1 + 1.13 · e^(−0.0213·(V/S))]' },
      { label: 'Slump Factor', expr: 'γ_s = 0.88 + 0.244 · s' },
      { label: 'Cement Factor', expr: 'γ_cc = 0.75 + 0.00061 · c' },
    ],
  },
  {
    id: 'mc2010',
    name: 'fib Model Code 2010',
    category: 'European Standard',
    engine: ['JS', 'RUST'],
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    textColor: 'text-purple-300',
    description: 'The fib Model Code 2010 (MC2010) is a comprehensive international code model for time-dependent structural concrete behaviour. It decomposes creep into basic creep (φ_bc) and drying creep (φ_dc) components, accounting for concrete strength, humidity, cross-section geometry, loading age, and cement class.',
    params: [
      { name: 'fcm', description: 'Mean compressive strength (MPa)' },
      { name: 'RH', description: 'Relative humidity (%)' },
      { name: 't0', description: 'Age at loading (days)' },
      { name: 'Ac', description: 'Cross-sectional area (mm²)' },
      { name: 'u', description: 'Exposed perimeter (mm)' },
      { name: 'T', description: 'Temperature (°C)' },
      { name: 'Cs', description: 'Cement strength class (e.g., 42.5R)' },
    ],
    output: 'φ(t, t₀) = φ_bc + φ_dc — combined creep coefficient',
    reference: 'fib (2013). fib Model Code for Concrete Structures 2010. Wilhelm Ernst & Sohn.',
    formulas: [
      { label: 'Total Creep', expr: 'φ(t, t₀) = φ_bc(t, t₀) + φ_dc(t, t₀)' },
      { label: 'Basic Creep Coefficient', expr: 'φ_bc = β_bc(f_cm) · β_bc(t, t₀)' },
      { label: 'β_bc(f_cm)', expr: 'β_bc(f_cm) = 1.8 / f_cm^0.7' },
      { label: 'β_bc(t,t₀)', expr: 'β_bc(t,t₀) = ln[(30/t₀ + 0.035)² · (t−t₀) + 1]' },
      { label: 'Drying Creep Coefficient', expr: 'φ_dc = β_dc(f_cm) · β_dc(RH) · β_dc(t₀) · β_dc(t,t₀)' },
      { label: 'β_dc(f_cm)', expr: 'β_dc(f_cm) = 412 / f_cm^1.4' },
      { label: 'β_dc(RH)', expr: 'β_dc(RH) = (1 − RH/100) / (0.1 · h_e/100)^(1/3)' },
      { label: 'Notional Size', expr: 'h_e = 2 · A_c / u  (effective thickness, mm)' },
      { label: 'Adjusted Loading Age', expr: 't₀,T = t₀ · exp[13.65 − 4000/(273+T)]  (temperature adjusted)' },
    ],
  },
  {
    id: 'b4',
    name: 'B4 Model',
    category: 'Multi-Decade Comprehensive',
    engine: ['JS', 'RUST'],
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
    description: 'The RILEM B4 model is a fourth-generation multi-decadal creep prediction model developed at Northwestern University. It accounts for material composition (water-cement ratio, aggregate type, cement content, cement type), environmental conditions, and cross-section geometry with high accuracy for 100-year predictions. The model outputs compliance function J(t, t\') representing total deformation per unit stress.',
    params: [
      { name: 't0', description: 'Loading start time (days)' },
      { name: 'tPrime', description: 'Age at loading / stress application (days)' },
      { name: 'T', description: 'Temperature (°C)' },
      { name: 'h', description: 'Relative humidity (0–1 or %)' },
      { name: 'fc', description: 'Compressive strength (MPa)' },
      { name: 'vS', description: 'V/S ratio — volume to surface (mm)' },
      { name: 'c', description: 'Cement content (kg/m³)' },
      { name: 'wC', description: 'Water-to-cement ratio' },
      { name: 'aC', description: 'Aggregate-to-cement ratio' },
      { name: 'cementType', description: 'Cement type: R, RS, or SL' },
      { name: 'aggregateType', description: 'Aggregate: Quartzite, Limestone, Sandstone, Granite' },
      { name: 'specimenShape', description: 'Specimen shape code (1–5)' },
    ],
    output: 'J(t, t\') — Compliance function (1/GPa), total creep + elastic deformation per unit stress',
    reference: 'Bažant Z.P., Hubler M.H., Yu Q. (2011). Pervasiveness of Excessive Segmental Bridge Deflections: Wake-Up Call for Creep. ACI Struct. J.',
    formulas: [
      { label: 'Compliance Function', expr: "J(t, t') = q₁ + C₀(t, t') + C_d(t, t', t₀)" },
      { label: 'Instantaneous Term', expr: 'q₁ = 0.6 / E₂₈  (elastic compliance)' },
      { label: 'Basic Creep', expr: "C₀(t,t') = q₂·Q(t,t') + q₃·ln[1+(t−t')^0.1] + q₄·ln(t/t')" },
      { label: 'Aging Viscoelastic', expr: "Q(t,t') = Q_f(t') · {1 + [Q_f/Z(t,t')]^r(t')}^(−1/r(t'))" },
      { label: 'Drying Creep', expr: "C_d(t,t',t₀) = q₅ · √{exp[−8H(t)] − exp[−8H(t')_max]}" },
      { label: 'Shrinkage Humidity', expr: 'H(t) = 1 − (1−h)·tanh√[(t̃−t₀~)/τ_SH]' },
      { label: 'Drying Half-Time', expr: 'τ_SH = τ_cem(a/c,w/c,c) · k_sagg · (k_sh·D)²  (D=2V/S)' },
      { label: 'Temperature Scaling', expr: 'R_T = exp[4000·(1/293 − 1/(T+273))]' },
    ],
  },
  {
    id: 'b4s',
    name: 'B4S Model',
    category: 'Simplified Rapid Analysis',
    engine: ['JS', 'RUST'],
    color: 'from-orange-500/20 to-yellow-500/20',
    border: 'border-orange-500/30',
    textColor: 'text-orange-300',
    description: 'The B4S model is the simplified variant of B4 that uses compressive strength (fc) as the sole material input instead of full mix design parameters. It sacrifices minor accuracy for significantly reduced input requirements, making it ideal for rapid parametric studies or when detailed composition data is unavailable.',
    params: [
      { name: 't0', description: 'Loading start time (days)' },
      { name: 'tPrime', description: 'Age at loading (days)' },
      { name: 'T', description: 'Temperature (°C)' },
      { name: 'h', description: 'Relative humidity (0–1 or %)' },
      { name: 'fc', description: 'Compressive strength (MPa)' },
      { name: 'vS', description: 'V/S ratio (mm)' },
      { name: 'cementType', description: 'Cement type: R, RS, or SL' },
      { name: 'specimenShape', description: 'Specimen shape code (1–5)' },
      { name: 'aggregateType', description: 'Aggregate type' },
    ],
    output: 'J(t, t\') — Compliance function (1/GPa)',
    reference: 'Bažant Z.P., Baweja S. (2000). Creep and Shrinkage Prediction Model for Analysis and Design of Concrete Structures: Model B3. RILEM Recommendation.',
    formulas: [
      { label: 'Compliance Function', expr: "J(t, t') = q₁ + C₀(t, t') + C_d(t, t', t₀)  [same structure as B4]" },
      { label: 'Key Simplification', expr: "Parameters q₂–q₅ derived solely from f'c (no mix design required)" },
      { label: 'Strength-Based q₂', expr: "q₂ = s₂ · (f'c / 40)^s₂f  (cement-type dependent coefficient)" },
      { label: 'Strength-Based q₃', expr: "q₃ = s₃ · q₂ · (f'c / 40)^s₃f" },
      { label: 'Strength-Based q₄', expr: "q₄ = s₄ · (f'c / 40)^s₄f" },
      { label: 'Strength-Based τ_SH', expr: "τ₀ = τ_s,cem · (f'c/40)^s_τf  (shrinkage half-time scale factor)" },
      { label: 'Drying Half-Time', expr: 'τ_SH = τ₀ · k_sagg · (k_sh·D)²' },
      { label: 'Difference from B4', expr: 'B4S omits a/c, w/c, c/ρ inputs; uses s-series coefficients per cement type' },
    ],
  },
];


export default function DocsPage() {
  const [selected, setSelected] = React.useState('aci209');
  const model = MODELS.find(m => m.id === selected);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10">
      <header className="mb-10">
        <h1 className="font-headline text-5xl font-bold tracking-tight text-on-background mb-4">
          Model <span className="text-primary italic">Library</span>
        </h1>
        <p className="text-on-surface-variant text-lg">
          Reference documentation for all supported concrete creep & shrinkage prediction models.
        </p>
      </header>

      {/* Model Tabs */}
      <div className="flex gap-2 flex-wrap">
        {MODELS.map(m => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`px-5 py-2.5 rounded-lg font-label uppercase tracking-widest text-xs transition-all active:scale-95 border ${
              selected === m.id
                ? `bg-gradient-to-r ${m.color} ${m.textColor} ${m.border} shadow-lg`
                : 'text-neutral-500 hover:text-neutral-300 border-outline-variant/30 hover:bg-white/5'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Model Detail Panel */}
      <div className={`glass-card rounded-2xl border ${model.border} p-8 shadow-xl relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${model.color} opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none`}></div>

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className={`text-[10px] font-label uppercase tracking-widest ${model.textColor} mb-2`}>{model.category}</div>
            <h2 className="font-headline text-3xl font-bold text-on-background">{model.name}</h2>
          </div>
          <div className="flex gap-2">
            {model.engine.map(e => (
              <span key={e} className={`px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest border ${model.border} ${model.textColor} bg-gradient-to-r ${model.color}`}>
                {e} Engine
              </span>
            ))}
          </div>
        </div>

        <p className="text-on-surface-variant leading-relaxed mb-10">{model.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Parameters Table */}
          <div>
            <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Input Parameters</h3>
            <div className="space-y-2">
              {model.params.map(p => (
                <div key={p.name} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <code className={`text-xs font-mono font-bold ${model.textColor} shrink-0 w-24 pt-0.5`}>{p.name}</code>
                  <span className="text-on-surface-variant text-sm">{p.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Output & Reference */}
          <div className="space-y-6">
            <div>
              <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Output</h3>
              <div className={`p-4 rounded-lg bg-gradient-to-r ${model.color} border ${model.border}`}>
                <p className={`font-mono text-sm ${model.textColor}`}>{model.output}</p>
              </div>
            </div>

            <div>
              <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Reference</h3>
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                <p className="text-on-surface-variant text-sm leading-relaxed italic">{model.reference}</p>
              </div>
            </div>

            <div>
              <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Computation Engine</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-cyan-500/10">
                  <span className="material-symbols-outlined text-cyan-400 text-[18px]">memory</span>
                  <div>
                    <div className="text-xs font-label uppercase tracking-wider text-cyan-300">RUST WASM Kernel</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">High-performance WebAssembly, ~10k points in &lt;50ms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-yellow-500/10">
                  <span className="material-symbols-outlined text-yellow-500 text-[18px]">javascript</span>
                  <div>
                    <div className="text-xs font-label uppercase tracking-wider text-yellow-400">Standard JS Engine</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Pure JavaScript reference implementation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulas Section */}
        {model.formulas && (
          <div className="border-t border-outline-variant/20 pt-8 mt-2">
            <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-6">Core Calculation Formulas</h3>
            <div className="space-y-3">
              {model.formulas.map((f, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <span className={`text-[10px] font-label uppercase tracking-widest shrink-0 sm:w-52 ${model.textColor}`}>{f.label}</span>
                  <code className="flex-1 font-mono text-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded border border-outline-variant/10 break-all">{f.expr}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Reference Table */}
      <div className="glass-card rounded-xl border border-outline-variant/20 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20">
          <h3 className="font-headline text-lg uppercase tracking-widest text-on-background">Model Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-high">
              <tr>
                {['Model', 'Origin', 'Output', 'Complexity', 'Engine'].map(h => (
                  <th key={h} className="p-4 text-left text-xs font-label uppercase tracking-wider text-outline">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'ACI 209R-92', origin: 'USA / ACI', output: 'φ(t,t₀)', complexity: '★★☆☆', engine: 'JS + RUST' },
                { name: 'fib MC 2010', origin: 'EU / fib', output: 'φ(t,t₀)', complexity: '★★★☆', engine: 'JS + RUST' },
                { name: 'B4', origin: 'Northwestern', output: 'J(t,t\')', complexity: '★★★★', engine: 'JS + RUST' },
                { name: 'B4S', origin: 'Northwestern', output: 'J(t,t\')', complexity: '★★★☆', engine: 'JS + RUST' },
              ].map((row, i) => (
                <tr key={i} className="border-t border-outline-variant/10 hover:bg-surface-container/40 transition-colors">
                  <td className="p-4 font-headline text-on-background">{row.name}</td>
                  <td className="p-4 text-on-surface-variant">{row.origin}</td>
                  <td className="p-4 font-mono text-primary">{row.output}</td>
                  <td className="p-4 text-yellow-400">{row.complexity}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-[10px] font-label uppercase bg-primary/10 text-primary border border-primary/20">{row.engine}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
