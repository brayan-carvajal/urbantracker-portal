import { DriversApi } from '../drivers/services/api/driverApi';
import { VehiclesApi } from '../vehicles/services/api/vehicleApi';
import { VehicleAssignmentsApi } from '../vehicleAssigments/services/api/vehicleAssigmentApi';
import { CompaniesApi } from '../company/services/api/companyApi';
import type { DriverApiResponse } from '../drivers/services/api/types';
import type { Vehicle } from '../vehicles/types/vehiculeTypes';
import type { VehicleAssigment } from '../vehicleAssigments/types/VehicleAssigmentsType';
import type { Company } from '../company/types/companyTypes';

export interface DashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  activeVehicles: number;
  totalCompanies: number;
  activeAlerts: number;
  vehiclesInRoute: number;
  availableVehicles: number;
  maintenanceVehicles: number;
  outOfServiceVehicles: number;
}

export interface ChartData {
  fleetEfficiency: Array<{ name: string; value: number; color: string }>;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: ActivityItem[];
  availableDrivers: DriverItem[];
  charts: ChartData;
}

export interface ActivityItem {
  id: string;
  type: 'route_completed' | 'vehicle_maintenance' | 'route_scheduled';
  message: string;
  timestamp: string;
  user?: string;
}

export interface MaintenanceItem {
  id: number;
  vehiclePlate: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DriverItem {
  id: number;
  name: string;
  licenseType: string;
  experience: string;
  status: 'available' | 'busy';
}

class DashboardService {
  private static instance: DashboardService;
  private cache: { data: DashboardData | null; timestamp: number } = { data: null, timestamp: 0 };
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async getDashboardData(forceRefresh = false): Promise<DashboardData> {
    // Check cache first
    const now = Date.now();
    if (!forceRefresh && this.cache.data && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      // Fetch all data in parallel for better performance
      const [driversResponse, vehiclesResponse, companiesResponse, assignmentsResponse] = await Promise.allSettled([
        DriversApi.getAllDrivers(),
        VehiclesApi.getAllVehicles(),
        CompaniesApi.getAllCompanies(),
        VehicleAssignmentsApi.getAllVehicleAssignments()
      ]);

      // Extract data with error handling
      const drivers = driversResponse.status === 'fulfilled' && driversResponse.value.success
        ? driversResponse.value.data || []
        : [];

      const vehicles = vehiclesResponse.status === 'fulfilled' && vehiclesResponse.value.success
        ? vehiclesResponse.value.data || []
        : [];

      const companies = companiesResponse.status === 'fulfilled' && companiesResponse.value.success
        ? companiesResponse.value.data || []
        : [];

      const assignments = assignmentsResponse.status === 'fulfilled' && assignmentsResponse.value.success
        ? assignmentsResponse.value.data || []
        : [];

      // Calculate stats
      const stats = this.calculateStats(drivers, vehicles, companies, assignments);

      // Get available drivers
      const availableDrivers = this.getAvailableDrivers(drivers, assignments);

      // Generate mock recent activities
      const recentActivities = this.generateRecentActivities(drivers, vehicles, assignments);

      // Calculate chart data
      const charts = this.calculateChartData(drivers, vehicles, companies, assignments, stats);

      const dashboardData = {
        stats,
        recentActivities,
        availableDrivers,
        charts
      };

      // Cache the result
      this.cache = { data: dashboardData, timestamp: now };

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
  }

  private calculateStats(
    drivers: DriverApiResponse[],
    vehicles: Vehicle[],
    companies: Company[],
    assignments: VehicleAssigment[]
  ): DashboardStats {
    const activeDrivers = drivers.filter(d => d.active).length;
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE' || v.status === 'active').length;
    const vehiclesInRoute = assignments.filter(a => a.assignmentStatus === 'ACTIVE' || a.assignmentStatus === 'active').length;
    const availableVehicles = activeVehicles - vehiclesInRoute;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE' || v.status === 'maintenance').length;
    const outOfServiceVehicles = vehicles.filter(v => v.status === 'OUT_OF_SERVICE' || v.status === 'out_of_service').length;

    // Calculate alerts (vehicles needing maintenance + overdue assignments)
    const activeAlerts = maintenanceVehicles + assignments.filter(a =>
      a.assignmentStatus === 'OVERDUE' || a.assignmentStatus === 'overdue'
    ).length;

    return {
      totalDrivers: drivers.length,
      activeDrivers,
      totalVehicles: vehicles.length,
      activeVehicles,
      totalCompanies: companies.length,
      activeAlerts,
      vehiclesInRoute,
      availableVehicles: Math.max(0, availableVehicles), // Ensure non-negative
      maintenanceVehicles,
      outOfServiceVehicles
    };
  }


  private getAvailableDrivers(drivers: DriverApiResponse[], assignments: VehicleAssigment[]): DriverItem[] {
    // Get drivers not currently assigned
    const assignedDriverIds = new Set(assignments
      .filter(a => a.assignmentStatus === 'ACTIVE' || a.assignmentStatus === 'active')
      .map(a => a.driverId)
    );

    const availableDrivers = drivers
      .filter(d => d.active && !assignedDriverIds.has(d.id))
      .slice(0, 2);

    return availableDrivers.map(driver => ({
      id: driver.id,
      name: `${driver.userProfile.firstName} ${driver.userProfile.lastName}`,
      licenseType: 'A1', // Default, could be enhanced with real license data
      experience: '8 años', // Default, could be calculated from createdAt
      status: 'available' as const
    }));
  }

  private generateRecentActivities(drivers: DriverApiResponse[], vehicles: Vehicle[], assignments: VehicleAssigment[]): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Generate mock activities based on real data
    if (assignments.length > 0) {
      const recentAssignments = assignments.slice(-3);
      recentAssignments.forEach((assignment, index) => {
        const driver = drivers.find(d => d.id === assignment.driverId);
        const vehicle = vehicles.find(v => v.id === assignment.vehicleId);
        if (driver && vehicle) {
          activities.push({
            id: `assignment-${assignment.id}`,
            type: 'route_scheduled',
            message: `Ruta asignada a ${driver.userProfile.firstName} ${driver.userProfile.lastName} con vehículo ${vehicle.licencePlate}`,
            timestamp: new Date(Date.now() - index * 3600000).toISOString(), // Hours ago
            user: driver.userProfile.firstName
          });
        }
      });
    }

    // Add some maintenance activities
    const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE' || v.status === 'maintenance');
    if (maintenanceVehicles.length > 0) {
      maintenanceVehicles.slice(0, 2).forEach((vehicle, index) => {
        activities.push({
          id: `maintenance-${vehicle.id}`,
          type: 'vehicle_maintenance',
          message: `Vehículo ${vehicle.licencePlate} en mantenimiento programado`,
          timestamp: new Date(Date.now() - (index + 1) * 7200000).toISOString(), // Hours ago
          user: 'Sistema'
        });
      });
    }

    // Add some completed routes
    if (assignments.length > 0) {
      const completedAssignments = assignments.filter(a => a.assignmentStatus === 'COMPLETED' || a.assignmentStatus === 'completed');
      if (completedAssignments.length > 0) {
        completedAssignments.slice(-2).forEach((assignment, index) => {
          const driver = drivers.find(d => d.id === assignment.driverId);
          if (driver) {
            activities.push({
              id: `completed-${assignment.id}`,
              type: 'route_completed',
              message: `Ruta completada por ${driver.userProfile.firstName} ${driver.userProfile.lastName}`,
              timestamp: new Date(Date.now() - (index + 2) * 1800000).toISOString(), // Hours ago
              user: driver.userProfile.firstName
            });
          }
        });
      }
    }

    // Sort by timestamp descending and limit to 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }

  private calculateChartData(
    drivers: DriverApiResponse[],
    vehicles: Vehicle[],
    companies: Company[],
    assignments: VehicleAssigment[],
    stats: DashboardStats
  ): ChartData {
    // Fleet efficiency data
    const fleetEfficiency = [
      { name: 'En Uso', value: stats.vehiclesInRoute, color: '#10b981' },
      { name: 'Disponibles', value: stats.availableVehicles, color: '#3b82f6' },
      { name: 'Inactivos', value: Math.max(0, stats.totalVehicles - stats.activeVehicles), color: '#6b7280' }
    ];

    return {
      fleetEfficiency
    };
  }
}

export const dashboardService = DashboardService.getInstance();