"use client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const handleLogout = () => {
    // In a real app, this would handle the logout process
    console.log("User logged out")
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Logout</span>
    </Button>
  )
}

