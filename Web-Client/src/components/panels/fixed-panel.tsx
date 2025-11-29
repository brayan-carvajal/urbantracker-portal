"use client"

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SearchBar } from "components/shared/search-bar"
import { RoutesPanel } from "./routes-panel"
import { StopInfoPanel } from "./stop-info-panel"
import { GeneralInfoPanel } from "./general-info-panel"
import { SearchResultsPanel } from "components/map/search-results-panel"
import { useSearchContext } from "components/map/search-context"
import { usePanelActive } from "components/panels/panel-active-context"
import { usePanelCollapse } from "components/panels/panel-collapse-context"
import { useRoute } from "components/map/route-context"
import { useRouter, useParams } from "next/navigation"
<<<<<<< HEAD
import { GeocodingFeature } from "@/lib/mapbox-api"
=======
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e

export function FixedPanel() {
  const { activePanel } = usePanelActive();
  const { isPanelCollapsed, togglePanelCollapse } = usePanelCollapse();
  const { selectedRoutes } = useRoute();
  const { selectedPlace, setSelectedPlace } = useSearchContext();
  const router = useRouter();
  const params = useParams();

  const detailSelected = params?.id ? parseInt(params.id as string, 10) : null;

<<<<<<< HEAD
  const handlePlaceSelect = (place: GeocodingFeature) => {
    setSelectedPlace(place);
  };

  const handleBackToRoutes = () => {
    setSelectedPlace(null);
  };

=======
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
  const handleRouteSelection = (routeId: number | null, userAction = false) => {
    if (userAction) {
      if (routeId !== null && !window.location.pathname.includes(`/map/routes/${routeId}`)) {
        router.push(`/map/routes/${routeId}`);
      } else if (routeId === null) {
        router.push("/map/routes");
      }
    }
  };

  const renderPanel = () => {
    // Si hay un lugar seleccionado, mostrar resultados de búsqueda
    if (selectedPlace) {
      return <SearchResultsPanel selectedPlace={selectedPlace} onBack={handleBackToRoutes} />
    }

    // Panel normal según el activePanel
    switch (activePanel) {
      case "routes":
        return <RoutesPanel showTitle selected={detailSelected} setSelected={(id) => handleRouteSelection(id, true)} />
      case "stop-info":
        return <StopInfoPanel />
      case "general-info":
        return <GeneralInfoPanel />
      default:
        return <RoutesPanel showTitle selected={detailSelected} setSelected={(id) => handleRouteSelection(id, true)} />
    }
  }

  return (
    <div className="fixed-panel-anim-wrapper">
      <div
        className={`fixed-panel-anim-panel ${
          isPanelCollapsed ? "collapsed" : "expanded"
        } w-96 bg-background/95 border-r border-border shadow-xl flex flex-col h-full relative`}
      >
        {/* Botón para colapsar */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-muted/95 border-t border-b border-r border-border rounded-r-md shadow-lg cursor-pointer hover:bg-accent transition-colors z-10"
          onClick={togglePanelCollapse}
        >
          <div className="flex items-center justify-center w-6 h-12">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="p-4 bg-muted/95">
<<<<<<< HEAD
          <SearchBar onPlaceSelect={handlePlaceSelect} />
=======
          <SearchBar />
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
        </div>

        {/* Contenido del panel */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 bg-background">
          {renderPanel()}
        </div>
      </div>

      {/* Botón para expandir */}
      {isPanelCollapsed && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/95 border border-border rounded-r-md shadow-lg cursor-pointer hover:bg-accent transition-colors z-10"
          onClick={togglePanelCollapse}
        >
          <div className="flex items-center justify-center w-6 h-12">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}