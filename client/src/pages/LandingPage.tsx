import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Link2,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sliders,
  QrCode,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"


const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 14,
      mass: 1,
    },
  },
} as const

const FAQ_ITEMS = [
  {
    question: "Is this link shortening service really free?",
    answer: "Yes, Shrtn is free to use. You can register an account, shorten links, and access detailed redirection analytics at no cost."
  },
  {
    question: "Why do links expire after 30 days?",
    answer: "Links expire automatically 30 days after they are created to prevent link rot and keep our redirects fast and uncluttered. This makes it ideal for temporary campaigns, sharing in emails, or social media updates."
  },
  {
    question: "What is the maximum number of links I can create?",
    answer: "Each user account can have up to 25 active short links at the same time. If you reach this limit, you can delete old or inactive links to free up space for new ones."
  },
  {
    question: "Why do I need to verify my email address?",
    answer: "To ensure that all accounts belong to active, valid users, we send a one-time 6-digit verification code (OTP) to your email during registration. This verification secures your account, validates your login credentials, and protects your links."
  },
  {
    question: "Can I temporarily disable a link?",
    answer: "Yes. From your dashboard, you can turn any link 'Inactive' at any time. When disabled, visitors will see an error page instead of being redirected. You can toggle the link back to 'Active' whenever you are ready."
  }
]

