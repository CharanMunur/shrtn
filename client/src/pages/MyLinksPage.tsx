import { useEffect, useState, useCallback } from "react"
import {
  Copy,
  ExternalLink,
  Trash2,
  BarChart2,
  Loader2,
  RefreshCw,
  Link2,
  CheckCircle2,
  Clock,
  QrCode,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/providers/auth-provider"
import { getUserUrls, toggleUrl, deleteUrl } from "@/lib/urls-api"
import { ApiError } from "@/lib/api"
import { formatRelativeTime, enrichUrls, downloadQrCode, type EnrichedUrl } from "@/lib/url"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { QrCodeDialog } from "@/components/url-shortener/QrCodeDialog"
import { toast } from "sonner"

interface MyLinksPageProps {
  onViewAnalytics: (shortCode: string) => void
}

export function MyLinksPage({ onViewAnalytics }: MyLinksPageProps) {
  const { token } = useAuth()
  const [urls, setUrls] = useState<EnrichedUrl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [togglingUrl, setTogglingUrl] = useState<string | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrCodeCode, setQrCodeCode] = useState<string>("")

  async function handleDownload(shortUrl: string, shortCode: string) {
    try {
      await downloadQrCode(shortUrl, shortCode)
    } catch (err) {
      toast.error("Failed to download QR code.")
    }
  }

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

  async function handleToggle(url: EnrichedUrl) {
    if (!url.shortCode) return
    setTogglingUrl(url.shortUrl)
    try {
      const newActive = await toggleUrl(url.shortCode, token!)
      setUrls((prev) =>
        prev.map((u) => (u.shortUrl === url.shortUrl ? { ...u, isActive: newActive } : u))
      )
      toast.success(newActive ? "Link activated." : "Link deactivated.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update link status.")
    } finally {
      setTogglingUrl(null)
    }
  }

  async function handleDelete(url: EnrichedUrl) {
    if (!url.shortCode) return
    setDeletingUrl(url.shortUrl)
    try {
      await deleteUrl(url.shortCode, token!)
      setUrls((prev) => prev.filter((u) => u.shortUrl !== url.shortUrl))
      toast.success("Link deleted successfully.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete link.")
    } finally {
      setDeletingUrl(null)
      setConfirmDeleteUrl(null)
    }
  }

  async function handleCopy(shortUrl: string) {
    await navigator.clipboard.writeText(shortUrl)
    setCopiedUrl(shortUrl)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">Loading your links…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Links</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage and monitor all your shortened URLs.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
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
            <Link2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No links yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Shorten your first URL to see it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Table header - desktop only */}
          <div className="hidden md:grid md:grid-cols-[6rem_1fr_5rem_8.5rem_8rem_9.5rem] gap-4 px-5 py-3 border-b border-border bg-muted/40 text-sm font-semibold text-muted-foreground/80">
            <div>Code</div>
            <div>Short URL</div>
            <div className="text-right pr-2">Clicks</div>
            <div className="text-center">Status</div>
            <div>Expires</div>
            <div>Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {urls.map((url, i) => {
              const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date()
              const isActive = url.isActive && !isExpired

              return (
                <div
                  key={`${url.shortUrl || url.shortCode || "link"}-${i}`}
                  className="flex flex-col md:grid md:grid-cols-[6rem_1fr_5rem_8.5rem_8rem_9.5rem] gap-4 px-4 py-4 md:px-5 md:py-4 items-stretch md:items-center hover:bg-muted/20 transition-colors"
                >
                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden flex flex-col gap-3 w-full">
                    {/* Header Row: Short code and Status */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-sm font-mono font-bold text-primary">
                        /{url.shortCode || "—"}
                      </span>
                      
                      {/* Status toggle field */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => handleToggle(url)}
                          disabled={togglingUrl === url.shortUrl || !!isExpired || !url.shortCode}
                          aria-label="Toggle URL active status"
                        />
                        {togglingUrl === url.shortUrl ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        ) : isActive ? (
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {isExpired ? "Expired" : "Off"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Info: Short URL and Original URL */}
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Short URL</span>
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground font-medium hover:text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {url.shortUrl}
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                        </a>
                      </div>

                      {url.originalUrl && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Dest URL</span>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-full mt-0.5">
                            {url.originalUrl}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats & Expiry row */}
                    <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-lg text-xs">
                      {/* Clicks */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Clicks:</span>
                        <span className="font-semibold text-foreground tabular-nums">{url.totalClicks.toLocaleString()}</span>
                      </div>

                      {/* Expiry */}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {url.expiresAt
                            ? isExpired
                              ? <span className="text-destructive font-medium">Expired</span>
                              : formatRelativeTime(url.expiresAt)
                            : "No expiry"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-end gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => onViewAnalytics(url.shortCode)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted border border-border/50 cursor-pointer"
                      >
                        <BarChart2 className="h-3.5 w-3.5" />
                        Analytics
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQrCodeUrl(url.shortUrl)
                          setQrCodeCode(url.shortCode)
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted border border-border/50 cursor-pointer"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        QR Code
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(url.shortUrl)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted border border-border/50 cursor-pointer"
                      >
                        {copiedUrl === url.shortUrl ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteUrl(url.shortUrl)}
                        className="flex items-center gap-1 text-xs font-medium text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded-md border border-destructive/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* DESKTOP TABLE ROW VIEW */}
                  {/* Short code */}
                  <div className="hidden md:block shrink-0">
                    <span className="text-sm font-mono font-bold text-primary">
                      /{url.shortCode || "—"}
                    </span>
                  </div>

                  {/* Short URL */}
                  <div className="hidden md:block min-w-0 w-full">
                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline block truncate"
                    >
                      {url.shortUrl}
                    </a>
                  </div>

                  {/* Clicks */}
                  <div className="hidden md:block w-full md:w-auto md:text-right md:pr-2">
                    <span className="text-sm font-semibold tabular-nums">{url.totalClicks.toLocaleString()}</span>
                  </div>

                  {/* Status toggle field */}
                  <div className="hidden md:flex md:justify-center items-center gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => handleToggle(url)}
                      disabled={togglingUrl === url.shortUrl || !!isExpired || !url.shortCode}
                      aria-label="Toggle URL active status"
                    />
                    {togglingUrl === url.shortUrl ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : isActive ? (
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {isExpired ? "Expired" : "Off"}
                      </span>
                    )}
                  </div>

                  {/* Expiry */}
                  <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3 shrink-0" />
                    {url.expiresAt
                      ? isExpired
                        ? <span className="text-destructive">Expired</span>
                        : formatRelativeTime(url.expiresAt)
                      : "—"}
                  </div>

                  {/* Actions */}
                  <div className="hidden md:flex items-center gap-1">
                    <IconBtn title="View analytics" onClick={() => onViewAnalytics(url.shortCode)}>
                      <BarChart2 className="h-4 w-4" />
                    </IconBtn>

                    <IconBtn title="Copy short URL" onClick={() => handleCopy(url.shortUrl)}>
                      {copiedUrl === url.shortUrl ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </IconBtn>

                    <IconBtn
                      title="QR Code"
                      onClick={() => {
                        setQrCodeUrl(url.shortUrl)
                        setQrCodeCode(url.shortCode)
                      }}
                    >
                      <QrCode className="h-4 w-4" />
                    </IconBtn>

                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open link"
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <IconBtn
                      title="Delete"
                      onClick={() => setConfirmDeleteUrl(url.shortUrl)}
                      className="hover:bg-destructive/15 hover:text-destructive animate-in fade-in duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {urls.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {urls.length} link{urls.length !== 1 ? "s" : ""} ·{" "}
          {urls.filter((u) => u.isActive).length} active ·{" "}
          {urls.reduce((sum, u) => sum + u.totalClicks, 0).toLocaleString()} total clicks
        </p>
      )}

      {/* QR Code Dialog */}
      <QrCodeDialog
        isOpen={!!qrCodeUrl}
        onClose={() => setQrCodeUrl(null)}
        qrCodeUrl={qrCodeUrl}
        qrCodeCode={qrCodeCode}
        onDownload={() => handleDownload(qrCodeUrl!, qrCodeCode)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteUrl !== null} onOpenChange={(open) => { if (!open) setConfirmDeleteUrl(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this shortened link? All click analytics history will be removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteUrl(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const target = urls.find(u => u.shortUrl === confirmDeleteUrl)
                if (target) handleDelete(target)
              }}
              disabled={deletingUrl !== null}
            >
              {deletingUrl ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Link"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode
  title?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
