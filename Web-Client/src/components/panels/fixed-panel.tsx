"use client"

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SearchBar } from "components/shared/search-bar"
import { RoutesPanel } from "./routes-panel"
import { StopInfoPanel } from "./stop-info-panel"
import { GeneralInfoPanel } from "./general-info-panel"
import { usePanelActive } from "components/panels/panel-active-context"
import { usePanelCollapse } from "components/panels/panel-collapse-context"
import { useRoute } from "components/map/route-context"
import { useRouter, useParams } from "next/navigation"

export function FixedPanel() {
  const { activePanel } = usePanelActive();
  const { isPanelCollapsed, togglePanelCollapse } = usePanelCollapse();
  const { selectedRoutes } = useRoute();
  const router = useRouter();
  const params = useParams();

  const detailSelected = params?.id ? parseInt(params.id as string, 10) : null;

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
        } w-96 bg-card border border-border shadow-xl flex flex-col h-full relative`}
      >
        {/* Botón para colapsar */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-card border border-border rounded-r-md shadow-md cursor-pointer hover:bg-accent transition-colors z-10"
          onClick={togglePanelCollapse}
        >
          <div className="flex items-center justify-center w-6 h-12">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="p-4 bg-card border-b border-border shadow-sm">
          <SearchBar />
        </div>

        {/* Contenido del panel */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 bg-card">
          {renderPanel()}
        </div>
      </div>

      {/* Botón para expandir */}
      {isPanelCollapsed && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-card border border-border rounded-r-md shadow-md cursor-pointer hover:bg-accent transition-colors z-10"
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
