import "@/app/globals.css"
import { Providers } from "@/components/providers"
import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "MapLeads - Business Search Platform",
  description: "Find and analyze business leads with MapLeads",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}