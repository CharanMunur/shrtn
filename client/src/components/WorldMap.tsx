import React, { useEffect, useState, useRef, memo } from "react"
import { getCountryCode } from "@/lib/icons"
import worldMapSvg from "@/assets/worldLow.svg?raw"

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
    const viewportRef = useRef<SVGElement | null>(null)

    // Zoom and pan state
    const [zoom, setZoom] = useState(1.4)
    const [pan, setPan] = useState({ x: -254, y: -137 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })

    const zoomRef = useRef(zoom)
    const panRef = useRef(pan)

    useEffect(() => {
      zoomRef.current = zoom
      panRef.current = pan
    }, [zoom, pan])

    // Hide hovered country tooltip during dragging to avoid visual noise/lag
    useEffect(() => {
      if (isDragging) {
        setHoveredCountry(null)
      }
    }, [isDragging, setHoveredCountry])

    // Apply zoom/pan transform to viewport group directly
    useEffect(() => {
      if (viewportRef.current) {
        viewportRef.current.setAttribute("transform", `translate(${pan.x}, ${pan.y}) scale(${zoom})`)
      }
    }, [zoom, pan])

    // Change cursor style dynamically when dragging
    useEffect(() => {
      if (containerRef.current) {
        const svgEl = containerRef.current.querySelector("svg")
        if (svgEl) {
          svgEl.style.cursor = isDragging ? "grabbing" : "grab"
        }
      }
    }, [isDragging])

    // Native Wheel listener for non-passive zoom behavior
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const handleNativeWheel = (e: WheelEvent) => {
        e.preventDefault()

        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
        const currentZoom = zoomRef.current
        const currentPan = panRef.current

        const nextZoom = currentZoom * factor
        const boundedZoom = Math.max(0.8, Math.min(12, nextZoom))

        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const dx = mouseX - currentPan.x
        const dy = mouseY - currentPan.y

        const nextPan = {
          x: mouseX - dx * (boundedZoom / currentZoom),
          y: mouseY - dy * (boundedZoom / currentZoom),
        }

        setZoom(boundedZoom)
        setPan(nextPan)
      }

      container.addEventListener("wheel", handleNativeWheel, { passive: false })
      return () => {
        container.removeEventListener("wheel", handleNativeWheel)
      }
    }, [])

    // Pointer events for dragging
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return // Left click only
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setPanStart({ x: pan.x, y: pan.y })
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setPan({
        x: panStart.x + dx,
        y: panStart.y + dy,
      })
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      setIsDragging(false)
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    // Zoom buttons implementation
    const zoomIn = () => {
      setZoom((prev) => {
        const nextZoom = Math.min(12, prev * 1.3)
        const container = containerRef.current
        if (container) {
          const rect = container.getBoundingClientRect()
          const mouseX = rect.width / 2
          const mouseY = rect.height / 2
          setPan((prevPan) => {
            const dx = mouseX - prevPan.x
            const dy = mouseY - prevPan.y
            return {
              x: mouseX - dx * (nextZoom / prev),
              y: mouseY - dy * (nextZoom / prev),
            }
          })
        }
        return nextZoom
      })
    }

    const zoomOut = () => {
      setZoom((prev) => {
        const nextZoom = Math.max(0.8, prev / 1.3)
        const container = containerRef.current
        if (container) {
          const rect = container.getBoundingClientRect()
          const mouseX = rect.width / 2
          const mouseY = rect.height / 2
          setPan((prevPan) => {
            const dx = mouseX - prevPan.x
            const dy = mouseY - prevPan.y
            return {
              x: mouseX - dx * (nextZoom / prev),
              y: mouseY - dy * (nextZoom / prev),
            }
          })
        }
        return nextZoom
      })
    }

    const getCenteredZoomPan = () => {
      const container = containerRef.current
      if (!container) return { zoom: 1.4, pan: { x: -254, y: -137 } }

      const rect = container.getBoundingClientRect()
      const W_c = rect.width
      const H_c = rect.height

      // SVG viewBox: "275.86 -2.5 719.29 690"
      const W_svg = 719.29
      const H_svg = 690
      const minX = 275.86
      const minY = -2.5

      // Scale factor (preserveAspectRatio xMidYMid meet)
      const scale = Math.min(W_c / W_svg, H_c / H_svg)
      const offsetX = (W_c - W_svg * scale) / 2
      const offsetY = (H_c - H_svg * scale) / 2

      // Center of entire world map in SVG coordinate space
      const Cx = minX + W_svg / 2   // 635.505
      const Cy = minY + H_svg / 2   // 342.5

      const targetZoom = 1.4

      // Pan so (Cx, Cy) appears at screen center (W_c/2, H_c/2)
      const tx = (W_c / 2 - offsetX) / scale + minX - Cx * targetZoom
      const ty = (H_c / 2 - offsetY) / scale + minY - Cy * targetZoom

      return { zoom: targetZoom, pan: { x: tx, y: ty } }
    }

    const resetZoomPan = () => {
      const centered = getCenteredZoomPan()
      setZoom(centered.zoom)
      setPan(centered.pan)
    }

    // Initialize SVG
    useEffect(() => {
      if (!svgText || !containerRef.current) return

      const container = containerRef.current
      container.innerHTML = svgText.replace(/<\?xml[^>]*\?>/i, "")

      const svgEl = container.querySelector("svg")
      if (!svgEl) return

      // Configure SVG viewport scaling
      svgEl.setAttribute("width", "100%")
      svgEl.setAttribute("height", "100%")
      svgEl.style.display = "block"
      svgEl.style.maxHeight = "100%"
      svgEl.style.backgroundColor = "transparent"
      svgEl.style.cursor = isDragging ? "grabbing" : "grab"

      // Wrap SVG children in viewport <g> for zooming/panning
      let viewport = svgEl.querySelector("#viewport") as SVGElement | null
      if (!viewport) {
        viewport = document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGElement
        viewport.setAttribute("id", "viewport")
        while (svgEl.firstChild) {
          viewport.appendChild(svgEl.firstChild)
        }
        svgEl.appendChild(viewport)
      }
      viewportRef.current = viewport

      // Apply initial transform and centering
      const centered = getCenteredZoomPan()
      setZoom(centered.zoom)
      setPan(centered.pan)
      viewport.setAttribute("transform", `translate(${centered.pan.x}, ${centered.pan.y}) scale(${centered.zoom})`)

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

      const paths = svgEl.querySelectorAll("path")
      const cleanups: (() => void)[] = []

      paths.forEach((el) => {
        const id = (el.getAttribute("id") || "").toLowerCase()
        if (!id) return

        const countryData = activeCountries.get(id)
        const clicks = countryData ? countryData.clicks : 0

        const htmlEl = el as SVGPathElement

        // Highlight based on analytics clicks count
        if (clicks > 0) {
          const intensity = clicks / maxClicks
          const fillColor = `rgba(59, 130, 246, ${0.15 + intensity * 0.65})`
          const strokeColor = "rgba(59, 130, 246, 0.9)"
          
          el.setAttribute("fill", fillColor)
          el.setAttribute("stroke", strokeColor)
          el.setAttribute("stroke-width", "0.75")
          
          htmlEl.style.fill = fillColor
          htmlEl.style.stroke = strokeColor
          htmlEl.style.cursor = "pointer"
          htmlEl.style.transition = "fill 0.15s ease, stroke 0.15s ease"
        } else {
          const fillColor = "rgba(107, 114, 128, 0.08)"
          const strokeColor = "rgba(107, 114, 128, 0.25)"
          
          el.setAttribute("fill", fillColor)
          el.setAttribute("stroke", strokeColor)
          el.setAttribute("stroke-width", "0.5")
          
          htmlEl.style.fill = fillColor
          htmlEl.style.stroke = strokeColor
          htmlEl.style.transition = "fill 0.15s ease"
        }

        const handleMouseEnter = (e: MouseEvent) => {
          const parentRect = container.getBoundingClientRect()
          if (!parentRect) return

          const x = e.clientX - parentRect.left + 16
          const y = e.clientY - parentRect.top - 12

          const title = el.getAttribute("title") || id.toUpperCase()
          const displayName = countryData ? countryData.name : title

          setHoveredCountry({
            name: displayName,
            clicks,
            x,
            y,
          })

          if (clicks > 0) {
            htmlEl.style.fill = "rgba(59, 130, 246, 0.95)"
            htmlEl.style.stroke = "rgba(96, 165, 250, 1)"
          } else {
            htmlEl.style.fill = "rgba(107, 114, 128, 0.15)"
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
            const fillColor = `rgba(59, 130, 246, ${0.15 + intensity * 0.65})`
            htmlEl.style.fill = fillColor
            htmlEl.style.stroke = "rgba(59, 130, 246, 0.9)"
          } else {
            htmlEl.style.fill = "rgba(107, 114, 128, 0.08)"
            htmlEl.style.stroke = "rgba(107, 114, 128, 0.25)"
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
      <div className="w-full h-full relative overflow-hidden select-none touch-none">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full flex items-center justify-center bg-card py-4"
        />

        {/* Zoom / Pan Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10 select-none">
          <button
            onClick={zoomIn}
            className="w-8 h-8 rounded-sm border border-border bg-popover/90 text-popover-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors text-lg font-semibold flex items-center justify-center cursor-pointer select-none"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="w-8 h-8 rounded-sm border border-border bg-popover/90 text-popover-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors text-lg font-semibold flex items-center justify-center cursor-pointer select-none"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={resetZoomPan}
            className="w-8 h-8 rounded-sm border border-border bg-popover/90 text-popover-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors text-sm flex items-center justify-center cursor-pointer select-none"
            title="Reset View"
          >
            ⟲
          </button>
        </div>
      </div>
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
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string
    clicks: number
    x: number
    y: number
  } | null>(null)

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <SvgContainer
        svgText={worldMapSvg}
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
