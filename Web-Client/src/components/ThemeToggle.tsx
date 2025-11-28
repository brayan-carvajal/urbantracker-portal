"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (!mounted) return
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Durante la hidratación, no mostrar nada para evitar FOUC
  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 w-8 h-8 bg-background text-foreground hover:bg-accent hover:shadow-lg hover:scale-105 border border-border rounded-lg shadow-md flex items-center justify-center transition-all duration-200"
      aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-blue-400 dark:text-blue-300" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
      )}
    </button>
  )
}