export function LandingPage() {
  const navigate = useNavigate()
  
  // Set SEO Meta title and description
  useEffect(() => {
    document.title = "Shrtn — Clean & Minimalist URL Shortener"
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute("content", "Instantly shorten long URLs, manage your active links, and analyze redirection statistics in real time.")
    }
  }, [])

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col font-sans">

      {/* Sticky Glassmorphism Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Link2 className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold tracking-tight text-foreground">Shrtn</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/signin")}
              className="cursor-pointer text-xs font-semibold"
            >
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate("/signup")} className="cursor-pointer text-xs">
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col items-center">

        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 flex flex-col items-center justify-center text-center overflow-hidden border-b border-border bg-gradient-to-b from-background via-muted/5 to-background"
        >
          {/* Subtle Ambient Gradient Light */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

          <div className="relative max-w-3xl flex flex-col items-center z-10 py-12">


            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-foreground text-center">
              Clean Short Links.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                Instant visitor insights.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed mb-10 text-center">
              Transform long, clunky URLs into short, shareable links. Generate custom QR codes and track visitor click counts, browsers, and devices immediately from a private dashboard.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
              <Button
                onClick={() => navigate("/signup")}
                className="gap-2 px-5 h-10 text-xs shadow-xs cursor-pointer w-full sm:w-auto font-semibold"
              >
                Get Started for Free
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const element = document.getElementById("how-it-works")
                  element?.scrollIntoView({ behavior: "smooth" })
                }}
                className="h-10 text-xs cursor-pointer w-full sm:w-auto font-semibold"
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full min-h-[calc(100vh-3.5rem)] py-16 flex flex-col items-center justify-center border-b border-border bg-muted/5 relative">
          <div className="w-full max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-16">

              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Three Steps to Better Links
              </h2>
              <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
                Shrtn streamlines the process of sharing URLs and monitoring their performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Process Step 1 */}
              <div className="flex flex-col items-start p-6 rounded-xl border border-border/60 bg-card text-left relative">
                <span className="absolute -top-4 left-6 text-3xl font-black text-primary/10 select-none">01</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 font-bold">
                  <Sliders className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">1. Shorten URLs</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Paste any long, query-heavy link into our shorten form. Generate a clean, 6-character Base62 short URL instantly.
                </p>
              </div>

              {/* Process Step 2 */}
              <div className="flex flex-col items-start p-6 rounded-xl border border-border/60 bg-card text-left relative">
                <span className="absolute -top-4 left-6 text-3xl font-black text-primary/10 select-none">02</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 font-bold">
                  <QrCode className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">2. Enable QR Codes</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Turn on QR codes for your short URLs. Scan them or download high-resolution PNG files directly for print or digital media.
                </p>
              </div>

              {/* Process Step 3 */}
              <div className="flex flex-col items-start p-6 rounded-xl border border-border/60 bg-card text-left relative">
                <span className="absolute -top-4 left-6 text-3xl font-black text-primary/10 select-none">03</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 font-bold">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">3. Track Analytics</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Access click timelines, browser logs, OS splits, and real-time counters from your private analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase: Analytics */}
        <section className="w-full min-h-[calc(100vh-3.5rem)] py-16 flex flex-col items-center justify-center border-b border-border bg-background relative">
          <div className="w-full max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-left space-y-4">

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Monitor Redirection Stats in Real Time
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Understand exactly who is visiting your short links. The analytics dashboard compiles click history and classifies client request details into readable graphs and metrics:
                </p>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Real-time click counts and time series graphs (7d, 30d, all-time)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>User-agent breakdown: Browser & OS classifications (Chrome, Safari, macOS, Linux, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Click log audits containing IP logs and relative timestamps</span>
                  </li>
                </ul>
              </div>

              <div className="flex-1 w-full max-w-md border border-border bg-card p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-bold text-foreground">Visits Over Time</span>
                  <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">7 Days</span>
                </div>
                {/* Fake Chart Preview */}
                <div className="h-32 flex items-end gap-2.5 px-2 bg-muted/20 rounded-lg border border-border/45 py-2">
                  {[20, 45, 30, 80, 50, 95, 70].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full bg-primary/20 hover:bg-primary rounded-t transition-all duration-300"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground font-mono">Day {i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono pt-1 text-muted-foreground">
                  <span>Total Clicks: <strong className="text-foreground">245</strong></span>
                  <span>Avg/Day: <strong className="text-foreground">35</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase: QR Code Ecosystem */}
        <section className="w-full min-h-[calc(100vh-3.5rem)] py-16 flex flex-col items-center justify-center border-b border-border bg-muted/5 relative">
          <div className="w-full max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 text-left space-y-4">

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Built-in Custom QR Code Engine
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every shortened URL includes a direct path to its own QR code, ideal for packaging, physical signage, business cards, or offline ads.
                </p>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Clean QR Codes generated on-the-fly directly from the backend API</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Downloadable high-resolution PNG format for easy printing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Enable or disable QR codes at any time from your dashboard</span>
                  </li>
                </ul>
              </div>

              {/* Simulated QR Code Card */}
              <div className="flex-1 w-full max-w-xs border border-border bg-card overflow-hidden rounded-2xl shadow-xs">
                <div className="aspect-square w-full bg-white flex items-center justify-center border-b border-border/80 p-6">
                  {/* Fake QR Image placeholder */}
                  <div className="relative h-44 w-44 bg-muted flex items-center justify-center rounded border border-border border-dashed">
                    <QrCode className="h-20 w-20 text-muted-foreground/30 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between bg-card text-left">
                  <div>
                    <p className="text-xs font-mono font-bold text-primary">/mK9mPq</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">shrtn.fun/mK9mPq</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 px-2.5">
                    <Download className="h-3 w-3" /> Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase: Limits & Status Controls */}
        <section className="w-full min-h-[calc(100vh-3.5rem)] py-16 flex flex-col items-center justify-center border-b border-border bg-background relative">
          <div className="w-full max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-left space-y-4">

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Keep Your Redirects Clean & Organized
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We enforce simple, sensible limits to prevent spam, maintain maximum database performance, and ensure your redirection link flows remain secure.
                </p>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span><strong>25 Links Quota</strong>: Manage up to 25 links. Recycle slots by deleting old links.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span><strong>30-Day Auto Expiry</strong>: Links expire 30 days after creation to prevent link rot.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span><strong>Status Switcher</strong>: Toggle links to &apos;Inactive&apos; to pause redirection instantly.</span>
                  </li>
                </ul>
              </div>

              <div className="flex-1 w-full max-w-md border border-border bg-card p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-bold text-foreground">Quota & Controls</span>
                  <span className="text-[10px] font-semibold text-green-500 bg-green-950/20 px-2 py-0.5 rounded border border-green-500/20">Secure</span>
                </div>
                {/* Quota visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">URL Quota Usage</span>
                    <span className="font-bold font-mono">12 / 25 links</span>
                  </div>
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border/50">
                    <div className="bg-primary h-full w-[48%]" />
                  </div>
                </div>
                {/* Status Switcher visual */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/40 pt-3">
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">Link Status</p>
                    <p className="text-[10px] text-muted-foreground">Visitors will be redirected</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-primary rounded-full relative flex items-center px-0.5 cursor-pointer">
                      <div className="w-3 h-3 bg-background rounded-full translate-x-4 transition-transform" />
                    </div>
                    <span className="text-[10px] font-bold text-green-500 uppercase">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Collapsible FAQ Section */}
        <section className="w-full min-h-[calc(100vh-3.5rem)] py-16 flex flex-col items-center justify-center border-b border-border bg-muted/5 relative">
          <div className="w-full max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-12">

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-muted-foreground/30"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full py-4 px-5 text-left font-semibold text-foreground flex items-center justify-between focus:outline-none cursor-pointer border-0 bg-transparent"
                    >
                      <span className="text-xs sm:text-sm pr-4">{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3 text-left">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full min-h-[calc(100vh-3.5rem)] py-16 flex flex-col items-center justify-center border-t border-border bg-muted/5 relative">
          <div className="w-full max-w-3xl px-4 sm:px-6 text-center flex flex-col items-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Link2 className="h-5.5 w-5.5" />
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Start Shortening Links Today
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-8 max-w-md leading-relaxed">
              Register for your free account, shorten your first link, and observe click updates in real time. No passwords or credit cards needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
              <Button
                onClick={() => navigate("/signup")}
                className="gap-2 px-5 h-10 text-xs shadow-xs cursor-pointer w-full sm:w-auto font-semibold"
              >
                Create Free Account
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/signin")}
                className="h-10 text-xs cursor-pointer w-full sm:w-auto font-semibold"
              >
                Already have an account? Sign in
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-border bg-background py-10">
        <div className="w-full mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8 pb-8">
            {/* Brand */}
            <div className="max-w-xs text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Link2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-foreground tracking-tight">Shrtn</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A clean, minimalist link shortening tool built for creators, marketers, and temporary campaign sharing.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16 text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">App</p>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left focus:outline-none border-0 bg-transparent p-0"
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left focus:outline-none border-0 bg-transparent p-0"
                    >
                      Redirection Metrics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left focus:outline-none border-0 bg-transparent p-0"
                    >
                      My Shortlinks
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Account</p>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => navigate("/signin")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left focus:outline-none border-0 bg-transparent p-0"
                    >
                      Sign In
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/signup")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left focus:outline-none border-0 bg-transparent p-0"
                    >
                      Sign Up
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright & Author */}
          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <p>© {new Date().getFullYear()} Shrtn. All rights reserved.</p>
            <p>
              Made by{" "}
              <a
                href="https://www.charanmunur.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary"
              >
                charanmunur
              </a>
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
