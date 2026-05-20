import React from 'react';

const MODELS = [
  {
    id: 'aci209',
    name: 'ACI 209R-92',
    category: 'North American Standard',
    engine: ['JS', 'RUST'],
    color: 'bg-primary/12',
    border: 'border-primary/30',
    textColor: 'text-primary',
    description: 'The ACI 209R-92 implementation in this app returns the creep coefficient φ(t,t₀). It uses the current shared kernel: a time development term based on t−t₀ multiplied by correction factors for loading age, humidity, volume-to-surface ratio, slump parameter, cement content, and α.',
    params: [
      { name: 't0', description: 'Age at loading (days)' },
      { name: 'H', description: 'Ambient relative humidity (%)' },
      { name: 'VS', description: 'Volume-to-surface ratio (mm)' },
      { name: 'sPhi / sphi', description: 'Sand ratio; batch files use sphi' },
      { name: 'Cc', description: 'Cement content (kg/m³)' },
      { name: 'alpha', description: 'Air content' },
      { name: 't', description: 'Target age from casting (days); batch files provide this column' },
    ],
    output: 'φ(t, t₀) — Creep Coefficient (dimensionless)',
    reference: 'ACI Committee 209 (1992). Prediction of Creep, Shrinkage, and Temperature Effects in Concrete Structures. ACI 209R-92.',
    formulas: [
      { label: 'Creep Coefficient', expr: 'φ(t, t₀) = β_c(t−t₀) · φ_∞' },
      { label: 'Time Function', expr: 'β_c = (t−t₀)^0.6 / [10 + (t−t₀)^0.6]' },
      { label: 'Ultimate Creep', expr: 'φ_∞ = 2.35 · β_t₀ · β_RH · β_VS · β_sφ · β_Cc · β_α' },
      { label: 'Age Factor', expr: 'β_t₀ = 1.25 · t₀^(−0.118)' },
      { label: 'Humidity Factor', expr: 'β_RH = 1.27 − 0.0067 · H' },
      { label: 'V/S Factor', expr: 'β_VS = 2 · [1 + 1.13 · e^(−0.0213·VS)] / 3' },
      { label: 'Sand Ratio Factor', expr: 'β_sφ = 0.88 + 0.244 · sφ' },
      { label: 'Cement Factor', expr: 'β_Cc = 0.75 + 0.00061 · Cc' },
      { label: 'Air Content Factor', expr: 'β_α = 0.46 + 9 · α' },
    ],
  },
  {
    id: 'mc2010',
    name: 'fib Model Code 2010',
    category: 'European Standard',
    engine: ['JS', 'RUST'],
    color: 'bg-secondary/12',
    border: 'border-secondary/30',
    textColor: 'text-secondary',
    description: 'The fib Model Code 2010 implementation in this app returns the creep coefficient φ(t,t₀) as the sum of basic creep and drying creep. The current kernel adjusts loading age for temperature and cement class, then uses cross-section size, humidity, strength, and t−t₀ for the final coefficient.',
    params: [
      { name: 'fcm', description: 'Mean compressive strength (MPa)' },
      { name: 'RH', description: 'Relative humidity (%)' },
      { name: 't0', description: 'Age at loading (days)' },
      { name: 'Ac', description: 'Cross-sectional area (mm²)' },
      { name: 'u', description: 'Exposed perimeter (mm)' },
      { name: 'T', description: 'Temperature (°C)' },
      { name: 'Cs', description: 'Cement strength class (e.g., 42.5R)' },
      { name: 't', description: 'Target age from casting (days); batch files provide this column' },
    ],
    output: 'φ(t, t₀) = φ_bc + φ_dc — combined creep coefficient',
    reference: 'fib (2013). fib Model Code for Concrete Structures 2010. Wilhelm Ernst & Sohn.',
    formulas: [
      { label: 'Total Creep', expr: 'φ(t, t₀) = φ_bc(t, t₀) + φ_dc(t, t₀)' },
      { label: 'Adjusted Loading Age', expr: 't₀,T = t₀ · exp[13.65 − 4000/(273+T)]' },
      { label: 'Cement Class Adjustment', expr: 't₀,adj = t₀,T · [9/(2+t₀,T^1.2)+1]^a' },
      { label: 'Notional Size', expr: 'h = 2 · A_c / u' },
      { label: 'Size Limit', expr: 'β_h = min(1.5h + 250√(35/f_cm), 1500√(35/f_cm))' },
      { label: 'Basic Creep', expr: 'φ_bc = 1.8/f_cm^0.7 · ln[(30/t₀,adj + 0.035)^2 · (t−t₀) + 1]' },
      { label: 'Drying Exponent', expr: 'γ(t₀)=1/[2.3 + 3.5/√t₀,adj]' },
      { label: 'Drying Creep', expr: 'φ_dc = 412/f_cm^1.4 · (1−RH/100)/(0.1h/100)^(1/3) · 1/(0.1+t₀,adj^0.2) · [(t−t₀)/(β_h+t−t₀)]^γ' },
    ],
  },
  {
    id: 'b4',
    name: 'B4 Model',
    category: 'Multi-Decade Comprehensive',
    engine: ['JS', 'RUST'],
    color: 'bg-emerald-500/12',
    border: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
    description: 'The B4 implementation in this app returns compliance J(t,t′) and drying shrinkage εsh. It uses equivalent time from temperature, D=2V/S, material coefficients from cement and aggregate type, and composition inputs c, w/c, and a/c.',
    params: [
      { name: 't0', description: 'Drying start age (days)' },
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
      { name: 't', description: 'Target age from casting (days); batch files provide this column' },
    ],
    output: 'J(t, t\') — Compliance function (1/GPa), total creep + elastic deformation per unit stress',
    reference: 'Bažant Z.P., Hubler M.H., Yu Q. (2011). Pervasiveness of Excessive Segmental Bridge Deflections: Wake-Up Call for Creep. ACI Struct. J.',
    formulas: [
      { label: 'Temperature Scaling', expr: 'β_T = exp[4000·(1/293 − 1/(T+273))]' },
      { label: 'Equivalent Time', expr: "t̂′ = t₀β_T + (t′−t₀)β_T; t̂ = t̂′ + (t−t′)β_T" },
      { label: 'Shrinkage Half-Time', expr: 'τ_SH = τ₀ · k_sτa · (k_s · 2V/S)^2' },
      { label: 'Shrinkage', expr: 'εsh = εsh∞ · k_h · tanh√[max(0,(t−t₀)β_T)/τ_SH]' },
      { label: 'Basic Creep', expr: "C₀ = q₂Q + q₃ln[1+max(0,t̂−t̂′)^0.1] + q₄ln[max(1,t̂/t̂′)]" },
      { label: 'Drying Creep', expr: 'C_d = q₅√max(0, exp(−p5H·H) − exp(−p5H·Hc))' },
      { label: 'Compliance Function', expr: "J(t,t′) = q₁ + β_T · C₀ + C_d" },
    ],
  },
  {
    id: 'b4s',
    name: 'B4S Model',
    category: 'Simplified Rapid Analysis',
    engine: ['JS', 'RUST'],
    color: 'bg-amber-500/12',
    border: 'border-orange-500/30',
    textColor: 'text-orange-300',
    description: 'The B4S implementation keeps the same B4-style compliance and drying shrinkage structure but derives material terms from compressive strength fc and cement type, so it does not require c, w/c, or a/c.',
    params: [
      { name: 't0', description: 'Drying start age (days)' },
      { name: 'tPrime', description: 'Age at loading (days)' },
      { name: 'T', description: 'Temperature (°C)' },
      { name: 'h', description: 'Relative humidity (0–1 or %)' },
      { name: 'fc', description: 'Compressive strength (MPa)' },
      { name: 'vS', description: 'V/S ratio (mm)' },
      { name: 'cementType', description: 'Cement type: R, RS, or SL' },
      { name: 'specimenShape', description: 'Specimen shape code (1–5)' },
      { name: 'aggregateType', description: 'Aggregate type' },
      { name: 't', description: 'Target age from casting (days); batch files provide this column' },
    ],
    output: 'J(t, t\') — Compliance function (1/GPa)',
    reference: 'Bažant Z.P., Baweja S. (2000). Creep and Shrinkage Prediction Model for Analysis and Design of Concrete Structures: Model B3. RILEM Recommendation.',
    formulas: [
      { label: 'Temperature Scaling', expr: 'β_T = exp[4000·(1/293 − 1/(T+273))]' },
      { label: 'Strength-Based τ₀', expr: "τ₀ = τ_s,cem · (fc/40)^sτf" },
      { label: 'Shrinkage Half-Time', expr: 'τ_SH = τ₀ · k_sτa · (k_s · 2V/S)^2' },
      { label: 'Strength-Based q₂', expr: 'q₂ = s₂ · (fc/40)^s2f / 1000' },
      { label: 'Strength-Based q₃', expr: 'q₃ = s₃ · q₂ · (fc/40)^s3f' },
      { label: 'Strength-Based q₄', expr: 'q₄ = s₄ · (fc/40)^s4f / 1000' },
      { label: 'Shrinkage', expr: 'εsh = εsh∞ · k_h · tanh√[max(0,(t−t₀)β_T)/τ_SH]' },
      { label: 'Compliance Function', expr: "J(t,t′) = q₁ + β_T · C₀ + C_d" },
    ],
  },
];


