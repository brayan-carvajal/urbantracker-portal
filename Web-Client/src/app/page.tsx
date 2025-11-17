"use client"

import Header from "landing/header"
import Hero from "landing/hero"
import Features from "landing/features"
import HowItWorks from "landing/how-it-works"
import PrivacyInfo from "landing/privacy-info"
import Team from "landing/team"
import Footer from "landing/footer"
import { Button } from "components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { ThemeWrapper } from "components/theme-wrapper"

export default function Home() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeWrapper>
      <main className="min-h-screen">
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <Team />
        <PrivacyInfo />
        <Footer />

        {/* Floating Theme Toggle Button */}
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 w-8 h-8 bg-background/90 border-2 border-border rounded-lg shadow-lg hover:bg-accent"
          variant="ghost"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-foreground" />
          )}
        </Button>
      </main>
    </ThemeWrapper>
  )
}
