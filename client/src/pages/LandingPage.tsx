import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/providers/theme-provider"
import {
  ArrowRight,
  ChevronDown,
  Grip,
  Menu,
  Zap,
  Globe2,
  Map,
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
      <header className="fixed top-0 inset-x-0 z-50 h-[80px] backdrop-blur-xl border-b grid grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-12 gap-6" style={{ backgroundColor: 'rgba(252,252,252,0.55)', borderBottomColor: 'rgba(224,224,224,0.4)' }}>
        <div className="flex items-center justify-self-start cursor-pointer" onClick={() => navigate("/")}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="290 515 705 220" className="h-[24px] w-auto text-[#1E1E1E] select-none">
            <g fill="currentColor">
              <path d="M 631.00 617.00 C 625.17 617.00 603.50 616.67 596.00 617.00 C 588.50 617.33 589.67 617.83 586.00 619.00 C 582.33 620.17 578.50 621.00 574.00 624.00 C 569.50 627.00 562.50 633.17 559.00 637.00 C 555.50 640.83 554.67 643.17 553.00 647.00 C 551.33 650.83 549.67 646.17 549.00 660.00 C 548.33 673.83 549.00 718.33 549.00 730.00 L 567.00 730.00 C 567.00 719.67 566.50 680.33 567.00 668.00 C 567.50 655.67 568.67 659.33 570.00 656.00 C 571.33 652.67 572.83 650.50 575.00 648.00 C 577.17 645.50 580.17 642.83 583.00 641.00 C 585.83 639.17 584.00 637.67 592.00 637.00 C 600.00 636.33 624.50 637.00 631.00 637.00 L 631.00 617.00 Z"/>
              <path d="M 742.00 730.00 L 760.00 730.00 C 760.00 719.17 759.17 678.33 760.00 665.00 C 760.83 651.67 762.33 654.33 765.00 650.00 C 767.67 645.67 773.17 641.33 776.00 639.00 C 778.83 636.67 778.67 636.83 782.00 636.00 C 785.33 635.17 790.67 634.17 796.00 634.00 C 801.33 633.83 810.00 634.50 814.00 635.00 C 818.00 635.50 816.67 634.67 820.00 637.00 C 823.33 639.33 831.00 645.67 834.00 649.00 C 837.00 652.33 837.00 654.00 838.00 657.00 C 839.00 660.00 839.67 654.83 840.00 667.00 C 840.33 679.17 840.00 719.50 840.00 730.00 L 858.00 730.00 C 858.00 718.00 859.17 673.17 858.00 658.00 C 856.83 642.83 854.17 644.33 851.00 639.00 C 847.83 633.67 843.00 629.33 839.00 626.00 C 835.00 622.67 830.83 620.67 827.00 619.00 C 823.17 617.33 823.17 616.50 816.00 616.00 C 808.83 615.50 792.17 615.00 784.00 616.00 C 775.83 617.00 772.50 618.67 767.00 622.00 C 761.50 625.33 754.67 631.83 751.00 636.00 C 747.33 640.17 746.67 642.33 745.00 647.00 C 743.33 651.67 741.50 650.17 741.00 664.00 C 740.50 677.83 741.83 719.00 742.00 730.00 Z"/>
              <path d="M 306.00 701.00 L 295.00 716.00 C 297.83 717.83 305.50 724.33 312.00 727.00 C 318.50 729.67 326.00 731.33 334.00 732.00 C 342.00 732.67 352.83 732.17 360.00 731.00 C 367.17 729.83 372.50 727.50 377.00 725.00 C 381.50 722.50 384.50 719.50 387.00 716.00 C 389.50 712.50 391.17 708.17 392.00 704.00 C 392.83 699.83 393.17 695.33 392.00 691.00 C 390.83 686.67 387.50 681.17 385.00 678.00 C 382.50 674.83 380.00 673.67 377.00 672.00 C 374.00 670.33 375.50 670.00 367.00 668.00 C 358.50 666.00 334.33 662.33 326.00 660.00 C 317.67 657.67 318.67 656.67 317.00 654.00 C 315.33 651.33 314.83 647.00 316.00 644.00 C 317.17 641.00 320.50 637.83 324.00 636.00 C 327.50 634.17 332.83 633.50 337.00 633.00 C 341.17 632.50 344.67 632.50 349.00 633.00 C 353.33 633.50 358.17 634.00 363.00 636.00 C 367.83 638.00 375.50 643.50 378.00 645.00 L 389.00 629.00 C 386.00 627.33 377.17 621.33 371.00 619.00 C 364.83 616.67 359.17 615.67 352.00 615.00 C 344.83 614.33 334.83 613.83 328.00 615.00 C 321.17 616.17 315.33 619.50 311.00 622.00 C 306.67 624.50 304.50 626.33 302.00 630.00 C 299.50 633.67 296.83 639.67 296.00 644.00 C 295.17 648.33 296.00 652.33 297.00 656.00 C 298.00 659.67 299.50 663.00 302.00 666.00 C 304.50 669.00 309.00 672.17 312.00 674.00 C 315.00 675.83 311.33 675.00 320.00 677.00 C 328.67 679.00 355.33 683.33 364.00 686.00 C 372.67 688.67 370.50 690.33 372.00 693.00 C 373.50 695.67 374.00 699.17 373.00 702.00 C 372.00 704.83 368.50 708.17 366.00 710.00 C 363.50 711.83 363.00 712.33 358.00 713.00 C 353.00 713.67 342.33 714.50 336.00 714.00 C 329.67 713.50 325.00 712.17 320.00 710.00 C 315.00 707.83 308.33 702.50 306.00 701.00 Z"/>
              <path d="M 651.00 586.00 C 651.00 603.00 650.50 668.83 651.00 688.00 C 651.50 707.17 652.00 696.33 654.00 701.00 C 656.00 705.67 658.83 711.67 663.00 716.00 C 667.17 720.33 674.33 724.67 679.00 727.00 C 683.67 729.33 683.83 729.50 691.00 730.00 C 698.17 730.50 716.83 730.00 722.00 730.00 L 721.00 711.00 C 715.67 710.83 696.17 711.33 689.00 710.00 C 681.83 708.67 681.17 706.67 678.00 703.00 C 674.83 699.33 671.33 699.00 670.00 688.00 C 668.67 677.00 670.00 645.50 670.00 637.00 L 721.00 636.00 L 722.00 617.00 L 671.00 617.00 L 670.00 586.00 L 651.00 586.00 Z"/>
              <path d="M 412.00 572.00 L 412.00 730.00 L 431.00 730.00 C 431.00 718.83 430.17 676.33 431.00 663.00 C 431.83 649.67 433.33 654.00 436.00 650.00 C 438.67 646.00 442.33 641.67 447.00 639.00 C 451.67 636.33 457.67 634.67 464.00 634.00 C 470.33 633.33 480.00 634.17 485.00 635.00 C 490.00 635.83 491.00 637.00 494.00 639.00 C 497.00 641.00 500.33 643.00 503.00 647.00 C 505.67 651.00 508.83 649.17 510.00 663.00 C 511.17 676.83 510.00 718.83 510.00 730.00 L 529.00 730.00 C 529.00 718.83 529.67 676.83 529.00 663.00 C 528.33 649.17 526.67 651.50 525.00 647.00 C 523.33 642.50 521.17 639.17 519.00 636.00 C 516.83 632.83 514.83 630.50 512.00 628.00 C 509.17 625.50 506.17 623.00 502.00 621.00 C 497.83 619.00 494.83 616.83 487.00 616.00 C 479.17 615.17 463.00 615.00 455.00 616.00 C 447.00 617.00 442.83 620.00 439.00 622.00 C 435.17 624.00 433.17 627.00 432.00 628.00 L 431.00 572.00 L 412.00 572.00 Z"/>
              <path d="M 907.00 563.00 C 903.17 566.83 888.50 580.50 884.00 586.00 C 879.50 591.50 880.67 592.17 880.00 596.00 C 879.33 599.83 879.50 605.33 880.00 609.00 C 880.50 612.67 880.83 614.67 883.00 618.00 C 885.17 621.33 889.33 626.33 893.00 629.00 C 896.67 631.67 901.17 633.17 905.00 634.00 C 908.83 634.83 911.67 635.17 916.00 634.00 C 920.33 632.83 925.83 630.83 931.00 627.00 C 936.17 623.17 944.17 614.67 947.00 611.00 C 949.83 607.33 948.83 607.17 948.00 605.00 C 947.17 602.83 943.83 599.17 942.00 598.00 C 940.17 596.83 941.50 594.83 937.00 598.00 C 932.50 601.17 920.17 613.83 915.00 617.00 C 909.83 620.17 908.67 618.00 906.00 617.00 C 903.33 616.00 900.50 612.67 899.00 611.00 C 897.50 609.33 897.33 608.83 897.00 607.00 C 896.67 605.17 896.67 601.83 897.00 600.00 C 897.33 598.17 895.33 600.00 899.00 596.00 C 902.67 592.00 915.67 580.17 919.00 576.00 C 922.33 571.83 920.17 573.00 919.00 571.00 C 917.83 569.00 914.00 565.33 912.00 564.00 C 910.00 562.67 907.83 563.17 907.00 563.00 Z"/>
              <path d="M 953.00 522.00 C 951.33 522.67 948.00 522.00 943.00 526.00 C 938.00 530.00 926.33 541.67 923.00 546.00 C 919.67 550.33 921.83 549.83 923.00 552.00 C 924.17 554.17 928.17 557.83 930.00 559.00 C 931.83 560.17 929.83 562.17 934.00 559.00 C 938.17 555.83 950.17 543.33 955.00 540.00 C 959.83 536.67 960.67 538.67 963.00 539.00 C 965.33 539.33 967.17 540.33 969.00 542.00 C 970.83 543.67 973.33 546.17 974.00 549.00 C 974.67 551.83 976.67 553.67 973.00 559.00 C 969.33 564.33 955.50 576.33 952.00 581.00 C 948.50 585.67 951.00 585.00 952.00 587.00 C 953.00 589.00 956.00 592.00 958.00 593.00 C 960.00 594.00 959.17 596.83 964.00 593.00 C 968.83 589.17 982.50 575.33 987.00 570.00 C 991.50 564.67 990.17 564.33 991.00 561.00 C 991.83 557.67 992.83 554.50 992.00 550.00 C 991.17 545.50 988.00 537.67 986.00 534.00 C 984.00 530.33 983.17 530.00 980.00 528.00 C 976.83 526.00 971.50 523.00 967.00 522.00 C 962.50 521.00 955.33 522.00 953.00 522.00 Z"/>
            </g>
          </svg>
        </div>

        <nav className="hidden md:flex items-center gap-2 text-[14px] font-medium text-[#1E1E1E]/80 tracking-tight justify-self-center">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">Features</button>
          <button onClick={() => document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">Analytics</button>
          <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2.5 rounded-xl hover:bg-[#EDEDED] hover:text-[#1E1E1E] transition-colors cursor-pointer">FAQ</button>
        </nav>

        <div className="hidden md:flex items-center gap-3 justify-self-end">
          <Button className="px-[14px]" variant="outline" size="lg" onClick={() => navigate("/signin")}>
            Sign in
          </Button>
          <Button className="px-[14px]" size="lg" onClick={() => navigate("/signup")}>
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
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
              Create managed short links with custom aliases, expiry controls, QR support, and a dashboard that explains where your traffic comes from.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            >
              <Button className="px-[14px]" size="lg" onClick={() => navigate("/signup")}>
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
            <Button className="mt-10 px-[14px]" size="lg" onClick={() => navigate("/signup")}>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="290 515 705 220" className="h-[24px] w-auto text-white select-none">
                  <g fill="currentColor">
                    <path d="M 631.00 617.00 C 625.17 617.00 603.50 616.67 596.00 617.00 C 588.50 617.33 589.67 617.83 586.00 619.00 C 582.33 620.17 578.50 621.00 574.00 624.00 C 569.50 627.00 562.50 633.17 559.00 637.00 C 555.50 640.83 554.67 643.17 553.00 647.00 C 551.33 650.83 549.67 646.17 549.00 660.00 C 548.33 673.83 549.00 718.33 549.00 730.00 L 567.00 730.00 C 567.00 719.67 566.50 680.33 567.00 668.00 C 567.50 655.67 568.67 659.33 570.00 656.00 C 571.33 652.67 572.83 650.50 575.00 648.00 C 577.17 645.50 580.17 642.83 583.00 641.00 C 585.83 639.17 584.00 637.67 592.00 637.00 C 600.00 636.33 624.50 637.00 631.00 637.00 L 631.00 617.00 Z"/>
                    <path d="M 742.00 730.00 L 760.00 730.00 C 760.00 719.17 759.17 678.33 760.00 665.00 C 760.83 651.67 762.33 654.33 765.00 650.00 C 767.67 645.67 773.17 641.33 776.00 639.00 C 778.83 636.67 778.67 636.83 782.00 636.00 C 785.33 635.17 790.67 634.17 796.00 634.00 C 801.33 633.83 810.00 634.50 814.00 635.00 C 818.00 635.50 816.67 634.67 820.00 637.00 C 823.33 639.33 831.00 645.67 834.00 649.00 C 837.00 652.33 837.00 654.00 838.00 657.00 C 839.00 660.00 839.67 654.83 840.00 667.00 C 840.33 679.17 840.00 719.50 840.00 730.00 L 858.00 730.00 C 858.00 718.00 859.17 673.17 858.00 658.00 C 856.83 642.83 854.17 644.33 851.00 639.00 C 847.83 633.67 843.00 629.33 839.00 626.00 C 835.00 622.67 830.83 620.67 827.00 619.00 C 823.17 617.33 823.17 616.50 816.00 616.00 C 808.83 615.50 792.17 615.00 784.00 616.00 C 775.83 617.00 772.50 618.67 767.00 622.00 C 761.50 625.33 754.67 631.83 751.00 636.00 C 747.33 640.17 746.67 642.33 745.00 647.00 C 743.33 651.67 741.50 650.17 741.00 664.00 C 740.50 677.83 741.83 719.00 742.00 730.00 Z"/>
                    <path d="M 306.00 701.00 L 295.00 716.00 C 297.83 717.83 305.50 724.33 312.00 727.00 C 318.50 729.67 326.00 731.33 334.00 732.00 C 342.00 732.67 352.83 732.17 360.00 731.00 C 367.17 729.83 372.50 727.50 377.00 725.00 C 381.50 722.50 384.50 719.50 387.00 716.00 C 389.50 712.50 391.17 708.17 392.00 704.00 C 392.83 699.83 393.17 695.33 392.00 691.00 C 390.83 686.67 387.50 681.17 385.00 678.00 C 382.50 674.83 380.00 673.67 377.00 672.00 C 374.00 670.33 375.50 670.00 367.00 668.00 C 358.50 666.00 334.33 662.33 326.00 660.00 C 317.67 657.67 318.67 656.67 317.00 654.00 C 315.33 651.33 314.83 647.00 316.00 644.00 C 317.17 641.00 320.50 637.83 324.00 636.00 C 327.50 634.17 332.83 633.50 337.00 633.00 C 341.17 632.50 344.67 632.50 349.00 633.00 C 353.33 633.50 358.17 634.00 363.00 636.00 C 367.83 638.00 375.50 643.50 378.00 645.00 L 389.00 629.00 C 386.00 627.33 377.17 621.33 371.00 619.00 C 364.83 616.67 359.17 615.67 352.00 615.00 C 344.83 614.33 334.83 613.83 328.00 615.00 C 321.17 616.17 315.33 619.50 311.00 622.00 C 306.67 624.50 304.50 626.33 302.00 630.00 C 299.50 633.67 296.83 639.67 296.00 644.00 C 295.17 648.33 296.00 652.33 297.00 656.00 C 298.00 659.67 299.50 663.00 302.00 666.00 C 304.50 669.00 309.00 672.17 312.00 674.00 C 315.00 675.83 311.33 675.00 320.00 677.00 C 328.67 679.00 355.33 683.33 364.00 686.00 C 372.67 688.67 370.50 690.33 372.00 693.00 C 373.50 695.67 374.00 699.17 373.00 702.00 C 372.00 704.83 368.50 708.17 366.00 710.00 C 363.50 711.83 363.00 712.33 358.00 713.00 C 353.00 713.67 342.33 714.50 336.00 714.00 C 329.67 713.50 325.00 712.17 320.00 710.00 C 315.00 707.83 308.33 702.50 306.00 701.00 Z"/>
                    <path d="M 651.00 586.00 C 651.00 603.00 650.50 668.83 651.00 688.00 C 651.50 707.17 652.00 696.33 654.00 701.00 C 656.00 705.67 658.83 711.67 663.00 716.00 C 667.17 720.33 674.33 724.67 679.00 727.00 C 683.67 729.33 683.83 729.50 691.00 730.00 C 698.17 730.50 716.83 730.00 722.00 730.00 L 721.00 711.00 C 715.67 710.83 696.17 711.33 689.00 710.00 C 681.83 708.67 681.17 706.67 678.00 703.00 C 674.83 699.33 671.33 699.00 670.00 688.00 C 668.67 677.00 670.00 645.50 670.00 637.00 L 721.00 636.00 L 722.00 617.00 L 671.00 617.00 L 670.00 586.00 L 651.00 586.00 Z"/>
                    <path d="M 412.00 572.00 L 412.00 730.00 L 431.00 730.00 C 431.00 718.83 430.17 676.33 431.00 663.00 C 431.83 649.67 433.33 654.00 436.00 650.00 C 438.67 646.00 442.33 641.67 447.00 639.00 C 451.67 636.33 457.67 634.67 464.00 634.00 C 470.33 633.33 480.00 634.17 485.00 635.00 C 490.00 635.83 491.00 637.00 494.00 639.00 C 497.00 641.00 500.33 643.00 503.00 647.00 C 505.67 651.00 508.83 649.17 510.00 663.00 C 511.17 676.83 510.00 718.83 510.00 730.00 L 529.00 730.00 C 529.00 718.83 529.67 676.83 529.00 663.00 C 528.33 649.17 526.67 651.50 525.00 647.00 C 523.33 642.50 521.17 639.17 519.00 636.00 C 516.83 632.83 514.83 630.50 512.00 628.00 C 509.17 625.50 506.17 623.00 502.00 621.00 C 497.83 619.00 494.83 616.83 487.00 616.00 C 479.17 615.17 463.00 615.00 455.00 616.00 C 447.00 617.00 442.83 620.00 439.00 622.00 C 435.17 624.00 433.17 627.00 432.00 628.00 L 431.00 572.00 L 412.00 572.00 Z"/>
                    <path d="M 907.00 563.00 C 903.17 566.83 888.50 580.50 884.00 586.00 C 879.50 591.50 880.67 592.17 880.00 596.00 C 879.33 599.83 879.50 605.33 880.00 609.00 C 880.50 612.67 880.83 614.67 883.00 618.00 C 885.17 621.33 889.33 626.33 893.00 629.00 C 896.67 631.67 901.17 633.17 905.00 634.00 C 908.83 634.83 911.67 635.17 916.00 634.00 C 920.33 632.83 925.83 630.83 931.00 627.00 C 936.17 623.17 944.17 614.67 947.00 611.00 C 949.83 607.33 948.83 607.17 948.00 605.00 C 947.17 602.83 943.83 599.17 942.00 598.00 C 940.17 596.83 941.50 594.83 937.00 598.00 C 932.50 601.17 920.17 613.83 915.00 617.00 C 909.83 620.17 908.67 618.00 906.00 617.00 C 903.33 616.00 900.50 612.67 899.00 611.00 C 897.50 609.33 897.33 608.83 897.00 607.00 C 896.67 605.17 896.67 601.83 897.00 600.00 C 897.33 598.17 895.33 600.00 899.00 596.00 C 902.67 592.00 915.67 580.17 919.00 576.00 C 922.33 571.83 920.17 573.00 919.00 571.00 C 917.83 569.00 914.00 565.33 912.00 564.00 C 910.00 562.67 907.83 563.17 907.00 563.00 Z"/>
                    <path d="M 953.00 522.00 C 951.33 522.67 948.00 522.00 943.00 526.00 C 938.00 530.00 926.33 541.67 923.00 546.00 C 919.67 550.33 921.83 549.83 923.00 552.00 C 924.17 554.17 928.17 557.83 930.00 559.00 C 931.83 560.17 929.83 562.17 934.00 559.00 C 938.17 555.83 950.17 543.33 955.00 540.00 C 959.83 536.67 960.67 538.67 963.00 539.00 C 965.33 539.33 967.17 540.33 969.00 542.00 C 970.83 543.67 973.33 546.17 974.00 549.00 C 974.67 551.83 976.67 553.67 973.00 559.00 C 969.33 564.33 955.50 576.33 952.00 581.00 C 948.50 585.67 951.00 585.00 952.00 587.00 C 953.00 589.00 956.00 592.00 958.00 593.00 C 960.00 594.00 959.17 596.83 964.00 593.00 C 968.83 589.17 982.50 575.33 987.00 570.00 C 991.50 564.67 990.17 564.33 991.00 561.00 C 991.83 557.67 992.83 554.50 992.00 550.00 C 991.17 545.50 988.00 537.67 986.00 534.00 C 984.00 530.33 983.17 530.00 980.00 528.00 C 976.83 526.00 971.50 523.00 967.00 522.00 C 962.50 521.00 955.33 522.00 953.00 522.00 Z"/>
                  </g>
                </svg>
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

    </div>
  )
}
