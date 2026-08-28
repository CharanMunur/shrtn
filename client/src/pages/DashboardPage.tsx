import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { getUserUrls } from "@/lib/urls-api"
import { formatRelativeTime, enrichUrls, type EnrichedUrl } from "@/lib/url"
import {
  Link2,
  BarChart2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react"

interface DashboardPageProps {
  onNavigate: (page: "shorten" | "links" | "analytics") => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { token, email } = useAuth()
  const [urls, setUrls] = useState<EnrichedUrl[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getUserUrls(token!)
        setUrls(enrichUrls(data))
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    })()
  }, [token])

  const activeUrls = urls.filter((u) => {
    const expired = u.expiresAt && new Date(u.expiresAt) < new Date()
    return u.isActive && !expired
  })
  const expiredUrls = urls.filter(
    (u) => u.expiresAt && new Date(u.expiresAt) < new Date()
  )
  const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0)
  const recentUrls = [...urls].slice(0, 5)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="space-y-8 py-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}
          {email ? `, ${email.split("@")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Here's an overview of your short links.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Link2 className="h-5 w-5" />}
          label="Total Links"
          value={isLoading ? "—" : urls.length.toString()}
          sub="all time"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Active"
          value={isLoading ? "—" : activeUrls.length.toString()}
          sub="currently live"
          accent="green"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Expired"
          value={isLoading ? "—" : expiredUrls.length.toString()}
          sub="past 30 days"
          accent="red"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Total Clicks"
          value={isLoading ? "—" : totalClicks.toLocaleString()}
          sub="across all links"
          accent="blue"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            icon={<Zap className="h-5 w-5" />}
            title="Shorten a URL"
            description="Create a new short link instantly"
            onClick={() => onNavigate("shorten")}
          />
          <QuickAction
            icon={<Link2 className="h-5 w-5" />}
            title="Manage Links"
            description="View, toggle, or delete your links"
            onClick={() => onNavigate("links")}
          />
          <QuickAction
            icon={<BarChart2 className="h-5 w-5" />}
            title="View Analytics"
            description="Track clicks, browsers & OS"
            onClick={() => onNavigate("analytics")}
          />
        </div>
      </div>

      {/* Recent links */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Links
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("links")}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : recentUrls.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 flex flex-col items-center gap-2 text-center">
            <Link2 className="h-8 w-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No links yet.</p>
            <button
              type="button"
              onClick={() => onNavigate("shorten")}
              className="text-sm text-primary hover:underline"
            >
              Shorten your first URL →
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
            {recentUrls.map((url, i) => {
              const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date()
              const shortCode = url.shortCode || ""
              return (
                <div
                  key={`${url.shortUrl || url.shortCode || "url"}-${i}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      (url.isActive !== undefined ? url.isActive : url.active) && !isExpired
                        ? "bg-green-500"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono font-medium text-primary">
                      {shortCode}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {url.shortUrl}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {url.totalClicks.toLocaleString()} clicks
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {url.expiresAt ? formatRelativeTime(url.expiresAt) : "—"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent?: "green" | "red" | "gray" | "blue"
}) {
  const accentClass =
    accent === "green"
      ? "text-green-600 dark:text-green-400"
      : accent === "red"
        ? "text-destructive"
        : accent === "blue"
          ? "text-blue-600 dark:text-blue-400"
          : accent === "gray"
            ? "text-muted-foreground"
            : "text-foreground"

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${accentClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl border border-border bg-card p-4 shadow-sm hover:bg-muted/40 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 ml-auto group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </button>
  )
}
