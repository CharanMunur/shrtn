# Shrtn Client — React Frontend

The React web app for [Shrtn](https://app.shrtn.fun). Deployed on **Vercel** at `app.shrtn.fun`.

## Features

- **Auth flows** — sign-up, email OTP verification, login, forgot/reset password
- **1-Click Smart Device Routing** — configure targeted destination URLs for **iOS** (App Store) and **Android** (Google Play Store) visitors alongside the main link
- **Dashboard** — overview stats, recent links, click totals
- **My Links** — management table with toggle, copy, delete, analytics, and QR overlay per link
- **QR Codes** — dedicated dashboard grid to enable/disable QR codes and download high-resolution PNGs
- **Shorten page** — paste a URL, set custom aliases, target iOS/Android devices, and get a `shrtn.fun/{code}` link instantly
- **Landing Page Navigation** — direct navigation buttons pointing to `app.shrtn.fun/signin`, `app.shrtn.fun/signup`, and `app.shrtn.fun/dashboard`
- **Analytics** — Browsers, OS, devices, countries, regions, and cities breakdowns, featuring:
  - An **Interactive Vector World Map** visualizing click densities with floating hover popover tooltips.
  - Parent country flags rendered dynamically inline next to region and city breakdowns.
  - Click timeline graphs (Recharts).
  - Traffic Activity heatmaps with popover tooltips.
- **Modern UI Styling** — Unified sharp `rounded-lg` cards, modals, and elements.
- **Theme** — light / dark / system toggle, persisted to localStorage
- **Responsive** — desktop sidebar + mobile slide-out drawer
- **Animations** — page transitions via Framer Motion
- **Analytics tracking** — Umami script embedded in `index.html`

---

## Stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Routing | React Router v7 |
| Package manager | Bun (also compatible with npm) |

---

## Directory Layout

```text
src/
├── components/
│   ├── ui/                   # Reusable atomic UI primitives (button, switch, etc.)
│   ├── auth-screen.tsx       # Sign-in, sign-up, OTP verification, password reset
│   ├── dashboard-shell.tsx   # Sidebar shell + nested routing
│   └── WorldMap.tsx          # Interactive SVG world map component with hover tooltips
├── lib/
│   ├── api.ts                # Fetch wrapper with auth headers & error handling
│   ├── urls-api.ts           # Typed API functions (shorten, list, toggle, delete, analytics)
│   ├── url.ts                # URL enrichment, short URL builder, date helpers
│   └── env.ts                # VITE_* env var accessors
├── pages/
│   ├── LandingPage.tsx       # Public marketing page with direct app.shrtn.fun routing
│   ├── DashboardPage.tsx     # Overview stats + quick actions
│   ├── ShortenPage.tsx       # Form with usage limit, Smart Device Routing inputs, and QR dialog
│   ├── MyLinksPage.tsx       # Full link management table with copy, edit, delete, and QR modal
│   ├── QrCodesPage.tsx       # QR code management dashboard (generate, revoke, download)
│   ├── AnalyticsPage.tsx     # Per-link click analytics with charts
│   ├── SettingsPage.tsx      # Change password
│   └── PersonalInfoPage.tsx  # Profile info
├── providers/
│   ├── auth-provider.tsx     # JWT session context (localStorage hydration)
│   └── theme-provider.tsx    # Theme context wrapper
├── App.tsx                   # Root router + RedirectHandler (shrtn.fun/code fallback)
└── main.tsx                  # Entry point
```

---

## Environment Variables

Create `client/.env` in the client directory:

```env
VITE_API_BASE_URL=https://shrtn.fun           # Render backend API URL
VITE_PUBLIC_SHORT_URL_BASE=https://shrtn.fun  # Base URL used for public links display
VITE_APP_DASHBOARD_URL=https://app.shrtn.fun   # Base URL for auth/dashboard web app
VITE_GOOGLE_CLIENT_ID=your-google-client-id   # Google OAuth App Client ID
VITE_GITHUB_CLIENT_ID=your-github-client-id   # GitHub OAuth App Client ID
```

For local development, `VITE_API_BASE_URL` and `VITE_PUBLIC_SHORT_URL_BASE` fallback to `http://localhost:8080`.

---

## Redirect Architecture

When a user visits `app.shrtn.fun/{code}`, the `RedirectHandler` in `App.tsx` fires and bounces the browser to `shrtn.fun/{code}` (the Render backend), which registers the click, evaluates 1-Click Smart Device Routing, and performs the final 302 redirect.

---

## Local Development

```bash
bun install
bun run dev
```

## Production Build

```bash
bun run build
# output → dist/
```

Deployed automatically on Vercel on every push to `master`. The `client/vercel.json` sets:
- `buildCommand: npm run build`
- `outputDirectory: dist`
- SPA catch-all rewrite to `/index.html` (fixes 404 on refresh)
