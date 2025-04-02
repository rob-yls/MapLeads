"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Business } from "@/components/map-leads-app"
import { ExternalLink, Mail, Phone, ChevronLeft, ChevronRight, Map } from "lucide-react"
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

// Define our own ColumnDef type instead of importing from @tanstack/react-table
export interface ColumnDef<T> {
  accessorKey: keyof T | string;
  header: string | React.ReactNode;
  cell?: (props: { row: { original: T; getValue: (key: string) => any } }) => React.ReactNode;
}

interface ResultsTableProps {
  data: Business[]
  columns?: ColumnDef<Business>[]
  currentPage?: number
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>
  pageSize?: number
  setPageSize?: React.Dispatch<React.SetStateAction<number>>
}

// Create a reusable pagination component to avoid duplicate code and key issues
function PaginationControls({
  currentPage,
  totalPages,
  goToPage,
  position,
}: {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  position: 'top' | 'bottom';
}) {
  return (
    <div className="flex items-center space-x-1">
      {/* First page */}
      {currentPage > 3 && (
        <Button
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => goToPage(1)}
          key={`${position}-first-page`}
        >
          1
        </Button>
      )}

      {/* Ellipsis if needed */}
      {currentPage > 4 && <span className="mx-1" key={`${position}-ellipsis-start`}>...</span>}

      {/* Page numbers around current page */}
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        // Calculate which page numbers to show
        let pageNum;
        if (currentPage <= 3) {
          // If near the start, show first 5 pages
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          // If near the end, show last 5 pages
          pageNum = totalPages - 4 + i;
        } else {
          // Otherwise show 2 before and 2 after current page
          pageNum = currentPage - 2 + i;
        }

        // Only render if the page number is valid
        if (pageNum > 0 && pageNum <= totalPages) {
          return (
            <Button
              key={`${position}-page-${pageNum}`}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </Button>
          );
        }
        return null;
      })}

      {/* Ellipsis if needed */}
      {currentPage < totalPages - 3 && <span className="mx-1" key={`${position}-ellipsis-end`}>...</span>}

      {/* Last page */}
      {currentPage < totalPages - 2 && totalPages > 5 && (
        <Button
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => goToPage(totalPages)}
          key={`${position}-last-page`}
        >
          {totalPages}
        </Button>
      )}
    </div>
  );
}

export function ResultsTable({ data, columns, currentPage: externalCurrentPage, setCurrentPage: externalSetCurrentPage, pageSize: externalPageSize, setPageSize: externalSetPageSize }: ResultsTableProps) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  const [internalPageSize, setInternalPageSize] = useState(10)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  // Use external state if provided, otherwise use internal state
  const currentPage = externalCurrentPage ?? internalCurrentPage
  const setCurrentPage = externalSetCurrentPage ?? setInternalCurrentPage
  const pageSize = externalPageSize ?? internalPageSize
  const setPageSize = externalSetPageSize ?? setInternalPageSize

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

  // Reusable page size selector component
  const PageSizeSelector = ({ id }: { id: string }) => (
    <div className="flex items-center space-x-2">
      <p className="text-sm text-muted-foreground">Rows per page</p>
      <Select value={(pageSize).toString()} onValueChange={handlePageSizeChange}>
        <SelectTrigger className="h-8 w-[70px]" id={`page-size-trigger-${id}`}>
          <SelectValue placeholder={(pageSize).toString()} />
        </SelectTrigger>
        <SelectContent id={`page-size-content-${id}`}>
          <SelectItem value="5" key={`${id}-size-5`}>5</SelectItem>
          <SelectItem value="10" key={`${id}-size-10`}>10</SelectItem>
          <SelectItem value="20" key={`${id}-size-20`}>20</SelectItem>
          <SelectItem value="50" key={`${id}-size-50`}>50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2 w-full sm:w-auto">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{" "}
            <span className="font-medium">{data.length}</span> results
          </p>
          <PageSizeSelector id="top" />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>

          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            goToPage={goToPage} 
            position="top" 
          />

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
        <div className="overflow-visible">
          <Table>
            <TableHeader className="overflow-visible">
              <TableRow className="overflow-visible">
                {columns?.map((column, index) => (
                  <TableHead key={`header-${index}`} className="whitespace-nowrap overflow-visible">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {columns?.map((column, columnIndex) => (
                    <TableCell 
                      key={`cell-${rowIndex}-${columnIndex}`} 
                      className="py-2"
                    >
                      {column.cell ? column.cell({ row: { original: row, getValue: (key) => row[key as keyof Business] } }) : row[column.accessorKey as keyof Business]}
                    </TableCell>
                  ))}
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
          <PageSizeSelector id="bottom" />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>

          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            goToPage={goToPage} 
            position="bottom" 
          />

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
              {selectedBusiness?.street}
              {selectedBusiness?.address2 && `, ${selectedBusiness?.address2}`}
              {selectedBusiness?.city && `, ${selectedBusiness?.city}`}
              {selectedBusiness?.state && `, ${selectedBusiness?.state}`}
              {selectedBusiness?.zipCode && ` ${selectedBusiness?.zipCode}`}
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
