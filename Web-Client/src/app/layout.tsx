import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "next-themes"
import { ThemeWrapper } from "@/components/theme-wrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "UrbanTracker",
  description: "Aplicación para rastrear y gestionar rutas de transporte urbano",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/logo-icon-black.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/logo-icon-white.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
}: Readonly<{
  children: React.ReactNode
}>) {
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="urbantracker-theme"
        >
          <ThemeWrapper>
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}

