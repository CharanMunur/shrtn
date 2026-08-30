// Icons sourced from SimpleIcons CDN (simpleicons.org)
// Using img tags with CDN URLs for colored brand icons

export type IconData = { url: string; color: string; label: string }

const SI_CDN = "https://cdn.simpleicons.org"

export const BROWSER_ICONS: Record<string, IconData> = {
  chrome: {
    label: "Google Chrome",
    color: "#4285F4",
    url: "/icons/chrome.svg",
  },
  firefox: {
    label: "Firefox",
    color: "#FF7139",
    url: "/icons/firefox.svg",
  },
  safari: {
    label: "Safari",
    color: "#006CFF",
    url: "/icons/safari.svg",
  },
  edge: {
    label: "Microsoft Edge",
    color: "#0078D7",
    url: "/icons/edge.svg",
  },
  opera: {
    label: "Opera",
    color: "#FF1B2D",
    url: "/icons/opera.svg",
  },
  brave: {
    label: "Brave",
    color: "#FB542B",
    url: "/icons/brave.svg",
  },
  vivaldi: {
    label: "Vivaldi",
    color: "#EF3939",
    url: "/icons/vivaldi.svg",
  },
  samsung: {
    label: "Samsung Internet",
    color: "#1428A0",
    url: "/icons/samsung.svg",
  },
  whatsapp: {
    label: "WhatsApp",
    color: "#25D366",
    url: "/icons/whatsapp.svg",
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    url: "/icons/linkedin.svg",
  },
}

export const OS_ICONS: Record<string, IconData> = {
  windows: {
    label: "Windows",
    color: "#0078D4",
    url: "/icons/windows.svg",
  },
  macos: {
    label: "macOS",
    color: "#000000",
    url: "/icons/macos.svg",
  },
  linux: {
    label: "Linux",
    color: "#FCC624",
    url: "/icons/linux.svg",
  },
  android: {
    label: "Android",
    color: "#34A853",
    url: "/icons/android.svg",
  },
  ubuntu: {
    label: "Ubuntu",
    color: "#E95420",
    url: `${SI_CDN}/ubuntu/E95420`,
  },
  ios: {
    label: "iOS",
    color: "#000000",
    url: "/icons/ios.svg",
  },
  chromeos: {
    label: "ChromeOS",
    color: "#4285F4",
    url: `${SI_CDN}/googlechrome/4285F4`,
  },
}

export function getBrowserIcon(name: string): IconData | null {
  const k = name.toLowerCase()
  if (k.includes("chrome") || k.includes("chromium")) return BROWSER_ICONS.chrome
  if (k.includes("firefox")) return BROWSER_ICONS.firefox
  if (k.includes("safari") && !k.includes("chrome")) return BROWSER_ICONS.safari
  if (k.includes("edge")) return BROWSER_ICONS.edge
  if (k.includes("opera") || k.includes("opr")) return BROWSER_ICONS.opera
  if (k.includes("brave")) return BROWSER_ICONS.brave
  if (k.includes("vivaldi")) return BROWSER_ICONS.vivaldi
  if (k.includes("samsung")) return BROWSER_ICONS.samsung
  if (k.includes("whatsapp")) return BROWSER_ICONS.whatsapp
  if (k.includes("linkedin")) return BROWSER_ICONS.linkedin
  return null
}

export function getOsIcon(name: string): IconData | null {
  const k = name.toLowerCase()
  if (k.includes("windows")) return OS_ICONS.windows
  
  // Specific mobile and distro OSs first
  if (k.includes("android")) return OS_ICONS.android
  if (k.includes("ios") || k.includes("iphone") || k.includes("ipad")) return OS_ICONS.ios
  if (k.includes("chromeos") || k.includes("chrome os")) return OS_ICONS.chromeos
  if (k.includes("ubuntu")) return OS_ICONS.ubuntu
  
  // Generic OSs last
  if (k.includes("mac") || k.includes("os x") || k.includes("osx")) return OS_ICONS.macos
  if (k.includes("linux")) return OS_ICONS.linux
  return null
}

