import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  Link2,
  BarChart3,
  ArrowRight,
  ChevronDown,
  QrCode,
  Menu
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

export function LandingPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  // Ensure the page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Shrtn — Intelligent Link Management"
  }, [])

  return (
    // We enforce light mode for the landing page to match the 0labs aesthetic
    <div className="bg-[#FAFAFA] text-[#1E1E1E] min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#1E1E1E] selection:text-white">
      
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-[80px] backdrop-blur-xl border-b grid grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-12 gap-6" style={{ backgroundColor: 'rgba(252,252,252,0.55)', borderBottomColor: 'rgba(224,224,224,0.4)' }}>
        <div className="flex items-center justify-self-start gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E1E1E] text-white shadow-sm">
            <Link2 className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Shrtn</span>
        </div>

        <nav className="hidden md:flex items-center gap-2 text-[14px] font-medium text-[#1E1E1E]/80 tracking-tight justify-self-center">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">Features</button>
          <button onClick={() => document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">Analytics</button>
          <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">FAQ</button>
        </nav>

        <div className="hidden md:flex items-center gap-3 justify-self-end">
          <button onClick={() => navigate("/signin")} className="px-6 py-3 text-[14px] font-medium rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] hover:bg-[#EBEBEB] transition-colors cursor-pointer">
            Sign in
          </button>
          <button onClick={() => navigate("/signup")} className="px-6 py-3 text-[14px] font-medium rounded-xl bg-[#1E1E1E] text-white shadow-sm hover:scale-[1.02] transition-transform flex items-center gap-1.5 cursor-pointer">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button className="md:hidden p-2 rounded-xl hover:bg-[#F5F5F5] justify-self-end text-[#1E1E1E]">
          <Menu className="h-5 w-5" />
        </button>
      </header>

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
              Transform long, clunky URLs into short, shareable links. Track click counts, device types, and operating systems from a clean, distraction-free dashboard.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            >
              <button onClick={() => navigate("/signup")} className="px-8 py-4 text-[15px] font-medium rounded-xl bg-[#1E1E1E] text-white shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform flex items-center gap-2 cursor-pointer">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="px-8 py-4 text-[15px] font-medium rounded-xl bg-white border border-[#E0E0E0] text-[#1E1E1E] shadow-sm hover:bg-[#F5F5F5] transition-colors cursor-pointer">
                See how it works
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Marquee Section */}
        <section className="pb-24 md:pb-32 bg-[#FAFAFA]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-[260px_1fr] gap-12 md:gap-16 items-center">
              <div>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="4" cy="4" r="2.2" fill="#1E1E1E" opacity="0.18"></circle>
                  <circle cx="14" cy="4" r="2.2" fill="#1E1E1E" opacity="0.18"></circle>
                  <circle cx="14" cy="14" r="2.2" fill="#1E1E1E" opacity="0.18"></circle>
                  <circle cx="4" cy="14" r="2.2" fill="#1E1E1E" opacity="0.18"></circle>
                </svg>
                <p className="mt-5 text-[13.5px] text-[#1E1E1E]/60 leading-snug">
                  Powered by modern<br/>web technologies
                </p>
              </div>
              <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div className="flex items-center w-max gap-x-24 animate-[marquee_30s_linear_infinite]">
                  {/* Fake tech logos to represent stack */}
                  {['React', 'Spring Boot', 'PostgreSQL', 'Redis', 'Vercel', 'Render'].map((tech, i) => (
                    <div key={i} className="flex items-center justify-center shrink-0 opacity-40 hover:opacity-100 transition-opacity font-bold text-2xl tracking-tighter">
                      {tech}
                    </div>
                  ))}
                  {/* Duplicate for infinite effect */}
                  {['React', 'Spring Boot', 'PostgreSQL', 'Redis', 'Vercel', 'Render'].map((tech, i) => (
                    <div key={`dup-${i}`} className="flex items-center justify-center shrink-0 opacity-40 hover:opacity-100 transition-opacity font-bold text-2xl tracking-tighter">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Thesis Section */}
        <section id="features" className="py-20 bg-[#FAFAFA]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="relative bg-[#F5F5F5] rounded-[32px] border border-[#E0E0E0] p-8 md:p-12 lg:p-16 overflow-hidden">
              <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 min-h-[480px]">
                
                <div className="flex flex-col">
                  <h2 className="font-serif text-[36px] leading-[1.1] text-[#1E1E1E]">Shrtn: Our Thesis</h2>
                  <p className="mt-5 text-[15px] text-[#1E1E1E]/65 max-w-[420px] leading-relaxed">
                    We built a URL shortener focused on speed, simplicity, and actionable data. No bloated dashboards or complex pricing tiers. Just clean links and deep insights into your audience.
                  </p>
                  <button onClick={() => navigate("/signup")} className="mt-8 w-fit px-5 py-2.5 text-[13px] font-medium rounded-xl bg-white border border-[#E0E0E0] hover:bg-[#EBEBEB] transition-colors flex items-center gap-1.5 cursor-pointer">
                    Start shortening <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  
                  <ul className="mt-auto pt-16 space-y-5">
                    {['Ultra-fast redirects via Redis', 'Detailed click analytics', 'QR code generation', 'Privacy-focused tracking'].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-left group">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                          <circle cx="4" cy="4" r="2" fill="#1E1E1E" opacity={i === 0 ? "1" : "0.18"}></circle>
                          <circle cx="14" cy="4" r="2" fill="#1E1E1E" opacity={i === 0 ? "1" : "0.18"}></circle>
                          <circle cx="4" cy="14" r="2" fill="#1E1E1E" opacity={i === 0 ? "1" : "0.18"}></circle>
                          <circle cx="14" cy="14" r="2" fill="#1E1E1E" opacity={i === 0 ? "1" : "0.18"}></circle>
                        </svg>
                        <span className={`text-[14.5px] transition-colors ${i === 0 ? "text-[#1E1E1E] font-medium" : "text-[#1E1E1E]/40 group-hover:text-[#1E1E1E]/70"}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative min-h-[500px] mt-8 lg:mt-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-0 right-0 w-[85%] max-w-[420px] bg-white border border-[#E0E0E0] rounded-[28px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden z-10"
                  >
                    <div className="p-8 pb-10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F5] text-[#1E1E1E] mb-6">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-[24px] leading-snug text-[#1E1E1E]">Actionable Analytics</h3>
                      <p className="mt-4 text-[14px] text-[#1E1E1E]/60 leading-relaxed">
                        Track every click in real-time. Our dashboard breaks down visitor data by device type, operating system, browser, and chronological timeline so you know exactly who is engaging with your content.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-40 left-0 w-[85%] max-w-[400px] bg-white border border-[#E0E0E0] rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] overflow-hidden z-20"
                  >
                    <div className="p-8 pb-10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E1E1E] text-white mb-6">
                        <QrCode className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-[24px] leading-snug text-[#1E1E1E]">Instant QR Codes</h3>
                      <p className="mt-4 text-[14px] text-[#1E1E1E]/60 leading-relaxed">
                        Bridge the gap between offline and online. Every shortened link automatically generates a scannable QR code that you can download in high-resolution for print materials.
                      </p>
                    </div>
                  </motion.div>
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
                Our redirection engine relies on a Redis cache layer for fast lookups, ensuring your visitors get where they need to go quickly and reliably.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Caching", title: "Redis Lookups", desc: "Redirects are served directly from memory, avoiding database queries on the hot path.", highlight: "O(1)", sub: "access time" },
                { label: "Encoding", title: "Base62 Codes", desc: "Database IDs are encoded to generate compact, collision-free short URLs.", highlight: "6", sub: "character length" },
                { label: "Security", title: "OTP Authentication", desc: "Stateless JWT sessions and email verification via Resend secure your account.", highlight: "JWT", sub: "stateless auth" }
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
                  <div className="mx-5 mb-5 mt-auto rounded-2xl p-6 flex items-center justify-center h-[240px] bg-[#F5F5F5] border border-[#E0E0E0]">
                    <div className="text-center">
                      <p className="font-serif text-[48px] leading-none tracking-tight text-[#1E1E1E]">{card.highlight}</p>
                      <p className="text-[13px] font-medium text-[#1E1E1E]/50 mt-3 uppercase tracking-widest">{card.sub}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24 bg-[#FAFAFA]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="relative rounded-[32px] overflow-hidden bg-[#1E1E1E] text-white">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, transparent 70%)' }}></div>
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
                    Toggle links on or off instantly. View rich analytics, generate QR codes, and manage your account from a minimalist, distraction-free interface.
                  </p>
                  <button onClick={() => navigate("/signup")} className="mt-10 px-8 py-4 bg-white text-[#1E1E1E] rounded-xl text-[14px] font-medium hover:bg-white/90 transition-colors flex items-center gap-2 cursor-pointer">
                    Create your account <ArrowRight className="h-4 w-4" />
                  </button>
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
            <button onClick={() => navigate("/signup")} className="mt-10 px-8 py-4 bg-[#1E1E1E] text-white rounded-xl text-[15px] font-medium shadow-xl hover:scale-[1.02] transition-transform inline-flex items-center gap-2 cursor-pointer">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#1A1A1A] text-white pt-20 pb-12 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row gap-12 lg:gap-24">
          <div className="flex flex-col justify-between flex-1 min-w-[200px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1A1A1A]">
                  <Link2 className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">Shrtn</span>
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
              <button onClick={() => navigate("/dashboard")} className="text-[14px] text-white/60 hover:text-white transition-colors text-left w-fit cursor-pointer">Dashboard</button>
              <button onClick={() => navigate("/signin")} className="text-[14px] text-white/60 hover:text-white transition-colors text-left w-fit cursor-pointer">Sign In</button>
              <button onClick={() => navigate("/signup")} className="text-[14px] text-white/60 hover:text-white transition-colors text-left w-fit cursor-pointer">Sign Up</button>
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

      {/* Global CSS for the Marquee Animation added locally since we are replacing the global styles approach */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-[marquee_30s_linear_infinite] {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
