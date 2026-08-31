# Shrtn Server — Spring Boot API Backend

The backend for [Shrtn](https://shrtn.fun). Deployed on **Render** at `shrtn.fun` — handles short-link redirects, 1-Click Smart Device Routing, click analytics, static Landing Page serving, user auth, and OTP emails.

---

## Stack

| | |
|---|---|
| Language | Java 25 |
| Framework | Spring Boot 4 |
| Auth | Spring Security + JWT (JJWT 0.12.6) |
| Database | PostgreSQL (Supabase) via Spring Data JPA |
| Cache | Redis (Upstash) via Spring Data Redis |
| Email | Resend API (`noreply@shrtn.fun`) via Java `HttpClient` |
| User-Agent parsing | `ua-parser` (`com.github.ua-parser:uap-java`) |

---

## System Components

### `controller/UrlController.java`
- Serves static Landing Page (`index.html`) on `GET /`
- Serves static vector assets (`logo.svg`, `world-map.svg`, `.js`, `.css`, `.ico`) with correct MIME types
- Handles 302 redirects for `/signin`, `/signup`, and `/dashboard/**` to `https://app.shrtn.fun`
- Executes shortcode redirects `GET /{code}` and dynamic QR Code generation (`?format=qr`)
- Redirects deleted, disabled, or expired links to `/` (root Landing Page) via HTTP 302

### `service/UrlService.java`
- Generates Base62 short codes from auto-incremented PostgreSQL IDs
- **1-Click Smart Device Routing**: Evaluates visitor `User-Agent` via `ua-parser` to route iOS visitors to `iosUrl`, Android visitors to `androidUrl`, and Desktop visitors to `originalUrl`
- On redirect: checks Redis → falls back to DB → caches the full URL snapshot → logs click in Postgres
- Caches `UrlCacheEntry` for redirect hot-path data and `UrlResponse[]` for per-user list views
- Evicts Redis keys on click, toggle, delete, and shorten where relevant

### `service/OtpService.java`
- Generates 6-digit OTPs linked to a user + purpose (`EMAIL_VERIFICATION` / `FORGOT_PASSWORD`)
- OTPs expire in **5 min** (verification) or **15 min** (reset)
- Sends emails via `ResendEmailService`

### `service/ResendEmailService.java`
- Calls the [Resend REST API](https://resend.com/docs/api-reference/emails/send-email) using Java's built-in `HttpClient` — no extra dependency
- Sends from `noreply@shrtn.fun`

### `security/`
- `JwtAuthenticationFilter` — intercepts requests, validates Bearer tokens, populates `SecurityContext`
- `JwtUtils` — token generation and validation (HMAC-SHA256)

---

## Caching Architecture (Redis)

| Key | Value | TTL | Eviction trigger |
|---|---|---|---|
| `url:{shortCode}` | Serialized `UrlCacheEntry` (`id`, `userId`, `originalUrl`, `iosUrl`, `androidUrl`, `isActive`, `expiresAt`) | 24h | Toggle off / Delete |
| `urls:{userId}` | Serialized `UrlResponse[]` for My Links / dashboard counts | Short TTL | Click / Shorten / Toggle / Delete |
| `analytics:{shortCode}` | Serialized analytics object | Until evicted | New click (evicted instantly in main thread + background resolver) / Delete |

---

## API Endpoints

All protected routes require `Authorization: Bearer <JWT_TOKEN>`.

### Public & Route Redirections

| Method | Path | Description | Result |
|---|---|---|---|
| `GET` | `/` | Serves public Landing Page | `200 OK` HTML |
| `GET` | `/signin` / `/login` | Redirect to Sign In | `302 Found` ➔ `https://app.shrtn.fun/signin` |
| `GET` | `/signup` / `/register` | Redirect to Sign Up | `302 Found` ➔ `https://app.shrtn.fun/signup` |
| `GET` | `/dashboard/**` | Redirect to Dashboard | `302 Found` ➔ `https://app.shrtn.fun/dashboard` |
| `GET` | `/{code}` | Short link redirect (or QR PNG if `?format=qr`) | `302 Found` to target URL / `/` if deleted |

### Auth — `/api/v1/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Register user, send email OTP |
| `POST` | `/verify-otp` | Verify OTP, receive JWT |
| `POST` | `/resend-otp` | Re-send OTP |
| `POST` | `/login` | Login, receive JWT |
| `POST` | `/forgot-password` | Send password reset OTP |
| `POST` | `/reset-password` | Reset password with OTP |

### Users — `/api/v1/users`

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/change-password` | Change password | Yes |

### URLs

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/shorten` | Create short link with optional `iosUrl` / `androidUrl` | Yes |
| `GET` | `/urls` | List user's links | Yes |
| `PATCH` | `/urls/{code}/toggle` | Enable / disable link | Yes |
| `DELETE` | `/urls/{code}` | Delete link + logs + cache | Yes |
| `GET` | `/urls/{code}/analytics` | Click analytics | Yes |
| `POST` | `/urls/{code}/qr` | Generate QR Code state | Yes |
| `DELETE` | `/urls/{code}/qr` | Revoke/disable QR Code state | Yes |

---

## Configuration

### `.env` (in `server/`)

```env
DB_URL=              # JDBC URL — e.g. jdbc:postgresql://...
DB_USERNAME=         # DB username
DB_PASSWORD=         # DB password
REDIS_HOST=          # Upstash Redis host
REDIS_PORT=          # Upstash Redis port (default 6379)
REDIS_PASSWORD=      # Upstash Redis password
JWT_SECRET=          # HMAC-SHA256 key (min 32 chars)
RESEND_API_KEY=      # Resend API key (re_...)
CORS_ALLOWED_ORIGINS=https://app.shrtn.fun
APP_DASHBOARD_URL=https://app.shrtn.fun
```

`application.properties` reads all values from env — no hardcoded secrets.

---

## Running Locally & Gradle Integration

```bash
cd server
cp .env.example .env   # fill in values
./gradlew bootRun      # builds frontend, copies dist to static, and starts on :8080
```

---

## Database Schema

```text
users
  id            bigint PK
  email         varchar(255) UNIQUE
  password      varchar(255)
  is_verified   boolean

urls
  id            bigint PK
  short_code    varchar(255) UNIQUE
  original_url  varchar(2048)
  ios_url       varchar(2048) NULLABLE
  android_url   varchar(2048) NULLABLE
  created_at    timestamp
  expires_at    timestamp
  is_active     boolean
  has_qr_code   boolean
  user_id       bigint FK → users.id

clicks
  id            bigint PK
  clicked_at    timestamp
  ip_address    varchar(45)
  user_agent    varchar(512)
  referrer      varchar(255)
  country       varchar(100)
  region        varchar(100)
  city          varchar(100)
  url_id        bigint FK → urls.id

otps
  id            bigint PK
  otp_code      varchar(6)
  purpose       varchar(255)
  created_at    timestamp
  expires_at    timestamp
  used_at       timestamp
  user_id       bigint FK → users.id
```
