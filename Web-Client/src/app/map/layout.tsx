"use client";

import { PanelActiveProvider } from "components/panels/panel-active-context";
import { PanelCollapseProvider } from "components/panels/panel-collapse-context";
import { VehicleProvider } from "components/map/vehicle-context";
import { RouteProvider } from "components/map/route-context";
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
          <MapControls />
        </MapView>
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
        <PanelActiveProvider>
          <PanelCollapseProvider>
            <ThemeWrapper>
              <MapLayoutContent>{children}</MapLayoutContent>
              <ThemeToggle />
            </ThemeWrapper>
          </PanelCollapseProvider>
        </PanelActiveProvider>
      </RouteProvider>
    </VehicleProvider>
  );
}