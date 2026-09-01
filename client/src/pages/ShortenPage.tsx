import { useState, useEffect } from "react"
import {
  Loader2,
  Link as LinkIcon,
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
  Clock,
  Smartphone,
  Flame,
  Tag,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { createShortUrl, getUserUrls } from "@/lib/urls-api"
import { ApiError } from "@/lib/api"
import { extractShortCode, buildShortUrl, downloadQrCode } from "@/lib/url"
import { QrCodeDialog } from "@/components/url-shortener/QrCodeDialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const URL_LIMIT = 25

export function ShortenPage() {
  const { token } = useAuth()
  const [longUrl, setLongUrl] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [expiryOption, setExpiryOption] = useState<"1" | "7" | "30" | "90">("30")
  const [iosUrl, setIosUrl] = useState("")
  const [androidUrl, setAndroidUrl] = useState("")
  const [maxClicks, setMaxClicks] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [result, setResult] = useState<{
    shortCode: string
    shortUrl: string
    expiresAt: string
    isPasswordProtected?: boolean
    iosUrl?: string
    androidUrl?: string
    maxClicks?: number
  } | null>(null)
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

  useEffect(() => {
    getUserUrls(token!)
      .then((urls) => setUrlCount(urls.length))
      .catch(() => {})
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
      const expiresAtStr = new Date(offsetDate.getTime() - offsetDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)

      const parsedMaxClicks = maxClicks.trim() ? parseInt(maxClicks.trim(), 10) : undefined

      const payload = {
        originalUrl: trimmed,
        customCode: customCode.trim() || undefined,
        expiresAt: expiresAtStr,
        password: password.trim() || undefined,
        iosUrl: iosUrl.trim() || undefined,
        androidUrl: androidUrl.trim() || undefined,
        maxClicks:
          parsedMaxClicks && !isNaN(parsedMaxClicks) && parsedMaxClicks > 0 ? parsedMaxClicks : undefined,
      }

      const data = await createShortUrl(payload, token!)

      let shortUrl = ""
      if (data.shortUrl && data.shortUrl.includes("http")) {
        shortUrl = data.shortUrl
      } else if (data.shortCode && data.shortCode.includes("http")) {
        shortUrl = data.shortCode
      } else {
        const code = data.shortCode || data.shortUrl || ""
        if (code) shortUrl = buildShortUrl(code)
      }

      let shortCode = shortUrl ? extractShortCode(shortUrl) : ""
      if (!shortCode) shortCode = data.shortCode || data.shortUrl || ""

      setResult({
        shortCode,
        shortUrl,
        expiresAt: data.expiresAt,
        isPasswordProtected: !!password.trim(),
        iosUrl: data.iosUrl,
        androidUrl: data.androidUrl,
        maxClicks: data.maxClicks,
      })
      setUrlCount((c) => (c !== null ? c + 1 : c))
      setCustomCode("")
      setPassword("")
      setIosUrl("")
      setAndroidUrl("")
      setMaxClicks("")
      toast.success("Short link created successfully!")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to shorten URL.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy() {
    if (!result?.shortUrl) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl py-10 px-4 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Shorten a URL</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create smart links with custom aliases, expiry, and device routing.
          </p>
        </div>
        {urlCount !== null && (
          <Badge
            variant={atLimit ? "destructive" : nearLimit ? "outline" : "secondary"}
            className="shrink-0 font-mono text-xs mt-0.5"
          >
            {urlCount} / {URL_LIMIT}
          </Badge>
        )}
      </div>

      {/* Quota bar */}
      {urlCount !== null && (
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              atLimit ? "bg-destructive" : nearLimit ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${Math.min((urlCount / URL_LIMIT) * 100, 100)}%` }}
          />
        </div>
      )}

      {/* Limit warning */}
      {atLimit && (
        <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Quota reached</p>
            <p className="text-sm text-muted-foreground mt-0.5">Delete existing links to create new ones.</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* URL Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="long-url"
              type="url"
              placeholder="https://your-long-url.com/..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              disabled={isLoading || atLimit}
              className="pl-9 pr-9 h-10 text-sm font-mono"
            />
            {longUrl && !isLoading && (
              <button
                type="button"
                onClick={() => setLongUrl("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || atLimit}
            className="h-10 px-4 text-sm font-semibold cursor-pointer shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                Shorten
              </>
            )}
          </Button>
        </div>

        {/* Options Card */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="flex-1 gap-1.5 text-sm cursor-pointer">
                  <Tag className="h-3.5 w-3.5 text-blue-500" />
                  Alias & Expiry
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-1 gap-1.5 text-sm cursor-pointer">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  Auto-Destruct
                </TabsTrigger>
                <TabsTrigger value="routing" className="flex-1 gap-1.5 text-sm cursor-pointer">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                  Device Routes
                </TabsTrigger>
              </TabsList>

              {/* Tab: Alias & Expiry */}
              <TabsContent value="basic" className="mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="custom-code" className="text-sm font-medium text-foreground leading-none">
                      Custom Alias
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none font-mono">/</span>
                      <Input
                        id="custom-code"
                        type="text"
                        placeholder="my-link"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        disabled={isLoading || atLimit}
                        className="pl-7 text-sm font-mono h-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground leading-none">Leave blank to auto-generate.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="expiry-option" className="text-sm font-medium text-foreground leading-none flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Expires After
                    </label>
                    <select
                      id="expiry-option"
                      value={expiryOption}
                      onChange={(e) => setExpiryOption(e.target.value as any)}
                      disabled={isLoading || atLimit}
                      className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                    >
                      <option value="1">1 Day</option>
                      <option value="7">7 Days</option>
                      <option value="30">30 Days (Default)</option>
                      <option value="90">90 Days</option>
                    </select>
                    <p className="text-xs text-muted-foreground leading-none">Link stops working after this period.</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Auto-Destruct */}
              <TabsContent value="security" className="mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="max-clicks" className="text-sm font-medium text-foreground leading-none flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      Burn After N Clicks
                    </label>
                    <Input
                      id="max-clicks"
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                      value={maxClicks}
                      onChange={(e) => setMaxClicks(e.target.value)}
                      disabled={isLoading || atLimit}
                      className="text-sm font-mono h-10"
                    />
                    <p className="text-xs text-muted-foreground leading-none">Link deactivates after this many visits.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="link-password" className="text-sm font-medium text-foreground leading-none flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      Password Lock
                    </label>
                    <div className="relative">
                      <Input
                        id="link-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Set unlock password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading || atLimit}
                        className="pr-9 text-sm h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-none">Visitors must enter this to open the link.</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Device Routes */}
              <TabsContent value="routing" className="mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="ios-url" className="text-sm font-medium text-foreground leading-none">
                      iOS Redirect
                    </label>
                    <Input
                      id="ios-url"
                      type="url"
                      placeholder="https://apps.apple.com/..."
                      value={iosUrl}
                      onChange={(e) => setIosUrl(e.target.value)}
                      disabled={isLoading || atLimit}
                      className="text-sm font-mono h-10"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="android-url" className="text-sm font-medium text-foreground leading-none">
                      Android Redirect
                    </label>
                    <Input
                      id="android-url"
                      type="url"
                      placeholder="https://play.google.com/..."
                      value={androidUrl}
                      onChange={(e) => setAndroidUrl(e.target.value)}
                      disabled={isLoading || atLimit}
                      className="text-sm font-mono h-10"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-none">
                  iOS/Android visitors will be sent to the respective URL. Others go to the main destination.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Result */}
      {result && (
        <Card className="border-emerald-500/25 bg-emerald-500/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardContent className="p-5 space-y-4">

            {/* Status row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Link created
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {result.isPasswordProtected && (
                  <Badge variant="outline" className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Lock className="h-3 w-3 mr-1" /> Password
                  </Badge>
                )}
                {result.maxClicks != null && (
                  <Badge variant="outline" className="text-xs border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Flame className="h-3 w-3 mr-1" /> {result.maxClicks} clicks
                  </Badge>
                )}
                {(result.iosUrl || result.androidUrl) && (
                  <Badge variant="outline" className="text-xs border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Smartphone className="h-3 w-3 mr-1" /> Smart routed
                  </Badge>
                )}
              </div>
            </div>

            {/* Short URL display */}
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 rounded-md border border-border bg-muted/40 px-3 h-10 flex items-center">
                <span className="font-mono text-sm font-semibold text-primary truncate">{result.shortUrl}</span>
              </div>
              <Button onClick={handleCopy} size="sm" className="shrink-0 gap-1.5 cursor-pointer">
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 cursor-pointer"
                onClick={() => {
                  setQrCodeUrl(result.shortUrl)
                  setQrCodeCode(result.shortCode)
                }}
              >
                <QrCode className="h-3.5 w-3.5" />
                QR
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 cursor-pointer"
                onClick={() => window.open(result.shortUrl, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Expires {new Date(result.expiresAt).toLocaleDateString()}
              </div>
              <code className="text-foreground/70 text-xs">/{result.shortCode}</code>
            </div>
          </CardContent>
        </Card>
      )}

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
