"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface PanelCollapseContextProps {
  isPanelCollapsed: boolean;
  togglePanelCollapse: () => void;
}

const PanelCollapseContext = createContext<PanelCollapseContextProps | undefined>(undefined);

export function usePanelCollapse() {
  const context = useContext(PanelCollapseContext);
  if (!context) throw new Error("usePanelCollapse must be used within PanelCollapseProvider");
  return context;
}

export function PanelCollapseProvider({ children }: { children: ReactNode }) {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false); // Cambiar a true para probar si está colapsado
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePanelCollapse = () => setIsPanelCollapsed((prev) => !prev);
  return (
    <PanelCollapseContext.Provider value={{ isPanelCollapsed, togglePanelCollapse }}>
      {children}
    </PanelCollapseContext.Provider>
  );
}
