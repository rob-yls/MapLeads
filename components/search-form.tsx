"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Ruler, Grid, HelpCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const formSchema = z.object({
  // Add unified search option
  unifiedSearch: z.string().optional(),
  
  // Keep original fields for separate search
  businessType: z.string().min(1, {
    message: "Business type is required",
  }),
  location: z.string().min(1, {
    message: "Location is required",
  }),
  radius: z.string().default("8047"),
  useGridSearch: z.boolean().default(false),
  gridSize: z.string().default("2"),
  
  // Add search mode toggle
  useUnifiedSearch: z.boolean().default(false)
})

interface SearchFormProps {
  onSearch: (businessType: string, location: string, radius: number, useGridSearch?: boolean, gridSize?: number) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unifiedSearch: "",
      businessType: "",
      location: "",
      radius: "8047",
      useGridSearch: false,
      gridSize: "2",
      useUnifiedSearch: false
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.useUnifiedSearch && values.unifiedSearch) {
      // When using unified search, pass the entire query as the business type
      // and an empty string as location (the API will parse it)
      onSearch(
        values.unifiedSearch,
        "", // Empty location since it's included in the unified search
        parseInt(values.radius),
        values.useGridSearch,
        parseInt(values.gridSize)
      )
    } else {
      // Traditional separate field search
      onSearch(
        values.businessType,
        values.location,
        parseInt(values.radius),
        values.useGridSearch,
        parseInt(values.gridSize)
      )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Search Mode Toggle */}
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="useUnifiedSearch"
            render={({ field }) => (
              <FormItem className="rounded-lg border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-3 h-9">
                  <FormLabel className="m-0 leading-none pr-2">Natural Language Search</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // Reset fields when toggling
                        if (checked) {
                          form.setValue("unifiedSearch", "");
                        } else {
                          form.setValue("businessType", "");
                          form.setValue("location", "");
                        }
                      }}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Toggle between natural language search (e.g. "coffee shops in Miami") and traditional search with separate fields.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Unified Search Field (shown when useUnifiedSearch is true) */}
        {form.watch("useUnifiedSearch") && (
          <div className="grid gap-4 md:grid-cols-1">
            <FormField
              control={form.control}
              name="unifiedSearch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Query</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="e.g., dentists in Portland, OR or coffee shops near Miami" 
                        className="pl-9" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        {/* Traditional Search Fields (shown when useUnifiedSearch is false) */}
        {!form.watch("useUnifiedSearch") && (
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="e.g., dentists, coffee shops" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="e.g., Portland, OR" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Radius</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="pl-9 relative">
                        <Ruler className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1609">1 mile (1.6 km)</SelectItem>
                      <SelectItem value="3219">2 miles (3.2 km)</SelectItem>
                      <SelectItem value="8047">5 miles (8.0 km)</SelectItem>
                      <SelectItem value="16093">10 miles (16.1 km)</SelectItem>
                      <SelectItem value="32187">20 miles (32.2 km)</SelectItem>
                      <SelectItem value="80467">50 miles (80.5 km)</SelectItem>
                      <SelectItem value="160934">100 miles (161 km)</SelectItem>
                      <SelectItem value="402336">250 miles (402 km)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {/* Advanced Search Options Section */}
        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
          <h3 className="text-sm font-medium">Advanced Search Options</h3>
          
          {/* Grid Search Toggle */}
          <div className="w-full">
            <FormField
              control={form.control}
              name="useGridSearch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <FormLabel className="mr-2 font-medium">Use Grid Search</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <div className="space-y-2">
                              <p className="font-medium">What is Grid Search?</p>
                              <p>Grid search divides the search area into a grid and performs multiple searches to overcome the 60-result limit of the Google Places API.</p>
                              <p className="font-medium mt-2">Why use it?</p>
                              <p>It significantly increases the number of businesses found in a single search, giving you more comprehensive results.</p>
                              <p className="font-medium mt-2">Time considerations:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Larger grid sizes increase search time but find more businesses</li>
                                <li>Larger search radius also increases search time</li>
                                <li>A large grid with a large radius may take over a minute to complete</li>
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Find more businesses by searching across multiple overlapping areas
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {/* Grid Size Selector - Appears when Grid Search is enabled */}
          {form.watch("useGridSearch") && (
            <div className="w-full pl-4 border-l-2 border-slate-200 ml-2">
              <FormField
                control={form.control}
                name="gridSize"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center">
                      <FormLabel className="mr-2 font-medium">Grid Size</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Larger grid sizes find more results but take longer to complete.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div 
                        className={`flex flex-col items-center justify-center p-2 border rounded-md cursor-pointer transition-all ${field.value === "1" ? "bg-primary/10 border-primary" : "bg-white hover:bg-slate-100"}`}
                        onClick={() => field.onChange("1")}
                      >
                        <div className="h-10 w-10 grid grid-cols-3 gap-0.5 mb-1">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="bg-primary/40 rounded-sm" />
                          ))}
                        </div>
                        <span className="font-medium">Small</span>
                        <span className="text-xs text-muted-foreground">3×3 grid</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-2 border rounded-md cursor-pointer transition-all ${field.value === "2" ? "bg-primary/10 border-primary" : "bg-white hover:bg-slate-100"}`}
                        onClick={() => field.onChange("2")}
                      >
                        <div className="h-10 w-10 grid grid-cols-5 gap-0.5 mb-1">
                          {[...Array(25)].map((_, i) => (
                            <div key={i} className="bg-primary/40 rounded-sm" />
                          ))}
                        </div>
                        <span className="font-medium">Medium</span>
                        <span className="text-xs text-muted-foreground">5×5 grid</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-2 border rounded-md cursor-pointer transition-all ${field.value === "3" ? "bg-primary/10 border-primary" : "bg-white hover:bg-slate-100"}`}
                        onClick={() => field.onChange("3")}
                      >
                        <div className="h-10 w-10 grid grid-cols-7 gap-0.5 mb-1">
                          {[...Array(49)].map((_, i) => (
                            <div key={i} className="bg-primary/40 rounded-sm" />
                          ))}
                        </div>
                        <span className="font-medium">Large</span>
                        <span className="text-xs text-muted-foreground">7×7 grid</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Larger grid sizes and search radius will find more businesses but increase search completion time
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <Button type="submit" className="w-full md:w-64 h-9 flex items-center justify-center">
            <Search className="h-4 w-4 mr-1.5" />
            <span className="-ml-0.5">Search</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}

