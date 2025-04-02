"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { FilterValues } from "@/components/map-leads-app"

const formSchema = z.object({
  name: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  ratingRange: z.tuple([z.number(), z.number()]),
  hasPhone: z.boolean().default(false),
  hasEmail: z.boolean().default(false),
  hasWebsite: z.boolean().default(false),
})

interface FilterSectionProps {
  onFilterChange: (filters: FilterValues) => void
}

export function FilterSection({ onFilterChange }: FilterSectionProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      description: "",
      ratingRange: [0, 5],
      hasPhone: false,
      hasEmail: false,
      hasWebsite: false,
    },
  })

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onFilterChange(value as FilterValues)
    })
    return () => subscription.unsubscribe()
  }, [form, onFilterChange])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFilterChange(values)
  }

  function clearFilters() {
    form.reset({
      name: "",
      street: "",
      city: "",
      description: "",
      ratingRange: [0, 5],
      hasPhone: false,
      hasEmail: false,
      hasWebsite: false,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Refine Results</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>
                            Business Name{" "}
                            <HelpCircle size={16} className="ml-1 text-gray-400" />
                          </FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>
                          Filter by the name of the business.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Filter by name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>
                            City{" "}
                            <HelpCircle size={16} className="ml-1 text-gray-400" />
                          </FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>
                          Filter by the city where the business is located.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Filter by city" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>
                            Street{" "}
                            <HelpCircle size={16} className="ml-1 text-gray-400" />
                          </FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>
                          Filter by the street where the business is located.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Filter by street" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>
                            Description{" "}
                            <HelpCircle size={16} className="ml-1 text-gray-400" />
                          </FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>
                          Filter by keywords in the business description.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Filter by keywords" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="ratingRange"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>
                            Rating Range: {field.value[0].toFixed(1)} - {field.value[1].toFixed(1)}{" "}
                            <HelpCircle size={16} className="ml-1 text-gray-400" />
                          </FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>
                          Filter by the rating range of the business.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Slider
                        min={0}
                        max={5}
                        step={0.1}
                        value={field.value}
                        onValueChange={field.onChange}
                        className="py-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="mb-2 block">Contact Information</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="hasPhone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="flex items-center">
                          <FormLabel className="font-normal">Has Phone</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle size={16} className="ml-1 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Filter by businesses that have a phone number.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="flex items-center">
                          <FormLabel className="font-normal">Has Email</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle size={16} className="ml-1 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Filter by businesses that have an email address.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasWebsite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="flex items-center">
                          <FormLabel className="font-normal">Has Website</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle size={16} className="ml-1 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Filter by businesses that have a website.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
