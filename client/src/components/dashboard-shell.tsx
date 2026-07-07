import { useState } from "react"
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Link2,
  BarChart2,
  Scissors,
  LogOut,
  Settings,
  Sun,
  Moon,
  Monitor,
  MoreHorizontal,
  User,
  Menu,
  X,
  QrCode,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { useTheme } from "@/providers/theme-provider"
import { DashboardPage } from "@/pages/DashboardPage"
import { MyLinksPage } from "@/pages/MyLinksPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { ShortenPage } from "@/pages/ShortenPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { PersonalInfoPage } from "@/pages/PersonalInfoPage"
import { QrCodesPage } from "@/pages/QrCodesPage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type Page = "dashboard" | "shorten" | "links" | "analytics" | "settings" | "personal-info" | "qrcodes"

const NAV_ITEMS: { id: Exclude<Page, "settings" | "personal-info">; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "shorten", label: "Shorten URL", icon: <Scissors className="h-4 w-4" /> },
  { id: "links", label: "My Links", icon: <Link2 className="h-4 w-4" /> },
  { id: "qrcodes", label: "QR Codes", icon: <QrCode className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
]

export function DashboardShell() {
  const { email, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pathname = location.pathname.replace(/\/$/, "")
  const page: Page = (() => {
    if (pathname.includes("/dashboard/shorten")) return "shorten"
    if (pathname.includes("/dashboard/links")) return "links"
    if (pathname.includes("/dashboard/qrcodes")) return "qrcodes"
    if (pathname.includes("/dashboard/analytics")) return "analytics"
    if (pathname.includes("/dashboard/settings")) return "settings"
    if (pathname.includes("/dashboard/personal-info")) return "personal-info"
    return "dashboard"
  })()

  function navigateTo(p: Page) {
    navigate(p === "dashboard" ? "/dashboard" : `/dashboard/${p}`)
    setSidebarOpen(false)
  }

  function viewAnalytics(shortCode: string) {
    navigate(`/dashboard/analytics/${shortCode}`)
    setSidebarOpen(false)
  }

  const username = email ? email.split("@")[0] : "User"
  const initials = username.slice(0, 2).toUpperCase()

  const pageLabel =
    NAV_ITEMS.find((n) => n.id === page)?.label ??
    (page === "settings" ? "Settings" : page === "personal-info" ? "Personal Info" : "Dashboard")

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col w-[240px] shrink-0 border-r border-border bg-background h-full transition-transform duration-300 md:translate-x-0 z-50
          fixed inset-y-0 left-0 md:static
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Top: brand row */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 px-3 border-b border-border">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold truncate flex-1 text-foreground">Shrtn</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted/50 shrink-0">
            Free
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                <span className={active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer: avatar + username + … */}
        <div className="border-t border-border px-2 pt-3.5 pb-3.5">
          <div className="flex items-center gap-2 px-1">
            {/* Avatar */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {initials}
            </div>

            {/* Username */}
            <span className="flex-1 text-sm font-medium text-foreground truncate min-w-0">
              {username}
            </span>

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                title="Menu"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="end"
                sideOffset={8}
                className="w-64 p-0 rounded-xl border border-border bg-popover shadow-xl overflow-hidden"
              >
                {/* User info header */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{username}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo("settings")}
                    title="Settings"
                    className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Theme switcher */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                  <span className="text-sm text-foreground">Theme</span>
                  <div className="flex items-center bg-muted rounded-md p-0.5 border border-border/60">
                    {[
                      { id: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "System" },
                      { id: "light", icon: <Sun className="h-3.5 w-3.5" />, label: "Light" },
                      { id: "dark", icon: <Moon className="h-3.5 w-3.5" />, label: "Dark" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        title={t.label}
                        onClick={() => setTheme(t.id as any)}
                        className={`p-1.5 rounded transition-all cursor-pointer ${
                          theme === t.id
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Info */}
                <div className="px-1 py-1">
                  <button
                    type="button"
                    onClick={() => navigateTo("personal-info")}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
                  >
                    Personal Info
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>

                <DropdownMenuSeparator className="my-0" />

                {/* Log Out */}
                <div className="px-1 py-1">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer group"
                  >
                    Log Out
                    <LogOut className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-5 gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">{pageLabel}</span>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<AnimatedPage><DashboardPage onNavigate={navigateTo} /></AnimatedPage>} />
            <Route path="/shorten" element={<AnimatedPage><ShortenPage /></AnimatedPage>} />
            <Route path="/links" element={<AnimatedPage><MyLinksPage onViewAnalytics={viewAnalytics} /></AnimatedPage>} />
            <Route path="/qrcodes" element={<AnimatedPage><QrCodesPage /></AnimatedPage>} />
            <Route path="/analytics" element={<AnimatedPage><AnalyticsPage /></AnimatedPage>} />
            <Route path="/analytics/:shortCode" element={<AnimatedPage><AnalyticsPage /></AnimatedPage>} />
            <Route path="/settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />
            <Route path="/personal-info" element={<AnimatedPage><PersonalInfoPage /></AnimatedPage>} />
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  )
}
