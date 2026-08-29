import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { ApiError } from "@/lib/api"
import { ModeToggle } from "@/features/theme/mode-toggle"
import { Card, CardContent } from "@/components/ui/card"

type Tab = "login" | "register" | "verify" | "forgot" | "reset"

interface AuthScreenProps {
  initialTab?: Tab
}

export function AuthScreen({ initialTab = "login" }: AuthScreenProps) {
  const navigate = useNavigate()
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
      } else {
        const res = await register({ email: email.trim(), password })
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="290 515 705 220" className="w-3/4 h-auto text-white">
          <g fill="currentColor">
            <path d="M 631.00 617.00 C 625.17 617.00 603.50 616.67 596.00 617.00 C 588.50 617.33 589.67 617.83 586.00 619.00 C 582.33 620.17 578.50 621.00 574.00 624.00 C 569.50 627.00 562.50 633.17 559.00 637.00 C 555.50 640.83 554.67 643.17 553.00 647.00 C 551.33 650.83 549.67 646.17 549.00 660.00 C 548.33 673.83 549.00 718.33 549.00 730.00 L 567.00 730.00 C 567.00 719.67 566.50 680.33 567.00 668.00 C 567.50 655.67 568.67 659.33 570.00 656.00 C 571.33 652.67 572.83 650.50 575.00 648.00 C 577.17 645.50 580.17 642.83 583.00 641.00 C 585.83 639.17 584.00 637.67 592.00 637.00 C 600.00 636.33 624.50 637.00 631.00 637.00 L 631.00 617.00 Z"/>
            <path d="M 742.00 730.00 L 760.00 730.00 C 760.00 719.17 759.17 678.33 760.00 665.00 C 760.83 651.67 762.33 654.33 765.00 650.00 C 767.67 645.67 773.17 641.33 776.00 639.00 C 778.83 636.67 778.67 636.83 782.00 636.00 C 785.33 635.17 790.67 634.17 796.00 634.00 C 801.33 633.83 810.00 634.50 814.00 635.00 C 818.00 635.50 816.67 634.67 820.00 637.00 C 823.33 639.33 831.00 645.67 834.00 649.00 C 837.00 652.33 837.00 654.00 838.00 657.00 C 839.00 660.00 839.67 654.83 840.00 667.00 C 840.33 679.17 840.00 719.50 840.00 730.00 L 858.00 730.00 C 858.00 718.00 859.17 673.17 858.00 658.00 C 856.83 642.83 854.17 644.33 851.00 639.00 C 847.83 633.67 843.00 629.33 839.00 626.00 C 835.00 622.67 830.83 620.67 827.00 619.00 C 823.17 617.33 823.17 616.50 816.00 616.00 C 808.83 615.50 792.17 615.00 784.00 616.00 C 775.83 617.00 772.50 618.67 767.00 622.00 C 761.50 625.33 754.67 631.83 751.00 636.00 C 747.33 640.17 746.67 642.33 745.00 647.00 C 743.33 651.67 741.50 650.17 741.00 664.00 C 740.50 677.83 741.83 719.00 742.00 730.00 Z"/>
            <path d="M 306.00 701.00 L 295.00 716.00 C 297.83 717.83 305.50 724.33 312.00 727.00 C 318.50 729.67 326.00 731.33 334.00 732.00 C 342.00 732.67 352.83 732.17 360.00 731.00 C 367.17 729.83 372.50 727.50 377.00 725.00 C 381.50 722.50 384.50 719.50 387.00 716.00 C 389.50 712.50 391.17 708.17 392.00 704.00 C 392.83 699.83 393.17 695.33 392.00 691.00 C 390.83 686.67 387.50 681.17 385.00 678.00 C 382.50 674.83 380.00 673.67 377.00 672.00 C 374.00 670.33 375.50 670.00 367.00 668.00 C 358.50 666.00 334.33 662.33 326.00 660.00 C 317.67 657.67 318.67 656.67 317.00 654.00 C 315.33 651.33 314.83 647.00 316.00 644.00 C 317.17 641.00 320.50 637.83 324.00 636.00 C 327.50 634.17 332.83 633.50 337.00 633.00 C 341.17 632.50 344.67 632.50 349.00 633.00 C 353.33 633.50 358.17 634.00 363.00 636.00 C 367.83 638.00 375.50 643.50 378.00 645.00 L 389.00 629.00 C 386.00 627.33 377.17 621.33 371.00 619.00 C 364.83 616.67 359.17 615.67 352.00 615.00 C 344.83 614.33 334.83 613.83 328.00 615.00 C 321.17 616.17 315.33 619.50 311.00 622.00 C 306.67 624.50 304.50 626.33 302.00 630.00 C 299.50 633.67 296.83 639.67 296.00 644.00 C 295.17 648.33 296.00 652.33 297.00 656.00 C 298.00 659.67 299.50 663.00 302.00 666.00 C 304.50 669.00 309.00 672.17 312.00 674.00 C 315.00 675.83 311.33 675.00 320.00 677.00 C 328.67 679.00 355.33 683.33 364.00 686.00 C 372.67 688.67 370.50 690.33 372.00 693.00 C 373.50 695.67 374.00 699.17 373.00 702.00 C 372.00 704.83 368.50 708.17 366.00 710.00 C 363.50 711.83 363.00 712.33 358.00 713.00 C 353.00 713.67 342.33 714.50 336.00 714.00 C 329.67 713.50 325.00 712.17 320.00 710.00 C 315.00 707.83 308.33 702.50 306.00 701.00 Z"/>
            <path d="M 651.00 586.00 C 651.00 603.00 650.50 668.83 651.00 688.00 C 651.50 707.17 652.00 696.33 654.00 701.00 C 656.00 705.67 658.83 711.67 663.00 716.00 C 667.17 720.33 674.33 724.67 679.00 727.00 C 683.67 729.33 683.83 729.50 691.00 730.00 C 698.17 730.50 716.83 730.00 722.00 730.00 L 721.00 711.00 C 715.67 710.83 696.17 711.33 689.00 710.00 C 681.83 708.67 681.17 706.67 678.00 703.00 C 674.83 699.33 671.33 699.00 670.00 688.00 C 668.67 677.00 670.00 645.50 670.00 637.00 L 721.00 636.00 L 722.00 617.00 L 671.00 617.00 L 670.00 586.00 L 651.00 586.00 Z"/>
            <path d="M 412.00 572.00 L 412.00 730.00 L 431.00 730.00 C 431.00 718.83 430.17 676.33 431.00 663.00 C 431.83 649.67 433.33 654.00 436.00 650.00 C 438.67 646.00 442.33 641.67 447.00 639.00 C 451.67 636.33 457.67 634.67 464.00 634.00 C 470.33 633.33 480.00 634.17 485.00 635.00 C 490.00 635.83 491.00 637.00 494.00 639.00 C 497.00 641.00 500.33 643.00 503.00 647.00 C 505.67 651.00 508.83 649.17 510.00 663.00 C 511.17 676.83 510.00 718.83 510.00 730.00 L 529.00 730.00 C 529.00 718.83 529.67 676.83 529.00 663.00 C 528.33 649.17 526.67 651.50 525.00 647.00 C 523.33 642.50 521.17 639.17 519.00 636.00 C 516.83 632.83 514.83 630.50 512.00 628.00 C 509.17 625.50 506.17 623.00 502.00 621.00 C 497.83 619.00 494.83 616.83 487.00 616.00 C 479.17 615.17 463.00 615.00 455.00 616.00 C 447.00 617.00 442.83 620.00 439.00 622.00 C 435.17 624.00 433.17 627.00 432.00 628.00 L 431.00 572.00 L 412.00 572.00 Z"/>
            <path d="M 907.00 563.00 C 903.17 566.83 888.50 580.50 884.00 586.00 C 879.50 591.50 880.67 592.17 880.00 596.00 C 879.33 599.83 879.50 605.33 880.00 609.00 C 880.50 612.67 880.83 614.67 883.00 618.00 C 885.17 621.33 889.33 626.33 893.00 629.00 C 896.67 631.67 901.17 633.17 905.00 634.00 C 908.83 634.83 911.67 635.17 916.00 634.00 C 920.33 632.83 925.83 630.83 931.00 627.00 C 936.17 623.17 944.17 614.67 947.00 611.00 C 949.83 607.33 948.83 607.17 948.00 605.00 C 947.17 602.83 943.83 599.17 942.00 598.00 C 940.17 596.83 941.50 594.83 937.00 598.00 C 932.50 601.17 920.17 613.83 915.00 617.00 C 909.83 620.17 908.67 618.00 906.00 617.00 C 903.33 616.00 900.50 612.67 899.00 611.00 C 897.50 609.33 897.33 608.83 897.00 607.00 C 896.67 605.17 896.67 601.83 897.00 600.00 C 897.33 598.17 895.33 600.00 899.00 596.00 C 902.67 592.00 915.67 580.17 919.00 576.00 C 922.33 571.83 920.17 573.00 919.00 571.00 C 917.83 569.00 914.00 565.33 912.00 564.00 C 910.00 562.67 907.83 563.17 907.00 563.00 Z"/>
            <path d="M 953.00 522.00 C 951.33 522.67 948.00 522.00 943.00 526.00 C 938.00 530.00 926.33 541.67 923.00 546.00 C 919.67 550.33 921.83 549.83 923.00 552.00 C 924.17 554.17 928.17 557.83 930.00 559.00 C 931.83 560.17 929.83 562.17 934.00 559.00 C 938.17 555.83 950.17 543.33 955.00 540.00 C 959.83 536.67 960.67 538.67 963.00 539.00 C 965.33 539.33 967.17 540.33 969.00 542.00 C 970.83 543.67 973.33 546.17 974.00 549.00 C 974.67 551.83 976.67 553.67 973.00 559.00 C 969.33 564.33 955.50 576.33 952.00 581.00 C 948.50 585.67 951.00 585.00 952.00 587.00 C 953.00 589.00 956.00 592.00 958.00 593.00 C 960.00 594.00 959.17 596.83 964.00 593.00 C 968.83 589.17 982.50 575.33 987.00 570.00 C 991.50 564.67 990.17 564.33 991.00 561.00 C 991.83 557.67 992.83 554.50 992.00 550.00 C 991.17 545.50 988.00 537.67 986.00 534.00 C 984.00 530.33 983.17 530.00 980.00 528.00 C 976.83 526.00 971.50 523.00 967.00 522.00 C 962.50 521.00 955.33 522.00 953.00 522.00 Z"/>
          </g>
        </svg>
      </div>
    </div>
  )
}

