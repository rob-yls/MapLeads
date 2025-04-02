"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Users, Building, SearchIcon, Mail } from "lucide-react"
import { VisualBarChart } from "@/components/visual-bar-chart"
import { VisualPieChart } from "@/components/visual-pie-chart"

// Mock data for charts
const barData = [
  { name: "Jan", searches: 65 },
  { name: "Feb", searches: 59 },
  { name: "Mar", searches: 80 },
  { name: "Apr", searches: 81 },
  { name: "May", searches: 56 },
  { name: "Jun", searches: 55 },
  { name: "Jul", searches: 40 },
]

const pieData = [
  { name: "Restaurants", value: 35 },
  { name: "Retail", value: 25 },
  { name: "Healthcare", value: 20 },
  { name: "Technology", value: 15 },
  { name: "Other", value: 5 },
]

// Vibrant colors for the pie chart
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#8AB4F8"]

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">436</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses Found</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts Collected</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+7% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest search and contact activities</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <SearchIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Search completed: "Coffee shops in Seattle, WA"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Today at 10:42 AM
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md border px-2 py-1 text-xs">
                    42 results
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Added 15 new contacts from "Dentists in Portland, OR"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yesterday at 3:23 PM
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Email campaign sent to "San Francisco Tech Companies"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2 days ago at 11:35 AM
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md border px-2 py-1 text-xs">
                    37% open rate
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Business Categories</CardTitle>
            <CardDescription>Distribution of businesses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <VisualPieChart data={pieData} colors={COLORS} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search Activity</CardTitle>
          <CardDescription>Number of searches performed over the last 7 months</CardDescription>
        </CardHeader>
        <CardContent>
          <VisualBarChart data={barData} />
        </CardContent>
      </Card>
    </div>
  )
}
