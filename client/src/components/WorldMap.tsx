import React, { useEffect, useState, useRef, memo } from "react"
import { getCountryCode } from "@/lib/icons"

interface WorldMapProps {
  countryBreakdown: Record<string, number>
}

// Separate, memoized wrapper that prevents parent hover state changes
// from re-evaluating the rendered SVG DOM node and losing highlights.
interface SvgContainerProps {
  svgText: string
  countryBreakdown: Record<string, number>
  setHoveredCountry: React.Dispatch<
    React.SetStateAction<{
      name: string
      clicks: number
      x: number
      y: number
    } | null>
  >
}

const SvgContainer = memo(
  ({ svgText, countryBreakdown, setHoveredCountry }: SvgContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!svgText || !containerRef.current) return

      const container = containerRef.current
      // Insert raw SVG text once
      container.innerHTML = svgText

      const svgEl = container.querySelector("svg")
      if (!svgEl) return

      // Configure SVG viewport scaling
      svgEl.setAttribute("width", "100%")
      svgEl.setAttribute("height", "100%")
      svgEl.style.display = "block"
      svgEl.style.maxHeight = "340px"

      const activeCountries = new Map<string, { name: string; clicks: number }>()
      if (countryBreakdown) {
        Object.entries(countryBreakdown).forEach(([name, clicks]) => {
          const code = getCountryCode(name)
          if (code) {
            activeCountries.set(code.toLowerCase(), { name, clicks })
          }
        })
      }

      const clickValues = Array.from(activeCountries.values()).map((c) => c.clicks)
      const maxClicks = clickValues.length > 0 ? Math.max(...clickValues) : 1

      // Select all path and group nodes with an explicit country ID
      const paths = svgEl.querySelectorAll("[id]")
      const cleanups: (() => void)[] = []

      paths.forEach((el) => {
        const id = (el.getAttribute("id") || "").toLowerCase()
        if (!id || id.startsWith("world-map")) return

        const countryData = activeCountries.get(id)
        const clicks = countryData ? countryData.clicks : 0

        // Highlight styled paths based on analytics traffic density
        if (clicks > 0) {
          const intensity = clicks / maxClicks
          el.setAttribute("fill", `rgba(59, 130, 246, ${0.15 + intensity * 0.65})`)
          el.setAttribute("stroke", "rgba(59, 130, 246, 0.9)")
          el.setAttribute("stroke-width", "0.75")
          ;(el as HTMLElement).style.cursor = "pointer"
          ;(el as HTMLElement).style.transition = "fill 0.15s ease, stroke 0.15s ease"
        } else {
          el.setAttribute("fill", "rgba(31, 41, 55, 0.05)")
          el.setAttribute("stroke", "rgba(107, 114, 128, 0.25)")
          el.setAttribute("stroke-width", "0.5")
          ;(el as HTMLElement).style.transition = "fill 0.15s ease"
        }

        const handleMouseEnter = (e: MouseEvent) => {
          const parentRect = container.getBoundingClientRect()
          if (!parentRect) return

          const x = e.clientX - parentRect.left + 16
          const y = e.clientY - parentRect.top - 12

          const displayName = countryData ? countryData.name : id.toUpperCase()
          setHoveredCountry({
            name: displayName,
            clicks,
            x,
            y,
          })

          if (clicks > 0) {
            el.setAttribute("fill", "rgba(59, 130, 246, 0.95)")
            el.setAttribute("stroke", "rgba(96, 165, 250, 1)")
          } else {
            el.setAttribute("fill", "rgba(107, 114, 128, 0.15)")
          }
        }

        const handleMouseMove = (e: MouseEvent) => {
          const parentRect = container.getBoundingClientRect()
          if (!parentRect) return

          const x = e.clientX - parentRect.left + 16
          const y = e.clientY - parentRect.top - 12
          setHoveredCountry((prev) => (prev ? { ...prev, x, y } : null))
        }

        const handleMouseLeave = () => {
          setHoveredCountry(null)
          if (clicks > 0) {
            const intensity = clicks / maxClicks
            el.setAttribute("fill", `rgba(59, 130, 246, ${0.15 + intensity * 0.65})`)
            el.setAttribute("stroke", "rgba(59, 130, 246, 0.9)")
          } else {
            el.setAttribute("fill", "rgba(31, 41, 55, 0.05)")
            el.setAttribute("stroke", "rgba(107, 114, 128, 0.25)")
          }
        }

        el.addEventListener("mouseenter", handleMouseEnter as EventListener)
        el.addEventListener("mousemove", handleMouseMove as EventListener)
        el.addEventListener("mouseleave", handleMouseLeave as EventListener)

        cleanups.push(() => {
          el.removeEventListener("mouseenter", handleMouseEnter as EventListener)
          el.removeEventListener("mousemove", handleMouseMove as EventListener)
          el.removeEventListener("mouseleave", handleMouseLeave as EventListener)
        })
      })

      return () => {
        cleanups.forEach((cleanup) => cleanup())
      }
    }, [svgText, countryBreakdown])

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center bg-card py-4"
      />
    )
  },
  // Only trigger re-render if the core analytics statistics or SVG template changes
  (prev, next) => {
    return (
      prev.svgText === next.svgText &&
      JSON.stringify(prev.countryBreakdown) === JSON.stringify(next.countryBreakdown)
    )
  }
)

SvgContainer.displayName = "SvgContainer"

export function WorldMap({ countryBreakdown }: WorldMapProps) {
  const [svgText, setSvgText] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string
    clicks: number
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    fetch("/world-map.svg")
      .then((res) => res.text())
      .then((text) => {
        setSvgText(text)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load world map SVG", err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[320px] items-center justify-center text-xs text-muted-foreground">
        Loading interactive map...
      </div>
    )
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <SvgContainer
        svgText={svgText}
        countryBreakdown={countryBreakdown}
        setHoveredCountry={setHoveredCountry}
      />

      {/* Floating map tooltip matching Recharts popover style */}
      {hoveredCountry && (
        <div
          className="absolute z-10 pointer-events-none bg-popover/95 backdrop-blur-xs border border-border shadow-md rounded-lg p-2 min-w-[120px] animate-in fade-in zoom-in-95 duration-100 flex flex-col text-left"
          style={{
            left: `${hoveredCountry.x}px`,
            top: `${hoveredCountry.y}px`,
          }}
        >
          <div className="text-[10px] font-medium text-muted-foreground leading-none mb-1">
            {hoveredCountry.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground mt-1 leading-none">
            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
            <span className="text-muted-foreground">Visitors</span>
            <span className="font-semibold text-foreground ml-auto pl-4">
              {hoveredCountry.clicks.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
