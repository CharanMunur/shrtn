# Shrtn — Production-Grade URL Shortener

A fast, full-stack URL shortener with click analytics, OTP-based authentication, a Redis-backed redirect engine, and dynamic QR Code generation. 

## Live Services

- **Frontend App**: [app.shrtn.fun](https://app.shrtn.fun) (Vercel)
- **API & Short Links**: [shrtn.fun](https://shrtn.fun) (Render)

---

## Directory Structure

This repository is organized as a monorepo:

- **[client/](./client)**: React 19 + Vite frontend. Features clean modern dashboard styling with Tailwind CSS v4, Framer Motion page transitions, Recharts analytics, and dynamic QR Code actions. See the [Client README](./client/README.md) for details.
- **[server/](./server)**: Java 25 + Spring Boot 4 REST API. Backed by PostgreSQL (Supabase), Upstash Redis caching, and the Resend API for transactional email verification. See the [Server README](./server/README.md) for details.

---

## Key Features

- **Social Authentication (Google & GitHub)**: Integrated credentials-free login and signup with secure authorization flows, client-side callback redirection, and auto-linking for matching email accounts.
- **Fast Redis Redirects**: Redirection engine backed by Upstash Redis (24h caching) with fallbacks to Supabase PostgreSQL.
- **Interactive Vector World Map**: Visualizes click density instantly across country boundaries using a lightweight, self-contained, offline-first vector map, complete with hover highlighting and custom floating tooltips matching the Recharts popover style.
- **GeoIP Location Tracking**: Resolves countries, regions, and cities using background lookup fallbacks to `ip-api.com` and proxy header extractions. Includes loopback client geolocation during local development tests.
- **24x7 Traffic Activity Heatmap**: Custom punchcard visualizer graphing hourly click density across all days of the week, with modernized popover-style hover tooltips adjusted dynamically to match the client's local timezone.
- **Offline-First SVG Icon Assets**: Serves clean browser, operating system, traffic referrer, and device icons directly from the local `/icons/` public folder, avoiding CDN request latency or network failures.
- **Dicebear Notionists Avatars**: Generates unique, highly-styled human avatars dynamically for the "Recent Clicks" feed, utilizing the visitor's IP address as a persistent random seed.
- **Umami-Style Dashboard Panels**: Simplified, highly-organized layout with clean normal-casing headers, bottom active-border indicators, and bottom footer maximize buttons:
  - *Environment*: Browsers, OS Types, and Devices.
  - *Location*: Countries, Regions, and Cities (with dynamic country flag icons shown for regions and cities).
- **Maximized Modals**: Click a card's footer "More" button to expand the tab into a spacious `max-w-4xl` dialog showing up to 100 detailed entries.
- **Dynamic QR Code Actions**: Downloadable SVG QR Codes resolved instantly by appending `?format=qr` to shortened links.
- **Reduced Roundness Styling**: Clean, modern, unified layout using sharp `rounded-lg` cards, modals, and elements for a polished user interface.
- **Transactional Auth**: OTP security verified via Resend email delivery.

---

## Architecture Overview

1. **Redirect Path**: Public requests to `shrtn.fun/{shortCode}` bypass the React application, querying Upstash Redis first (24h cache) and falling back to Supabase PostgreSQL on misses. Clicks are logged with browser, OS, and country analytics, and the client is 302-redirected.
2. **QR Code Resolution**: Append `?format=qr` to any valid short URL to dynamically resolve, render, and download its QR code image directly from the backend.
3. **Caches**: Employs separate Redis caches for the redirect hot-path, user URL listings, and click analytics, with active invalidation strategies on writes. Evicts click analytics caches instantly on redirect to ensure zero-lag click updates on the dashboard, combined with async geocoding updates.

---

## Quick Start (Local Development)

### Prerequisites

Ensure you have **Java 25**, **Bun** (or **Node.js**), and a local/cloud database config.

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

---

## License

MIT — see [LICENSE](./LICENSE).
