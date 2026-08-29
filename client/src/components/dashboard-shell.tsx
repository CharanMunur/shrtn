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
          <div className="flex-1 flex items-center min-w-0 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="290 515 705 220" className="h-[20px] w-auto text-foreground shrink-0 select-none">
              <g fill="currentColor">
                <path d="M 631.00 617.00 C 625.17 617.00 603.50 616.67 596.00 617.00 C 588.50 617.33 589.67 617.83 586.00 619.00 C 582.33 620.17 578.50 621.00 574.00 624.00 C 569.50 627.00 562.50 633.17 559.00 637.00 C 555.50 640.83 554.67 643.17 553.00 647.00 C 551.33 650.83 549.67 646.17 549.00 660.00 C 548.33 673.83 549.00 718.33 549.00 730.00 L 567.00 730.00 C 567.00 719.67 566.50 680.33 567.00 668.00 C 567.50 655.67 568.67 659.33 570.00 656.00 C 571.33 652.67 572.83 650.50 575.00 648.00 C 577.17 645.50 580.17 642.83 583.00 641.00 C 585.83 639.17 584.00 637.67 592.00 637.00 C 600.00 636.33 624.50 637.00 631.00 637.00 L 631.00 617.00 Z"/>
                <path d="M 742.00 730.00 L 760.00 730.00 C 760.00 719.17 759.17 678.33 760.00 665.00 C 760.83 651.67 762.33 654.33 765.00 650.00 C 767.67 645.67 773.17 641.33 776.00 639.00 C 778.83 636.67 778.67 636.83 782.00 636.00 C 785.33 635.17 790.67 634.17 796.00 634.00 C 801.33 633.83 810.00 634.50 814.00 635.00 C 818.00 635.50 816.67 634.67 820.00 637.00 C 823.33 639.33 831.00 645.67 834.00 649.00 C 837.00 652.33 837.00 654.00 838.00 657.00 C 839.00 660.00 839.67 654.83 840.00 667.00 C 840.33 679.17 840.00 719.50 840.00 730.00 L 858.00 730.00 C 858.00 718.00 859.17 673.17 858.00 658.00 C 856.83 642.83 854.17 644.33 851.00 639.00 C 847.83 633.67 843.00 629.33 839.00 626.00 C 835.00 622.67 830.83 620.67 827.00 619.00 C 823.17 617.33 823.17 616.50 816.00 616.00 C 808.83 615.50 792.17 615.00 784.00 616.00 C 775.83 617.00 772.50 618.67 767.00 622.00 C 761.50 625.33 754.67 631.83 751.00 636.00 C 747.33 640.17 746.67 642.33 745.00 647.00 C 743.33 651.67 741.50 650.17 741.00 664.00 C 740.50 677.83 741.83 719.00 742.00 730.00 Z"/>
                <path d="M 306.00 701.00 L 295.00 716.00 C 297.83 717.83 305.50 724.33 312.00 727.00 C 318.50 729.67 326.00 731.33 334.00 732.00 C 342.00 732.67 352.83 732.17 360.00 731.00 C 367.17 729.83 372.50 727.50 377.00 725.00 C 381.50 722.50 384.50 719.50 387.00 716.00 C 389.50 712.50 391.17 708.17 392.00 704.00 C 392.83 699.83 393.17 695.33 392.00 691.00 C 390.83 686.67 387.50 681.17 385.00 678.00 C 382.50 674.83 380.00 673.67 377.00 672.00 C 374.00 670.33 375.50 670.00 367.00 668.00 C 358.50 666.00 334.33 662.33 326.00 660.00 C 317.67 657.67 318.67 656.67 317.00 654.00 C 315.33 651.33 314.83 647.00 316.00 644.00 C 317.17 641.00 320.50 637.83 324.00 636.00 C 327.50 634.17 332.83 633.50 337.00 633.00 C 341.17 632.50 344.67 632.50 349.00 633.00 C 353.33 633.50 358.17 634.00 363.00 636.00 C 367.83 638.00 375.50 643.50 378.00 645.00 L 389.00 629.00 C 386.00 627.33 377.17 621.33 371.00 619.00 C 364.83 616.67 359.17 615.67 352.00 615.00 C 344.83 614.33 334.83 613.83 328.00 615.00 C 321.17 616.17 315.33 619.50 311.00 622.00 C 306.67 624.50 304.50 626.33 302.00 630.00 C 299.50 633.67 296.83 639.67 296.00 644.00 C 295.17 648.33 296.00 652.33 297.00 656.00 C 298.00 659.67 299.50 663.00 302.00 666.00 C 304.50 669.00 309.00 672.17 312.00 674.00 C 315.00 675.83 311.33 675.00 320.00 677.00 C 328.67 679.00 355.33 683.33 364.00 686.00 C 372.67 688.67 370.50 690.33 372.00 693.00 C 373.50 695.67 374.00 699.17 373.00 702.00 C 372.00 704.83 368.50 708.17 366.00 710.00 C 363.50 711.83 363.00 712.33 358.00 713.00 C 353.00 713.67 342.33 714.50 336.00 714.00 C 329.67 713.50 325.00 712.17 320.00 710.00 C 315.00 707.83 308.33 702.50 306.00 701.00 Z"/>
                <path d="M 651.00 586.00 C 651.00 603.00 650.50 668.83 651.00 688.00 C 651.50 707.17 652.00 696.33 654.00 701.00 C 656.00 705.67 658.83 711.67 663.00 716.00 C 667.17 720.33 674.33 724.67 679.00 727.00 C 683.67 729.33 683.83 729.50 691.00 730.00 C 698.17 730.50 716.83 730.00 722.00 730.00 L 721.00 711.00 C 715.67 710.83 696.17 711.33 689.00 710.00 C 681.83 708.67 681.17 706.67 678.00 703.00 C 674.83 699.33 671.33 699.00 670.00 688.00 C 668.67 677.00 670.00 645.50 670.00 637.00 L 721.00 636.00 L 722.00 617.00 L 671.00 617.00 L 670.00 586.00 L 651.00 586.00 Z"/>
                <path d="M 412.00 572.00 L 412.00 730.00 L 431.00 730.00 C 431.00 718.83 430.17 676.33 431.00 663.00 C 431.83 649.67 433.33 654.00 436.00 650.00 C 438.67 646.00 442.33 641.67 447.00 639.00 C 451.67 636.33 457.67 634.67 464.00 634.00 C 470.33 633.33 480.00 634.17 485.00 635.00 C 490.00 635.83 491.00 637.00 494.00 639.00 C 497.00 641.00 500.33 643.00 503.00 647.00 C 505.67 651.00 508.83 649.17 510.00 663.00 C 511.17 676.83 510.00 718.83 510.00 730.00 L 529.00 730.00 C 529.00 718.83 529.67 676.83 529.00 663.00 C 528.33 649.17 526.67 651.50 525.00 647.00 C 523.33 642.50 521.17 639.17 519.00 636.00 C 523.33 642.50 521.17 639.17 519.00 636.00 Z"/>
                <path d="M 907.00 563.00 C 903.17 566.83 888.50 580.50 884.00 586.00 C 879.50 591.50 880.67 592.17 880.00 596.00 C 879.33 599.83 879.50 605.33 880.00 609.00 C 880.50 612.67 880.83 614.67 883.00 618.00 C 885.17 621.33 889.33 626.33 893.00 629.00 C 896.67 631.67 901.17 633.17 905.00 634.00 C 908.83 634.83 911.67 635.17 916.00 634.00 C 920.33 632.83 925.83 630.83 931.00 627.00 C 936.17 623.17 944.17 614.67 947.00 611.00 C 949.83 607.33 948.83 607.17 948.00 605.00 C 947.17 602.83 943.83 599.17 942.00 598.00 C 940.17 596.83 941.50 594.83 937.00 598.00 C 932.50 601.17 920.17 613.83 915.00 617.00 C 909.83 620.17 908.67 618.00 906.00 617.00 C 903.33 616.00 900.50 612.67 899.00 611.00 C 897.50 609.33 897.33 608.83 897.00 607.00 C 896.67 605.17 896.67 601.83 897.00 600.00 C 897.33 598.17 895.33 600.00 899.00 596.00 C 902.67 592.00 915.67 580.17 919.00 576.00 C 922.33 571.83 920.17 573.00 919.00 571.00 C 917.83 569.00 914.00 565.33 912.00 564.00 C 910.00 562.67 907.83 563.17 907.00 563.00 Z"/>
                <path d="M 953.00 522.00 C 951.33 522.67 948.00 522.00 943.00 526.00 C 938.00 530.00 926.33 541.67 923.00 546.00 C 919.67 550.33 921.83 549.83 923.00 552.00 C 924.17 554.17 928.17 557.83 930.00 559.00 C 931.83 560.17 929.83 562.17 934.00 559.00 C 938.17 555.83 950.17 543.33 955.00 540.00 C 959.83 536.67 960.67 538.67 963.00 539.00 C 965.33 539.33 967.17 540.33 969.00 542.00 C 970.83 543.67 973.33 546.17 974.00 549.00 C 974.67 551.83 976.67 553.67 973.00 559.00 C 969.33 564.33 955.50 576.33 952.00 581.00 C 948.50 585.67 951.00 585.00 952.00 587.00 C 953.00 589.00 956.00 592.00 958.00 593.00 C 960.00 594.00 959.17 596.83 964.00 593.00 C 968.83 589.17 982.50 575.33 987.00 570.00 C 991.50 564.67 990.17 564.33 991.00 561.00 C 991.83 557.67 992.83 554.50 992.00 550.00 C 991.17 545.50 988.00 537.67 986.00 534.00 C 984.00 530.33 983.17 530.00 980.00 528.00 C 976.83 526.00 971.50 523.00 967.00 522.00 C 962.50 521.00 955.33 522.00 953.00 522.00 Z"/>
              </g>
            </svg>
          </div>
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
