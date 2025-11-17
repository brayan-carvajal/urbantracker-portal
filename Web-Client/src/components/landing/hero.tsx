"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/hooks/useTheme"
import { useEffect, useState } from "react"

export default function Hero() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar hidratación incorrecta usando un placeholder hasta que el cliente esté montado
  const imageSrc = mounted ? (theme === "dark" ? "/mapa-dark.png" : "/mapa-light.png") : "/mapa-light.png";

  return (
    <section id="inicio" className="pt-32 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance mb-6">
              Transformando la <span className="text-primary">Movilidad Urbana</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-8">
              Sistema de gestión y visualización de rutas de transporte urbano en tiempo real
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-card text-card-foreground font-semibold rounded-xl border border-border shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-primary/60"
              onClick={() => router.push("demo")}
            >
              <MapPin className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
            <Button
              size="lg"
              className="bg-card text-card-foreground font-semibold rounded-xl border border-border shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-primary/60"
              onClick={() => window.open('movil/user', '_blank')}
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Descargar App Conductor
            </Button>
          </div>

          <div className="relative">
            <div className="bg-card rounded-lg shadow-xl p-8">
              {mounted ? (
                <Image
                  src={imageSrc}
                  alt="Vista previa del mapa interactivo de UrbanTracker"
                  width={1400}
                  height={900}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              ) : (
                <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
