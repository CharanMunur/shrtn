import { getPublicShortUrlBase } from "@/lib/env"
import type { UrlResponse } from "@/types/api"

export type EnrichedUrl = UrlResponse & { shortCode: string; shortUrl: string }

export function enrichUrls(urls: UrlResponse[]): EnrichedUrl[] {
  return urls.map((u) => {
    let shortUrl = ""
    if (u.shortUrl && u.shortUrl.includes("http")) {
      shortUrl = u.shortUrl
    } else if (u.shortCode && u.shortCode.includes("http")) {
      shortUrl = u.shortCode
    } else {
      const code = u.shortCode || u.shortUrl || ""
      if (code) {
        shortUrl = buildShortUrl(code)
      }
    }

    let shortCode = shortUrl ? extractShortCode(shortUrl) : ""
    if (!shortCode) {
      shortCode = u.shortCode || u.shortUrl || ""
    }

    const active = u.isActive !== undefined ? u.isActive : u.active
    return {
      ...u,
      shortUrl,
      shortCode,
      isActive: !!active,
    }
  })
}

export function buildShortUrl(shortCode: string) {
  const base = getPublicShortUrlBase().replace(/\/$/, "")
  return `${base}/${shortCode}`
}

export function extractShortCode(shortUrl: string | null | undefined): string {
  if (!shortUrl) return ""
  try {
    const parsed = new URL(shortUrl)
    const segments = parsed.pathname.split("/").filter(Boolean)
    return segments.at(-1) ?? ""
  } catch {
    try {
      const segments = shortUrl.split("/").filter(Boolean)
      return segments.at(-1) ?? ""
    } catch {
      return ""
    }
  }
}

export function safeDate(value: string | Date) {
  if (typeof value === "string") {
    let dateStr = value.trim()
    // If it's an ISO string without timezone indicator, append Z to treat as UTC
    if (dateStr.includes("T") && !dateStr.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(dateStr)) {
      dateStr = dateStr + "Z"
    }
    const date = new Date(dateStr)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return Number.isNaN(value.getTime()) ? null : value
}

export function formatDateTime(value: string | Date) {
  const date = safeDate(value)
  if (!date) {
    return "Unknown"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function formatRelativeTime(value: string | Date) {
  const date = safeDate(value)
  if (!date) {
    return "Unknown"
  }

  const diff = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const absSeconds = Math.round(Math.abs(diff) / 1000)

  if (absSeconds < 60) {
    return formatter.format(Math.sign(diff) * absSeconds, "second")
  }

  const absMinutes = Math.round(absSeconds / 60)
  if (absMinutes < 60) {
    return formatter.format(Math.sign(diff) * absMinutes, "minute")
  }

  const absHours = Math.round(absMinutes / 60)
  if (absHours < 24) {
    return formatter.format(Math.sign(diff) * absHours, "hour")
  }

  const absDays = Math.round(absHours / 24)
  return formatter.format(Math.sign(diff) * absDays, "day")
}
