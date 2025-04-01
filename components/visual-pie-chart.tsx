"use client"

import { useState } from "react"

interface PieChartProps {
  data: { name: string; value: number }[]
  colors: string[]
}

export function VisualPieChart({ data, colors }: PieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Create CSS conic gradient for the pie chart
  let conicGradient = "conic-gradient("
  let currentAngle = 0

  data.forEach((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = percentage * 3.6 // Convert percentage to degrees (360 degrees * percentage/100)

    conicGradient += `${colors[index % colors.length]} ${currentAngle}deg ${currentAngle + angle}deg${index < data.length - 1 ? ", " : ""}`
    currentAngle += angle
  })

  conicGradient += ")"

  return (
    <div className="flex flex-col items-center">
      {/* Pie Chart */}
      <div className="relative w-[160px] h-[160px] mb-4">
        <div className="w-full h-full rounded-full" style={{ background: conicGradient }}></div>

        {/* Center circle for donut effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-background rounded-full"></div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100)

          return (
            <div
              key={index}
              className="flex items-center gap-1 cursor-pointer"
              onMouseEnter={() => setHoveredSlice(index)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div
                className={`w-3 h-3 rounded-sm ${hoveredSlice === index ? "ring-2 ring-offset-1" : ""}`}
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-xs">
                {item.name} ({percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

