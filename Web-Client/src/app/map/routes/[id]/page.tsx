"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { FixedPanel } from "components/panels/fixed-panel";
import { useRoute, useRoutePoints } from "components/map/route-context";

export default function RouteDetailPage() {
  const params = useParams();
  const { setSelectedRoutes, setFocusedRoute, addRoute } = useRoute();

  useEffect(() => {
    const routeId = params.id as string;
    if (routeId) {
      // Convertir el ID de string a number y seleccionar la ruta
      const id = parseInt(routeId, 10);
      if (!isNaN(id)) {
        // No sobrescribimos selectedRoutes aquí para no perder selecciones previas.
        setFocusedRoute(id);

        // Cargar los puntos de ruta desde la API
        loadRouteGeometry(id);
      }
    }
  }, [params.id, setSelectedRoutes, setFocusedRoute]);

  const loadRouteGeometry = async (routeId: number) => {
    try {
      const response = await fetch(`http://18.119.92.101:8080/api/v1/public/route/${routeId}/GEOMETRY`);
      if (!response.ok) throw new Error('Error al cargar geometría de ruta');
      const data = await response.json();
      const detail = data.data;
      const waypoints = detail.waypoints;

      // Separar puntos outbound y return
      const outboundPoints = waypoints
        .filter((w: any) => w.destine === 'OUTBOUND')
        .sort((a: any, b: any) => a.sequence - b.sequence)
        .map((w: any) => [w.longitude, w.latitude] as [number, number]);

      const returnPoints = waypoints
        .filter((w: any) => w.destine === 'RETURN')
        .sort((a: any, b: any) => a.sequence - b.sequence)
        .map((w: any) => [w.longitude, w.latitude] as [number, number]);

      // Setear puntos de ruta en el contexto
      addRoute(routeId, outboundPoints, returnPoints);
    } catch (error) {
      console.error('Error loading route geometry:', error);
    }
  };

  return <FixedPanel />;
}