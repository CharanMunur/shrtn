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

## Architecture Overview

1. **Redirect Path**: Public requests to `shrtn.fun/{shortCode}` bypass the React application, querying Upstash Redis first (24h cache) and falling back to Supabase PostgreSQL on misses. Clicks are logged with browser and OS analytics (using `ua-parser`), and the client is 302-redirected.
2. **QR Code Resolution**: Append `?format=qr` to any valid short URL to dynamically resolve, render, and download its QR code image directly from the backend.
3. **Caches**: Employs separate Redis caches for the redirect hot-path, user URL listings, and click analytics, with active invalidation strategies on writes.

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
