import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Link2,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  Sliders,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


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
            <button
              onClick={() => navigate("/signin")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Sign in
            </button>
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
          className="relative w-full max-w-5xl px-4 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted/50">
              <Sparkles className="h-3.5 w-3.5 text-foreground" />
              Free URL Shortening & Live Metrics
            </Badge>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4 text-foreground text-center max-w-3xl">
            Clean short links.<br />Instant visitor insights.
          </motion.h1>

          <motion.p variants={itemVariants} className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 text-center">
            Transform long, clunky URLs into short, shareable links. Track visitor click counts, browsers, and devices immediately from a private dashboard.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="gap-2 px-6 h-10 text-sm shadow-sm cursor-pointer w-full sm:w-auto font-semibold"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.section>

        {/* Bento Grid Feature Section */}
        <section className="py-20 border-t border-border w-full flex flex-col items-center bg-muted/10">
          <div className="w-full max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-2">Platform Features</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How Shrtn Works & What It Offers
              </h2>
              <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
                A simple overview of the options, bounds, and security measures designed to keep your links active and safe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: URL Shortener & Quota */}
              <div className="md:col-span-2 border border-border bg-card text-card-foreground p-6 rounded-xl shadow-xs hover:border-muted-foreground/30 transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground mb-4">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Instant Link Shortener</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    Convert long, query-heavy links into clean, shareable short codes. The creation panel displays your usage in real-time, helping you track how many links you have generated toward your account quota.
                  </p>
                </div>
                <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground truncate">https://github.com/charanmunur/shrtn...</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mx-2" />
                  <span className="text-foreground font-bold font-mono">shrtn.fun/xK9mPq</span>
                </div>
              </div>

              {/* Card 2: Unified Link Dashboard */}
              <div className="border border-border bg-card text-card-foreground p-6 rounded-xl shadow-xs hover:border-muted-foreground/30 transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground mb-4">
                    <Link2 className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Unified Dashboard</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    Access all your shortened URLs from a single clean dashboard. Monitor active counters, track relative expirations, and perform swift updates without navigating complicated settings.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Centralized link hub</span>
                </div>
              </div>

              {/* Card 3: Link Expiry timers */}
              <div className="border border-border bg-card text-card-foreground p-6 rounded-xl shadow-xs hover:border-muted-foreground/30 transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground mb-4">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">30-Day Active Expiration</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    To maintain clean routing and prevent database clutter, each shortened link stays active for exactly 30 days. Perfect for monthly updates, short-term campaigns, or finite document shares.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <span>Relative countdown</span>
                  <span className="font-mono text-foreground font-bold">29d 23h remaining</span>
                </div>
              </div>

              {/* Card 4: Switch Status & Limits */}
              <div className="md:col-span-2 border border-border bg-card text-card-foreground p-6 rounded-xl shadow-xs hover:border-muted-foreground/30 transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground mb-4">
                    <Sliders className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Status & Quota Controls</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    Temporarily pause redirects anytime. Toggle any short link to 'Inactive' to stop routing visitors instantly. Users can manage up to 25 links concurrently, and deleting old links immediately restores your quota.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex-1 bg-muted h-2.5 rounded-full overflow-hidden border border-border/50">
                    <div className="bg-primary h-full w-[48%]" />
                  </div>
                  <span className="text-xs font-bold font-mono shrink-0">12 / 25 Links Used</span>
                </div>
              </div>

              {/* Card 5: Metrics Area Chart */}
              <div className="md:col-span-2 border border-border bg-card text-card-foreground p-6 rounded-xl shadow-xs hover:border-muted-foreground/30 transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground mb-4">
                    <BarChart3 className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Interactive Click Charting</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    Audit redirection stats across multiple periods. The analytics panel includes clean click charts showing traffic timelines over 7-day, 30-day, or all-time intervals.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-muted text-foreground font-semibold">7 Days</span>
                  <span className="px-2 py-1 rounded hover:bg-muted transition-colors">30 Days</span>
                  <span className="px-2 py-1 rounded hover:bg-muted transition-colors">All Time</span>
                </div>
              </div>

              {/* Card 6: User-Agent breakdown */}
              <div className="border border-border bg-card text-card-foreground p-6 rounded-xl shadow-xs hover:border-muted-foreground/30 transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground mb-4">
                    <Info className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Client Breakdowns</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    Understand your audience. The dashboard breaks down visits by visitor browser, OS classification, and logs individual redirection requests with IP info and relative time labels.
                  </p>
                </div>
                <div className="mt-6 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Chrome</span>
                    <span className="text-foreground font-bold">72%</span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[72%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Collapsible FAQ Section */}
        <section className="w-full max-w-3xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-2">Common Inquiries</Badge>
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
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-20 sm:py-24 border-t border-border bg-muted/10 flex flex-col items-center">
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
                size="lg"
                onClick={() => navigate("/signup")}
                className="gap-2 px-6 h-10 text-xs shadow-sm cursor-pointer w-full sm:w-auto font-semibold"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate("/signin")}
                className="text-muted-foreground hover:text-foreground h-10 text-xs cursor-pointer w-full sm:w-auto"
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
