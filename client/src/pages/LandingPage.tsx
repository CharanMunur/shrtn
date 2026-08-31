import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/providers/theme-provider"
import { useAuth } from "@/providers/auth-provider"
import { getAppDashboardBaseUrl } from "@/lib/env"
import {
  ArrowRight,
  ChevronDown,
  Grip,
  Menu,
  Zap,
  Globe2,
  Map,
  X,
} from "lucide-react"

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1,
    },
  },
}

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

type FeatureTabKey = "redirects" | "analytics" | "qr" | "privacy"

const FEATURE_TABS: Array<{
  key: FeatureTabKey
  title: string
  heading: string
  body: string
  highlights: string[]
}> = [
  {
    key: "redirects",
    title: "Fast, controlled short links",
    heading: "Short links built for daily use",
    body: "Create clean short links with generated Base62 codes or your own custom alias. Every link includes an expiry window, ownership checks, active or inactive status, and a dashboard record with its destination and click count.",
    highlights: [
      "Custom aliases",
      "Expiry controls",
      "Active status toggles",
    ],
  },
  {
    key: "analytics",
    title: "Detailed click analytics",
    heading: "Actionable Analytics",
    body: "Understand how each link performs with analytics across total clicks, recent visits, referrers, browsers, operating systems, devices, countries, regions, cities, and activity by date and hour.",
    highlights: [
      "Device, OS, browser",
      "Country, region, city",
      "Date and hour patterns",
    ],
  },
  {
    key: "qr",
    title: "QR code generation",
    heading: "Instant QR Codes",
    body: "Turn any active short link into a QR code when you need an offline entry point. QR access is tied to the same destination and can be enabled or revoked from the link record.",
    highlights: [
      "300px PNG output",
      "Enable or revoke",
      "Same tracked link",
    ],
  },
  {
    key: "privacy",
    title: "Secure accounts and ownership",
    heading: "Account-first link management",
    body: "Shrtn keeps link operations tied to verified accounts. Registration uses email OTP verification, sessions use JWT authentication, and protected actions check ownership before links, analytics, QR state, or password changes are modified.",
    highlights: [
      "Email OTP verification",
      "JWT sessions",
      "Owner-only actions",
    ],
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { token } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeFeatureTab, setActiveFeatureTab] =
    useState<FeatureTabKey>("analytics")
  const activeFeatureTabData =
    FEATURE_TABS.find((tab) => tab.key === activeFeatureTab) ?? FEATURE_TABS[0]
  const activeFeatureTabIndex = FEATURE_TABS.findIndex(
    (tab) => tab.key === activeFeatureTab
  )
  const nextFeatureTab =
    FEATURE_TABS[(activeFeatureTabIndex + 1) % FEATURE_TABS.length]
  
  const appBase = getAppDashboardBaseUrl()

  const goToSignIn = () => {
    window.location.href = `${appBase}/signin`
  }

  const goToSignUp = () => {
    window.location.href = `${appBase}/signup`
  }

  const goToDashboard = () => {
    window.location.href = `${appBase}/dashboard`
  }

  // Ensure the page starts at the top and force light mode
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Shrtn — Intelligent Link Management"
    setTheme("light")
  }, [setTheme])

  return (
    // We enforce light mode for the landing page to match the 0labs aesthetic
    <div className="bg-[#FAFAFA] text-[#1E1E1E] min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#1E1E1E] selection:text-white">
      
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-[80px] backdrop-blur-xl border-b flex items-center justify-between px-6 lg:px-12" style={{ backgroundColor: 'rgba(252,252,252,0.55)', borderBottomColor: 'rgba(224,224,224,0.4)' }}>
        <img 
          src="/logo.svg" 
          className="h-[24px] w-auto shrink-0 select-none cursor-pointer" 
          alt="shrtn logo" 
          onClick={() => navigate("/")}
        />

        <nav className="hidden md:flex items-center gap-2 text-[14px] font-medium text-[#1E1E1E]/80 tracking-tight">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">Features</button>
          <button onClick={() => document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">Analytics</button>
          <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">FAQ</button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <Button className="px-[14px]" size="lg" onClick={goToDashboard}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button className="px-[14px]" variant="outline" size="lg" onClick={goToSignIn}>
                  Sign in
                </Button>
                <Button className="px-[14px]" size="lg" onClick={goToSignUp}>
                  Create Account
                </Button>
              </>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-[#F5F5F5] text-[#1E1E1E] cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[80px] z-40 border-b shadow-lg md:hidden flex flex-col p-6 gap-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderColor: 'rgba(224,224,224,0.4)' }}
          >
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }} 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#EDEDED] text-[#1E1E1E] text-base font-semibold transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" });
                }} 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#EDEDED] text-[#1E1E1E] text-base font-semibold transition-colors cursor-pointer"
              >
                Analytics
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
                }} 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#EDEDED] text-[#1E1E1E] text-base font-semibold transition-colors cursor-pointer"
              >
                FAQ
              </button>
            </nav>
            
            <hr className="border-border/40 my-1" />
            
            <div className="flex flex-col gap-3">
              {token ? (
                <Button className="w-full justify-center py-3" size="lg" onClick={() => { setIsMobileMenuOpen(false); goToDashboard(); }}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button className="w-full justify-center py-3" variant="outline" size="lg" onClick={() => { setIsMobileMenuOpen(false); goToSignIn(); }}>
                    Sign in
                  </Button>
                  <Button className="w-full justify-center py-3" size="lg" onClick={() => { setIsMobileMenuOpen(false); goToSignUp(); }}>
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full relative z-10">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-[80px] overflow-hidden">
          {/* Decorative background elements inspired by 0labs */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ maskImage: 'linear-gradient(180deg, #000 0%, #000 30%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.25) 75%, transparent 92%)', WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 30%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.25) 75%, transparent 92%)' }}>
            <div className="absolute hidden md:block left-[-100px] top-[-50px] w-[210px] h-[760px] rounded-full bg-gradient-to-b from-[#F3F3F3] to-[#DEDEDE] opacity-55 -rotate-[22deg] blur-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),_0_24px_60px_-28px_rgba(0,0,0,0.10)]" />
            <div className="absolute hidden md:block left-[40px] top-[10px] w-[140px] h-[680px] rounded-full bg-gradient-to-b from-[#EFEFEF] to-[#D5D5D5] opacity-70 -rotate-[22deg] blur-[0.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),_0_24px_60px_-28px_rgba(0,0,0,0.10)]" />
            <div className="absolute hidden md:block right-[-120px] top-[-20px] w-[210px] h-[740px] rounded-full bg-gradient-to-b from-[#F3F3F3] to-[#DEDEDE] opacity-55 rotate-[22deg] blur-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),_0_24px_60px_-28px_rgba(0,0,0,0.10)]" />
            <div className="absolute hidden md:block right-[20px] top-[60px] w-[140px] h-[660px] rounded-full bg-gradient-to-b from-[#EFEFEF] to-[#D5D5D5] opacity-65 rotate-[22deg] blur-[0.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),_0_24px_60px_-28px_rgba(0,0,0,0.10)]" />
          </div>
          
          <div className="absolute inset-x-0 bottom-0 h-[55%] z-[1] pointer-events-none bg-gradient-to-b from-[rgba(250,250,250,0)] via-[rgba(250,250,250,0.6)] to-[#FAFAFA]" />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-[2] w-full max-w-4xl mx-auto text-center px-6"
          >
            <motion.h1 
              variants={itemVariants}
              className="font-serif text-[42px] leading-[1.05] sm:text-[56px] md:text-[72px] lg:text-[84px] tracking-tight text-[#1E1E1E]"
            >
              Short links.<br/>
              <span className="font-sans font-medium tracking-tight">Powerful analytics.</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="mt-7 text-[16px] md:text-[19px] text-[#1E1E1E]/60 max-w-xl mx-auto leading-relaxed"
            >
              Create managed short links with custom aliases, expiry controls, QR support, and a dashboard that explains where your traffic comes from.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            >
              <Button className="px-[14px]" size="lg" onClick={goToSignUp}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button className="px-[14px]" variant="outline" size="lg" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                See how it works
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features / Tabs Section */}
        <section id="features" className="py-14 md:py-16 bg-[#FAFAFA]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="rounded-[28px] border border-[#E0E0E0] bg-[#F5F5F5] p-6 md:p-8 lg:p-10 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.08)]">
              <div className="grid lg:grid-cols-[0.88fr_1.12fr] gap-10 lg:gap-14 items-center">
                <div className="flex flex-col">
                  <div>
                    <h2 className="font-serif text-[36px] md:text-[48px] leading-[1.05] tracking-tight text-[#1E1E1E] mt-3">
                      Our features
                    </h2>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                  {FEATURE_TABS.map((tab) => {
                    const isActive = activeFeatureTab === tab.key
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveFeatureTab(tab.key)}
                        className={`inline-flex items-center gap-2 w-fit text-left text-[15px] leading-snug transition-colors ${
                          isActive
                            ? "text-[#1E1E1E] font-medium"
                            : "text-[#1E1E1E]/45 hover:text-[#1E1E1E]/70"
                        }`}
                      >
                        <Grip className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        {tab.title}
                      </button>
                    )
                  })}
                </div>

                <Button
                  className="mt-6 w-fit px-[14px]"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/signup")}
                >
                  Start shortening <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                </div>

                <div className="relative min-h-[500px] lg:min-h-[540px] mt-6 lg:mt-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeatureTabData.key}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="relative h-full"
                    >
                      <div className="absolute right-6 top-0 hidden md:block w-[78%] rotate-[4deg] rounded-[28px] border border-[#E0E0E0] bg-white/55 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.16)] opacity-70">
                        <p className="text-[13px] font-medium text-[#1E1E1E]/35">
                          {nextFeatureTab.title}
                        </p>
                        <h3 className="mt-4 font-serif text-[22px] leading-snug text-[#1E1E1E]/30">
                          {nextFeatureTab.heading}
                        </h3>
                        <p className="mt-4 text-[14px] leading-relaxed text-[#1E1E1E]/25 max-w-[420px]">
                          {nextFeatureTab.body}
                        </p>
                      </div>

                      <div className="relative z-10 mt-12 md:mt-16 w-full rounded-[28px] border border-[#E0E0E0] bg-white p-6 md:p-8 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.16)]">
                        <h3 className="font-serif text-[26px] md:text-[34px] leading-tight text-[#1E1E1E]">
                          {activeFeatureTabData.heading}
                        </h3>
                        <p className="mt-5 max-w-[620px] text-[16px] md:text-[17px] leading-[1.8] text-[#1E1E1E]/62">
                          {activeFeatureTabData.body}
                        </p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                          {activeFeatureTabData.highlights.map((item) => (
                            <div
                              key={item}
                              className="rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] px-2.5 py-2"
                            >
                              <p className="text-[13px] font-medium text-[#1E1E1E]/72 leading-tight">
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlight Metrics */}
        <section id="analytics" className="py-24 bg-[#FAFAFA]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-end mb-16">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl px-3 py-1 text-[12px] text-[#1E1E1E]/70 font-medium">
                  Architecture
                </span>
                <h2 className="font-serif text-[36px] md:text-[48px] leading-[1.05] tracking-tight mt-5 text-[#1E1E1E]">
                  Modern Infrastructure
                </h2>
              </div>
              <p className="text-[15px] text-[#1E1E1E]/60 leading-relaxed max-w-md md:justify-self-end">
                Shrtn uses Redis for redirect lookups, PostgreSQL for durable link and click history, and focused cache invalidation so dashboard data stays current.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Caching", title: "Redirect Cache", desc: "Frequently used short codes are resolved from Redis before falling back to the database.", highlight: "O(1)", sub: "access time" },
                { label: "Encoding", title: "Base62 Codes", desc: "Generated links stay compact, while custom aliases are validated for length, uniqueness, and reserved words.", highlight: "6", sub: "character length" },
                { label: "Freshness", title: "Cache Invalidation", desc: "URL lists and analytics are refreshed after clicks, edits, QR changes, and deletes.", highlight: "TTL", sub: "managed cache" }
              ].map((card, i) => (
                <motion.article 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-[24px] border border-[#E0E0E0] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col min-h-[480px] overflow-hidden"
                >
                  <div className="p-8 pb-6">
                    <span className="text-[12px] font-medium text-[#1E1E1E]/50 uppercase tracking-wider">{card.label}</span>
                    <h3 className="font-serif mt-3 text-[22px] leading-snug text-[#1E1E1E]">{card.title}</h3>
                    <p className="text-[14px] text-[#1E1E1E]/60 leading-relaxed mt-3">{card.desc}</p>
                  </div>
                  <div className={`mx-5 mb-5 mt-auto rounded-2xl p-6 flex items-center justify-center h-[240px] border ${
                    card.highlight === "6"
                      ? "bg-[#181818] border-[#181818] text-white"
                      : "bg-[#F5F5F5] border-[#E0E0E0] text-[#1E1E1E]"
                  }`}>
                    <div className="text-center">
                      <p className="font-serif text-[48px] leading-none tracking-tight">{card.highlight}</p>
                      <p className={`text-[13px] font-medium mt-3 uppercase tracking-widest ${
                        card.highlight === "6" ? "text-white/50" : "text-[#1E1E1E]/50"
                      }`}>{card.sub}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Intelligence Section */}
        <section className="py-24 bg-[#FAFAFA] border-t border-[#E0E0E0]/65">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-end mb-16">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#1E1E1E] text-white rounded-xl px-3 py-1 text-[12px] font-medium">
                  Analytics
                </span>
                <h2 className="font-serif text-[36px] md:text-[48px] leading-[1.05] tracking-tight mt-5 text-[#1E1E1E]">
                  Know Your Audience
                </h2>
              </div>
              <p className="text-[15px] text-[#1E1E1E]/60 leading-relaxed max-w-md md:justify-self-end">
                Each click becomes a structured signal: when it happened, where it came from, and what environment opened it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Globe2 className="h-5 w-5" />,
                  title: "Traffic Sources",
                  desc: "See which referrers send visitors to each short link, then compare that context with recent click history and daily activity patterns."
                },
                {
                  icon: <Map className="h-5 w-5" />,
                  title: "Visitor Environment",
                  desc: "Break down engagement by browser, operating system, and device type, including desktop, mobile, tablet, and bot traffic."
                },
                {
                  icon: <Zap className="h-5 w-5" />,
                  title: "Geographic Detail",
                  desc: "Understand where engagement is coming from with country, region, and city-level reporting powered by background IP enrichment."
                }
              ].map((item, i) => (
                <motion.article 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-[24px] border border-[#E0E0E0] p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between min-h-[260px]"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F5] text-[#1E1E1E] mb-6 border border-[#E0E0E0]/60">
                      {item.icon}
                    </div>
                    <h3 className="font-serif text-[20px] leading-snug text-[#1E1E1E]">{item.title}</h3>
                    <p className="text-[14px] text-[#1E1E1E]/60 leading-relaxed mt-3">{item.desc}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24 bg-[#FAFAFA]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="relative rounded-[32px] overflow-hidden bg-[#181818] text-white">
              <div className="relative grid lg:grid-cols-[1fr_1.2fr] gap-12 p-10 md:p-16 items-center">
                <div>
                  <p className="inline-flex items-center gap-2 text-[13px] text-white/70 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    Dashboard
                  </p>
                  <h2 className="font-serif text-[36px] md:text-[48px] leading-[1.1] tracking-tight mt-5">
                    Total control over<br/>your links.
                  </h2>
                  <p className="mt-6 text-[16px] text-white/60 max-w-md leading-relaxed">
                    Manage active links, review destinations, monitor click totals, generate or revoke QR codes, and disable links without deleting history.
                  </p>
                  <Button className="mt-10 px-[14px]" variant="outline" size="lg" onClick={() => navigate("/signup")}>
                    Create your account <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="lg:justify-self-end w-full"
                >
                  <div className="bg-white text-[#1E1E1E] rounded-[24px] shadow-2xl overflow-hidden border border-white/20">
                    <div className="px-6 py-4 border-b border-[#E0E0E0] flex items-center gap-2 bg-[#F5F5F5]">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="font-bold text-[20px]">shrtn.fun/xK9mPq</h3>
                          <p className="text-[13px] text-[#1E1E1E]/50 mt-1">Redirects to: https://very-long-url.com/...</p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[12px] font-medium">
                          Active
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E0E0E0]">
                        <div className="bg-[#F5F5F5] rounded-xl p-4">
                          <p className="text-[12px] text-[#1E1E1E]/50 font-medium">Total Clicks</p>
                          <p className="text-[28px] font-bold mt-1">1,248</p>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-xl p-4">
                          <p className="text-[12px] text-[#1E1E1E]/50 font-medium">Top Browser</p>
                          <p className="text-[28px] font-bold mt-1">Chrome</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-[#FAFAFA]">
          <div className="max-w-[800px] mx-auto px-6 lg:px-12">
            <h2 className="font-serif text-[32px] md:text-[40px] tracking-tight text-center text-[#1E1E1E] mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <div key={index} className="rounded-2xl border border-[#E0E0E0] bg-white overflow-hidden transition-all hover:border-[#1E1E1E]/30 shadow-sm">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full py-5 px-6 text-left font-medium text-[#1E1E1E] flex items-center justify-between cursor-pointer focus:outline-none"
                    >
                      <span className="text-[15px] pr-4">{item.question}</span>
                      <ChevronDown className={`h-5 w-5 text-[#1E1E1E]/40 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#1E1E1E]" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-1 text-[14px] text-[#1E1E1E]/60 leading-relaxed">
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

        {/* Final CTA */}
        <section className="py-32 bg-[#FAFAFA] text-center border-b border-[#E0E0E0]">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="font-serif text-[40px] md:text-[56px] leading-[1.1] tracking-tight text-[#1E1E1E]">
              Ready to simplify<br/>your links?
            </h2>
            <Button className="mt-10 px-[14px]" size="lg" onClick={goToSignUp}>
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#1A1A1A] text-white pt-20 pb-12 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row gap-12 lg:gap-24">
          <div className="flex flex-col justify-between flex-1 min-w-[200px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo.svg" 
                  className="h-[24px] w-auto invert shrink-0 select-none" 
                  alt="shrtn logo" 
                />
              </div>
              <p className="text-[14px] text-white/50 leading-relaxed max-w-xs">
                A modern URL shortening service with robust analytics and simple management.
              </p>
            </div>
            <div className="mt-20 md:mt-12">
              <p className="text-[13px] text-white/40 font-medium mb-6">© {new Date().getFullYear()} Shrtn</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-8 gap-y-12 flex-[2] md:justify-end">
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold text-white mb-2">Product</h4>
              <button onClick={goToDashboard} className="text-[14px] text-white/60 hover:text-white transition-colors text-left w-fit cursor-pointer">Dashboard</button>
              <button onClick={goToSignIn} className="text-[14px] text-white/60 hover:text-white transition-colors text-left w-fit cursor-pointer">Sign In</button>
              <button onClick={goToSignUp} className="text-[14px] text-white/60 hover:text-white transition-colors text-left w-fit cursor-pointer">Sign Up</button>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold text-white mb-2">Legal</h4>
              <a href="#" className="text-[14px] text-white/60 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-[14px] text-white/60 hover:text-white transition-colors">Terms of Service</a>
              <a href="https://github.com/charanmunur" target="_blank" rel="noopener noreferrer" className="text-[14px] text-white/60 hover:text-white transition-colors mt-4">Made by charanmunur</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
