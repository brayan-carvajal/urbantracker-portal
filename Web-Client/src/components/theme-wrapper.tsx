"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface ThemeWrapperProps {
  children: React.ReactNode
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Durante la hidratación inicial, renderizar sin clase de tema hasta que se determine el tema real
  // para evitar FOUC y problemas de hidratación
  if (!mounted) {
    return (
      <div>
        {children}
      </div>
    )
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      {children}
    </div>
  )
}