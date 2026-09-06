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

function trackClickAsync(ctx, renderOriginUrl, shortCode, request) {
  if (ctx && typeof ctx.waitUntil === "function") {
    const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "";
    const cfCountry = request.headers.get("CF-IPCountry") || "";
    ctx.waitUntil(
      fetch(renderOriginUrl + "/api/v1/clicks/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: shortCode,
          ipAddress: clientIp,
          userAgent: request.headers.get("User-Agent") || "",
          referrer: request.headers.get("Referer") || "",
          country: cfCountry
        })
      }).catch((e) => console.error("Async click track error:", e))
    );
  }
}

export default {
  async fetch(request, env, ctx) {
    const urlObj = new URL(request.url);
    const renderOriginUrl = env.RENDER_ORIGIN_URL || "https://shrtn-esyz.onrender.com";
    const appDashboardUrl = env.APP_DASHBOARD_URL || "https://app.shrtn.fun";

    // Direct proxy for /health endpoint to Render origin container
    if (urlObj.pathname === "/health") {
      return fetch(new Request(renderOriginUrl + "/health", request));
    }

    // Edge Cache static assets & strip Origin/Content-Disposition headers to bypass CORS & script blocking
    if (urlObj.pathname.startsWith("/assets/")) {
      const cache = caches.default;
      let cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const reqHeaders = new Headers(request.headers);
        reqHeaders.delete("Origin");
        reqHeaders.delete("origin");
        const originReq = new Request(renderOriginUrl + urlObj.pathname + urlObj.search, {
          method: "GET",
          headers: reqHeaders
        });
        const originResp = await fetch(originReq);
        if (originResp.ok) {
          const headers = new Headers(originResp.headers);
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
          headers.delete("Content-Disposition");
          headers.delete("content-disposition");

          if (urlObj.pathname.endsWith(".js")) {
            headers.set("Content-Type", "application/javascript; charset=UTF-8");
          } else if (urlObj.pathname.endsWith(".css")) {
            headers.set("Content-Type", "text/css; charset=UTF-8");
          }

          const responseToCache = new Response(originResp.body, {
            status: originResp.status,
            statusText: originResp.statusText,
            headers: headers
          });
          if (ctx && typeof ctx.waitUntil === "function") {
            ctx.waitUntil(cache.put(request, responseToCache.clone()));
          }
          return responseToCache;
        }
        return originResp;
      } catch (e) {
        console.error("Asset fetch error:", e);
      }
    }

    // Static auth & root routes handled instantly at edge
    if (urlObj.pathname === "/signin") return Response.redirect(appDashboardUrl + "/signin", 302);
    if (urlObj.pathname === "/signup") return Response.redirect(appDashboardUrl + "/signup", 302);
    if (urlObj.pathname === "/dashboard" || urlObj.pathname.startsWith("/dashboard/")) return Response.redirect(appDashboardUrl + urlObj.pathname, 302);
    if (urlObj.pathname === "/" || urlObj.pathname === "") return fetch(new Request(renderOriginUrl + urlObj.pathname + urlObj.search, request));

    const shortCode = urlObj.pathname.replace(/^\/+/, "");
    if (!shortCode || shortCode.includes("/")) {
      return fetch(new Request(renderOriginUrl + urlObj.pathname + urlObj.search, request));
    }

    // 1. Query Upstash Redis REST API directly from Cloudflare Edge
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
            let entry = null;
            try {
              entry = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
            } catch (e) {}

            if (entry && entry.originalUrl) {
              if (entry.isActive === false) {
                return Response.redirect(appDashboardUrl + "/404?reason=deactivated", 302);
              }
              if (entry.isPasswordProtected) {
                return Response.redirect(appDashboardUrl + "/unlock/" + shortCode, 302);
              }

              // Fire non-blocking click tracking event to Spring Boot in background
              trackClickAsync(ctx, renderOriginUrl, shortCode, request);

              // Smart Device Routing at Edge
              const ua = (request.headers.get("User-Agent") || "").toLowerCase();
              if (entry.iosUrl && (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod"))) {
                return Response.redirect(entry.iosUrl, 302);
              }
              if (entry.androidUrl && ua.includes("android")) {
                return Response.redirect(entry.androidUrl, 302);
              }

              // Sub-20ms Edge Redirect
              return Response.redirect(entry.originalUrl, 302);
            }
          }
        }
      } catch (e) {
        console.error("Upstash Redis fetch error:", e);
      }
    }

    // Cache Miss Fallback to Render origin container
    return fetch(new Request(renderOriginUrl + urlObj.pathname + urlObj.search, request));
  }
};
