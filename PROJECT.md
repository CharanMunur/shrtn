# Shrtn — Project Context Document

> A full-stack, production-grade URL shortener with click analytics, OTP-based authentication, Redis caching, Go WebAssembly edge redirects, and transactional email — built with React, Spring Boot, and Go Wasm, deployed across Vercel, Render, and Cloudflare.

---

## 1. What Is Shrtn?

Shrtn is a URL shortening service. A user pastes a long URL into the dashboard, optionally configures custom aliases, expiration periods, auto-destruct click limits (`maxClicks`), or iOS/Android device redirects, and gets a short Base62 code (e.g. `xK9mPq`). When visitors click `shrtn.fun/xK9mPq`, the request is handled by Cloudflare Edge Isolates (Go Wasm) or the backend, fetching link metadata from Upstash Redis, logging analytics, and performing a sub-20ms 302 redirect.

Users get a full dashboard to manage their links: toggle on/off, track auto-destruct click progress (`🔥 X / N`), delete links, and view per-link click analytics.

---

## 2. Live Deployment

| Service | URL | Platform |
|---|---|---|
| Frontend / Dashboard | [app.shrtn.fun](https://app.shrtn.fun) | Vercel |
| Short link redirects & API | [shrtn.fun](https://shrtn.fun) | Render & Cloudflare Edge |
| Edge Redirection Engine | `shrtn-go-edge-redirector` | Cloudflare Workers (Go Wasm) |
| Transactional email | `noreply@shrtn.fun` | Resend |

---

## 3. Tech Stack

### Frontend
| Technology | Role |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety across components and API types |
| Vite | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| shadcn UI | UI primitives (Tabs, Card, Input, Button, Badge) |
| Framer Motion | Page transition animations |
| Recharts | Analytics charts |
| React Router v7 | Client-side routing |
| Bun | Package manager / script runner |

### Backend & Edge Engine
| Technology | Role |
|---|---|
| Java 25 | Spring Boot 4 REST API language |
| Go (Golang) 1.22 | WebAssembly Edge Redirector language (`GOOS=js GOARCH=wasm`) |
| WebAssembly (`main.wasm`) | Edge compiled binary running on Cloudflare V8 Isolates |
| Cloudflare Workers | Sub-20ms global edge network |
| Spring Security | Filter chain, JWT authentication, CORS |
| Spring Data JPA | ORM layer over PostgreSQL |
| Upstash Redis REST | Redis cache client for Go Wasm Edge engine |
| Resend | Transactional email delivery |
| Gradle | Java build system |

---

## 4. Architecture

### 4.1 Repository Structure

```
shrtn/                        ← monorepo root
├── client/                   ← React frontend (Vite)
├── server/                   ← Spring Boot API backend
├── cloudflare-worker/        ← Go WebAssembly Cloudflare Worker engine
│   ├── main.go               ← Go source code for edge redirection
│   ├── main.wasm             ← Compiled WebAssembly binary
│   ├── index.js              ← JS Wasm bridge for Cloudflare Workers
│   ├── wasm_exec.js          ← Go Wasm runtime bridge
│   ├── wrangler.jsonc        ← Cloudflare Wrangler configuration
│   └── package.json
├── agy.md                    ← Technical Context & Architecture
├── PROJECT.md                ← Project Context Document
└── README.md
```

---

## 5. Database Schema

```
users
  id             BIGINT        PK, auto-increment
  email          VARCHAR(255)  UNIQUE, NOT NULL
  password       VARCHAR(255)  BCrypt hashed
  is_verified    BOOLEAN       default false

urls
  id             BIGINT        PK, auto-increment
  short_code     VARCHAR(255)  UNIQUE (Base62 of id)
  original_url   VARCHAR(2048)
  ios_url        VARCHAR(2048) NULLABLE (iOS Smart Routing)
  android_url    VARCHAR(2048) NULLABLE (Android Smart Routing)
  max_clicks     INTEGER       NULLABLE (Auto-Destruct limit)
  created_at     TIMESTAMP
  expires_at     TIMESTAMP     +30 days default
  is_active      BOOLEAN       default true
  user_id        BIGINT        FK → users.id

clicks
  id             BIGINT        PK, auto-increment
  clicked_at     TIMESTAMP
  ip_address     VARCHAR(255)
  user_agent     VARCHAR(255)
  country        VARCHAR(100)
  region         VARCHAR(100)
  city           VARCHAR(100)
  url_id         BIGINT        FK → urls.id
```
