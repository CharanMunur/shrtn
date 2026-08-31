export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080"
}

export function getPublicShortUrlBase() {
  return import.meta.env.VITE_PUBLIC_SHORT_URL_BASE?.trim() || "http://localhost:8080"
}

export function getAppDashboardBaseUrl() {
  return import.meta.env.VITE_APP_DASHBOARD_URL?.trim() || "https://app.shrtn.fun"
}

