const WASM_TIMEOUT_MS = 5000;

let engineModule = null;
let enginePromise = null;

export async function loadCreepEngine() {
  if (engineModule) return engineModule;

  if (!enginePromise) {
    enginePromise = (async () => {
      const wasmPromise = import('../wasm-pkg/creep_calculator_engine.js');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`WASM load timed out after ${WASM_TIMEOUT_MS}ms`)), WASM_TIMEOUT_MS);
      });

      const wasm = await Promise.race([wasmPromise, timeoutPromise]);
      await wasm.default();
      engineModule = wasm;
      return engineModule;
    })().catch((error) => {
      enginePromise = null;
      throw error;
    });
  }

  return enginePromise;
}

export function appendFeedLog(setFeedLogs, message, type = 'info') {
  setFeedLogs((prev) => {
    const last = prev[prev.length - 1];
    if (last?.message === message && last?.type === type) return prev;
    return [...prev.slice(-9), { time: new Date().toLocaleTimeString(), message, type }];
  });
}