const REFERRER_ICONS: Record<string, IconData> = {
  github: {
    label: "GitHub",
    color: "#181717",
    url: `${SI_CDN}/github/181717`,
  },
  twitter: {
    label: "Twitter / X",
    color: "#000000",
    url: `${SI_CDN}/x/000000`,
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    url: "/icons/linkedin.svg",
  },
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    url: `${SI_CDN}/facebook/1877F2`,
  },
  google: {
    label: "Google",
    color: "#4285F4",
    url: `${SI_CDN}/google/4285F4`,
  },
  youtube: {
    label: "YouTube",
    color: "#FF0000",
    url: `${SI_CDN}/youtube/FF0000`,
  },
  instagram: {
    label: "Instagram",
    color: "#E4405F",
    url: `${SI_CDN}/instagram/E4405F`,
  },
  whatsapp: {
    label: "WhatsApp",
    color: "#25D366",
    url: "/icons/whatsapp.svg",
  },
}

export function getReferrerIcon(name: string): IconData | null {
  const k = name.toLowerCase()
  if (k.includes("github")) return REFERRER_ICONS.github
  if (k.includes("twitter") || k.includes("t.co") || k === "x.com") return REFERRER_ICONS.twitter
  if (k.includes("linkedin")) return REFERRER_ICONS.linkedin
  if (k.includes("facebook")) return REFERRER_ICONS.facebook
  if (k.includes("google")) return REFERRER_ICONS.google
  if (k.includes("youtube")) return REFERRER_ICONS.youtube
  if (k.includes("instagram")) return REFERRER_ICONS.instagram
  if (k.includes("whatsapp") || k.includes("wa.me")) return REFERRER_ICONS.whatsapp
  return null
}

