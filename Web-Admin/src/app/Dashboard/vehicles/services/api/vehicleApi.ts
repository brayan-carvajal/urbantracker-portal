import type { Vehicle, VehiculeFormData } from '../../types/vehiculeTypes';
import { ApiClient } from '../../../utils/apiClient';
import { API_ENDPOINTS } from './config';
import type { CrudResponse } from './types';

const apiClient = new ApiClient('http://localhost:8080');

export class VehiclesApi {
  static async getAllVehicles(): Promise<CrudResponse<Vehicle[]>> {
    return apiClient.get<CrudResponse<Vehicle[]>>(API_ENDPOINTS.VEHICLES);
  }

  static async getVehicleById(id: number): Promise<CrudResponse<Vehicle>> {
    return apiClient.get<CrudResponse<Vehicle>>(`${API_ENDPOINTS.VEHICLES}/${id}`);
  }

  static async createVehicle(vehicleData: VehiculeFormData): Promise<CrudResponse<Vehicle>> {
    const formData = new FormData();
    
    // Add basic vehicle data
    formData.append('licencePlate', vehicleData.licencePlate);
    formData.append('brand', vehicleData.brand);
    formData.append('model', vehicleData.model);
    formData.append('year', (vehicleData.year ?? 0).toString());
    formData.append('color', vehicleData.color || '');
    formData.append('passengerCapacity', (vehicleData.passengerCapacity ?? 0).toString());
    formData.append('status', vehicleData.status || '');
    if (vehicleData.companyId !== null && vehicleData.companyId !== undefined) {
      formData.append('companyId', vehicleData.companyId.toString());
    }
    if (vehicleData.vehicleTypeId !== null && vehicleData.vehicleTypeId !== undefined) {
      formData.append('vehicleTypeId', vehicleData.vehicleTypeId.toString());
    }
    formData.append('inService', (vehicleData.inService ?? false).toString());
    
    // Add image files if they exist
    if (vehicleData.outboundImage) {
      formData.append('outboundImage', vehicleData.outboundImage);
    }
    
    return apiClient.postFormData<CrudResponse<Vehicle>>(API_ENDPOINTS.VEHICLES_WITH_FILES, formData);
  }

  static async updateVehicle(id: number, vehicleData: VehiculeFormData): Promise<CrudResponse<Vehicle>> {
    const formData = new FormData();

    // Add basic vehicle data
    formData.append('licencePlate', vehicleData.licencePlate);
    formData.append('brand', vehicleData.brand);
    formData.append('model', vehicleData.model);
    formData.append('year', (vehicleData.year ?? 0).toString());
    formData.append('color', vehicleData.color || '');
    formData.append('passengerCapacity', (vehicleData.passengerCapacity ?? 0).toString());
    formData.append('status', vehicleData.status || '');
    if (vehicleData.companyId !== null && vehicleData.companyId !== undefined) {
      formData.append('companyId', vehicleData.companyId.toString());
    }
    if (vehicleData.vehicleTypeId !== null && vehicleData.vehicleTypeId !== undefined) {
      formData.append('vehicleTypeId', vehicleData.vehicleTypeId.toString());
    }
    formData.append('inService', (vehicleData.inService ?? false).toString());

    // Add image operation flags
    if (vehicleData.deleteOutboundImage) {
      formData.append('deleteOutboundImage', 'true');
    }

    // Add image files if they exist
    if (vehicleData.outboundImage) {
      formData.append('outboundImage', vehicleData.outboundImage);
    }

    return apiClient.putFormData<CrudResponse<Vehicle>>(`${API_ENDPOINTS.VEHICLES_WITH_FILES}/${id}`, formData);
  }

  static async deleteVehicle(id: number): Promise<CrudResponse<void>> {
    return apiClient.delete<CrudResponse<void>>(`${API_ENDPOINTS.VEHICLES}/${id}`);
  }

}