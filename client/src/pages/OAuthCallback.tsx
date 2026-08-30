import { useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/providers/auth-provider"
import { requestJson } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface AuthResponse {
  token: string
  message?: string
}

import { toast } from "sonner"

const globalExchangedCodes = new Set<string>()

export function OAuthCallback() {
  const { provider } = useParams<{ provider: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const code = searchParams.get("code")

  useEffect(() => {
    if (!code || !provider) {
      navigate("/signin?error=Invalid OAuth request", { replace: true })
      return
    }

    if (globalExchangedCodes.has(code)) {
      return
    }
    globalExchangedCodes.add(code)

    const exchangeCode = async () => {
      try {
        const response = await requestJson<AuthResponse>(`/api/v1/auth/oauth/${provider}`, {
          method: "POST",
          body: { code },
        })

        // Decode the email/sub from JWT payload
        const base64Url = response.token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        )
        const payload = JSON.parse(jsonPayload)
        const email = payload.sub || ""

        loginWithToken(response.token, email)
        toast.success(`Successfully signed in via ${provider.toUpperCase()}!`)
        navigate("/dashboard", { replace: true })
      } catch (err: any) {
        console.error("OAuth callback exchange error:", err)
        navigate(`/signin?error=${encodeURIComponent(err.message || "Failed to login with " + provider)}`, { replace: true })
      }
    }

    exchangeCode()
  }, [code, provider, navigate, loginWithToken])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-muted-foreground gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm font-medium">Completing secure sign-in...</span>
    </div>
  )
}
