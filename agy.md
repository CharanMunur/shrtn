# Shrtn Codebase Architecture & Technical Context

This document captures the technical context, architectural flows, database schemas, caching mechanics, and design patterns of the **Shrtn** platform.

---

## 1. System Architecture

```mermaid
graph TD
    Client[Client Browser] -->|shrtn.fun/code| CloudflareEdge[Cloudflare Edge Worker - Go Wasm]
    CloudflareEdge -->|1. Query Upstash REST| Redis[(Upstash Redis)]
    CloudflareEdge -->|2. Check Max Clicks & Expiry| Validate{Valid & Active?}
    Validate -->|No / Expired / Max Clicks| Deactivated[Redirect to 404 / Notice]
    Validate -->|Yes| DeviceRouting{iOS / Android / Desktop?}
    DeviceRouting -->|iOS Match| TargetIOS[iosUrl]
    DeviceRouting -->|Android Match| TargetAndroid[androidUrl]
    DeviceRouting -->|Default| TargetWeb[originalUrl]
    CloudflareEdge -->|3. Sub-20ms 302 Redirect| Client
    Client -->|Fallback / API| SpringBoot[Spring Boot Backend]
    SpringBoot -->|Record Click Async| DBWrite[PostgreSQL Clicks Table]
```

### 1.1 Redirection Flow & Smart Routing
1. **Public Edge Entry**: Public client redirects hit Cloudflare Edge Isolates running Go WebAssembly (`main.wasm`).
2. **Static & Auth Route Delegation**:
   - `/` $\rightarrow$ Serves or redirects to Landing Page.
   - `/signin`, `/signup`, `/dashboard/*` $\rightarrow$ Issues instant 302 redirects to `https://app.shrtn.fun/...`.
3. **Upstash Redis REST Querying**: Queries Upstash Redis REST endpoint (`/get/url:{shortCode}`).
4. **Auto-Destruct & Password Checking**:
   - If `maxClicks` is reached or `isActive` is `false`, returns deactivation notice.
   - If `isPasswordProtected` is `true`, redirects visitor to password unlock screen (`/unlock/{shortCode}`).
5. **Smart Device Routing**: Evaluates `User-Agent` header in Go Wasm:
   - **iOS** (`iPhone`, `iPad`, `iPod`): Redirects to `iosUrl` if set.
   - **Android**: Redirects to `androidUrl` if set.
   - **Default**: Redirects to `originalUrl`.
6. **Async Click Analytics Logging**: Spring Boot API records click entries (`clicked_at`, `ip_address`, `user_agent`, `country`, `region`, `city`) in PostgreSQL.

---

## 2. Database Schema

### `urls` Table
* `id` (bigint, PK)
* `short_code` (varchar(255), UNIQUE)
* `original_url` (varchar(2048))
* `ios_url` (varchar(2048), NULLABLE)
* `android_url` (varchar(2048), NULLABLE)
* `max_clicks` (integer, NULLABLE) — **Auto-Destruct limit**
* `created_at` (timestamp)
* `expires_at` (timestamp)
* `is_active` (boolean)
* `password_hash` (varchar(255), NULLABLE)
* `user_id` (bigint, FK → `users.id`)

---

## 3. Cloudflare Worker Edge Engine (`cloudflare-worker/`)

- **Language**: Go (Golang) 1.22
- **Compilation**: `GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o main.wasm main.go`
- **Bridge**: `index.js` instantiates `WebAssembly.instantiate(wasmModule, go.importObject)` and executes `globalThis.handleGoRedirect(...)`.
- **Latency**: Sub-20ms 302 redirects at Cloudflare's 300+ Edge locations.
