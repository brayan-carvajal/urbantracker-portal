
"use client";

import { PanelActiveProvider } from "components/panels/panel-active-context";
import { PanelCollapseProvider } from "components/panels/panel-collapse-context";
import { VehicleProvider } from "components/map/vehicle-context";
import { RouteProvider } from "components/map/route-context";
import { ThemeWrapper } from "components/theme-wrapper";
import { ThemeToggle } from "components/ThemeToggle";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeWrapper>
      <VehicleProvider>
        <RouteProvider>
          <PanelActiveProvider>
            <PanelCollapseProvider>
              {children}
              <ThemeToggle />
            </PanelCollapseProvider>
          </PanelActiveProvider>
        </RouteProvider>
      </VehicleProvider>
    </ThemeWrapper>
  );
}
