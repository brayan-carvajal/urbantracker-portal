import type { Company, CompanyFormData } from '../../types/companyTypes';
import { ApiClient } from '../../../utils/apiClient';
import { API_ENDPOINTS } from './config';
import type { CrudResponse } from './types';

const apiClient = new ApiClient('http://18.119.92.101:8080');

export class CompaniesApi {
  static async getAllCompanies(): Promise<CrudResponse<Company[]>> {
    return apiClient.get<CrudResponse<Company[]>>(API_ENDPOINTS.COMPANIES);
  }

  static async getCompanyById(id: number): Promise<CrudResponse<Company>> {
    return apiClient.get<CrudResponse<Company>>(`${API_ENDPOINTS.COMPANIES}/${id}`);
  }

  static async createCompany(companyData: CompanyFormData): Promise<CrudResponse<Company>> {
    return apiClient.post<CrudResponse<Company>>(API_ENDPOINTS.COMPANIES, companyData);
  }

  static async updateCompany(id: number, companyData: CompanyFormData): Promise<CrudResponse<Company>> {
    return apiClient.put<CrudResponse<Company>>(`${API_ENDPOINTS.COMPANIES}/${id}`, companyData);
  }

  static async deleteCompany(id: number): Promise<CrudResponse<void>> {
    return apiClient.delete<CrudResponse<void>>(`${API_ENDPOINTS.COMPANIES}/${id}`);
  }
}