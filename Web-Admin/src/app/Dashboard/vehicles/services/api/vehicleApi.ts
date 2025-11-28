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
    
    // Agregar campos básicos
    formData.append('licencePlate', vehicleData.licencePlate);
    formData.append('brand', vehicleData.brand);
    formData.append('model', vehicleData.model);
    formData.append('year', vehicleData.year.toString());
    formData.append('color', vehicleData.color);
    formData.append('passengerCapacity', vehicleData.passengerCapacity.toString());
    formData.append('status', vehicleData.status);
    formData.append('companyId', vehicleData.companyId.toString());
    formData.append('vehicleTypeId', vehicleData.vehicleTypeId.toString());
    formData.append('inService', vehicleData.inService.toString());
    
    // Agregar archivos si existen
    if (vehicleData.outboundImage) {
      formData.append('outboundImage', vehicleData.outboundImage);
    }
    if (vehicleData.returnImage) {
      formData.append('returnImage', vehicleData.returnImage);
    }
    
    return apiClient.postFormData<CrudResponse<Vehicle>>(API_ENDPOINTS.VEHICLES, formData);
  }

  static async updateVehicle(id: number, vehicleData: VehiculeFormData): Promise<CrudResponse<Vehicle>> {
    const formData = new FormData();
    
    // Agregar campos básicos
    formData.append('licencePlate', vehicleData.licencePlate);
    formData.append('brand', vehicleData.brand);
    formData.append('model', vehicleData.model);
    formData.append('year', vehicleData.year.toString());
    formData.append('color', vehicleData.color);
    formData.append('passengerCapacity', vehicleData.passengerCapacity.toString());
    formData.append('status', vehicleData.status);
    formData.append('companyId', vehicleData.companyId.toString());
    formData.append('vehicleTypeId', vehicleData.vehicleTypeId.toString());
    formData.append('inService', vehicleData.inService.toString());
    
    // Agregar archivos si existen
    if (vehicleData.outboundImage) {
      formData.append('outboundImage', vehicleData.outboundImage);
    }
    if (vehicleData.returnImage) {
      formData.append('returnImage', vehicleData.returnImage);
    }
    
    return apiClient.putFormData<CrudResponse<Vehicle>>(`${API_ENDPOINTS.VEHICLES}/${id}`, formData);
  }

  static async deleteVehicle(id: number): Promise<CrudResponse<void>> {
    return apiClient.delete<CrudResponse<void>>(`${API_ENDPOINTS.VEHICLES}/${id}`);
  }
}