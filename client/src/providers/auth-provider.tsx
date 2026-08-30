import { createContext, useContext, useMemo, useState } from "react"

import { requestJson } from "@/lib/api"
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  MessageResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "@/types/api"

type AuthContextValue = {
  token: string | null
  email: string | null
  isHydrated: boolean
  login: (request: LoginRequest) => Promise<void>
  loginWithToken: (token: string, email: string) => void
  register: (request: RegisterRequest) => Promise<MessageResponse>
  verifyOtp: (email: string, otpCode: string) => Promise<void>
  resendOtp: (email: string) => Promise<MessageResponse>
  forgotPassword: (email: string) => Promise<MessageResponse>
  resetPassword: (request: ResetPasswordRequest) => Promise<MessageResponse>
  changePassword: (request: ChangePasswordRequest) => Promise<MessageResponse>
  logout: () => void
}

const TOKEN_STORAGE_KEY = "url-shortener-token"
const EMAIL_STORAGE_KEY = "url-shortener-email"

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [email, setEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem(EMAIL_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const isHydrated = true

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      email,
      isHydrated,
      login: async (request) => {
        const response = await requestJson<AuthResponse>("/api/v1/auth/login", {
          method: "POST",
          body: request,
        })

        localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
        localStorage.setItem(EMAIL_STORAGE_KEY, request.email)
        setToken(response.token)
        setEmail(request.email)
      },
      loginWithToken: (tokenVal, emailVal) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenVal)
        localStorage.setItem(EMAIL_STORAGE_KEY, emailVal)
        setToken(tokenVal)
        setEmail(emailVal)
      },
      register: async (request) => {
        const response = await requestJson<MessageResponse>("/api/v1/auth/register", {
          method: "POST",
          body: request,
        })

        localStorage.setItem(EMAIL_STORAGE_KEY, request.email)
        setEmail(request.email)
        return response
      },
      verifyOtp: async (emailVal, otpCode) => {
        const response = await requestJson<AuthResponse>("/api/v1/auth/verify-otp", {
          method: "POST",
          body: { email: emailVal, otpCode },
        })

        localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
        localStorage.setItem(EMAIL_STORAGE_KEY, emailVal)
        setToken(response.token)
        setEmail(emailVal)
      },
      resendOtp: async (emailVal) => {
        const response = await requestJson<MessageResponse>("/api/v1/auth/resend-otp", {
          method: "POST",
          body: { email: emailVal, password: "" },
        })
        return response
      },
      forgotPassword: async (emailVal) => {
        const response = await requestJson<MessageResponse>("/api/v1/auth/forgot-password", {
          method: "POST",
          body: { email: emailVal },
        })
        return response
      },
      resetPassword: async (request) => {
        const response = await requestJson<MessageResponse>("/api/v1/auth/reset-password", {
          method: "POST",
          body: request,
        })
        return response
      },
      changePassword: async (request) => {
        const response = await requestJson<MessageResponse>("/api/v1/users/change-password", {
          method: "POST",
          body: request,
          token,
        })
        return response
      },
      logout: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(EMAIL_STORAGE_KEY)
        setToken(null)
        setEmail(null)
      },
    }),
    [email, isHydrated, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
