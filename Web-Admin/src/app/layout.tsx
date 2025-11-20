import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import { AuthGuard } from "@/components/AuthGuard"
import { ThemeProvider } from "next-themes"
import { ThemeWrapper } from "@/components/theme-wrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "UrbanTracker",
  description: "Sistema de gestión de transporte",
  generator: "v0.app",
  icons: {
  icon: [
    { url: "/white-logo.svg", sizes: "any", type: "image/svg+xml" },
    { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
  ],
}

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="urbantracker-admin-theme"
        >
          <ThemeWrapper>
            <AuthGuard>
              {children}
            </AuthGuard>
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
