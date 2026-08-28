import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useTheme } from "@/providers/theme-provider"
import { getUserUrls } from "@/lib/urls-api"
import { ShieldCheck, Sun, Moon, Monitor, Sparkles, Link2 } from "lucide-react"

export function PersonalInfoPage() {
  const { token, email } = useAuth()
  const { theme, setTheme } = useTheme()
  const [urlCount, setUrlCount] = useState<number | null>(null)
  const URL_LIMIT = 25

  useEffect(() => {
    if (token) {
      getUserUrls(token).then((urls) => setUrlCount(urls.length)).catch(() => {})
    }
  }, [token])

  const username = email ? email.split("@")[0] : "—"
  const usedPct = urlCount !== null ? Math.min((urlCount / URL_LIMIT) * 100, 100) : 0

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal Info</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details, plan, and preferences.
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold border border-primary/20">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{username}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Username</p>
              <p className="text-sm font-medium text-foreground">{username}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{email ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground">Plan</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Free Plan</p>
                <p className="text-xs text-muted-foreground">No credit card required</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground">
              Free
            </span>
          </div>

          {/* Link usage */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                <span>Short links used</span>
              </div>
              <span className="font-semibold tabular-nums text-foreground">
                {urlCount !== null ? `${urlCount} / ${URL_LIMIT}` : "—"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usedPct >= 100 ? "bg-destructive" : usedPct >= 80 ? "bg-amber-500" : "bg-primary"
                }`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            {urlCount !== null && (
              <p className="text-xs text-muted-foreground text-right">
                {URL_LIMIT - urlCount} remaining
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground mb-3">Choose your preferred interface theme.</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
              { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
              { id: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all cursor-pointer ${
                  theme === t.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
