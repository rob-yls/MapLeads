"use client"

import { ArrowLeftRight, SidebarClose, SidebarOpen } from "lucide-react"
import { cn } from "@/lib/utils"

// Component for the vertically stacked pin control
export function SidebarPinControl({
  currentState,
  onChange,
  className,
  isCollapsed = false,
}: {
  currentState: "locked-open" | "locked-closed" | "auto-hide"
  onChange: (newState: "locked-open" | "locked-closed" | "auto-hide") => void
  className?: string
  isCollapsed?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1 overflow-hidden ${className || ""}`}>
      <button
        onClick={() => onChange("locked-open")}
        className={cn(
          "h-10 w-full relative",
          "flex items-center",
          currentState === "locked-open" ? "text-primary" : "text-black dark:text-white",
        )}
        title="Pin sidebar open"
      >
        {/* Fixed-position icon container with more compact background */}
        <div className={cn("absolute left-0 top-0 flex items-center justify-center h-10 w-10")}>
          <div
            className={cn(
              "flex items-center justify-center",
              currentState === "locked-open" ? "bg-primary/20 rounded-md p-1.5" : "",
            )}
          >
            <SidebarOpen className="h-5 w-5" />
          </div>
        </div>
      </button>

      <button
        onClick={() => onChange("auto-hide")}
        className={cn(
          "h-10 w-full relative",
          "flex items-center",
          currentState === "auto-hide" ? "text-primary" : "text-black dark:text-white",
        )}
        title="Auto-hide sidebar"
      >
        {/* Fixed-position icon container with more compact background */}
        <div className={cn("absolute left-0 top-0 flex items-center justify-center h-10 w-10")}>
          <div
            className={cn(
              "flex items-center justify-center",
              currentState === "auto-hide" ? "bg-primary/20 rounded-md p-1.5" : "",
            )}
          >
            <ArrowLeftRight className="h-5 w-5" />
          </div>
        </div>
      </button>

      <button
        onClick={() => onChange("locked-closed")}
        className={cn(
          "h-10 w-full relative",
          "flex items-center",
          currentState === "locked-closed" ? "text-primary" : "text-black dark:text-white",
        )}
        title="Pin sidebar closed"
      >
        {/* Fixed-position icon container with more compact background */}
        <div className={cn("absolute left-0 top-0 flex items-center justify-center h-10 w-10")}>
          <div
            className={cn(
              "flex items-center justify-center",
              currentState === "locked-closed" ? "bg-primary/20 rounded-md p-1.5" : "",
            )}
          >
            <SidebarClose className="h-5 w-5" />
          </div>
        </div>
      </button>
    </div>
  )
}

// Keep the individual icons for backward compatibility
export const LockOpenIcon = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className || ""}`}>
    <SidebarOpen className="h-4 w-4 text-primary" />
  </div>
)

export const LockClosedIcon = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className || ""}`}>
    <SidebarClose className="h-4 w-4 text-muted-foreground" />
  </div>
)

export const AutoHideIcon = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className || ""}`}>
    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
  </div>
)

