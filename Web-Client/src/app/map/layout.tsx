"use client";

import { PanelActiveProvider } from "components/panels/panel-active-context";
import { PanelCollapseProvider } from "components/panels/panel-collapse-context";
import { VehicleProvider } from "components/map/vehicle-context";
import { RouteProvider } from "components/map/route-context";
import { SearchProvider } from "components/map/search-context";
import { Sidebar } from "components/sidebar/sidebar";
import MapView from "components/map/map-view";
import { MapControls } from "components/map/map-controls";
import { usePanelCollapse } from "components/panels/panel-collapse-context";
import { ThemeWrapper } from "components/theme-wrapper";
import { ThemeToggle } from "components/ThemeToggle";

function MapLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPanelCollapsed } = usePanelCollapse();

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
        
        <div
          className={`fixed top-0 z-40 h-screen transition-all duration-700 ease-in-out ${
            isPanelCollapsed
              ? "left-20 w-6" // Solo muestra el botón cuando está colapsado
              : "left-20 w-96" // Muestra el panel completo
          }`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VehicleProvider>
      <RouteProvider>
<<<<<<< HEAD
        <SearchProvider>
          <PanelActiveProvider>
            <PanelCollapseProvider>
              <ThemeWrapper>
                <MapLayoutContent>{children}</MapLayoutContent>
              </ThemeWrapper>
            </PanelCollapseProvider>
          </PanelActiveProvider>
        </SearchProvider>
=======
        <PanelActiveProvider>
          <PanelCollapseProvider>
            <ThemeWrapper>
              <MapLayoutContent>{children}</MapLayoutContent>
            </ThemeWrapper>
          </PanelCollapseProvider>
        </PanelActiveProvider>
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
      </RouteProvider>
    </VehicleProvider>
  );
}