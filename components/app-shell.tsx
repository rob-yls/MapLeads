"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { EnhancedSidebar, type SidebarPinState } from "@/components/enhanced-sidebar"
import { SidebarItem } from "@/components/sidebar-item"
import { LogoutButton } from "@/components/logout-button"
import { Footer } from "@/components/footer"
import { Home, Search, History, Users, Settings, Map } from "lucide-react"
import Link from "next/link"
import { SidebarPinControl } from "@/components/sidebar-state-icons"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [pinState, setPinState] = React.useState<SidebarPinState>("locked-open")

  // Force sidebar state based on pin state when it changes
  React.useEffect(() => {
    if (pinState === "locked-open") {
      setSidebarOpen(true)
    } else if (pinState === "locked-closed") {
      setSidebarOpen(false)
    }
    // For auto-hide state, we don't force any change - it will respond to mouse events
  }, [pinState])

  const handlePinStateChange = (newState: SidebarPinState) => {
    setPinState(newState)
    if (newState === "locked-open" || newState === "auto-hide") {
      setSidebarOpen(true)
    } else if (newState === "locked-closed") {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Full-width header */}
      <header className="flex h-16 items-center justify-between border-b px-4 z-30 bg-background">
        <div className="flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">MapLeads</h1>
        </div>
        <LogoutButton />
      </header>

      {/* Middle section with sidebar and main content */}
      <div className="flex flex-1 relative">
        {/* Sidebar container - fixed position relative to this container */}
        <div className="relative" style={{ width: sidebarOpen ? "10.4rem" : "2.5rem" }}>
          <EnhancedSidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            pinState={pinState}
            setPinState={setPinState}
            className="top-0 bottom-0"
          >
            <div className="flex flex-col gap-0.5 py-0 mt-4 w-full">
              <Link href="/dashboard" className="w-full">
                <SidebarItem
                  icon={<Home className="h-5 w-5" />}
                  label="Dashboard"
                  isActive={pathname === "/dashboard"}
                  isCollapsed={!sidebarOpen}
                />
              </Link>
              <Link href="/search" className="w-full">
                <SidebarItem
                  icon={<Search className="h-5 w-5" />}
                  label="Search"
                  isActive={pathname === "/search"}
                  isCollapsed={!sidebarOpen}
                />
              </Link>
              <Link href="/history" className="w-full">
                <SidebarItem
                  icon={<History className="h-5 w-5" />}
                  label="History"
                  isActive={pathname === "/history"}
                  isCollapsed={!sidebarOpen}
                />
              </Link>
              <Link href="/contacts" className="w-full">
                <SidebarItem
                  icon={<Users className="h-5 w-5" />}
                  label="Contacts"
                  isActive={pathname === "/contacts"}
                  isCollapsed={!sidebarOpen}
                />
              </Link>
              <Link href="/settings" className="w-full">
                <SidebarItem
                  icon={<Settings className="h-5 w-5" />}
                  label="Settings"
                  isActive={pathname === "/settings"}
                  isCollapsed={!sidebarOpen}
                />
              </Link>

              {/* Pin control at the bottom of sidebar */}
              <div className="w-full mt-auto mb-4">
                <SidebarPinControl currentState={pinState} onChange={handlePinStateChange} isCollapsed={!sidebarOpen} />
              </div>
            </div>
          </EnhancedSidebar>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden transition-all duration-300 ease-in-out mt-1 rounded-tl-lg">
          <main className="flex-1 p-4 pt-3 overflow-auto bg-background rounded-tl-lg shadow-sm">
            <div className="w-full space-y-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Full-width footer */}
      <Footer />
    </div>
  )
}

