import { useEffect, useState, useCallback } from "react"
import { QrCode, Loader2, RefreshCw, ExternalLink, Download, Trash2 } from "lucide-react"
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
      toast.success("QR Code revoked successfully.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to revoke QR Code.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDownload(shortUrl: string, shortCode: string) {
    try {
      await downloadQrCode(shortUrl, shortCode)
    } catch (err) {
      toast.error("Failed to download QR code.")
    }
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Generate, enable, and disable custom QR codes for your short links.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {urls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <QrCode className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No links found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Shorten a URL first to start generating QR codes.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {urls.map((url) => {
            const hasQr = url.hasQrCode
            const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date()
            const isActive = url.isActive && !isExpired

            return (
              <div
                key={url.shortCode}
                className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* QR Code Container */}
                <div className="relative aspect-square flex items-center justify-center border-b border-border/80 overflow-hidden bg-muted/10">
                  {hasQr ? (
                    isActive ? (
                      <img
                        src={`${url.shortUrl}?format=qr`}
                        alt={`QR Code for /${url.shortCode}`}
                        className="w-full h-full object-contain bg-white animate-in fade-in duration-200"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground h-full w-full animate-in fade-in duration-200">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-dashed border-border mb-3">
                          <QrCode className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-xs text-destructive font-medium px-4 mb-2">
                          Short link is disabled
                        </p>
                        <p className="text-[10px] text-muted-foreground max-w-[200px] mb-4">
                          Activate the link using the toggle switch above to re-enable this QR code.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === url.shortCode}
                          onClick={() => handleRevoke(url.shortCode)}
                          className="text-xs"
                        >
                          Disable QR Code
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground h-full w-full animate-in fade-in duration-200">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-dashed border-border mb-3">
                        <QrCode className="h-6 w-6 text-muted-foreground/60" />
                      </div>
                      {!isActive ? (
                        <p className="text-xs text-destructive font-medium px-4">
                          {isExpired ? "Link is expired. QR codes cannot be generated." : "Link is inactive. Activate link to generate QR codes."}
                        </p>
                      ) : (
                        <p className="text-xs max-w-[200px] mb-4">
                          QR code is not generated yet for this short link.
                        </p>
                      )}
                      {isActive && (
                        <Button
                          size="sm"
                          disabled={actionLoading === url.shortCode}
                          onClick={() => handleGenerate(url.shortCode)}
                          className="flex items-center gap-1.5 text-xs px-4"
                        >
                          {actionLoading === url.shortCode ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <QrCode className="h-3.5 w-3.5" />
                          )}
                          Enable QR Code
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Info Block */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold text-primary">
                        /{url.shortCode}
                      </span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => handleToggleLink(url.shortCode)}
                          disabled={togglingLink === url.shortCode || !!isExpired}
                          aria-label="Toggle link active status"
                        />
                        {togglingLink === url.shortCode ? (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        ) : isActive ? (
                          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {isExpired ? "Expired" : "Disabled"}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 truncate"
                    >
                      {url.shortUrl}
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground/80 truncate pt-1 font-mono" title={url.originalUrl}>
                      {url.originalUrl}
                    </p>
                  </div>

                  {/* Actions footer */}
                  {hasQr && isActive && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 animate-in fade-in duration-200">
                      <button
                        type="button"
                        onClick={() => handleRevoke(url.shortCode)}
                        disabled={actionLoading === url.shortCode}
                        title="Disable QR Code"
                        className="flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-md border border-destructive/20 transition-colors cursor-pointer shrink-0"
                      >
                        {actionLoading === url.shortCode ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(url.shortUrl, url.shortCode)}
                        className="flex-1 flex items-center justify-center gap-1 text-[11px] h-8 px-2"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
