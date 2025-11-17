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

  // Durante la hidratación y antes del mount, mostrar un loader neutral
  if (!mounted) {
    return (
      <button
        className="fixed bottom-4 right-4 z-50 p-3 bg-background border border-border rounded-full shadow-lg"
        aria-label="Loading theme toggle"
        disabled
      >
        <div className="h-5 w-5 bg-muted-foreground/20 rounded" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-[100] p-3 bg-background/90 dark:bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-accent transition-all duration-200 hover:scale-105"
      aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-blue-400 dark:text-blue-300" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      )}
    </button>
  )
}