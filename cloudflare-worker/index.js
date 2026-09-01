import "./wasm_exec.js";
import wasmModule from "./main.wasm";

const go = new Go();
let wasmInstancePromise = null;

async function getWasmInstance() {
  if (!wasmInstancePromise) {
    wasmInstancePromise = (async () => {
      const instance = await WebAssembly.instantiate(wasmModule, go.importObject);
      go.run(instance);
      return instance;
    })();
  }
  return wasmInstancePromise;
}

export default {
  async fetch(request, env, ctx) {
    try {
      await getWasmInstance();

      const url = request.url;
      const userAgent = request.headers.get("User-Agent") || "";
      const upstashUrl = env.UPSTASH_REDIS_REST_URL || "";
      const upstashToken = env.UPSTASH_REDIS_REST_TOKEN || "";
      const appDashboardUrl = env.APP_DASHBOARD_URL || "https://app.shrtn.fun";
      const renderOriginUrl = env.RENDER_ORIGIN_URL || "https://shrtn.fun";

      if (typeof globalThis.handleGoRedirect === "function") {
        const result = globalThis.handleGoRedirect(
          url,
          userAgent,
          upstashUrl,
          upstashToken,
          appDashboardUrl,
          renderOriginUrl
        );

        if (result && result.redirectUrl) {
          return Response.redirect(result.redirectUrl, result.status || 302);
        }
      }
    } catch (err) {
      console.error("Go Wasm edge redirect error:", err);
    }

    return fetch(request);
  }
};
