"use client"

import { Sidebar } from "components/sidebar/sidebar"
import { FixedPanel } from "components/panels/fixed-panel"
import MapView from "components/map/map-view"
import { MapControls } from "components/map/map-controls"
import { ThemeToggle } from "components/ThemeToggle"

export default function DemoPage() {
  return (
    <main className="relative h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 relative h-screen">
        <MapView>
          {/* Controles de zoom posicionados cerca del botón de tema con espacio */}
          <div className="absolute bottom-16 right-6 z-40">
            <MapControls />
          </div>
        </MapView>
        
        {/* Botón de cambio de tema */}
        <ThemeToggle />
        
        <div className="fixed top-0 left-20 w-96 z-40 h-screen">
          <FixedPanel />
        </div>
      </div>
    </main>
  );
}