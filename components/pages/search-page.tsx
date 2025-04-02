"use client"

import { SearchForm } from "@/components/search-form"
import { FilterSection } from "@/components/filter-section"
import { ResultsTable, ColumnDef } from "@/components/results-table"
import { ChatPanel } from "@/components/chat-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, SearchIcon, Map, Loader2, Phone, Mail, ExternalLink, Globe, CheckSquare } from "lucide-react"
import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Business as UIBusiness } from "@/components/map-leads-app"
import type { Business as DBBusiness } from "@/types/database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { googleMapsService } from "@/lib/google-maps"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Transform database business to UI business
function transformBusinessForUI(business: Partial<DBBusiness>): UIBusiness {
  return {
    id: business.id || "",
    name: business.name || "",
    formatted_address: business.formatted_address || "",
    street: business.address || "",
    address2: business.address2 || undefined,
    city: business.city || "",
    state: business.state || "",
    zipCode: business.postal_code || "",
    rating: business.rating || 0,
    review_count: business.review_count || 0,
    phone: business.phone || undefined,
    email: business.email || undefined,
    website: business.website || undefined,
    description: business.description || "",
    googleMapUrl: business.googleMapUrl || undefined,
  }
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [businessType, setBusinessType] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [radius, setRadius] = React.useState(5000)
  const [showChat, setShowChat] = React.useState(false)
  const [filteredResults, setFilteredResults] = React.useState<UIBusiness[]>([])
  const [showFilters, setShowFilters] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("results")
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [searchResults, setSearchResults] = React.useState<Partial<DBBusiness>[] | null>(null)
  const [nextPageToken, setNextPageToken] = React.useState<string | undefined>(undefined)
  const [selectedRecords, setSelectedRecords] = React.useState<Record<string, boolean>>({})
  const [selectAllVisible, setSelectAllVisible] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Create a reference to track if the component has been mounted
  const componentMounted = React.useRef(false);

  // Log search results for debugging
  React.useEffect(() => {
    if (componentMounted.current && searchResults) {
      console.log('Search results:', searchResults);
    } else {
      componentMounted.current = true;
    }
  }, [searchResults]);

  // Transform API results to UI format whenever searchResults changes
  React.useEffect(() => {
    if (searchResults) {
      const transformedResults = searchResults.map(result => transformBusinessForUI(result));
      setFilteredResults(transformedResults);
    } else {
      setFilteredResults([]);
    }
  }, [searchResults])

  // Handle search form submission
  const handleSearch = async (businessType: string, location: string) => {
    setActiveTab("results")
    setIsSearching(true)
    setSearchError(null)
    
    try {
      console.log(`Searching for ${businessType} in ${location}...`);
      
      const response = await fetch(`/api/maps/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: businessType,
          location: location,
          radius: 5000, // Default 5km radius
        }),
        cache: 'no-store',
        next: { revalidate: 0 } // Disable caching
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || `Request failed with status: ${response.status}`;
        console.error('Search API error:', errorMessage, data);
        throw new Error(errorMessage);
      }
      
      if (!data.results || !Array.isArray(data.results)) {
        console.error('Invalid search results format:', data);
        throw new Error('Invalid response format from search API');
      }
      
      console.log(`Found ${data.results.length} results`);
      setSearchResults(data.results);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      console.error('Search error:', error);
      // Provide more detailed error information
      let errorMessage = 'An unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      } else if (error !== null && error !== undefined) {
        errorMessage = String(error);
      }
      
      setSearchError(errorMessage);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }

  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    if (!searchResults) return

    // Apply filters to the original search results
    const filtered = searchResults
      .map(transformBusinessForUI)
      .filter(business => {
        // Filter by rating if specified
        if (filters.ratingRange) {
          const [minRating, maxRating] = filters.ratingRange;
          if (business.rating < minRating || business.rating > maxRating) {
            return false;
          }
        }

        // Filter by having a website if specified
        if (filters.hasWebsite && !business.website) {
          return false
        }

        // Filter by having a phone if specified
        if (filters.hasPhone && !business.phone) {
          return false
        }
        
        // Filter by having an email if specified
        if (filters.hasEmail && !business.email) {
          return false
        }

        // Filter by name if specified
        if (filters.name && !business.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return false
        }

        // Filter by street if specified
        if (filters.street && business.street && !business.street.toLowerCase().includes(filters.street.toLowerCase())) {
          return false
        }

        // Filter by city if specified
        if (filters.city && business.city && !business.city.toLowerCase().includes(filters.city.toLowerCase())) {
          return false
        }

        // Filter by description/category if specified
        if (filters.description && business.description && 
            !business.description.toLowerCase().includes(filters.description.toLowerCase())) {
          return false
        }

        return true
      })

    setFilteredResults(filtered)
  }

  // Handle loading more results
  const handleLoadMore = async () => {
    if (!nextPageToken) return;
    
    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/maps/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageToken: nextPageToken,
        }),
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load more results');
      }
      
      // Append new results to existing ones
      setSearchResults(prev => prev ? [...prev, ...data.results] : data.results);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      console.error('Load more error:', error);
      setSearchError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSearching(false);
    }
  }

  // Handle CSV download
  const downloadCSV = async () => {
    try {
      setIsSearching(true);
      
      // Get all business data including details from API
      let allBusinessData: UIBusiness[] = [];
      
      // First, add the currently filtered results
      allBusinessData = [...filteredResults];
      
      // Filter to only include selected records
      const selectedBusinesses = allBusinessData.filter(business => selectedRecords[business.id]);
      
      if (selectedBusinesses.length === 0) {
        setIsSearching(false);
        return; // No selected records to export
      }
      
      // Export the selected businesses
      exportToCSV(selectedBusinesses);
      setIsSearching(false);
    } catch (error) {
      console.error('Error exporting selected results:', error);
      setIsSearching(false);
      
      // Export what we have so far
      const selectedBusinesses = filteredResults.filter(business => selectedRecords[business.id]);
      if (selectedBusinesses.length > 0) {
        exportToCSV(selectedBusinesses);
      }
    }
  }

  // Helper function to export data to CSV
  const exportToCSV = (businesses: UIBusiness[]) => {
    // Create CSV content
    const headers = ["Name", "Address", "City", "State", "Zip Code", "Rating", "Reviews", "Phone", "Email", "Website", "Description", "Google Map"]
    const csvContent = [
      headers.join(","),
      ...businesses.map(business => [
        `"${business.name}"`,
        `"${business.formatted_address}"`,
        `"${business.city || ""}"`,
        `"${business.state || ""}"`,
        `"${business.zipCode || ""}"`,
        business.rating || "",
        business.review_count || "",
        `"${business.phone || ""}"`,
        `"${business.email || ""}"`,
        `"${business.website || ""}"`,
        `"${business.description || ""}"`,
        `"${business.googleMapUrl || ""}"`
      ].join(","))
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "business_results.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
  }

  const columns: ColumnDef<UIBusiness>[] = [
    {
      accessorKey: "select",
      header: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                <Checkbox 
                  checked={selectAllVisible}
                  onCheckedChange={(checked) => {
                    const currentPageIds = filteredResults
                      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                      .map(row => row.id);
                    
                    // Create a new selection state
                    const newSelected = { ...selectedRecords };
                    
                    // Update selection for current page items
                    currentPageIds.forEach(id => {
                      newSelected[id] = !!checked;
                    });
                    
                    setSelectedRecords(newSelected);
                    setSelectAllVisible(!!checked);
                  }}
                  aria-label="Select all visible records"
                  className="cursor-pointer"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Select all visible records</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <div className="flex items-center justify-center">
            <Checkbox 
              checked={!!selectedRecords[id]}
              onCheckedChange={(checked) => {
                setSelectedRecords(prev => ({
                  ...prev,
                  [id]: !!checked
                }));
              }}
              aria-label={`Select ${row.original.name}`}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const name = row.getValue("name") as string
        return <div className="font-medium whitespace-normal min-w-[150px] max-w-[300px]">{name}</div>
      },
    },
    {
      accessorKey: "formatted_address",
      header: "Address",
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const address = row.getValue("formatted_address") as string
        return <div className="whitespace-normal min-w-[200px] max-w-[350px]">{address}</div>
      },
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const city = row.getValue("city") as string
        return <div className="whitespace-normal min-w-[100px] max-w-[150px]">{city}</div>
      },
    },
    {
      accessorKey: "state",
      header: <div className="text-center w-full">State</div>,
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const state = row.original.state
        return state ? <div className="whitespace-normal min-w-[60px] max-w-[100px] text-center">{state}</div> : null
      },
    },
    {
      accessorKey: "zipCode",
      header: <div className="text-center w-full">Zip Code</div>,
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const zipCode = row.original.zipCode
        return zipCode ? <div className="whitespace-normal min-w-[80px] max-w-[120px] text-center">{zipCode}</div> : null
      },
    },
    {
      accessorKey: "rating",
      header: <div className="text-center w-full">Reviews</div>,
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const rating = row.getValue("rating") as number
        const reviewCount = row.original.review_count || 0
        return (
          <div className="min-w-[100px] max-w-[120px] text-center">
            {rating ? (
              <div className="flex flex-col items-center gap-1">
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span className="text-yellow-500">★</span>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">No reviews</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const phone = row.original.phone
        return phone ? (
          <a
            href={`tel:${phone}`}
            className="flex items-center text-sm hover:underline whitespace-normal min-w-[120px] max-w-[180px]"
          >
            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
            {phone}
          </a>
        ) : (
          <span className="text-muted-foreground text-sm min-w-[120px] max-w-[180px]">Not available</span>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const email = row.original.email
        return email ? (
          <a
            href={`mailto:${email}`}
            className="flex items-center text-sm hover:underline whitespace-normal min-w-[150px] max-w-[200px]"
          >
            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
            {email}
          </a>
        ) : (
          <span className="text-muted-foreground text-sm min-w-[150px] max-w-[200px]">Not available</span>
        )
      },
    },
    {
      accessorKey: "website",
      header: <div className="text-center w-full">Website</div>,
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const website = row.original.website
        return website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-sm hover:text-primary min-w-[100px] max-w-[120px]"
          >
            <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
            View
          </a>
        ) : (
          <span className="text-muted-foreground text-sm min-w-[100px] max-w-[120px] text-center">Not available</span>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const description = row.original.description
        return description ? (
          <div className="whitespace-normal min-w-[200px] max-w-[300px] line-clamp-2" title={description}>
            {description}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm min-w-[200px] max-w-[300px]">No description</span>
        )
      },
    },
    {
      accessorKey: "googleMapUrl",
      header: <div className="text-center w-full">Google Map</div>,
      cell: ({ row }: { row: { original: UIBusiness; getValue: (key: string) => any } }) => {
        const googleMapUrl = row.original.googleMapUrl
        return googleMapUrl ? (
          <a
            href={googleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-sm hover:text-primary min-w-[100px] max-w-[120px]"
          >
            <Map className="h-4 w-4 mr-1 flex-shrink-0" />
            View
          </a>
        ) : (
          <span className="text-muted-foreground text-sm min-w-[100px] max-w-[120px] text-center">Not available</span>
        )
      },
    },
  ]

  return (
    <>
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
        <Card className="relative">
          <CardHeader className="py-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {isSearching ? (
                    "Searching..."
                  ) : searchError ? (
                    "Error searching. Please try again."
                  ) : !searchResults ? (
                    "Enter search criteria above to find businesses."
                  ) : filteredResults.length === 0 ? (
                    "No results found. Try adjusting your search criteria."
                  ) : (
                    `Showing ${filteredResults.length} businesses matching your criteria`
                  )}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                  disabled={!searchResults || searchResults.length === 0}
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Select all records that match the current filters
                          const newSelected = { ...selectedRecords };
                          
                          // Update selection for all records
                          filteredResults.forEach(business => {
                            newSelected[business.id] = true;
                          });
                          
                          setSelectedRecords(newSelected);
                          setSelectAllVisible(true);
                        }}
                        className="flex items-center gap-2"
                        disabled={filteredResults.length === 0}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Select All From Results
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Selects all records that match your current filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={downloadCSV}
                        className="flex items-center gap-2"
                        disabled={Object.keys(selectedRecords).length === 0 || !Object.values(selectedRecords).some(v => v)}
                      >
                        <Download className="h-4 w-4" />
                        Export {Object.values(selectedRecords).filter(Boolean).length} Selected
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Exports only selected records</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button onClick={() => setShowChat(!showChat)} variant="secondary">
                  {showChat ? "Hide Chat" : "AI Assistant"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {searchError && (
              <Alert variant="destructive" className="mx-6 mt-4">
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}
            
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
                    {isSearching ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <ResultsTable 
                          columns={columns} 
                          data={filteredResults} 
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          pageSize={pageSize}
                          setPageSize={setPageSize}
                        />
                        
                        {nextPageToken && (
                          <div className="mt-4 flex justify-center">
                            <Button 
                              onClick={handleLoadMore} 
                              disabled={isSearching}
                              variant="outline"
                            >
                              {isSearching ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                "Load More Results"
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
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
    </>
  )
}
