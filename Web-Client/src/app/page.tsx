"use client"

import Header from "landing/header"
import Hero from "landing/hero"
import Features from "landing/features"
import HowItWorks from "landing/how-it-works"
import PrivacyInfo from "landing/privacy-info"
import Team from "landing/team"
import Footer from "landing/footer"
import { ThemeToggle } from "components/ThemeToggle"
import { ThemeWrapper } from "components/theme-wrapper"

export default function Home() {
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
        <ThemeToggle />
      </main>
    </ThemeWrapper>
  )
}
