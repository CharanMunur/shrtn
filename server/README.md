# Shrtn Server — Spring Boot API Backend

The backend for [Shrtn](https://shrtn.fun). Deployed on **Render** at `shrtn.fun` — handles short-link redirects, click analytics, user auth, and OTP emails.

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

### `service/UrlService.java`
- Generates Base62 short codes from auto-incremented PostgreSQL IDs
- On redirect: checks Redis → falls back to DB → caches the full URL snapshot → logs the click in Postgres
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
| `url:{shortCode}` | Serialized `UrlCacheEntry` (`id`, `userId`, `originalUrl`, `isActive`, `expiresAt`) | 24h | Toggle off / Delete |
| `urls:{userId}` | Serialized `UrlResponse[]` for My Links / dashboard counts | Short TTL | Click / Shorten / Toggle / Delete |
| `analytics:{shortCode}` | Serialised analytics object | Until evicted | New click / Delete |

---

## API Endpoints

All protected routes require `Authorization: Bearer <JWT_TOKEN>`.

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
| `POST` | `/shorten` | Create short link (max 25/user) | Yes |
| `GET` | `/urls` | List user's links | Yes |
| `PATCH` | `/urls/{code}/toggle` | Enable / disable link | Yes |
| `DELETE` | `/urls/{code}` | Delete link + logs + cache | Yes |
| `GET` | `/urls/{code}/analytics` | Click analytics | Yes |
| `GET` | `/{code}` | Public redirect (302) | No |

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
```

`application.properties` reads all values from env — no hardcoded secrets.

---

## Running Locally

```bash
cd server
cp .env.example .env   # fill in values
./gradlew bootRun      # starts on :8080
```

## Dockerfile

A `Dockerfile` is included for containerised deployments. Render uses it directly via the `Dockerfile` at the repo root (server directory).

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
  created_at    timestamp
  expires_at    timestamp
  is_active     boolean
  user_id       bigint FK → users.id

clicks
  id            bigint PK
  clicked_at    timestamp
  ip_address    varchar(255)
  user_agent    varchar(255)
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
