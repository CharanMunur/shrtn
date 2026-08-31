import { useState, useEffect } from "react"
import {
  Loader2,
  Link,
  Link2,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertTriangle,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  X,
  SlidersHorizontal,
  Clock,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { createShortUrl, getUserUrls } from "@/lib/urls-api"
import { ApiError } from "@/lib/api"
import { extractShortCode, buildShortUrl, downloadQrCode } from "@/lib/url"
import { QrCodeDialog } from "@/components/url-shortener/QrCodeDialog"
import { toast } from "sonner"

const URL_LIMIT = 25

export function ShortenPage() {
  const { token } = useAuth()
  const [longUrl, setLongUrl] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [expiryOption, setExpiryOption] = useState<"1" | "7" | "30" | "90">("30")
  const [result, setResult] = useState<{ shortCode: string; shortUrl: string; expiresAt: string; isPasswordProtected?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [urlCount, setUrlCount] = useState<number | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrCodeCode, setQrCodeCode] = useState<string>("")

  async function handleDownload(shortUrl: string, shortCode: string) {
    try {
      await downloadQrCode(shortUrl, shortCode)
    } catch {
      toast.error("Failed to download QR code.")
    }
  }

  // Load current URL count to show usage & enforce limit in UI
  useEffect(() => {
    getUserUrls(token!).then((urls) => setUrlCount(urls.length)).catch(() => {})
  }, [token])

  const atLimit = urlCount !== null && urlCount >= URL_LIMIT
  const nearLimit = urlCount !== null && urlCount >= URL_LIMIT - 5 && !atLimit

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = longUrl.trim()
    if (!trimmed) {
      setError("Please enter a destination URL.")
      return
    }
    if (atLimit) return
    setIsLoading(true)
    setError("")
    setResult(null)
    setCopied(false)
    try {
      const offsetDate = new Date(Date.now() + parseInt(expiryOption) * 24 * 60 * 60 * 1000)
      const expiresAtStr = new Date(offsetDate.getTime() - offsetDate.getTimezoneOffset() * 60000).toISOString().slice(0, 19)

      const payload = {
        originalUrl: trimmed,
        customCode: customCode.trim() || undefined,
        expiresAt: expiresAtStr,
        password: password.trim() || undefined,
      }

      const data = await createShortUrl(payload, token!)
      
      let shortUrl = ""
      if (data.shortUrl && data.shortUrl.includes("http")) {
        shortUrl = data.shortUrl
      } else if (data.shortCode && data.shortCode.includes("http")) {
        shortUrl = data.shortCode
      } else {
        const code = data.shortCode || data.shortUrl || ""
        if (code) {
          shortUrl = buildShortUrl(code)
        }
      }

      let shortCode = shortUrl ? extractShortCode(shortUrl) : ""
      if (!shortCode) {
        shortCode = data.shortCode || data.shortUrl || ""
      }

      setResult({
        shortCode,
        shortUrl,
        expiresAt: data.expiresAt,
        isPasswordProtected: !!password.trim(),
      })
      setUrlCount((c) => (c !== null ? c + 1 : c))
      setCustomCode("")
      setPassword("")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to shorten URL.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {/* Header & Usage Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shorten URL</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Create fast, trackable short links with custom aliases and optional protection.
            </p>
          </div>
          {urlCount !== null && (
            <div className="rounded-sm border border-border/60 bg-card px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Quota:</span>
              <span className={`font-bold tabular-nums ${atLimit ? "text-destructive" : nearLimit ? "text-amber-500" : "text-foreground"}`}>
                {urlCount} / {URL_LIMIT}
              </span>
            </div>
          )}
        </div>

        {/* Quota Progress Bar */}
        {urlCount !== null && (
          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                atLimit ? "bg-destructive" : nearLimit ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min((urlCount / URL_LIMIT) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Limit Banners */}
      {atLimit && (
        <div className="flex items-start gap-3 rounded-sm border border-destructive/20 bg-destructive/8 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Quota Limit Reached</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              You have reached the maximum limit of {URL_LIMIT} links. Delete unused links from{" "}
              <span className="text-foreground font-semibold">My Links</span> to free up quota.
            </p>
          </div>
        </div>
      )}

      {nearLimit && (
        <div className="flex items-start gap-3 rounded-sm border border-amber-500/20 bg-amber-500/8 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            You're approaching the {URL_LIMIT}-link limit.{" "}
            <span className="text-foreground font-semibold">{URL_LIMIT - urlCount!} remaining.</span>
          </p>
        </div>
      )}

      {/* Main Shorten Form Card */}
      <div className="rounded-sm border border-border/60 bg-card p-6 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Primary Destination URL Input */}
          <div className="space-y-1.5">
            <label htmlFor="long-url" className="text-xs font-semibold text-muted-foreground">
              Destination Target URL
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="long-url"
                type="url"
                placeholder="https://example.com/long-path/to-shorten"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                disabled={isLoading || atLimit}
                className="w-full rounded-sm border border-input bg-background pl-10 pr-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              />
              {longUrl && !isLoading && (
                <button
                  type="button"
                  onClick={() => setLongUrl("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options Header */}
          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Link Options</span>
            </div>

            {/* Custom Code & Expiration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="custom-code" className="text-xs font-medium text-muted-foreground">
                  Custom Alias (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground select-none">
                    /
                  </span>
                  <input
                    id="custom-code"
                    type="text"
                    placeholder="my-custom-code"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    disabled={isLoading || atLimit}
                    className="w-full rounded-sm border border-input bg-background pl-6 pr-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="expiry-option" className="text-xs font-medium text-muted-foreground">
                  Expiration Time
                </label>
                <div className="relative">
                  <select
                    id="expiry-option"
                    value={expiryOption}
                    onChange={(e) => setExpiryOption(e.target.value as any)}
                    disabled={isLoading || atLimit}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="30">30 Days (Default)</option>
                    <option value="1">1 Day</option>
                    <option value="7">7 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Protection */}
            <div className="space-y-1.5 mt-4">
              <label htmlFor="link-password" className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Password Protection (Optional)
                </span>
              </label>
              <div className="relative">
                <input
                  id="link-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Set a password to lock link (min 3 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || atLimit}
                  className="w-full rounded-sm border border-input bg-background pl-3 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 px-3.5 py-2.5 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || atLimit}
            className="w-full rounded-sm bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating link…
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                {atLimit ? "Quota Limit Reached" : "Shorten URL"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Result Banner */}
      {result && (
        <div className="rounded-sm border border-green-500/30 bg-card p-6 shadow-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-green-500 font-semibold text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Your short link is live!</span>
            </div>
            {result.isPasswordProtected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-medium">
                <Lock className="h-3 w-3" /> Protected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-0 rounded-sm border border-border bg-muted/30 px-3.5 py-2.5 text-sm font-mono font-bold text-primary truncate">
              {result.shortUrl}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-sm border border-border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setQrCodeUrl(result.shortUrl)
                  setQrCodeCode(result.shortCode)
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-sm border border-border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                QR Code
              </button>

              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-sm border border-border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Expires: {new Date(result.expiresAt).toLocaleDateString()}</span>
            </div>
            <span>Shortcode: <code className="font-bold text-foreground">/{result.shortCode}</code></span>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      <QrCodeDialog
        isOpen={!!qrCodeUrl}
        onClose={() => setQrCodeUrl(null)}
        qrCodeUrl={qrCodeUrl}
        qrCodeCode={qrCodeCode}
        onDownload={() => handleDownload(qrCodeUrl!, qrCodeCode)}
      />
    </div>
  )
}
