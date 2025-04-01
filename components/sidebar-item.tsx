"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: (e?: React.MouseEvent) => void
  isCollapsed?: boolean
  tooltip?: string
  hideLabel?: boolean
}

export function SidebarItem({
  icon,
  label,
  isActive = false,
  onClick,
  isCollapsed = false,
  tooltip,
  hideLabel = false,
}: SidebarItemProps) {
  const showLabel = !isCollapsed && !hideLabel

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-9 w-full relative overflow-hidden", // Reduced height from h-10 to h-9
              "flex items-center",
              isActive ? "bg-[#cddcf9] text-foreground" : "", // Custom active background color
              "hover:bg-[#cddcf9] hover:text-foreground", // Custom hover color
            )}
            onClick={(e) => onClick && onClick(e)}
          >
            {/* Fixed-position icon container */}
            <div
              className={cn(
                "absolute left-0 top-0 flex items-center justify-center h-9 w-10", // Adjusted height to match button
                isActive ? "text-primary" : "text-black dark:text-white",
              )}
            >
              {icon}
            </div>

            {/* Label that appears/disappears - adjusted to be closer to icon */}
            {showLabel && (
              <div className="pl-9 text-left w-full overflow-hidden">
                <span className="text-sm truncate block">{label}</span>
              </div>
            )}
          </Button>
        </TooltipTrigger>
        {(isCollapsed || hideLabel) && <TooltipContent side="right">{tooltip || label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}

