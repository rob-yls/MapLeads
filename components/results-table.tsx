"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Business } from "@/components/map-leads-app"
import { ExternalLink, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface ResultsTableProps {
  data: Business[]
}

export function ResultsTable({ data }: ResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = data.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const openDescriptionModal = (business: Business) => {
    setSelectedBusiness(business)
  }

  // Function to format website URL for display
  const formatWebsiteUrl = (url: string) => {
    // Remove protocol (http://, https://) for display
    return url.replace(/^https?:\/\//, "")
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-md border border-dashed">
        <p className="text-muted-foreground">No results found. Try adjusting your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2 w-full sm:w-auto">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{" "}
            <span className="font-medium">{data.length}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>

          <div className="flex items-center space-x-1">
            {/* First page */}
            {currentPage > 3 && (
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => goToPage(1)}
              >
                1
              </Button>
            )}

            {/* Ellipsis if needed */}
            {currentPage > 4 && <span className="mx-1">...</span>}

            {/* Page numbers around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Calculate which page numbers to show
              let pageNum
              if (currentPage <= 3) {
                // If near the start, show first 5 pages
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                // If near the end, show last 5 pages
                pageNum = totalPages - 4 + i
              } else {
                // Otherwise show 2 before and 2 after current page
                pageNum = currentPage - 2 + i
              }

              // Only render if the page number is valid
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              }
              return null
            })}

            {/* Ellipsis if needed */}
            {currentPage < totalPages - 3 && <span className="mx-1">...</span>}

            {/* Last page */}
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <div className="table-container w-full overflow-x-auto" style={{ minWidth: "100%" }}>
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="h-10">
                <TableHead className="min-w-[200px] py-2">Business Name</TableHead>
                <TableHead className="min-w-[200px] py-2">Street</TableHead>
                <TableHead className="min-w-[150px] py-2">City</TableHead>
                <TableHead className="min-w-[100px] py-2">Rating</TableHead>
                <TableHead className="min-w-[150px] py-2">Phone</TableHead>
                <TableHead className="min-w-[200px] py-2">Email</TableHead>
                <TableHead className="min-w-[200px] py-2">Website</TableHead>
                <TableHead className="min-w-[300px] py-2">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((business) => (
                <TableRow key={business.id} className="h-10">
                  <TableCell className="font-medium break-words py-2">{business.name}</TableCell>
                  <TableCell className="break-words py-2">{business.street}</TableCell>
                  <TableCell className="break-words py-2">{business.city}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant="secondary">{business.rating.toFixed(1)}</Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    {business.phone ? (
                      <a
                        href={`tel:${business.phone}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words">{business.phone}</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {business.email ? (
                      <a
                        href={`mailto:${business.email}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words">{business.email}</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {business.website ? (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                          {formatWebsiteUrl(business.website)}
                        </span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center space-x-1 max-w-[300px]">
                      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {business.description.length > 50
                          ? business.description.substring(0, 50)
                          : business.description}
                      </div>
                      {business.description.length > 50 && (
                        <button
                          onClick={() => openDescriptionModal(business)}
                          className="text-blue-600 hover:underline whitespace-nowrap font-bold text-xs"
                        >
                          ...READ MORE
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2 w-full sm:w-auto">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{" "}
            <span className="font-medium">{data.length}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>

          <div className="flex items-center space-x-1">
            {/* First page */}
            {currentPage > 3 && (
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => goToPage(1)}
              >
                1
              </Button>
            )}

            {/* Ellipsis if needed */}
            {currentPage > 4 && <span className="mx-1">...</span>}

            {/* Page numbers around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Calculate which page numbers to show
              let pageNum
              if (currentPage <= 3) {
                // If near the start, show first 5 pages
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                // If near the end, show last 5 pages
                pageNum = totalPages - 4 + i
              } else {
                // Otherwise show 2 before and 2 after current page
                pageNum = currentPage - 2 + i
              }

              // Only render if the page number is valid
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              }
              return null
            })}

            {/* Ellipsis if needed */}
            {currentPage < totalPages - 3 && <span className="mx-1">...</span>}

            {/* Last page */}
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>

      {/* Description Modal */}
      <Dialog open={!!selectedBusiness} onOpenChange={(open) => !open && setSelectedBusiness(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedBusiness?.name}</DialogTitle>
            <DialogDescription>
              {selectedBusiness?.street}, {selectedBusiness?.city}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm">{selectedBusiness?.description}</p>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedBusiness?.rating.toFixed(1)} Rating</Badge>
              </div>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

