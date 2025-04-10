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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Natural Language Search</FormLabel>
                </div>
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
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="useGridSearch"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <FormLabel className="mr-2">Use Grid Search</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Grid search performs multiple overlapping searches to find more results beyond the 60-result limit.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Find more businesses by using a grid-based search approach
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
          
          {form.watch("useGridSearch") && (
            <FormField
              control={form.control}
              name="gridSize"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="mr-2">Grid Size</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Larger grid sizes find more results but take longer to complete.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="pl-9 relative">
                        <Grid className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <SelectValue placeholder="Select grid size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Small (3×3 grid)</SelectItem>
                      <SelectItem value="2">Medium (5×5 grid)</SelectItem>
                      <SelectItem value="3">Large (7×7 grid)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    Larger grid sizes may take longer to complete
                  </div>
                </FormItem>
              )}
            />
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

