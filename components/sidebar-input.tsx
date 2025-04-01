// Let's create a custom SidebarInput component that doesn't rely on form context

// Create a new file for a custom SidebarInput component that doesn't use form context
"use client"

import type * as React from "react"
import { Input } from "@/components/ui/input"

interface SidebarInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SidebarInput({ className, ...props }: SidebarInputProps) {
  return (
    <Input
      className={`h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${className || ""}`}
      {...props}
    />
  )
}

