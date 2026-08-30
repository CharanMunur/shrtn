import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { ApiError } from "@/lib/api"
import { ModeToggle } from "@/features/theme/mode-toggle"
import { toast } from "sonner"


type Tab = "login" | "register" | "verify" | "forgot" | "reset"

interface AuthScreenProps {
  initialTab?: Tab
}

export function AuthScreen({ initialTab = "login" }: AuthScreenProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword } = useAuth()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  useEffect(() => {
    const err = searchParams.get("error")
    if (err) {
      setError(decodeURIComponent(err))
    }
  }, [searchParams])

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
    const redirectUri = window.location.origin + "/oauth/callback/google"
    const scope = "email profile openid"
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`
    window.location.href = authUrl
  }

  const handleGitHubSignIn = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || ""
    const redirectUri = window.location.origin + "/oauth/callback/github"
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
    window.location.href = authUrl
  }

  useEffect(() => {
    if (initialTab && initialTab !== "verify" && initialTab !== "forgot" && initialTab !== "reset") {
      setTab(initialTab)
      setError("")
      setInfoMessage("")
    }
  }, [initialTab])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (tab === "verify") {
      if (!email.trim() || !otpCode.trim()) {
        setError("Email and verification code are required.")
        return
      }
      setIsLoading(true)
      setError("")
      try {
        await verifyOtp(email.trim(), otpCode.trim())
        toast.success("Account verified! Welcome to shrtn.")
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Verification failed.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (tab === "forgot") {
      if (!email.trim()) {
        setError("Email is required.")
        return
      }
      setIsLoading(true)
      setError("")
      setInfoMessage("")
      try {
        const res = await forgotPassword(email.trim())
        toast.success(res.message || "OTP code sent to email.")
        setInfoMessage(res.message || "OTP code sent to email.")
        setTab("reset")
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to send reset code.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (tab === "reset") {
      if (!email.trim() || !otpCode.trim() || !newPassword.trim()) {
        setError("All fields are required.")
        return
      }
      if (newPassword !== confirmNewPassword) {
        setError("Passwords do not match.")
        return
      }
      setIsLoading(true)
      setError("")
      setInfoMessage("")
      try {
        const res = await resetPassword({
          email: email.trim(),
          otpCode: otpCode.trim(),
          newPassword,
        })
        toast.success(res.message || "Password reset successful.")
        setInfoMessage(res.message || "Password reset successful.")
        setTab("login")
        setPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        setOtpCode("")
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Password reset failed.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.")
      return
    }
    setIsLoading(true)
    setError("")
    setInfoMessage("")
    try {
      if (tab === "login") {
        await login({ email: email.trim(), password })
        toast.success("Successfully logged in!")
      } else {
        const res = await register({ email: email.trim(), password })
        toast.success(res.message || "Verification code sent. Please check your inbox.")
        setInfoMessage(res.message || "Verification code sent. Please check your inbox.")
        setTab("verify")
      }
    } catch (err) {
      const errMsg = err instanceof ApiError ? err.message : "Something went wrong."
      setError(errMsg)
      if (errMsg.toLowerCase().includes("verify") || errMsg.toLowerCase().includes("verification")) {
        setTab("verify")
        setInfoMessage(errMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      setError("Email is required to resend verification code.")
      return
    }
    setIsResending(true)
    setError("")
    setInfoMessage("")
    try {
      const res = await resendOtp(email.trim())
      setInfoMessage(res.message || "Verification code resent. Please check your inbox.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend code.")
    } finally {
      setIsResending(false)
    }
  }

  function switchTab(next: "login" | "register") {
    setTab(next)
    navigate(next === "login" ? "/signin" : "/signup")
    setError("")
    setInfoMessage("")
    setOtpCode("")
    setEmail("")
    setPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
  }

  const isOtpFlow = tab === "verify" || tab === "reset"
  const isSwitcherVisible = tab !== "verify" && tab !== "forgot" && tab !== "reset"

  const title = (() => {
    if (tab === "login") return "Welcome back"
    if (tab === "register") return "Create an account"
    if (tab === "verify") return "Verify your email"
    if (tab === "forgot") return "Forgot password?"
    return "Reset password"
  })()

  const description = (() => {
    if (tab === "login") return "Sign in to manage your short links"
    if (tab === "register") return "Start shortening URLs for free"
    if (tab === "verify") return "Enter the 6-digit code sent to your inbox"
    if (tab === "forgot") return "Enter your email to receive a password reset code"
    return "Enter code and choose a new password"
  })()

  return (
    <div className="min-h-screen w-screen bg-background grid md:grid-cols-2 relative overflow-hidden">
      {/* Left Column: Form Container */}
      <div className="flex flex-col justify-center items-center h-full w-full p-6 sm:p-10 md:p-16 bg-background relative">
        {/* Floating Back Button */}
        <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Floating Theme Switcher inside the left section */}
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <ModeToggle />
        </div>

        <div className="w-full max-w-sm flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            
            {/* Title & Header */}
            <div className="flex flex-col gap-2 text-center mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Tab switcher */}
            {isSwitcherVisible && (
              <div className="flex rounded-lg bg-muted p-1">
                {(["login", "register"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => switchTab(t)}
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all cursor-pointer ${
                      tab === t
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "login" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || tab === "verify" || tab === "reset"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted/40"
                />
              </div>

              {isOtpFlow && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-otp"
                    className="text-sm font-medium text-foreground"
                  >
                    Verification Code
                  </label>
                  <input
                    id="auth-otp"
                    type="text"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                    className="w-full text-center tracking-[0.75em] text-lg font-mono rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  />
                </div>
              )}

              {tab === "login" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="auth-password"
                      className="text-sm font-medium text-foreground"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot")
                        setError("")
                        setInfoMessage("")
                      }}
                      className="text-xs text-primary hover:underline cursor-pointer bg-transparent border-0 p-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0 p-0"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {tab === "register" && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0 p-0"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {tab === "reset" && (
                <>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="auth-new-password"
                      className="text-sm font-medium text-foreground"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="auth-new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0 p-0"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="auth-confirm-new-password"
                      className="text-sm font-medium text-foreground"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="auth-confirm-new-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                  </div>
                </>
              )}
            </div>

            {infoMessage && (
              <div className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2 text-sm text-primary">
                {infoMessage}
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {tab === "login"
                ? "Sign in"
                : tab === "register"
                  ? "Create account"
                  : tab === "verify"
                    ? "Verify & Sign in"
                    : tab === "forgot"
                      ? "Send Reset Code"
                      : "Reset Password"}
            </button>

            {/* Social Divider & Actions */}
            {(tab === "login" || tab === "register") && (
              <>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Or continue with</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGitHubSignIn}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>
              </>
            )}

            {tab === "verify" && (
              <div className="text-center text-xs">
                <span className="text-muted-foreground">Didn't receive the code? </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || isLoading}
                  className="underline text-primary hover:text-primary/80 font-medium disabled:opacity-50 cursor-pointer bg-transparent border-0 p-0"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </div>
            )}

            {isSwitcherVisible ? (
              <p className="text-center text-xs text-muted-foreground">
                {tab === "login" ? "Don't have an account? " : "Already have one? "}
                <button
                  type="button"
                  onClick={() => switchTab(tab === "login" ? "register" : "login")}
                  className="underline hover:text-foreground cursor-pointer bg-transparent border-0 p-0"
                >
                  {tab === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login")
                    setError("")
                    setInfoMessage("")
                    setOtpCode("")
                    setEmail("")
                    setPassword("")
                    setNewPassword("")
                    setConfirmNewPassword("")
                  }}
                  className="underline hover:text-foreground cursor-pointer bg-transparent border-0 p-0"
                >
                  Back to Sign in
                </button>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Right Column: Custom 181818 Logo Area */}
      <div className="relative hidden bg-[#181818] md:flex flex-col items-center justify-center p-12 select-none h-full w-full">
        <img 
          src="/logo.svg" 
          className="w-3/4 h-auto invert shrink-0 select-none" 
          alt="shrtn logo" 
        />
      </div>
    </div>
  )
}
