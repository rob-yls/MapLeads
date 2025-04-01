"use client"

import * as React from "react"
import { SearchForm } from "@/components/search-form"
import { FilterSection } from "@/components/filter-section"
import { ResultsTable } from "@/components/results-table"
import { ChatPanel } from "@/components/chat-panel"
import { LogoutButton } from "@/components/logout-button"
import { EnhancedSidebar } from "@/components/enhanced-sidebar"
import { SidebarItem } from "@/components/sidebar-item"
import { Button } from "@/components/ui/button"
import { Download, Home, Search, History, Settings, Users, Map } from "lucide-react"

export default function MapLeadsApp() {
  const [showChat, setShowChat] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState<Business[]>([])
  const [filteredResults, setFilteredResults] = React.useState<Business[]>([])
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>([
    { id: "1", businessType: "coffee shops", location: "Seattle, WA" },
    { id: "2", businessType: "restaurants", location: "Portland, OR" },
    { id: "3", businessType: "dentists", location: "San Francisco, CA" },
  ])
  const [activeItem, setActiveItem] = React.useState("search")
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  // Mock data for demonstration
  React.useEffect(() => {
    const mockData: Business[] = [
      {
        id: "1",
        name: "Sunrise Cafe",
        street: "123 Main St",
        city: "Portland",
        rating: 4.5,
        phone: "503-555-1234",
        email: "info@sunrisecafe.com",
        website: "https://sunrisecafe.com",
        description: "Cozy cafe with great breakfast options",
      },
      {
        id: "2",
        name: "Downtown Dental",
        street: "456 Park Ave",
        city: "Portland",
        rating: 4.8,
        phone: "503-555-5678",
        email: "appointments@downtowndental.com",
        website: "https://downtowndental.com",
        description: "Modern dental practice with gentle care",
      },
      {
        id: "3",
        name: "Tech Solutions",
        street: "789 Broadway",
        city: "Portland",
        rating: 4.2,
        phone: "503-555-9012",
        email: null,
        website: "https://techsolutions.com",
        description: "IT support and consulting services",
      },
      {
        id: "4",
        name: "Green Thumb Nursery",
        street: "101 Garden Way",
        city: "Beaverton",
        rating: 4.7,
        phone: "503-555-3456",
        email: "plants@greenthumb.com",
        website: null,
        description: "Local plant nursery with organic options",
      },
      {
        id: "5",
        name: "Riverfront Restaurant",
        street: "202 Water St",
        city: "Portland",
        rating: 4.3,
        phone: null,
        email: "reservations@riverfrontrestaurant.com",
        website: "https://riverfrontrestaurant.com",
        description: "Upscale dining with river views",
      },
    ]

    setSearchResults(mockData)
    setFilteredResults(mockData)
  }, [])

  const handleSearch = (businessType: string, location: string) => {
    // In a real app, this would fetch data from an API
    console.log(`Searching for ${businessType} in ${location}`)

    // Add to search history
    const newHistoryItem = {
      id: Date.now().toString(),
      businessType,
      location,
    }

    setSearchHistory([newHistoryItem, ...searchHistory])
  }

  const handleHistoryItemClick = (item: SearchHistoryItem) => {
    // In a real app, this would re-run the search
    console.log(`Loading results for ${item.businessType} in ${item.location}`)
  }

  const handleFilterChange = (filters: FilterValues) => {
    // Apply filters to search results
    let filtered = [...searchResults]

    if (filters.name) {
      filtered = filtered.filter((business) => business.name.toLowerCase().includes(filters.name.toLowerCase()))
    }

    if (filters.street) {
      filtered = filtered.filter((business) => business.street.toLowerCase().includes(filters.street.toLowerCase()))
    }

    if (filters.city) {
      filtered = filtered.filter((business) => business.city.toLowerCase().includes(filters.city.toLowerCase()))
    }

    if (filters.description) {
      filtered = filtered.filter((business) =>
        business.description.toLowerCase().includes(filters.description.toLowerCase()),
      )
    }

    if (filters.ratingRange) {
      filtered = filtered.filter(
        (business) => business.rating >= filters.ratingRange[0] && business.rating <= filters.ratingRange[1],
      )
    }

    if (filters.hasPhone) {
      filtered = filtered.filter((business) => business.phone !== null)
    }

    if (filters.hasEmail) {
      filtered = filtered.filter((business) => business.email !== null)
    }

    if (filters.hasWebsite) {
      filtered = filtered.filter((business) => business.website !== null)
    }

    setFilteredResults(filtered)
  }

  const downloadCSV = () => {
    // Create CSV content
    const headers = ["Business Name", "Street", "City", "Rating", "Phone", "Email", "Website", "Description"]
    const rows = filteredResults.map((business) => [
      business.name,
      business.street,
      business.city,
      business.rating.toString(),
      business.phone || "",
      business.email || "",
      business.website || "",
      business.description,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "mapleads_results.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Full-width header */}
      <header className="flex h-16 items-center justify-between border-b px-4 z-10">
        <div className="flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">MapLeads</h1>
        </div>
        <LogoutButton />
      </header>

      {/* Content area with sidebar and main content */}
      <div className="flex flex-1 overflow-hidden min-h-[calc(100vh-4rem)]">
        <EnhancedSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen}>
          <div className="flex flex-col items-center gap-1 py-2 pt-4">
            <SidebarItem
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              isActive={activeItem === "dashboard"}
              onClick={() => setActiveItem("dashboard")}
              isCollapsed={!sidebarOpen}
            />
            <SidebarItem
              icon={<Search className="h-5 w-5" />}
              label="Search"
              isActive={activeItem === "search"}
              onClick={() => setActiveItem("search")}
              isCollapsed={!sidebarOpen}
            />
            <SidebarItem
              icon={<History className="h-5 w-5" />}
              label="History"
              isActive={activeItem === "history"}
              onClick={() => setActiveItem("history")}
              isCollapsed={!sidebarOpen}
            />
            <SidebarItem
              icon={<Users className="h-5 w-5" />}
              label="Contacts"
              isActive={activeItem === "contacts"}
              onClick={() => setActiveItem("contacts")}
              isCollapsed={!sidebarOpen}
            />
            <SidebarItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              isActive={activeItem === "settings"}
              onClick={() => setActiveItem("settings")}
              isCollapsed={!sidebarOpen}
            />
          </div>
        </EnhancedSidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 p-4 overflow-auto">
            <div className="mx-auto max-w-6xl space-y-6">
              <SearchForm onSearch={handleSearch} />

              <div className="space-y-6">
                <FilterSection onFilterChange={handleFilterChange} />

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <h2 className="text-xl font-bold">Results</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download CSV
                      </Button>
                      <Button onClick={() => setShowChat(!showChat)}>{showChat ? "Hide Chat" : "Show Chat"}</Button>
                    </div>
                  </div>

                  <ResultsTable data={filteredResults} />
                </div>
              </div>
            </div>
          </main>

          {showChat && <ChatPanel />}
        </div>
      </div>
    </div>
  )
}

// Types
export interface Business {
  id: string
  name: string
  street: string
  city: string
  rating: number
  phone: string | null
  email: string | null
  website: string | null
  description: string
}

export interface SearchHistoryItem {
  id: string
  businessType: string
  location: string
}

export interface FilterValues {
  name: string
  street: string
  city: string
  description: string
  ratingRange: [number, number]
  hasPhone: boolean
  hasEmail: boolean
  hasWebsite: boolean
}

