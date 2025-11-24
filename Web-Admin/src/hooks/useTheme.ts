"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const themeData = useNextTheme()
  const { theme, setTheme } = themeData

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar hydration mismatch devolviendo un estado neutro antes del montaje
  return {
    ...themeData,
    mounted,
    safeTheme: mounted ? theme : undefined,
    safeSetTheme: mounted ? setTheme : () => {}
  }
}
