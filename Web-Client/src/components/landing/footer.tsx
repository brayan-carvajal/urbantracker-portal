
"use client"

import { Github, Linkedin, Mail, MapPin } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { useEffect, useState } from "react"

// Animación suave personalizada para el scroll
const smoothScrollTo = (targetY: number, duration = 600) => {
  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    // easeInOutQuad
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;
    window.scrollTo(0, startY + distance * ease);
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }
  requestAnimationFrame(animation);
};

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const yOffset = -80;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    smoothScrollTo(y, 700);
  }
};

export default function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar logo según tema - con placeholder durante hidratación
  const logoSrc = mounted ? (theme === "dark" ? "/logo-full-white.svg" : "/logo-full-black.svg") : "/logo-full-white.svg";

  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src={logoSrc} alt="Logo UrbanTracker" className="h-10" />
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Sistema de gestión y visualización de rutas de transporte público en tiempo real. Desarrollado por
              aprendices SENA comprometidos con la innovación urbana.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>SENA - Centro de Tecnología, Colombia</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  type="button"
                  className="hover:text-foreground transition-colors text-left w-full cursor-pointer"
                  onClick={() => scrollToSection("inicio")}
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-foreground transition-colors text-left w-full cursor-pointer"
                  onClick={() => scrollToSection("funciones")}
                >
                  Funciones
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-foreground transition-colors text-left w-full cursor-pointer"
                  onClick={() => scrollToSection("como-funciona")}
                >
                  Cómo funciona
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-foreground transition-colors text-left w-full cursor-pointer"
                  onClick={() => scrollToSection("equipo")}
                >
                  Equipo
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-foreground transition-colors text-left w-full cursor-pointer"
                  onClick={() => scrollToSection("privacidad")}
                >
                  Privacidad
                </button>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contáctanos</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/AFSB114/UrbanTracker"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-muted-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:urbantracker.sena@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-muted-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8">
          <div className="flex justify-center items-center">
            <div className="text-sm text-muted-foreground text-center">
              © 2025 UrbanTracker - Todos los derechos reservados
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}