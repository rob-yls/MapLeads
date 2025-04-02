"use client"

import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Define the three possible sidebar states
export type SidebarPinState = "locked-open" | "locked-closed" | "auto-hide"

interface EnhancedSidebarProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  pinState: SidebarPinState
  setPinState: React.Dispatch<React.SetStateAction<SidebarPinState>>
}

export function EnhancedSidebar({
  children,
  className,
  isOpen,
  setIsOpen,
  pinState,
  setPinState,
}: EnhancedSidebarProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null)

  // Handle auto-collapse when mouse leaves sidebar (only if in auto-hide mode)
  const handleMouseLeave = () => {
    if (pinState === "auto-hide") {
      setIsOpen(false)
    }
  }

  // Handle auto-expand when mouse enters sidebar (only if in auto-hide mode)
  const handleMouseEnter = () => {
    if (pinState === "auto-hide") {
      setIsOpen(true)
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={sidebarRef}
        className={cn(
          "transition-all duration-300 ease-in-out absolute left-0 z-20",
          isOpen ? "w-[10.4rem]" : "w-10",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={cn(
            "flex flex-col w-full border-r bg-sidebar overflow-hidden h-full",
            // Custom shadow that only applies to the right side (no bottom shadow)
            "shadow-[2px_0px_5px_0px_rgba(0,0,0,0.05)]",
          )}
        >
          <div className={cn("flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col px-0")}>
            {React.Children.map(children, (child) => {
              // Only pass isCollapsed to valid React elements that might accept this prop
              if (React.isValidElement(child)) {
                // Check if the component type is a custom component (not a DOM element)
                // DOM elements like 'div', 'span' etc. have typeof string
                const isCustomComponent = typeof child.type !== 'string';
                
                // Only pass isCollapsed to custom components, not to DOM elements
                if (isCustomComponent) {
                  return React.cloneElement(child as React.ReactElement<any>, { isCollapsed: !isOpen });
                }
              }
              return child;
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
