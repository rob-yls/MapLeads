"use client"

import { useState } from "react"

interface BarChartProps {
  data: { name: string; searches: number }[]
  height?: number
}

export function VisualBarChart({ data, height = 200 }: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map((item) => item.searches))

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-end justify-between h-[200px] gap-2 mb-2">
        {data.map((item, index) => {
          const barHeight = (item.searches / maxValue) * 180

          return (
            <div key={index} className="flex flex-col items-center flex-1 relative group">
              <div
                className="w-full bg-primary rounded-t-sm transition-all hover:opacity-80"
                style={{ height: `${barHeight}px` }}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              ></div>

              {/* Tooltip */}
              {hoveredBar === index && (
                <div className="absolute bottom-full mb-2 bg-background border rounded-md shadow-md px-2 py-1 text-xs z-10">
                  {item.searches} searches
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

