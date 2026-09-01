import { useEffect, useState, useCallback, useMemo } from "react"
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
  Search,
  MousePointerClick,
  Info,
  Download,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Lock,
  Flame,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/providers/auth-provider"
import { getUserUrls, toggleUrl, deleteUrl } from "@/lib/urls-api"
import { ApiError } from "@/lib/api"
import { formatDateTime, formatRelativeTime, enrichUrls, downloadQrCode, type EnrichedUrl } from "@/lib/url"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

function exportSingleLinkData(link: EnrichedUrl, format: "csv" | "json") {
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
  const status = link.isActive && !isExpired ? "Active" : isExpired ? "Expired" : "Disabled"

  if (format === "json") {
    const exportData = {
      shortCode: link.shortCode,
      shortUrl: link.shortUrl,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt ? new Date(link.createdAt).toISOString() : null,
      expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString() : null,
      status,
      totalClicks: link.totalClicks,
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2))
    const dlAnchor = document.createElement("a")
    dlAnchor.setAttribute("href", dataStr)
    dlAnchor.setAttribute("download", `link-${link.shortCode}.json`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
    toast.success(`Exported /${link.shortCode} data to JSON`)
  } else {
    const headers = ["Short Code", "Short URL", "Original URL", "Created At", "Expires At", "Status", "Total Clicks"]
    const row = [
      link.shortCode,
      link.shortUrl,
      `"${(link.originalUrl || "").replace(/"/g, '""')}"`,
      link.createdAt ? new Date(link.createdAt).toISOString() : "",
      link.expiresAt ? new Date(link.expiresAt).toISOString() : "Never",
      status,
      link.totalClicks,
    ]
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(","), row.join(",")].join("\n"))
    const dlAnchor = document.createElement("a")
    dlAnchor.setAttribute("href", csvContent)
    dlAnchor.setAttribute("download", `link-${link.shortCode}.csv`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
    toast.success(`Exported /${link.shortCode} data to CSV`)
  }
}