const COUNTRY_CODES: Record<string, string> = {
  "afghanistan": "af",
  "aland islands": "ax",
  "albania": "al",
  "algeria": "dz",
  "american samoa": "as",
  "andorra": "ad",
  "angola": "ao",
  "anguilla": "ai",
  "antarctica": "aq",
  "antigua and barbuda": "ag",
  "argentina": "ar",
  "armenia": "am",
  "aruba": "aw",
  "australia": "au",
  "austria": "at",
  "azerbaijan": "az",
  "bahamas": "bs",
  "bahrain": "bh",
  "bangladesh": "bd",
  "barbados": "bb",
  "belarus": "by",
  "belgium": "be",
  "belize": "bz",
  "benin": "bj",
  "bermuda": "bm",
  "bhutan": "bt",
  "bolivia": "bo",
  "bosnia and herzegovina": "ba",
  "botswana": "bw",
  "bouvet island": "bv",
  "brazil": "br",
  "british indian ocean territory": "io",
  "brunei darussalam": "bn",
  "bulgaria": "bg",
  "burkina faso": "bf",
  "burundi": "bi",
  "cambodia": "kh",
  "cameroon": "cm",
  "canada": "ca",
  "cape verde": "cv",
  "cayman islands": "ky",
  "central african republic": "cf",
  "chad": "td",
  "chile": "cl",
  "china": "cn",
  "christmas island": "cx",
  "cocos (keeling) islands": "cc",
  "colombia": "co",
  "comoros": "km",
  "congo": "cg",
  "congo, democratic republic": "cd",
  "cook islands": "ck",
  "costa rica": "cr",
  "cote d'ivoire": "ci",
  "croatia": "hr",
  "cuba": "cu",
  "cyprus": "cy",
  "czech republic": "cz",
  "denmark": "dk",
  "djibouti": "dj",
  "dominica": "dm",
  "dominican republic": "do",
  "ecuador": "ec",
  "egypt": "eg",
  "el salvador": "sv",
  "equatorial guinea": "gq",
  "eritrea": "er",
  "estonia": "ee",
  "ethiopia": "et",
  "falkland islands": "fk",
  "faroe islands": "fo",
  "fiji": "fj",
  "finland": "fi",
  "france": "fr",
  "french guiana": "gf",
  "french polynesia": "pf",
  "french southern territories": "tf",
  "gabon": "ga",
  "gambia": "gm",
  "georgia": "ge",
  "germany": "de",
  "ghana": "gh",
  "gibraltar": "gi",
  "greece": "gr",
  "greenland": "gl",
  "grenada": "gd",
  "guadeloupe": "gp",
  "guam": "gu",
  "guatemala": "gt",
  "guernsey": "gg",
  "guinea": "gn",
  "guinea-bissau": "gw",
  "guyana": "gy",
  "haiti": "ht",
  "heard island and mcdonald islands": "hm",
  "holy see": "va",
  "honduras": "hn",
  "hong kong": "hk",
  "hungary": "hu",
  "iceland": "is",
  "india": "in",
  "indonesia": "id",
  "iran": "ir",
  "iraq": "iq",
  "ireland": "ie",
  "isle of man": "im",
  "israel": "il",
  "italy": "it",
  "jamaica": "jm",
  "japan": "jp",
  "jersey": "je",
  "jordan": "jo",
  "kazakhstan": "kz",
  "kenya": "ke",
  "kiribati": "ki",
  "north korea": "kp",
  "south korea": "kr",
  "kuwait": "kw",
  "kyrgyzstan": "kg",
  "laos": "la",
  "latvia": "lv",
  "lebanon": "lb",
  "lesotho": "ls",
  "liberia": "lr",
  "libya": "ly",
  "liechtenstein": "li",
  "lithuania": "lt",
  "luxembourg": "lu",
  "macao": "mo",
  "macedonia": "mk",
  "madagascar": "mg",
  "malawi": "mw",
  "malaysia": "my",
  "maldives": "mv",
  "mali": "ml",
  "malta": "mt",
  "marshall islands": "mh",
  "martinique": "mq",
  "mauritania": "mr",
  "mauritius": "mu",
  "mayotte": "yt",
  "mexico": "mx",
  "micronesia": "fm",
  "moldova": "md",
  "monaco": "mc",
  "mongolia": "mn",
  "montenegro": "me",
  "montserrat": "ms",
  "morocco": "ma",
  "mozambique": "mz",
  "myanmar": "mm",
  "namibia": "na",
  "nauru": "nr",
  "nepal": "np",
  "netherlands": "nl",
  "new caledonia": "nc",
  "new zealand": "nz",
  "nicaragua": "ni",
  "niger": "ne",
  "nigeria": "ng",
  "niue": "nu",
  "norfolk island": "nf",
  "northern mariana islands": "mp",
  "norway": "no",
  "oman": "om",
  "pakistan": "pk",
  "palau": "pw",
  "palestine": "ps",
  "panama": "pa",
  "papua new guinea": "pg",
  "paraguay": "py",
  "peru": "pe",
  "philippines": "ph",
  "pitcairn": "pn",
  "poland": "pl",
  "portugal": "pt",
  "puerto rico": "pr",
  "qatar": "qa",
  "reunion": "re",
  "romania": "ro",
  "russian federation": "ru",
  "russia": "ru",
  "rwanda": "rw",
  "saint barthelemy": "bl",
  "saint helena": "sh",
  "saint kitts and nevis": "kn",
  "saint lucia": "lc",
  "saint martin": "mf",
  "saint pierre and miquelon": "pm",
  "saint vincent and the grenadines": "vc",
  "samoa": "ws",
  "san marino": "sm",
  "sao tome and principe": "st",
  "saudi arabia": "sa",
  "senegal": "sn",
  "serbia": "rs",
  "seychelles": "sc",
  "sierra leone": "sl",
  "singapore": "sg",
  "slovakia": "sk",
  "slovenia": "si",
  "solomon islands": "sb",
  "somalia": "so",
  "south africa": "za",
  "south georgia": "gs",
  "south sudan": "ss",
  "spain": "es",
  "sri lanka": "lk",
  "sudan": "sd",
  "suriname": "sr",
  "svalbard and jan mayen": "sj",
  "swaziland": "sz",
  "sweden": "se",
  "switzerland": "ch",
  "syrian arab republic": "sy",
  "taiwan": "tw",
  "tajikistan": "tj",
  "tanzania": "tz",
  "thailand": "th",
  "timor-leste": "tl",
  "togo": "tg",
  "tokelau": "tk",
  "tonga": "to",
  "trinidad and tobago": "tt",
  "tunisia": "tn",
  "turkey": "tr",
  "turkmenistan": "tm",
  "turks and caicos islands": "tc",
  "tuvalu": "tv",
  "uganda": "ug",
  "ukraine": "ua",
  "united arab emirates": "ae",
  "united kingdom": "gb",
  "united states": "us",
  "uruguay": "uy",
  "uzbekistan": "uz",
  "vanuatu": "vu",
  "venezuela": "ve",
  "vietnam": "vn",
  "virgin islands, british": "vg",
  "virgin islands, u.s.": "vi",
  "wallis and futuna": "wf",
  "western sahara": "eh",
  "yemen": "ye",
  "zambia": "zm",
  "zimbabwe": "zw",
}

export function getCountryCode(name: string): string | null {
  if (!name) return null
  return COUNTRY_CODES[name.toLowerCase()] ?? null
}
