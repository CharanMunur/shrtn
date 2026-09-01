# Shrtn Cloudflare Worker — Go (Golang) WebAssembly Edge Redirect Engine

This directory contains the high-performance Cloudflare Worker edge redirect engine written in **Go (Golang)** and compiled to **WebAssembly (`main.wasm`)**.

## Features

- **⚡ Sub-20ms 302 Redirects**: Runs at Cloudflare's 300+ Edge data centers directly via V8 Isolates.
- **🏎️ Upstash Redis REST Query**: Queries Upstash Redis REST API endpoints (`/get/url:{shortCode}`) directly in Go.
- **📱 Smart Device Routing**: Evaluates visitor `User-Agent` headers in Go Wasm for iOS (`iPhone`/`iPad`/`iPod`) and Android targets.
- **🔥 Auto-Destruct & Password Checking**: Checks `maxClicks` limits and password lock status before redirecting.
- **🌐 Instant Auth Route Handlers**: Instantly redirects `/signin`, `/signup`, `/dashboard` to `https://app.shrtn.fun/...`.

---

## Directory Structure

```text
cloudflare-worker/
├── main.go            # Go edge redirect engine source code
├── main.wasm          # Compiled WebAssembly binary
├── index.js           # Lightweight JS Wasm bridge for Cloudflare Workers
├── wasm_exec.js       # Go Wasm runtime bridge
├── wrangler.jsonc      # Cloudflare Worker configuration
└── package.json
```

---

## Development & Deployment

### Build WebAssembly Binary
```bash
GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o main.wasm main.go
```

### Local Development Server
```bash
bun run dev
# or: npx wrangler dev
```

### Deploy to Cloudflare Workers
```bash
bun run deploy
# or: npx wrangler deploy
```
