import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/providers/auth-provider"
import { getUserUrls, getUrlAnalytics } from "@/lib/urls-api"
import { ApiError } from "@/lib/api"
import { formatDateTime, formatRelativeTime, enrichUrls, type EnrichedUrl } from "@/lib/url"
import { getBrowserIcon, getOsIcon, getDeviceType, getCountryCode, type IconData } from "@/lib/icons"
import type { UrlAnalyticsResponse, UrlResponse } from "@/types/api"
import {
  Loader2,
  MousePointerClick,
  Globe2,
  Monitor,
  Clock,
  ChevronDown,
  Link2,
  BarChart3,
  Smartphone,
  Bot,
  MapPin,
  Maximize2,
  X,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { WorldMap } from "@/components/WorldMap"
import { Style, Avatar } from '@dicebear/core'
import definition from '@dicebear/styles/notionists.json' with { type: 'json' }

const dicebearStyle = new Style(definition);

interface AnalyticsPageProps {
  initialShortCode?: string | null
}

export function AnalyticsPage({ initialShortCode }: AnalyticsPageProps) {
  const { token } = useAuth()
  const { shortCode } = useParams()
  const navigate = useNavigate()
  const [urls, setUrls] = useState<EnrichedUrl[]>([])
  const [selectedCode, setSelectedCode] = useState<string>(shortCode ?? initialShortCode ?? "")
  const [analytics, setAnalytics] = useState<UrlAnalyticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d")
  const [tabGroup2, setTabGroup2] = useState<"browsers" | "os" | "devices">("browsers")
  const [tabGroup3, setTabGroup3] = useState<"countries" | "regions" | "cities">("countries")
  const [expandedTab, setExpandedTab] = useState<"browsers" | "os" | "devices" | "countries" | "regions" | "cities" | null>(null)

  const chartData = useMemo(() => {
    if (!analytics?.clicksByDate) return []

    const data = []
    const today = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 0

    if (days > 0) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        const label = d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
        data.push({
          date: dateStr,
          label,
          clicks: analytics.clicksByDate[dateStr] || 0,
        })
      }
    } else {
      const dates = Object.keys(analytics.clicksByDate).sort()
      if (dates.length === 0) return []

      const minDate = new Date(dates[0])
      const maxDate = new Date()
      const curDate = new Date(minDate)
      while (curDate <= maxDate) {
        const dateStr = curDate.toISOString().split("T")[0]
        const label = curDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
        data.push({
          date: dateStr,
          label,
          clicks: analytics.clicksByDate[dateStr] || 0,
        })
        curDate.setDate(curDate.getDate() + 1)
      }
    }
    return data
  }, [analytics, timeRange])

  const chartConfig = {
    clicks: {
      label: "Clicks",
      color: "oklch(0.4880 0.2430 264.3760)",
    },
  } satisfies ChartConfig

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setError("")
      try {
        const initialCode = shortCode ?? initialShortCode
        if (initialCode) {
          const [data, analyticsData] = await Promise.all([
            getUserUrls(token!),
            getUrlAnalytics(initialCode, token!),
          ])
          const enriched = enrichUrls(data)
          setUrls(enriched)
          setSelectedCode(initialCode)
          setAnalytics(analyticsData)
        } else {
          const data = await getUserUrls(token!)
          const enriched = enrichUrls(data)
          setUrls(enriched)

          const nextCode = enriched.length > 0 ? enriched[0].shortCode : ""
          if (nextCode) {
            setSelectedCode(nextCode)
            navigate(`/dashboard/analytics/${nextCode}`, { replace: true })
            const analyticsData = await getUrlAnalytics(nextCode, token!)
            setAnalytics(analyticsData)
          }
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [token, initialShortCode, shortCode, navigate])


  function topEntries(record: Record<string, number>, max = 8) {
    return Object.entries(record ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, max)
  }

  const browserEntries = analytics ? topEntries(analytics.browserBreakdown) : []
  const osEntries = analytics ? topEntries(analytics.osBreakdown) : []
  const deviceEntries = analytics ? topEntries(analytics.deviceBreakdown) : []
  const countryEntries = analytics ? topEntries(analytics.countryBreakdown) : []
  const regionEntries = analytics ? topEntries(analytics.regionBreakdown) : []
  const cityEntries = analytics ? topEntries(analytics.cityBreakdown) : []
  const total = analytics?.totalClicks ?? 0



  return (
    <div className="space-y-6 py-8 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed click insights for your short links.
          </p>
        </div>

        {/* URL selector */}
        {!isLoading && urls.length > 0 && (
          <div className="relative">
            <select
              id="url-select"
              value={selectedCode}
              onChange={(e) => navigate(`/dashboard/analytics/${e.target.value}`)}
              className="appearance-none rounded-sm border border-border bg-card px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {urls.map((u) => {
                return (
                  <option key={u.shortCode} value={u.shortCode}>
                    /{u.shortCode}
                  </option>
                )
              })}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-sm bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading analytics…</span>
        </div>
      ) : !analytics ? (
        <EmptyState urls={urls} />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Link info card */}
          <div className="rounded-sm border border-border bg-card px-5 py-4 overflow-hidden">
            <div className="flex items-start gap-3 w-full min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Link2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-base font-bold text-primary">
                    /{analytics.shortCode}
                  </span>
                  <span className="text-xs text-muted-foreground">short link</span>
                </div>
                {analytics.originalUrl && (
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed break-all">
                    {analytics.originalUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              icon={<MousePointerClick className="h-4 w-4" />}
              label="Total Clicks"
              value={total.toLocaleString()}
              highlight
            />
            <MetricCard
              icon={<Globe2 className="h-4 w-4" />}
              label="Browsers"
              value={Object.keys(analytics.browserBreakdown ?? {}).length.toString()}
            />
            <MetricCard
              icon={<Monitor className="h-4 w-4" />}
              label="OS Types"
              value={Object.keys(analytics.osBreakdown ?? {}).length.toString()}
            />
            <MetricCard
              icon={<Clock className="h-4 w-4" />}
              label="Recent Clicks"
              value={(analytics.lastClicks?.length ?? 0).toString()}
            />
          </div>

          {/* Clicks over time chart (Full Width) */}
          <div className="rounded-sm border border-border/60 bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-base">Clicks traffic</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Timeline of clicks registered for this link.
                </p>
              </div>

              {/* Time range selector */}
              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-sm self-start">
                <button
                  onClick={() => setTimeRange("7d")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                    timeRange === "7d"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimeRange("30d")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                    timeRange === "30d"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setTimeRange("all")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                    timeRange === "all"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    className="text-[10px]"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    className="text-[10px]"
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="clicks"
                    fill="var(--color-clicks)"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Browser, OS, Devices, Countries, and Location breakdowns (Side-by-Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environment Panel */}
            <div className="rounded-sm border border-border/60 bg-card overflow-hidden flex flex-col h-[424px]">
              {/* Normal Casing Header */}
              <div className="px-5 pt-5 pb-3 shrink-0">
                <h3 className="text-base font-bold text-foreground leading-none">Environment</h3>
              </div>

              {/* Tabs Row under Header */}
              <div className="flex border-b border-border bg-card px-5 pt-3 pb-3 gap-6 shrink-0">
                {(["browsers", "os", "devices"] as const).map((tab) => {
                  const active = tabGroup2 === tab
                  const label = tab === "browsers" ? "Browsers" : tab === "os" ? "OS" : "Devices"
                  return (
                    <button
                      key={tab}
                      onClick={() => setTabGroup2(tab)}
                      className={`text-xs font-semibold cursor-pointer border-b-2 pb-3 -mb-[13px] transition-colors ${
                        active
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Card Content */}
              <div className="flex-1 min-h-0 overflow-y-auto pt-3">
                {tabGroup2 === "browsers" && (
                  <BreakdownTable
                    title="Browser"
                    entries={browserEntries.slice(0, 5)}
                    total={total}
                    getIcon={getBrowserIcon}
                  />
                )}
                {tabGroup2 === "os" && (
                  <BreakdownTable
                    title="OS"
                    entries={osEntries.slice(0, 5)}
                    total={total}
                    getIcon={getOsIcon}
                  />
                )}
                {tabGroup2 === "devices" && (
                  <BreakdownTable
                    title="Device"
                    entries={deviceEntries.slice(0, 5)}
                    total={total}
                    renderIcon={(name) => {
                      const k = name.toLowerCase()
                      let src = "/icons/laptop.svg"
                      if (k.includes("mobile")) src = "/icons/mobile.svg"
                      else if (k.includes("tablet")) src = "/icons/tablet.svg"
                      else if (k.includes("desktop")) src = "/icons/desktop.svg"
                      else if (k.includes("bot")) return <Bot className="h-4 w-4 text-muted-foreground" />
                      return <img src={src} className="h-4 w-4 object-contain opacity-70 dark:invert" alt={name} />
                    }}
                  />
                )}
              </div>

              {/* Centered More Button at Bottom */}
              <div className="p-3 border-t border-border/50 bg-muted/5 shrink-0 flex justify-center">
                <button
                  onClick={() => setExpandedTab(tabGroup2)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3" />
                  More
                </button>
              </div>
            </div>

            {/* Location Panel */}
            <div className="rounded-sm border border-border/60 bg-card overflow-hidden flex flex-col h-[424px]">
              {/* Normal Casing Header */}
              <div className="px-5 pt-5 pb-3 shrink-0">
                <h3 className="text-base font-bold text-foreground leading-none">Location</h3>
              </div>

              {/* Tabs Row under Header */}
              <div className="flex border-b border-border bg-card px-5 pt-3 pb-3 gap-6 shrink-0">
                {(["countries", "regions", "cities"] as const).map((tab) => {
                  const active = tabGroup3 === tab
                  const label = tab === "countries" ? "Countries" : tab === "regions" ? "Regions" : "Cities"
                  return (
                    <button
                      key={tab}
                      onClick={() => setTabGroup3(tab)}
                      className={`text-xs font-semibold cursor-pointer border-b-2 pb-3 -mb-[13px] transition-colors whitespace-nowrap ${
                        active
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Card Content */}
              <div className="flex-1 min-h-0 overflow-y-auto pt-3">
                {tabGroup3 === "countries" && (
                  <BreakdownTable
                    title="Country"
                    entries={countryEntries.slice(0, 5)}
                    total={total}
                    renderIcon={(name) => {
                      const code = getCountryCode(name)
                      if (code) {
                        return <span className={`fi fi-${code} shadow-sm scale-110`} />
                      }
                      return (
                        <div className="h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                          {name.charAt(0)}
                        </div>
                      )
                    }}
                  />
                )}
                {tabGroup3 === "regions" && (
                  <BreakdownTable
                    title="Region"
                    entries={regionEntries.slice(0, 5)}
                    total={total}
                  />
                )}
                {tabGroup3 === "cities" && (
                  <BreakdownTable
                    title="City"
                    entries={cityEntries.slice(0, 5)}
                    total={total}
                  />
                )}
              </div>

              {/* Centered More Button at Bottom */}
              <div className="p-3 border-t border-border/50 bg-muted/5 shrink-0 flex justify-center">
                <button
                  onClick={() => setExpandedTab(tabGroup3)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3" />
                  More
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Geographic Map & Traffic Activity Heatmap (Side-by-Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* World Map Geographic Distribution */}
            <div className="lg:col-span-2 rounded-sm border border-border/60 bg-card p-5 flex flex-col gap-3">
              <div className="px-1 pt-1 shrink-0">
                <h3 className="text-base font-bold text-foreground leading-none">Geographic Distribution</h3>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Visitor click densities visualized across country boundaries.
                </p>
              </div>
              <div className="h-[510px] bg-muted/5 rounded border border-border/40 overflow-hidden">
                <WorldMap countryBreakdown={analytics ? analytics.countryBreakdown : {}} />
              </div>
            </div>

            {/* Traffic Activity Heatmap */}
            <div className="lg:col-span-1">
              <TrafficHeatmap heatmap={analytics.trafficHeatmap} />
            </div>
          </div>

          {/* Recent Clicks Card (Full Width) */}
          <div className="rounded-sm border border-border/60 bg-card overflow-hidden flex flex-col">
            {/* Normal Casing Header */}
            <div className="px-5 pt-5 pb-3 shrink-0 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground leading-none">Recent Clicks</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Last {analytics.lastClicks ? Math.min(analytics.lastClicks.length, 5) : 0} of {total.toLocaleString()} clicks registered.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 min-h-0">
              {!analytics.lastClicks || analytics.lastClicks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Clock className="h-6 w-6 opacity-30 mb-2" />
                  <p className="text-sm">No recent clicks</p>
                </div>
              ) : (
                analytics.lastClicks.slice(0, 5).map((click, i) => {
                  const avatar = new Avatar(dicebearStyle, {
                    "backgroundColor": [],
                    "beardProbability": 0,
                    "gestureProbability": 0,
                    "glassesProbability": 0,
                    "clothesGraphicProbability": 0,
                    "seed": click.ipAddress || `Felix-${i}`
                  });
                  const svgMarkup = avatar.toString();
                  
                  const browserInfo = getBrowserIcon(click.userAgent);
                  const osInfo = getOsIcon(click.userAgent);
                  const deviceLabel = getDeviceType(click.userAgent);

                  const relTime = click.clickedAt ? formatRelativeTime(click.clickedAt) : "—";
                  const absTime = click.clickedAt ? formatDateTime(click.clickedAt) : "—";

                  return (
                    <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Avatar */}
                        <div 
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden bg-muted border border-border/60 shadow-sm"
                          dangerouslySetInnerHTML={{ __html: svgMarkup }}
                        />
                        
                        {/* Session Metadata */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground tracking-tight">
                            {click.ipAddress ? `Visitor (${click.ipAddress})` : "Anonymous Visitor"}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 text-[11px] font-medium text-muted-foreground">
                            {/* Browser */}
                            <span className="inline-flex items-center gap-1">
                              {browserInfo && (
                                <img 
                                  src={browserInfo.url} 
                                  className="h-3.5 w-3.5 object-contain shrink-0" 
                                  alt={browserInfo.label} 
                                />
                              )}
                              <span>{browserInfo?.label || (click.userAgent ? (click.userAgent.split(" ")[0]?.split("/")[0] || "Unknown") : "Unknown")}</span>
                            </span>
                            
                            <span className="text-muted-foreground/30 text-xs">•</span>
                            
                            {/* OS */}
                            <span className="inline-flex items-center gap-1">
                              {osInfo && (
                                <img 
                                  src={osInfo.url} 
                                  className="h-3.5 w-3.5 object-contain shrink-0" 
                                  alt={osInfo.label} 
                                />
                              )}
                              <span>{osInfo?.label || "Unknown OS"}</span>
                            </span>
                            
                            <span className="text-muted-foreground/30 text-xs">•</span>
                            
                            {/* Device */}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40 font-semibold uppercase tracking-wider shrink-0">
                              {deviceLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Time details */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground capitalize">
                          {relTime}
                        </span>
                        <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                          {absTime.split(",")[1]?.trim() || absTime}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Tab Details Modal */}
      {expandedTab !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
          <div className="bg-card border border-border rounded-sm w-full max-w-4xl flex flex-col h-[85vh] max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 className="font-bold text-base capitalize flex items-center gap-2">
                {expandedTab === "browsers" ? (
                  <>
                    <Globe2 className="h-5 w-5 text-primary" />
                    Browsers
                  </>
                ) : expandedTab === "os" ? (
                  <>
                    <Monitor className="h-5 w-5 text-primary" />
                    Operating Systems
                  </>
                ) : expandedTab === "devices" ? (
                  <>
                    <Smartphone className="h-5 w-5 text-primary" />
                    Devices
                  </>
                ) : expandedTab === "countries" ? (
                  <>
                    <MapPin className="h-5 w-5 text-primary" />
                    Countries
                  </>
                ) : expandedTab === "regions" ? (
                  <>
                    <MapPin className="h-5 w-5 text-primary" />
                    Regions
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-primary" />
                    Cities
                  </>
                )}
              </h3>
              <button
                onClick={() => setExpandedTab(null)}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {expandedTab === "browsers" && (
                <BreakdownTable
                  title="Browser"
                  entries={analytics ? topEntries(analytics.browserBreakdown, 100) : []}
                  total={total}
                  getIcon={getBrowserIcon}
                />
              )}
              {expandedTab === "os" && (
                <BreakdownTable
                  title="OS"
                  entries={analytics ? topEntries(analytics.osBreakdown, 100) : []}
                  total={total}
                  getIcon={getOsIcon}
                />
              )}
              {expandedTab === "devices" && (
                <BreakdownTable
                  title="Device"
                  entries={analytics ? topEntries(analytics.deviceBreakdown, 100) : []}
                  total={total}
                  renderIcon={(name) => {
                    const k = name.toLowerCase()
                    let src = "/icons/laptop.svg"
                    if (k.includes("mobile")) src = "/icons/mobile.svg"
                    else if (k.includes("tablet")) src = "/icons/tablet.svg"
                    else if (k.includes("desktop")) src = "/icons/desktop.svg"
                    else if (k.includes("bot")) return <Bot className="h-4 w-4 text-muted-foreground" />
                    return <img src={src} className="h-4 w-4 object-contain opacity-70 dark:invert" alt={name} />
                  }}
                />
              )}
              {expandedTab === "countries" && (
                <BreakdownTable
                  title="Country"
                  entries={analytics ? topEntries(analytics.countryBreakdown, 100) : []}
                  total={total}
                  renderIcon={(name) => {
                    const code = getCountryCode(name)
                    if (code) {
                      return <span className={`fi fi-${code} shadow-sm scale-110`} />
                    }
                    return (
                      <div className="h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                        {name.charAt(0)}
                      </div>
                    )
                  }}
                />
              )}
              {expandedTab === "regions" && (
                <BreakdownTable
                  title="Region"
                  entries={analytics ? topEntries(analytics.regionBreakdown, 100) : []}
                  total={total}
                />
              )}
              {expandedTab === "cities" && (
                <BreakdownTable
                  title="City"
                  entries={analytics ? topEntries(analytics.cityBreakdown, 100) : []}
                  total={total}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-sm border p-4 flex flex-col gap-2 ${
        highlight
          ? "border-primary/25 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className={`flex items-center gap-1.5 text-xs font-medium ${
        highlight ? "text-primary" : "text-muted-foreground"
      }`}>
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold tabular-nums ${
        highlight ? "text-primary" : "text-foreground"
      }`}>
        {value}
      </p>
    </div>
  )
}

function BreakdownTable({
  title,
  entries,
  total,
  getIcon,
  renderIcon,
}: {
  title: string
  entries: [string, number][]
  total: number
  getIcon?: (name: string) => IconData | null
  renderIcon?: (name: string) => React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Table column headers */}
      <div className="flex items-center px-5 py-2 text-sm font-semibold text-muted-foreground/75 shrink-0 select-none bg-muted/5">
        {/* Placeholder for Icon alignment */}
        <div className="w-7 shrink-0" />
        <div className="w-3 shrink-0" />
        
        <span className="flex-1">{title}</span>
        <span className="w-20 text-right pr-1">Visitors</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <BarChart3 className="h-6 w-6 opacity-30" />
            <p className="text-sm">No data yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {entries.map(([fullName, count]) => {
              const [displayName, countryName] = fullName.includes(":") ? fullName.split(":") : [fullName, ""]
              const iconData = getIcon ? getIcon(displayName) : null
              const totalPct = total ? Math.round((count / total) * 100) : 0
              const regionCityFlagCode = countryName ? getCountryCode(countryName) : null

              return (
                <div key={fullName} className="group relative px-5 py-2.5 hover:bg-muted/15 transition-colors overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary/6 transition-all duration-500 ease-out pointer-events-none"
                    style={{ width: `${totalPct}%` }}
                  />
                  <div className="relative flex items-center gap-3">
                    {/* Icon */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                      {renderIcon ? (
                        renderIcon(displayName)
                      ) : (
                        <>
                          {regionCityFlagCode ? (
                            <span className={`fi fi-${regionCityFlagCode} shadow-sm scale-110`} />
                          ) : iconData ? (
                            <img
                              src={iconData.url}
                              alt={iconData.label}
                              className="h-5 w-5 object-contain"
                              loading="lazy"
                              onError={(e) => {
                                const el = e.currentTarget
                                el.style.display = "none"
                                const fallback = el.nextElementSibling as HTMLElement | null
                                if (fallback) fallback.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div
                            className="h-5 w-5 rounded bg-muted-foreground/20 items-center justify-center text-[10px] font-bold text-muted-foreground uppercase"
                            style={{ display: (iconData || regionCityFlagCode) ? "none" : "flex" }}
                          >
                            {displayName.charAt(0)}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Name */}
                    <span className="flex-1 text-sm font-medium truncate text-foreground/90">
                      {displayName || "Unknown"}
                    </span>

                    {/* Count + percent pipe separator */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-sm font-semibold tabular-nums w-8 text-right text-foreground">
                        {count.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right border-l border-border pl-2.5">
                        {totalPct}%
                      </span>
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

function TrafficHeatmap({ heatmap }: { heatmap: number[][] }) {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const HOURS = [
    "12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am",
    "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
  ]

  const localHeatmap = useMemo(() => {
    const shifted = Array.from({ length: 7 }, () => Array(24).fill(0));
    if (!heatmap) return shifted;

    const timezoneOffsetMinutes = new Date().getTimezoneOffset();

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const count = heatmap[d]?.[h] ?? 0;
        if (count > 0) {
          // Shift at minute-level granularity using the middle of the hour block (30 mins)
          let totalMinutes = (d * 24 + h) * 60 + 30 - timezoneOffsetMinutes;
          
          // Wrap around a 7-day week (7 days * 24 hours * 60 minutes = 10080 minutes)
          totalMinutes = (totalMinutes % 10080 + 10080) % 10080;
          
          const totalHours = Math.floor(totalMinutes / 60);
          const localD = Math.floor(totalHours / 24);
          const localH = totalHours % 24;
          shifted[localD][localH] += count;
        }
      }
    }
    return shifted;
  }, [heatmap])

  const maxClicks = useMemo(() => {
    let m = 1
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (localHeatmap[d][h] > m) {
          m = localHeatmap[d][h]
        }
      }
    }
    return m
  }, [localHeatmap])

  return (
    <div className="rounded-sm border border-border bg-card overflow-hidden flex flex-col">
      {/* Normal Casing Header */}
      <div className="px-5 pt-5 pb-3 shrink-0 border-b border-border/60">
        <h3 className="text-base font-bold text-foreground leading-none">Traffic Activity</h3>
        <p className="text-xs text-muted-foreground mt-1.5">
          Hourly click activity density across days of the week.
        </p>
      </div>
      
      <div className="px-3 py-4">
        <div className="min-w-[340px] space-y-1">
          {/* Header Row */}
          <div className="grid grid-cols-[50px_1fr] items-center gap-x-2 mb-2">
            <span className="text-[10px] text-muted-foreground font-mono text-right pr-2">Hour</span>
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          {/* 24 Hour Rows */}
          {Array.from({ length: 24 }).map((_, hIdx) => {
            const showLabel = hIdx % 2 === 0;
            return (
              <div key={hIdx} className="grid grid-cols-[50px_1fr] items-center gap-x-2">
                <span className="text-[10px] font-mono text-muted-foreground text-right pr-2 shrink-0 leading-none">
                  {showLabel ? HOURS[hIdx] : ""}
                </span>
                
                <div className="grid grid-cols-7 justify-items-center">
                  {Array.from({ length: 7 }).map((_, dIdx) => {
                    const count = localHeatmap[dIdx][hIdx]
                    const intensity = count / maxClicks
                    const opacity = count > 0 ? 0.3 + intensity * 0.7 : 1
                    
                    const tooltipXClass = dIdx <= 1 ? "left-0 -translate-x-0" : dIdx >= 5 ? "left-auto right-0 translate-x-0" : "left-1/2 -translate-x-1/2"
                    const tooltipYClass = hIdx <= 4 ? "top-full mt-2" : "bottom-full mb-2"
                    const tooltipAnimClass = hIdx <= 4 ? "slide-in-from-top-1" : "slide-in-from-bottom-1"
                    
                    return (
                      <div
                        key={dIdx}
                        className="flex items-center justify-center w-5 h-4 group relative"
                      >
                        <div
                          className={`rounded-[2px] transition-all duration-300 ${
                            count > 0 ? "bg-primary shadow-xs" : "bg-muted-foreground/15"
                          }`}
                          style={{
                            width: "12px",
                            height: "12px",
                            opacity: opacity,
                          }}
                        />
                        
                        {/* Tooltip matching Recharts ChartTooltip style */}
                        {count > 0 && (
                          <div className={`absolute hidden group-hover:block bg-popover/95 backdrop-blur-xs border border-border shadow-md rounded-sm p-2 min-w-[120px] z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none text-left ${tooltipXClass} ${tooltipYClass} ${tooltipAnimClass}`}>
                            <div className="text-[10px] font-medium text-muted-foreground leading-none mb-1">
                              {DAYS[dIdx]} • {HOURS[hIdx]}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-foreground mt-1 leading-none">
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              <span className="text-muted-foreground">Clicks</span>
                              <span className="font-semibold text-foreground ml-auto pl-4">{count.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ urls }: { urls: UrlResponse[] }) {
  if (urls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border py-20 gap-3 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground opacity-30" />
        <p className="font-medium">No links yet</p>
        <p className="text-sm text-muted-foreground">Shorten your first URL to start tracking.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center text-muted-foreground">
      <BarChart3 className="h-10 w-10 opacity-30" />
      <p className="font-medium">No clicks yet</p>
      <p className="text-sm">Share your short link to start collecting analytics.</p>
    </div>
  )
}

