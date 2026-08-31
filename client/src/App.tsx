import { useEffect, useState, useCallback } from "react"
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"
import { AuthProvider, useAuth } from "@/providers/auth-provider"
import { AuthScreen } from "@/components/auth-screen"
import { DashboardShell } from "@/components/dashboard-shell"
import { LandingPage } from "@/pages/LandingPage"
import { OAuthCallback } from "@/pages/OAuthCallback"
import { Loader2, Lock, Eye, EyeOff, AlertTriangle, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { unlockShortUrl } from "@/lib/urls-api"
import { ApiError } from "@/lib/api"

import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppRoutes() {
  const { token, isHydrated } = useAuth()

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route
        path="/signin"
        element={token ? <Navigate to="/dashboard" replace /> : <AuthScreen initialTab="login" />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/dashboard" replace /> : <AuthScreen initialTab="register" />}
      />
      <Route
        path="/oauth/callback/:provider"
        element={token ? <Navigate to="/dashboard" replace /> : <OAuthCallback />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard/*"
        element={token ? <DashboardShell /> : <Navigate to="/signin" replace />}
      />

      {/* Public Shortcode Redirect Handler */}
      <Route path="/:shortCode" element={<RedirectHandler />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RedirectHandler() {
  const { shortCode } = useParams()
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const attemptUnlock = useCallback(async (pass?: string) => {
    if (!shortCode) return
    setIsSubmitting(true)
    setError("")
    try {
      const res = await unlockShortUrl(shortCode, pass)
      if (res && res.targetUrl) {
        window.location.href = res.targetUrl
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to process link"
      if (msg.includes("Password required")) {
        setRequiresPassword(true)
      } else {
        setError(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [shortCode])

  useEffect(() => {
    if (shortCode) {
      const reserved = ["signin", "signup", "dashboard"]
      if (reserved.includes(shortCode.toLowerCase())) {
        return
      }
      attemptUnlock()
    }
  }, [shortCode, attemptUnlock])

  const reserved = ["signin", "signup", "dashboard"]
  if (shortCode && reserved.includes(shortCode.toLowerCase())) {
    return <Navigate to={`/${shortCode}`} replace />
  }

  if (requiresPassword) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-sm border border-border/80 bg-card p-6 shadow-md space-y-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Password Protected Link</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                /{shortCode}
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              attemptUnlock(password)
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password to access"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  className="w-full rounded-sm border border-input bg-background pl-3 pr-9 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-sm bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full text-xs font-semibold rounded-sm gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Unlocking…
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  Unlock & Continue
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-sm border border-destructive/20 bg-card p-6 shadow-md space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold">Link Error</h2>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2 text-sm">Redirecting…</span>
    </div>
  )
}

export default App
