import { requestJson, requestVoid } from "@/lib/api"
import type { UrlAnalyticsResponse, UrlRequest, UrlResponse } from "@/types/api"

export async function createShortUrl(
  request: UrlRequest,
  token?: string
): Promise<UrlResponse> {
  return requestJson<UrlResponse>("/shorten", {
    method: "POST",
    body: request,
    token,
  })
}

export async function getUserUrls(token: string): Promise<UrlResponse[]> {
  return requestJson<UrlResponse[]>("/urls", {
    method: "GET",
    token,
  })
}

// Server returns boolean (the new active state), not UrlResponse
export async function toggleUrl(
  shortCode: string,
  token: string
): Promise<boolean> {
  return requestJson<boolean>(`/urls/${shortCode}/toggle`, {
    method: "PATCH",
    token,
  })
}

export async function deleteUrl(
  shortCode: string,
  token: string
): Promise<void> {
  return requestVoid(`/urls/${shortCode}`, {
    method: "DELETE",
    token,
  })
}

export async function getUrlAnalytics(
  shortCode: string,
  token: string
): Promise<UrlAnalyticsResponse> {
  return requestJson<UrlAnalyticsResponse>(`/urls/${shortCode}/analytics`, {
    method: "GET",
    token,
  })
}

export async function generateQrCodeApi(
  shortCode: string,
  token: string
): Promise<boolean> {
  return requestJson<boolean>(`/urls/${shortCode}/qr`, {
    method: "POST",
    token,
  })
}

export async function revokeQrCodeApi(
  shortCode: string,
  token: string
): Promise<boolean> {
  return requestJson<boolean>(`/urls/${shortCode}/qr`, {
    method: "DELETE",
    token,
  })
}
