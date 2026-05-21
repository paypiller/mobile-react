/**
 * Property service — API calls matching the backend property module
 */
import api from '../lib/api';
import { API_ENDPOINTS } from '../constants/api';
import type { ApiResponse, PropertiesResponse, Property, CreatePropertyPayload } from '../types';

export const propertyService = {
  /**
   * Get all properties for the active vendor
   * GET /api/v1/property/
   */
  async getProperties(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PropertiesResponse>>(
      API_ENDPOINTS.property.list,
      { params },
    );
    return response.data;
  },

  /**
   * Get properties where the user is a team member
   * GET /api/v1/property/managed
   */
  async getManagedProperties(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PropertiesResponse>>(
      API_ENDPOINTS.property.managed,
      { params },
    );
    return response.data;
  },

  /**
   * Get a single property by ID
   * GET /api/v1/property/:propertyId
   */
  async getPropertyById(propertyId: number) {
    const response = await api.get<ApiResponse<Property>>(
      API_ENDPOINTS.property.getById(propertyId),
    );
    return response.data;
  },

  /**
   * Create a new property under the active vendor
   * POST /api/v1/property/create
   */
  async createProperty(payload: CreatePropertyPayload) {
    const response = await api.post<ApiResponse<{ property: Property }>>(
      API_ENDPOINTS.property.create,
      payload,
    );
    return response.data;
  },
};
