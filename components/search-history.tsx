"use client"
import type { SearchHistoryItem } from "@/components/map-leads-app"
import { SidebarItem } from "@/components/sidebar-item"
import { Search } from "lucide-react"

interface SearchHistoryProps {
  history: SearchHistoryItem[]
  onItemClick: (item: SearchHistoryItem) => void
  isCollapsed?: boolean
}

export function SearchHistory({ history, onItemClick, isCollapsed = false }: SearchHistoryProps) {
  if (history.length === 0) {
    return (
      <div className={isCollapsed ? "hidden" : "px-4 py-2 text-sm text-muted-foreground"}>No search history yet</div>
    )
  }

  if (isCollapsed) {
    return null // Don't show search history in collapsed mode
  }

  return (
    <div className="space-y-1">
      {history.map((item) => (
        <SidebarItem
          key={item.id}
          icon={<Search className="h-4 w-4" />}
          label={`${item.businessType} in ${item.location}`}
          onClick={() => onItemClick(item)}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  )
}

