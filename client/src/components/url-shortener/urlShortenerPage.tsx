import { useEffect, useState } from "react"

import { ShortenedUrlResult } from "@/components/url-shortener/shortenedUrlResult"
import { UrlShortenerForm } from "@/components/url-shortener/urlShortenerForm"
import { UrlShortenerHeader } from "@/components/url-shortener/urlShortenerHeader"
import { ModeToggle } from "@/features/theme/mode-toggle"
import { createShortUrl } from "@/lib/urls-api"

export function UrlShortenerPage() {
  const [longUrl, setLongUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => window.clearTimeout(timeoutId)
  }, [copied])

  async function handleSubmit() {
    const trimmedUrl = longUrl.trim()
    if (!trimmedUrl) {
      setShortUrl("")
      setError("Paste a URL first.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setCopied(false)

    try {
      const data = await createShortUrl({ originalUrl: trimmedUrl })
      if (!data.shortUrl) {
        throw new Error("The server returned an empty short URL.")
      }

      setShortUrl(data.shortUrl)
    } catch (submitError) {
      setShortUrl("")
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while shortening the URL."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
  } 

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.18),transparent_38%),linear-gradient(180deg,var(--background)_0%,var(--background)_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b from-primary/5 to-transparent" />
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ModeToggle />
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center">
        <section className="w-full space-y-10">
          <UrlShortenerHeader />
          <div className="space-y-6">
            <UrlShortenerForm
              isSubmitting={isSubmitting}
              value={longUrl}
              onChange={setLongUrl}
              onSubmit={handleSubmit}
            />
            <ShortenedUrlResult
              copied={copied}
              error={error}
              shortUrl={shortUrl}
              onCopy={handleCopy}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
