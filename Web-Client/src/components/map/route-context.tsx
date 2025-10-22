import React, { createContext, useContext, useState } from 'react';

interface RouteData {
  id: number;
  outboundPoints: [number, number][] | null;
  returnPoints: [number, number][] | null;
}

interface RouteContextType {
  routes: RouteData[];
  setRoutes: React.Dispatch<React.SetStateAction<RouteData[]>>;
  selectedRoutes: number[];
  setSelectedRoutes: React.Dispatch<React.SetStateAction<number[]>>;
  focusedRoute: number | null;
  setFocusedRoute: React.Dispatch<React.SetStateAction<number | null>>;
  addRoute: (routeId: number, outboundPoints: [number, number][] | null, returnPoints: [number, number][] | null) => void;
  removeRoute: (routeId: number) => void;
  clearRoutes: () => void;
}

const RouteContext = createContext<RouteContextType | null>(null);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [focusedRoute, setFocusedRoute] = useState<number | null>(null);

  const addRoute = (routeId: number, outboundPoints: [number, number][] | null, returnPoints: [number, number][] | null) => {
    setRoutes(prev => {
      const existing = prev.find(r => r.id === routeId);
      if (existing) {
        return prev.map(r => r.id === routeId ? { ...r, outboundPoints, returnPoints } : r);
      }
      return [...prev, { id: routeId, outboundPoints, returnPoints }];
    });
  };

  const removeRoute = (routeId: number) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
    setSelectedRoutes(prev => prev.filter(id => id !== routeId));
  };

  const clearRoutes = () => {
    setRoutes([]);
    setSelectedRoutes([]);
  };

  return (
    <RouteContext.Provider value={{
      routes,
      setRoutes,
      selectedRoutes,
      setSelectedRoutes,
      focusedRoute,
      setFocusedRoute,
      addRoute,
      removeRoute,
      clearRoutes
    }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoutePoints() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoutePoints debe usarse dentro de RouteProvider');
  return ctx;
}

export function useRoute() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoute debe usarse dentro de RouteProvider');
  return {
    selectedRoutes: ctx.selectedRoutes,
    setSelectedRoutes: ctx.setSelectedRoutes,
    focusedRoute: ctx.focusedRoute,
    setFocusedRoute: ctx.setFocusedRoute,
    addRoute: ctx.addRoute,
    removeRoute: ctx.removeRoute,
    clearRoutes: ctx.clearRoutes
  };
}