export type AuthResponse = {
  token: string
  message?: string
}

export type MessageResponse = {
  message: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest

export type VerifyOtpRequest = {
  email: string
  otpCode: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  email: string
  otpCode: string
  newPassword: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type UrlRequest = {
  originalUrl: string
  customCode?: string
  expiresAt?: string
  password?: string
  iosUrl?: string
  androidUrl?: string
}

export type UrlResponse = {
  shortUrl?: string
  shortCode?: string
  originalUrl?: string
  totalClicks: number
  isActive: boolean
  active?: boolean
  hasQrCode?: boolean
  isPasswordProtected?: boolean
  expiresAt: string
  createdAt?: string
  iosUrl?: string
  androidUrl?: string
}

export type UnlockRequest = {
  password: string
}

export type UnlockResponse = {
  targetUrl: string
}

export type ClickDetailDTO = {
  clickedAt: string
  ipAddress: string
  userAgent: string
}

export type UrlAnalyticsResponse = {
  shortCode: string
  originalUrl: string
  totalClicks: number
  lastClicks: ClickDetailDTO[]
  browserBreakdown: Record<string, number>
  osBreakdown: Record<string, number>
  clicksByDate: Record<string, number>
  referrerBreakdown: Record<string, number>
  deviceBreakdown: Record<string, number>
  countryBreakdown: Record<string, number>
  regionBreakdown: Record<string, number>
  cityBreakdown: Record<string, number>
  trafficHeatmap: number[][]
}
