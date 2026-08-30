import { useEffect, useState, useCallback } from "react"
import { QrCode, Loader2, RefreshCw, ExternalLink, Download, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { getUserUrls, generateQrCodeApi, revokeQrCodeApi, toggleUrl } from "@/lib/urls-api"
import { ApiError } from "@/lib/api"
import { enrichUrls, downloadQrCode, type EnrichedUrl } from "@/lib/url"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export function QrCodesPage() {
  const { token } = useAuth()
  const [urls, setUrls] = useState<EnrichedUrl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [togglingLink, setTogglingLink] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await getUserUrls(token!)
      setUrls(enrichUrls(data))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load links.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggleLink(shortCode: string) {
    setTogglingLink(shortCode)
    try {
      const newActive = await toggleUrl(shortCode, token!)
      setUrls((prev) =>
        prev.map((u) => (u.shortCode === shortCode ? { ...u, isActive: newActive } : u))
      )
      toast.success(newActive ? "Link activated." : "Link deactivated.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to toggle link status.")
    } finally {
      setTogglingLink(null)
    }
  }

  async function handleGenerate(shortCode: string) {
    setActionLoading(shortCode)
    try {
      await generateQrCodeApi(shortCode, token!)
      setUrls((prev) =>
        prev.map((u) => (u.shortCode === shortCode ? { ...u, hasQrCode: true } : u))
      )
      toast.success("QR Code generated successfully.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to generate QR Code.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRevoke(shortCode: string) {
    setActionLoading(shortCode)
    try {
      await revokeQrCodeApi(shortCode, token!)
      setUrls((prev) =>
        prev.map((u) => (u.shortCode === shortCode ? { ...u, hasQrCode: false } : u))
      )
      toast.success("QR Code revoked.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to revoke QR Code.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDownload(shortUrl: string, shortCode: string) {
    try {
      await downloadQrCode(shortUrl, shortCode)
    } catch {
      toast.error("Failed to download QR code.")
    }
  }

  const totalQr = urls.filter((u) => u.hasQrCode).length
  const activeQr = urls.filter((u) => {
    const isExpired = u.expiresAt && new Date(u.expiresAt) < new Date()
    return u.hasQrCode && u.isActive && !isExpired
  }).length

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">Loading QR codes…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Generate and manage QR codes for your short links.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer shrink-0 mt-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats strip */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-sm border border-border/60 bg-card px-4 py-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Total Links</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{urls.length}</p>
          </div>
          <div className="rounded-sm border border-border/60 bg-card px-4 py-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">QR Generated</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{totalQr}</p>
          </div>
          <div className="rounded-sm border border-border/60 bg-card px-4 py-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Active QRs</p>
            <p className="text-2xl font-bold text-primary mt-0.5">{activeQr}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-sm bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {urls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border py-20 gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <QrCode className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No links found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Shorten a URL first to start generating QR codes.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {urls.map((url) => {
            const hasQr = url.hasQrCode
            const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date()
            const isActive = url.isActive && !isExpired
            const loading = actionLoading === url.shortCode

            return (
              <div
                key={url.shortCode}
                className="group flex flex-col rounded-sm border border-border/60 bg-card overflow-hidden hover:border-border transition-colors"
              >
                {/* Top bar: shortcode + status badge + toggle */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50">
                  <span className="text-sm font-mono font-bold text-primary truncate">
                    /{url.shortCode}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-400 bg-yellow-400/15 px-2 py-0.5 rounded-full border border-yellow-400/40">
                        <Clock className="h-2.5 w-2.5" />
                        Expired
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-400/15 px-2 py-0.5 rounded-full border border-green-400/40">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                        <XCircle className="h-2.5 w-2.5" />
                        Disabled
                      </span>
                    )}
                    <Switch
                      checked={!!isActive}
                      onCheckedChange={() => handleToggleLink(url.shortCode)}
                      disabled={togglingLink === url.shortCode || !!isExpired}
                      aria-label="Toggle link active status"
                    />
                    {togglingLink === url.shortCode && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* QR Preview */}
                <div className={`relative aspect-square flex items-center justify-center overflow-hidden ${hasQr && isActive ? "bg-white" : "bg-muted/30"}`}>
                  {hasQr && isActive ? (
                    <>
                      <img
                        src={`${url.shortUrl}?format=qr`}
                        alt={`QR Code for /${url.shortCode}`}
                        className="w-full h-full object-contain p-6 animate-in fade-in duration-200"
                      />
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownload(url.shortUrl, url.shortCode)}
                          title="Download QR"
                          className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-sm hover:bg-white/90 transition-colors cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevoke(url.shortCode)}
                          disabled={loading}
                          title="Revoke QR Code"
                          className="flex items-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-2 rounded-sm hover:bg-destructive/90 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Revoke
                        </button>
                      </div>
                    </>
                  ) : hasQr && !isActive ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full w-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-dashed border-border">
                        <QrCode className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-xs text-destructive font-medium">Link is disabled</p>
                      <p className="text-[11px] text-muted-foreground max-w-[180px]">
                        Activate the link above to re-enable this QR code.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRevoke(url.shortCode)}
                        disabled={loading}
                        className="text-[11px] text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {loading ? "Revoking…" : "Revoke QR instead"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full w-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-dashed border-border">
                        <QrCode className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      {!isActive ? (
                        <p className="text-xs text-destructive font-medium px-4">
                          {isExpired
                            ? "Link expired — QR unavailable."
                            : "Activate link to generate a QR code."}
                        </p>
                      ) : (
                        <>
                          <p className="text-[11px] text-muted-foreground max-w-[160px]">
                            No QR code generated yet.
                          </p>
                          <Button
                            size="sm"
                            disabled={loading}
                            onClick={() => handleGenerate(url.shortCode)}
                            className="flex items-center gap-1.5 text-xs h-8 px-4"
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <QrCode className="h-3.5 w-3.5" />
                            )}
                            Generate QR
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: URLs */}
                <div className="px-4 py-3 space-y-1 border-t border-border/50 bg-muted/20">
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary hover:underline transition-colors truncate"
                  >
                    {url.shortUrl}
                    <ExternalLink className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                  </a>
                  <p
                    className="text-[11px] text-muted-foreground truncate font-mono"
                    title={url.originalUrl}
                  >
                    {url.originalUrl}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