export default function DocsPage() {
  const [selected, setSelected] = React.useState('aci209');
  const model = MODELS.find(m => m.id === selected);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10">
      <header className="mb-10">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-background mb-4">
          Model <span className="text-primary">library</span>
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg max-w-[65ch] leading-relaxed">
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
                ? `${m.color} ${m.textColor} ${m.border}`
                : 'text-neutral-500 hover:text-neutral-300 border-outline-variant/30 hover:bg-white/5'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Model Detail Panel */}
      <div className={`glass-card rounded-lg border ${model.border} p-5 md:p-8 relative overflow-hidden`}>
        <div className={`absolute top-[-10rem] right-[-10rem] h-96 w-96 rotate-12 ${model.color} blur-3xl pointer-events-none`}></div>

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className={`text-[10px] font-label uppercase tracking-widest ${model.textColor} mb-2`}>{model.category}</div>
            <h2 className="font-headline text-3xl font-bold text-on-background">{model.name}</h2>
          </div>
          <div className="flex gap-2">
            {model.engine.map(e => (
              <span key={e} className={`px-3 py-1 rounded-sm text-[10px] font-label uppercase tracking-widest border ${model.border} ${model.textColor} ${model.color}`}>
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
                <div key={p.name} className="flex items-start gap-3 p-3 rounded-md bg-surface-container-low border border-outline-variant/10">
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
              <div className={`p-4 rounded-md ${model.color} border ${model.border}`}>
                <p className={`font-mono text-sm ${model.textColor}`}>{model.output}</p>
              </div>
            </div>

            <div>
              <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Reference</h3>
              <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/10">
                <p className="text-on-surface-variant text-sm leading-relaxed italic">{model.reference}</p>
              </div>
            </div>

            <div>
              <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Computation Engine</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-md bg-surface-container-low border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">memory</span>
                  <div>
                    <div className="text-xs font-label uppercase tracking-wider text-primary">RUST WASM Kernel</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">High-performance WebAssembly, ~10k points in &lt;50ms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-md bg-surface-container-low border border-secondary/10">
                  <span className="material-symbols-outlined text-secondary text-[18px]" aria-hidden="true">javascript</span>
                  <div>
                    <div className="text-xs font-label uppercase tracking-wider text-secondary">Standard JS Engine</div>
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
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-md bg-surface-container-low border border-outline-variant/10">
                  <span className={`text-[10px] font-label uppercase tracking-widest shrink-0 sm:w-52 ${model.textColor}`}>{f.label}</span>
                  <code className="flex-1 font-mono text-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-sm border border-outline-variant/10 break-all">{f.expr}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
