"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search, Calendar, ArrowRight, Download, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// Mock data for search history
const searchHistory = [
  {
    id: "1",
    businessType: "Coffee shops",
    location: "Seattle, WA",
    date: new Date(2023, 6, 15),
    resultsCount: 42,
  },
  {
    id: "2",
    businessType: "Restaurants",
    location: "Portland, OR",
    date: new Date(2023, 6, 10),
    resultsCount: 78,
  },
  {
    id: "3",
    businessType: "Dentists",
    location: "San Francisco, CA",
    date: new Date(2023, 6, 5),
    resultsCount: 23,
  },
  {
    id: "4",
    businessType: "Gyms",
    location: "Los Angeles, CA",
    date: new Date(2023, 5, 28),
    resultsCount: 35,
  },
  {
    id: "5",
    businessType: "Bookstores",
    location: "New York, NY",
    date: new Date(2023, 5, 20),
    resultsCount: 51,
  },
]

// Mock data for saved searches
const savedSearches = [
  {
    id: "1",
    name: "Seattle Coffee",
    businessType: "Coffee shops",
    location: "Seattle, WA",
    date: new Date(2023, 6, 15),
    filters: "Rating > 4.0, Has Website",
  },
  {
    id: "2",
    name: "Portland Dining",
    businessType: "Restaurants",
    location: "Portland, OR",
    date: new Date(2023, 6, 10),
    filters: "Rating > 4.5, Has Phone",
  },
  {
    id: "3",
    name: "SF Dental",
    businessType: "Dentists",
    location: "San Francisco, CA",
    date: new Date(2023, 6, 5),
    filters: "Has Website, Has Email",
  },
]

export default function HistoryPage() {
  return (
    <AppShell>
      <Tabs defaultValue="search-history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search-history">Search History</TabsTrigger>
          <TabsTrigger value="saved-searches">Saved Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="search-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>View and manage your recent search history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {item.businessType} in {item.location}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{format(item.date, "MMM d, yyyy")}</span>
                          <Badge variant="outline" className="ml-2">
                            {item.resultsCount} results
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Run Again
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Search History
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="saved-searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
              <CardDescription>Access your saved search configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedSearches.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Type:</span>
                          <span>{item.businessType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Location:</span>
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Filters:</span>
                          <span>{item.filters}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Saved on {format(item.date, "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button className="flex items-center gap-1">
                          Run Search
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

