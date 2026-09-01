import "./wasm_exec.js";
import wasmModule from "./main.wasm";

const go = new Go();
let isGoRunning = false;

function initGoWasm() {
  if (!isGoRunning) {
    isGoRunning = true;
    WebAssembly.instantiate(wasmModule, go.importObject).then((instance) => {
      go.run(instance);
    }).catch((err) => {
      console.error("Failed to instantiate Go Wasm module:", err);
    });
  }
}

// Start Go Wasm runtime on worker cold start
initGoWasm();

export default {
  async fetch(request, env, ctx) {
    const urlObj = new URL(request.url);
    const renderOriginUrl = env.RENDER_ORIGIN_URL || "https://shrtn-esyz.onrender.com";
    const appDashboardUrl = env.APP_DASHBOARD_URL || "https://app.shrtn.fun";

    // Direct proxy for /health endpoint to Render origin container
    if (urlObj.pathname === "/health") {
      return fetch(new Request(renderOriginUrl + "/health", request));
    }

    // Static auth & root routes handled instantly at edge
    if (urlObj.pathname === "/signin") return Response.redirect(appDashboardUrl + "/signin", 302);
    if (urlObj.pathname === "/signup") return Response.redirect(appDashboardUrl + "/signup", 302);
    if (urlObj.pathname === "/dashboard" || urlObj.pathname.startsWith("/dashboard/")) return Response.redirect(appDashboardUrl + urlObj.pathname, 302);
    if (urlObj.pathname === "/" || urlObj.pathname === "") return Response.redirect(renderOriginUrl, 302);

    const shortCode = urlObj.pathname.replace(/^\/+/, "");
    if (!shortCode || shortCode.includes("/")) {
      return fetch(new Request(renderOriginUrl + urlObj.pathname + urlObj.search, request));
    }

    // 1. Fetch cached link from Upstash Redis REST at Edge speed
    let upstashJson = "";
    const upstashUrl = env.UPSTASH_REDIS_REST_URL;
    const upstashToken = env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      try {
        const endpoint = upstashUrl.replace(/\/+$/, "") + "/get/url:" + shortCode;
        const upstashResp = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        if (upstashResp.ok) {
          const data = await upstashResp.json();
          if (data && data.result) {
            upstashJson = typeof data.result === "string" ? data.result : JSON.stringify(data.result);
          }
        }
      } catch (e) {
        console.error("Upstash Redis fetch error:", e);
      }
    }

    // 2. Pass link data into Go Wasm engine for smart device routing & destruct validation
    try {
      let attempts = 0;
      while (typeof globalThis.handleGoRedirect !== "function" && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        attempts++;
      }

      if (typeof globalThis.handleGoRedirect === "function") {
        const userAgent = request.headers.get("User-Agent") || "";
        const result = globalThis.handleGoRedirect(
          shortCode,
          userAgent,
          upstashJson,
          appDashboardUrl,
          renderOriginUrl
        );

        if (result) {
          const redirectUrl = typeof result.redirectUrl === "string" ? result.redirectUrl : (result.get ? result.get("redirectUrl") : "");
          const status = typeof result.status === "number" ? result.status : (result.get ? result.get("status") : 302);
          if (redirectUrl) {
            return Response.redirect(redirectUrl, status || 302);
          }
        }
      }
    } catch (err) {
      console.error("Go Wasm edge redirect error:", err);
    }

    // Fallback to Render origin
    return fetch(new Request(renderOriginUrl + urlObj.pathname + urlObj.search, request));
  }
};
