import type {
  RouteResponse,
  RouteRequest,
  CompleteRouteData,
  RouteWaypointRequest,
  RouteDetailsResponse,
} from "../../types/routeTypes";
import { ApiClient } from "../../../../utils/apiClient";
import { API_ENDPOINTS } from "./config";
import type { CrudResponse } from "./types";

const apiClient = new ApiClient("http://3.142.222.206:8080");

export class RoutesApi {
  static async getAllRoutes(): Promise<CrudResponse<RouteResponse[]>> {
    console.log('[RoutesApi] getAllRoutes called - endpoint:', API_ENDPOINTS.ROUTES);
    const result = await apiClient.get<CrudResponse<RouteResponse[]>>(API_ENDPOINTS.ROUTES);
    console.log('[RoutesApi] getAllRoutes response:', result);
    return result;
  }

  static async getRouteById(
    id: number,
    type: "WAYPOINT" | "GEOMETRY"
  ): Promise<CrudResponse<RouteDetailsResponse>> {
    return apiClient.get<CrudResponse<RouteDetailsResponse>>(
      `${API_ENDPOINTS.ROUTES}/${id}/${type}`
    );
  }

  static async createRoute(
    routeData: RouteRequest
  ): Promise<CrudResponse<RouteResponse>> {
    return apiClient.post<CrudResponse<RouteResponse>>(
      API_ENDPOINTS.ROUTES,
      routeData
    );
  }

  static async updateRoute(
    id: number,
    routeData: CompleteRouteData,
    deleteOutboundImage?: boolean,
    deleteReturnImage?: boolean
  ): Promise<CrudResponse<RouteResponse>> {
    const formData = this.createFormData(routeData, deleteOutboundImage, deleteReturnImage);

    return apiClient.putFormData<CrudResponse<RouteResponse>>(
      `${API_ENDPOINTS.ROUTES}/${id}`,
      formData
    );
  }

  static async deleteRoute(id: number): Promise<CrudResponse<void>> {
    return apiClient.delete<CrudResponse<void>>(
      `${API_ENDPOINTS.ROUTES}/${id}`
    );
  }

  static async deleteRouteImage(
    routeId: number,
    imageType: "outbound" | "return"
  ): Promise<CrudResponse<void>> {
    return apiClient.delete<CrudResponse<void>>(
      `${API_ENDPOINTS.ROUTES}/${routeId}/images/${imageType}`
    );
  }

  static async createRouteWithImages(
    routeData: CompleteRouteData
  ): Promise<CrudResponse<RouteResponse>> {
    const formData = this.createFormData(routeData);

    return apiClient.postFormData<CrudResponse<RouteResponse>>(
      API_ENDPOINTS.ROUTES,
      formData
    );
  }

  private static createFormData(routeData: CompleteRouteData, deleteOutboundImage: boolean = false, deleteReturnImage: boolean = false): FormData {
    const formData = new FormData();

    const waypointsGeometry: RouteWaypointRequest[] = [
      ...((
        routeData.outboundRoute.geometry as GeoJSON.LineString
      )?.coordinates?.map((c, i) => ({
        latitude: c[1],
        longitude: c[0],
        type: "GEOMETRY" as const,
        destine: "OUTBOUND" as const,
        sequence: i,
      })) || []),
      ...((
        routeData.returnRoute.geometry as GeoJSON.LineString
      )?.coordinates?.map((c, i) => ({
        latitude: c[1],
        longitude: c[0],
        type: "GEOMETRY" as const,
        destine: "RETURN" as const,
        sequence: i,
      })) || []),
    ];

    const waypoints: RouteWaypointRequest[] = [
      ...routeData.outboundRoute.waypoints.map((w) => ({
        ...w,
        destine: "OUTBOUND" as const,
      })),
      ...routeData.returnRoute.waypoints.map((w) => ({
        ...w,
        destine: "RETURN" as const,
      })),
    ];

    const uniqueWaypoints = [
      ...new Map(
        waypoints.map((wp) => [`${wp.sequence}-${wp.type}-${wp.destine}`, wp])
      ).values(),
    ];

    const waypointList = [...uniqueWaypoints, ...waypointsGeometry];

    formData.append("numberRoute", routeData.numberRoute);
    formData.append("description", routeData.description);
    formData.append("totalDistance", routeData.totalDistance.toString());
    formData.append("waypoints", JSON.stringify(waypointList));

    // Agregar flags de eliminación solo si son true
    if (deleteOutboundImage) {
      formData.append("deleteOutboundImage", "true");
    }
    if (deleteReturnImage) {
      formData.append("deleteReturnImage", "true");
    }

    if (routeData.outboundImage) {
      formData.append("outboundImage", routeData.outboundImage);
    }
    if (routeData.returnImage) {
      formData.append("returnImage", routeData.returnImage);
    }
    return formData;
  }
}
