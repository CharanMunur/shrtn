import { useState, useEffect } from "react"
import { Loader2, Link2, CheckCircle2, Copy, ExternalLink, Zap, AlertTriangle, QrCode } from "lucide-react"
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
  const [expiryOption, setExpiryOption] = useState<"1" | "7" | "30" | "90">("30")
  const [result, setResult] = useState<{ shortCode: string; shortUrl: string; expiresAt: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [urlCount, setUrlCount] = useState<number | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrCodeCode, setQrCodeCode] = useState<string>("")

  async function handleDownload(shortUrl: string, shortCode: string) {
    try {
      await downloadQrCode(shortUrl, shortCode)
    } catch (err) {
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
      setError("Please enter a URL.")
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
      })
      setUrlCount((c) => (c !== null ? c + 1 : c))
      setCustomCode("")
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
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Zap className="h-4 w-4" />
          <span>Quick shorten</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Shorten a URL</h1>
        <p className="mt-1 text-muted-foreground">
          Paste a long URL below and get a short link instantly.
        </p>
      </div>

      {/* Usage indicator */}
      {urlCount !== null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Links used</span>
            <span className={`font-semibold tabular-nums ${atLimit ? "text-destructive" : nearLimit ? "text-amber-500 dark:text-amber-400" : "text-foreground"}`}>
              {urlCount} / {URL_LIMIT}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                atLimit
                  ? "bg-destructive"
                  : nearLimit
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
              style={{ width: `${Math.min((urlCount / URL_LIMIT) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* At limit banner */}
      {atLimit && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Link limit reached</p>
            <p className="text-muted-foreground mt-0.5">
              You've used all {URL_LIMIT} links. Delete some from{" "}
              <span className="text-foreground font-medium">My Links</span> to create new ones.
            </p>
          </div>
        </div>
      )}

      {/* Near limit banner */}
      {nearLimit && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            You're approaching the {URL_LIMIT}-link limit.{" "}
            <span className="text-foreground font-medium">{URL_LIMIT - urlCount!} remaining.</span>
          </p>
        </div>
      )}

      {/* Form card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="long-url" className="text-sm font-medium">
              Long URL
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="long-url"
                type="url"
                placeholder="https://example.com/a-very-long-path/that/needs/shortening"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                disabled={isLoading || atLimit}
                className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="custom-code" className="text-sm font-medium">
                Custom Alias (Optional)
              </label>
              <input
                id="custom-code"
                type="text"
                placeholder="e.g. my-alias"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                disabled={isLoading || atLimit}
                className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="expiry-option" className="text-sm font-medium">
                Expiration
              </label>
              <select
                id="expiry-option"
                value={expiryOption}
                onChange={(e) => setExpiryOption(e.target.value as any)}
                disabled={isLoading || atLimit}
                className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="30">30 Days (Default)</option>
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || atLimit}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Shortening…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {atLimit ? "Limit reached" : "Shorten"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="font-semibold">Your short link is ready!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border border-border bg-muted px-3 py-2.5 text-sm font-mono text-foreground truncate">
              {result.shortUrl}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors shrink-0"
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
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors shrink-0 cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </button>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This link will expire on {new Date(result.expiresAt).toLocaleDateString()}. Find it in{" "}
            <span className="text-foreground font-medium">My Links</span>.
          </p>
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
