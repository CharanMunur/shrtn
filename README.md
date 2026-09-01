# Shrtn — Production-Grade URL Shortener

A fast, full-stack URL shortener with click analytics, OTP-based authentication, a Go WebAssembly Cloudflare Worker edge redirect engine, Auto-Destruct links, 1-Click Smart Device Routing, and dynamic QR Code generation. 

## Live Services

- **Frontend App & Dashboard**: [app.shrtn.fun](https://app.shrtn.fun) (Vercel)
- **Landing Page, API & Short Links**: [shrtn.fun](https://shrtn.fun) (Render & Cloudflare Edge)

---

## Directory Structure

This repository is organized as a monorepo:

- **[client/](./client)**: React 19 + Vite frontend. Features clean modern dashboard styling with Tailwind CSS v4, Framer Motion page transitions, Recharts analytics, shadcn UI components, and dynamic QR Code actions. See the [Client README](./client/README.md) for details.
- **[server/](./server)**: Java 25 + Spring Boot 4 REST API. Backed by PostgreSQL (Supabase), Upstash Redis caching, and the Resend API for transactional email verification. Bundles static frontend resources automatically via Gradle. See the [Server README](./server/README.md) for details.
- **[cloudflare-worker/](./cloudflare-worker)**: High-performance edge redirection engine written in **Go (Golang)** compiled to **WebAssembly (`main.wasm`)**. Executes sub-20ms short URL redirects, Upstash Redis REST queries, and smart device routing at Cloudflare's 300+ Edge Isolates. See the [Worker README](./cloudflare-worker/README.md) for details.

---

## Key Features

- **🔥 Auto-Destruct / "Burn After Reading" Links**: Set optional `maxClicks` limits on shortened URLs. Once reached, the link automatically deactivates, evicts from Redis cache, and shows live progress badges (`🔥 X / N`) on user dashboards.
- **⚡ Go WebAssembly Cloudflare Worker Edge Engine**: Ultra-fast sub-20ms 302 redirects executed directly at Cloudflare's nearest edge data center via Go Wasm (`main.wasm`), querying Upstash Redis REST API endpoints in real-time.
- **📱 1-Click Smart Device Routing**: Configure targeted destination links for **iOS** (iPhone/iPad App Store) and **Android** (Google Play Store) visitors alongside the main URL. Device routing is evaluated at the edge redirect layer.
- **🌐 Unified Landing Page & Localhost Smart Routing**: `shrtn.fun` serves the public Landing Page directly at `GET /`, while authentication and dashboard routes (`/signin`, `/signup`, `/dashboard`) handle local dev vs production environments seamlessly.
- **🔐 Social & OTP Authentication (Google & GitHub)**: Integrated credentials-free login/signup with secure authorization flows, client-side callback redirection, and OTP verification via Resend email delivery.
- **🗺️ Interactive Vector World Map**: Visualizes click density instantly across country boundaries using a lightweight, self-contained, offline-first vector map with custom hover tooltips.
- **📊 GeoIP Location & Punchcard Analytics**: Resolves countries, regions, and cities with background lookup fallbacks. Graphs hourly 24x7 traffic density matching the user's local timezone.
- **🎨 Modernized Card-less UI/UX**: Clean layout using shadcn UI components, progressive disclosure tabs, and sharp `rounded-md`/`rounded-sm` geometry.

---

## Quick Start (Local Development)

### Prerequisites

Ensure you have **Java 25**, **Go 1.22+**, **Bun** (or **Node.js**), and local/cloud database config.

### 1. Launch Backend API

```bash
cd server
cp .env.example .env   # configure environment variables
./gradlew bootRun      # runs on http://localhost:8080
```

### 2. Launch React Dashboard

```bash
cd client
bun install            # or npm install
bun run dev            # runs on http://localhost:5173 (proxied to :8080)
```

### 3. Launch Go WebAssembly Cloudflare Worker (Optional)

```bash
cd cloudflare-worker
bun run dev            # runs local Wrangler dev server on http://localhost:8787
```

---

## License

MIT — see [LICENSE](./LICENSE).
