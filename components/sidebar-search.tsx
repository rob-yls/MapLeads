"use client"

import type * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SidebarSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SidebarSearch({ className, ...props }: SidebarSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      <Input
        className={`h-8 w-full bg-background pl-8 shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
          className || ""
        }`}
        {...props}
      />
    </div>
  )
}