function exportAllLinksData(urlsList: EnrichedUrl[], format: "csv" | "json") {
  if (urlsList.length === 0) return
  if (format === "json") {
    const exportData = urlsList.map((link) => {
      const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
      const status = link.isActive && !isExpired ? "Active" : isExpired ? "Expired" : "Disabled"
      return {
        shortCode: link.shortCode,
        shortUrl: link.shortUrl,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt ? new Date(link.createdAt).toISOString() : null,
        expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString() : null,
        status,
        totalClicks: link.totalClicks,
      }
    })
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2))
    const dlAnchor = document.createElement("a")
    dlAnchor.setAttribute("href", dataStr)
    dlAnchor.setAttribute("download", `all-links-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
    toast.success("Exported all links to JSON")
  } else {
    const headers = ["Short Code", "Short URL", "Original URL", "Created At", "Expires At", "Status", "Total Clicks"]
    const rows = urlsList.map((link) => {
      const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
      const status = link.isActive && !isExpired ? "Active" : isExpired ? "Expired" : "Disabled"
      return [
        link.shortCode,
        link.shortUrl,
        `"${(link.originalUrl || "").replace(/"/g, '""')}"`,
        link.createdAt ? new Date(link.createdAt).toISOString() : "",
        link.expiresAt ? new Date(link.expiresAt).toISOString() : "Never",
        status,
        link.totalClicks,
      ].join(",")
    })
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(","), ...rows].join("\n"))
    const dlAnchor = document.createElement("a")
    dlAnchor.setAttribute("href", csvContent)
    dlAnchor.setAttribute("download", `all-links-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
    toast.success("Exported all links to CSV")
  }
}

export function MyLinksPage({ onViewAnalytics }: MyLinksPageProps) {
  const { token } = useAuth()
  const [urls, setUrls] = useState<EnrichedUrl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [togglingUrl, setTogglingUrl] = useState<string | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrCodeCode, setQrCodeCode] = useState<string>("")
  const [detailsLink, setDetailsLink] = useState<EnrichedUrl | null>(null)

  async function handleDownload(shortUrl: string, shortCode: string) {
    try {
      await downloadQrCode(shortUrl, shortCode)
    } catch {
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

  const activeCount = useMemo(() => {
    return urls.filter((u) => {
      const isExpired = u.expiresAt && new Date(u.expiresAt) < new Date()
      return u.isActive && !isExpired
    }).length
  }, [urls])

  const totalClicks = useMemo(() => {
    return urls.reduce((sum, u) => sum + u.totalClicks, 0)
  }, [urls])

  const filteredUrls = useMemo(() => {
    return urls.filter((u) => {
      const isExpired = u.expiresAt && new Date(u.expiresAt) < new Date()
      const isActive = u.isActive && !isExpired

      if (statusFilter === "active" && !isActive) return false
      if (statusFilter === "expired" && !isExpired) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchCode = u.shortCode.toLowerCase().includes(q)
        const matchUrl = u.originalUrl?.toLowerCase().includes(q)
        const matchShortUrl = u.shortUrl.toLowerCase().includes(q)
        if (!matchCode && !matchUrl && !matchShortUrl) return false
      }

      return true
    })
  }, [urls, statusFilter, searchQuery])

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Links</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage, search, and monitor all your shortened URLs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {urls.length > 0 && (
            <button
              type="button"
              onClick={() => exportAllLinksData(urls, "csv")}
              className="flex items-center gap-1.5 rounded-sm border border-border/60 bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              title="Download all links data as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Summary Stat Strip */}
      {urls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-sm border border-border/60 bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Links</p>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{urls.length}</p>
            </div>
            <div className="p-2.5 rounded-sm bg-muted text-muted-foreground">
              <Link2 className="h-5 w-5" />
            </div>
          </div>
          <div className="rounded-sm border border-border/60 bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Links</p>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{activeCount}</p>
            </div>
            <div className="p-2.5 rounded-sm bg-green-500/10 text-green-500 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="rounded-sm border border-border/60 bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Clicks</p>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-sm bg-muted text-muted-foreground">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Controls: Search and Filter Tabs */}
      {urls.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search code or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs bg-card border-border/60 h-9 rounded-sm"
            />
          </div>

          <div className="flex items-center bg-muted/40 p-1 rounded-sm border border-border/50 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({urls.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("expired")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                statusFilter === "expired"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Expired ({urls.length - activeCount})
            </button>
          </div>
        </div>
      )}

      {urls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border py-20 gap-3 text-center">
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
      ) : filteredUrls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-border bg-card py-16 gap-2 text-center">
          <Search className="h-6 w-6 text-muted-foreground opacity-40" />
          <p className="text-sm font-medium text-foreground">No links match your filter</p>
          <p className="text-xs text-muted-foreground">Try searching for a different code or URL.</p>
        </div>
      ) : (
        <div className="rounded-sm border border-border/60 bg-card overflow-hidden shadow-xs">
          {/* Table header - desktop only */}
          <div className="hidden md:grid md:grid-cols-[1fr_6rem_7.5rem_7.5rem_10rem] gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
            <div>Link Details</div>
            <div className="text-right">Clicks</div>
            <div className="text-center">Status</div>
            <div>Expires</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/60">
            {filteredUrls.map((url, i) => {
              const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date()
              const isActive = url.isActive && !isExpired

              return (
                <div
                  key={`${url.shortUrl || url.shortCode || "link"}-${i}`}
                  className="flex flex-col md:grid md:grid-cols-[1fr_6rem_7.5rem_7.5rem_10rem] gap-4 px-4 py-4 md:px-5 md:py-3.5 items-stretch md:items-center hover:bg-muted/15 transition-colors"
                >
                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-bold text-primary">
                          /{url.shortCode || "—"}
                        </span>
                        {url.isPasswordProtected && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-medium" title="Password protected">
                            <Lock className="h-3 w-3" />
                            Protected
                          </span>
                        )}
                        {url.maxClicks != null && url.maxClicks > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-medium" title={`Auto-destructs after ${url.maxClicks} clicks`}>
                            <Flame className="h-3 w-3" />
                            {url.totalClicks} / {url.maxClicks}
                          </span>
                        )}
                      </div>
                      
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
                          <span className="text-xs font-semibold text-green-500">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {isExpired ? "Expired" : "Disabled"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {url.shortUrl}
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                      </a>

                      {url.originalUrl && (
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-full">
                          {url.originalUrl}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-sm text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Clicks:</span>
                        <span className="font-semibold text-foreground tabular-nums">{url.totalClicks.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {url.expiresAt
                            ? isExpired
                              ? <span className="text-destructive font-medium">Expired</span>
                              : formatRelativeTime(url.expiresAt)
                            : "Never"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setDetailsLink(url)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-sm hover:bg-muted border border-border/50 cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5" />
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewAnalytics(url.shortCode)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-sm hover:bg-muted border border-border/50 cursor-pointer"
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
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-sm hover:bg-muted border border-border/50 cursor-pointer"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        QR Code
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(url.shortUrl)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-sm hover:bg-muted border border-border/50 cursor-pointer"
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
                        className="flex items-center gap-1 text-xs font-medium text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded-sm border border-destructive/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* DESKTOP TABLE ROW VIEW */}
                  {/* Link Details: Shortcode + Destination Stack */}
                  <div className="hidden md:block min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">
                        /{url.shortCode || "—"}
                      </span>
                      {url.isPasswordProtected && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-medium" title="Password protected">
                          <Lock className="h-3 w-3" />
                          Protected
                        </span>
                      )}
                      {url.maxClicks != null && url.maxClicks > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-medium" title={`Auto-destructs after ${url.maxClicks} clicks`}>
                          <Flame className="h-3 w-3" />
                          {url.totalClicks} / {url.maxClicks}
                        </span>
                      )}
                    </div>
                    {url.originalUrl && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5 truncate">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground hover:underline truncate"
                        >
                          {url.originalUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Clicks */}
                  <div className="hidden md:block text-right">
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {url.totalClicks.toLocaleString()}
                    </span>
                  </div>

                  {/* Status toggle field */}
                  <div className="hidden md:flex justify-center items-center gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => handleToggle(url)}
                      disabled={togglingUrl === url.shortUrl || !!isExpired || !url.shortCode}
                      aria-label="Toggle URL active status"
                    />
                    {togglingUrl === url.shortUrl ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : isActive ? (
                      <span className="text-xs font-semibold text-green-500">
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
                        ? <span className="text-destructive font-medium">Expired</span>
                        : formatRelativeTime(url.expiresAt)
                      : "Never"}
                  </div>

                  {/* Actions */}
                  <div className="hidden md:flex items-center justify-end gap-1">
                    <IconBtn title="Link Details & Dates" onClick={() => setDetailsLink(url)}>
                      <Info className="h-4 w-4" />
                    </IconBtn>

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
                      className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <IconBtn
                      title="Delete"
                      onClick={() => setConfirmDeleteUrl(url.shortUrl)}
                      className="hover:bg-destructive/15 hover:text-destructive transition-colors"
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
          Showing {filteredUrls.length} of {urls.length} link{urls.length !== 1 ? "s" : ""} ·{" "}
          {activeCount} active ·{" "}
          {totalClicks.toLocaleString()} total clicks
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

      {/* Link Details Modal */}
      <Dialog open={detailsLink !== null} onOpenChange={(open) => { if (!open) setDetailsLink(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold font-mono">
              <Link2 className="h-5 w-5 text-primary" />
              /{detailsLink?.shortCode} Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete metadata, timestamps, and export options for this link.
            </DialogDescription>
          </DialogHeader>

          {detailsLink && (
            <div className="space-y-4 py-2">
              <div className="rounded-sm border border-border/60 bg-muted/20 p-3 space-y-2">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">Short URL</span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-xs font-mono font-semibold text-primary truncate">{detailsLink.shortUrl}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(detailsLink.shortUrl)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedUrl === detailsLink.shortUrl ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedUrl === detailsLink.shortUrl ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {detailsLink.originalUrl && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground block">Destination URL</span>
                    <a
                      href={detailsLink.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline truncate block mt-0.5"
                    >
                      {detailsLink.originalUrl}
                    </a>
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-sm border border-border/60 bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-semibold text-xs">Created Date</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {detailsLink.createdAt ? formatDateTime(detailsLink.createdAt) : "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {detailsLink.createdAt ? formatRelativeTime(detailsLink.createdAt) : ""}
                  </p>
                </div>

                <div className="rounded-sm border border-border/60 bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-semibold text-xs">Expiry Date</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {detailsLink.expiresAt ? formatDateTime(detailsLink.expiresAt) : "Never"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {detailsLink.expiresAt
                      ? new Date(detailsLink.expiresAt) < new Date()
                        ? "Expired"
                        : formatRelativeTime(detailsLink.expiresAt)
                      : "No expiration set"}
                  </p>
                </div>

                <div className="rounded-sm border border-border/60 bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="font-semibold text-xs">Status</span>
                  </div>
                  <p className="font-semibold">
                    {detailsLink.expiresAt && new Date(detailsLink.expiresAt) < new Date() ? (
                      <span className="text-destructive">Expired</span>
                    ) : detailsLink.isActive ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-muted-foreground">Disabled</span>
                    )}
                  </p>
                </div>

                <div className="rounded-sm border border-border/60 bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    <span className="font-semibold text-xs">Total Clicks</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm tabular-nums">
                    {detailsLink.totalClicks.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-sm border border-border/60 bg-card p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="font-semibold text-xs">Protection</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {detailsLink.isPasswordProtected ? (
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Protected
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSingleLinkData(detailsLink!, "csv")}
                className="w-full sm:w-auto text-xs cursor-pointer gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Download CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSingleLinkData(detailsLink!, "json")}
                className="w-full sm:w-auto text-xs cursor-pointer gap-1.5"
              >
                <FileJson className="h-3.5 w-3.5" />
                Download JSON
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                size="sm"
                onClick={() => {
                  if (detailsLink) {
                    onViewAnalytics(detailsLink.shortCode)
                    setDetailsLink(null)
                  }
                }}
                className="w-full sm:w-auto text-xs cursor-pointer gap-1.5"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Analytics
              </Button>
            </div>
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
      className={`flex h-8 w-8 items-center justify-center rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
