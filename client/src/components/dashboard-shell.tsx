import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Link,
  Link2,
  BarChart2,
  LogOut,
  Settings,
  Sun,
  Moon,
  Monitor,
  MoreHorizontal,
  User,
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
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"

type Page = "dashboard" | "shorten" | "links" | "analytics" | "settings" | "personal-info" | "qrcodes"

const NAV_ITEMS: { id: Exclude<Page, "settings" | "personal-info">; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "shorten", label: "Shorten URL", icon: <Link className="h-4 w-4" /> },
  { id: "links", label: "My Links", icon: <Link2 className="h-4 w-4" /> },
  { id: "qrcodes", label: "QR Codes", icon: <QrCode className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
]

export function DashboardShell() {
  const { email, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

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
  }

  function viewAnalytics(shortCode: string) {
    navigate(`/dashboard/analytics/${shortCode}`)
  }

  const username = email ? email.split("@")[0] : "User"
  const initials = username.slice(0, 2).toUpperCase()

  const pageLabel =
    NAV_ITEMS.find((n) => n.id === page)?.label ??
    (page === "settings" ? "Settings" : page === "personal-info" ? "Personal Info" : "Dashboard")

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
          {/* Top: Header / Brand */}
          <SidebarHeader className="flex h-14 shrink-0 flex-row items-center justify-between px-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <img 
                src="/logo.svg" 
                className="h-[20px] w-auto dark:invert shrink-0 select-none" 
                alt="shrtn logo" 
              />
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-sidebar-border text-muted-foreground bg-muted/50 shrink-0 group-data-[collapsible=icon]:hidden">
              Free
            </span>
          </SidebarHeader>

          {/* Navigation links */}
          <SidebarContent className="px-2 py-3">
            <SidebarGroup className="p-0">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {NAV_ITEMS.map((item) => {
                    const active = page === item.id
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={active}
                          onClick={() => navigateTo(item.id)}
                          tooltip={item.label}
                          className="h-9 px-3 cursor-pointer text-sm font-medium transition-colors"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer: User Profile & Menu */}
          <SidebarFooter className="border-t border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-sm p-2 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer outline-none">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {initials}
                    </div>
                    <span className="flex-1 text-sm font-medium text-sidebar-foreground truncate min-w-0 group-data-[collapsible=icon]:hidden">
                      {username}
                    </span>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="w-64 p-0 rounded-sm border border-border bg-popover shadow-xl overflow-hidden"
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
                        className="shrink-0 p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Theme switcher */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-sm text-foreground">Theme</span>
                      <div className="flex items-center bg-muted rounded-sm p-0.5 border border-border/60">
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
                        className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
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
                        className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer group"
                      >
                        Log Out
                        <LogOut className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-background">
          <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4 gap-3">
            <SidebarTrigger className="cursor-pointer" />
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
        </SidebarInset>
      </div>
    </SidebarProvider>
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
