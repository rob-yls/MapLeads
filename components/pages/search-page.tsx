"use client"

import { AppShell } from "@/components/app-shell"
import { SearchForm } from "@/components/search-form"
import { FilterSection } from "@/components/filter-section"
import { ResultsTable } from "@/components/results-table"
import { ChatPanel } from "@/components/chat-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, SearchIcon, Map } from "lucide-react"
import * as React from "react"
import type { Business, FilterValues } from "@/components/map-leads-app"

// Function to generate random mock data
function generateMockData(count: number): Business[] {
  const cities = [
    "Portland",
    "Seattle",
    "San Francisco",
    "Los Angeles",
    "New York",
    "Chicago",
    "Austin",
    "Miami",
    "Denver",
    "Boston",
    "Atlanta",
    "Dallas",
    "Phoenix",
    "Las Vegas",
    "Nashville",
  ]
  const businessTypes = [
    "Restaurant",
    "Cafe",
    "Dental Office",
    "Tech Company",
    "Retail Store",
    "Gym",
    "Salon",
    "Law Firm",
    "Accounting Firm",
    "Marketing Agency",
    "Real Estate Office",
    "Medical Clinic",
    "Bakery",
    "Brewery",
    "Consulting Firm",
  ]
  const streetNames = [
    "Main St",
    "Oak Ave",
    "Maple Rd",
    "Broadway",
    "Park Ave",
    "Market St",
    "Washington Blvd",
    "Lincoln Ave",
    "Highland Dr",
    "Sunset Blvd",
    "River Rd",
    "Lake St",
    "Forest Ave",
    "Mountain View",
    "Ocean Dr",
  ]

  const mockData: Business[] = []

  for (let i = 1; i <= count; i++) {
    const hasPhone = Math.random() > 0.2
    const hasEmail = Math.random() > 0.3
    const hasWebsite = Math.random() > 0.25
    const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const streetNumber = Math.floor(Math.random() * 9000) + 1000
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)]

    // Generate varying length descriptions
    let description = ""
    const descriptionLength = Math.floor(Math.random() * 4) // 0-3

    switch (descriptionLength) {
      case 0: // Short description
        description = `${businessType} serving the ${city} area.`
        break
      case 1: // Medium description
        description = `${businessType} serving the ${city} area with professional services and competitive rates. Established in ${2000 + Math.floor(Math.random() * 23)}.`
        break
      case 2: // Long description
        description = `${businessType} serving the ${city} area with professional services and competitive rates. Established in ${2000 + Math.floor(Math.random() * 23)}. We pride ourselves on customer satisfaction and quality service. Our team of experts is ready to assist you with all your needs.`
        break
      case 3: // Very long description
        description = `${businessType} serving the ${city} area with professional services and competitive rates. Established in ${2000 + Math.floor(Math.random() * 23)}. We pride ourselves on customer satisfaction and quality service. Our team of experts is ready to assist you with all your needs. We have been voted the best ${businessType.toLowerCase()} in ${city} for the past ${Math.floor(Math.random() * 5) + 3} years. Contact us today to learn more about our services and how we can help you achieve your goals. We look forward to serving you!`
        break
    }

    // Create business with varying data characteristics
    mockData.push({
      id: i.toString(),
      name:
        `${city} ${businessType} ${i}` +
        (i % 20 === 0 ? " with an Exceptionally Long Business Name That Might Cause Layout Issues" : ""),
      street:
        `${streetNumber} ${streetName}` +
        (i % 25 === 0 ? ", Suite " + Math.floor(Math.random() * 500) + ", Building Complex Name" : ""),
      city: city,
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10, // Rating between 1.0 and 5.0
      phone: hasPhone
        ? `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
        : null,
      email: hasEmail
        ? `contact${i}@${city.toLowerCase().replace(" ", "")}${businessType.toLowerCase().replace(" ", "")}.com`.toLowerCase()
        : null,
      website: hasWebsite
        ? `https://www.${city.toLowerCase().replace(" ", "")}${businessType.toLowerCase().replace(" ", "")}.com`.toLowerCase()
        : null,
      description: description,
    })
  }

  return mockData
}

export default function SearchPage() {
  const [showChat, setShowChat] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState<Business[]>([])
  const [filteredResults, setFilteredResults] = React.useState<Business[]>([])
  const [showFilters, setShowFilters] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("results")

  // Generate 100 mock data entries
  React.useEffect(() => {
    const mockData = generateMockData(100)
    setSearchResults(mockData)
    setFilteredResults(mockData)
  }, [])

  const handleSearch = (businessType: string, location: string) => {
    // In a real app, this would fetch data from an API
    console.log(`Searching for ${businessType} in ${location}`)

    // For demo purposes, filter the existing data based on the search terms
    let filtered = [...searchResults]

    if (businessType) {
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(businessType.toLowerCase()) ||
          business.description.toLowerCase().includes(businessType.toLowerCase()),
      )
    }

    if (location) {
      filtered = filtered.filter(
        (business) =>
          business.city.toLowerCase().includes(location.toLowerCase()) ||
          business.street.toLowerCase().includes(location.toLowerCase()),
      )
    }

    setFilteredResults(filtered)
    setActiveTab("results")
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
    <AppShell>
      <div className="space-y-6 w-full">
        {/* Search Section */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <SearchIcon className="h-6 w-6 text-primary" />
              Business Search
            </CardTitle>
            <CardDescription>
              Find businesses by type and location to generate leads for your marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchForm onSearch={handleSearch} />
          </CardContent>
        </Card>

        {/* Results Section with Tabs */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {filteredResults.length === 0
                    ? "No results found. Try adjusting your search criteria."
                    : `Showing ${filteredResults.length} businesses matching your criteria`}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadCSV}
                  className="flex items-center gap-2"
                  disabled={filteredResults.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={() => setShowChat(!showChat)} variant="secondary">
                  {showChat ? "Hide Chat" : "AI Assistant"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="results">Table View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 pt-2">
                {showFilters && (
                  <div className="mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                    <FilterSection onFilterChange={handleFilterChange} />
                  </div>
                )}

                <TabsContent value="results" className="mt-0 w-full">
                  <div className="content-container">
                    <ResultsTable data={filteredResults} />
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-0 w-full">
                  <div className="content-container">
                    <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-md border border-dashed">
                      <div className="flex flex-col items-center text-center p-4">
                        <Map className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Map View Coming Soon</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          The map view will allow you to visualize business locations geographically. This feature is
                          currently in development.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {showChat && (
        <div className="fixed bottom-0 right-0 w-full sm:w-96 h-96 z-50 shadow-lg border-t sm:border-l sm:border-t-0 bg-background">
          <ChatPanel onClose={() => setShowChat(false)} />
        </div>
      )}
    </AppShell>
  )
}

