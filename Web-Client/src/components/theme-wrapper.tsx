"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/hooks/useTheme"

interface ThemeWrapperProps {
  children: React.ReactNode
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Durante la hidratación inicial, renderizar con tema oscuro por defecto
  // para evitar FOUC cuando el usuario esté en modo oscuro
  if (!mounted) {
    return (
      <div className="dark">
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