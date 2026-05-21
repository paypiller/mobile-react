/**
 * Global property store using Zustand
 *
 * Manages property selection and listing.
 * The active property drives most dashboard features.
 */
import { create } from 'zustand';
import { propertyService } from '../services/property.service';
import type { Property } from '../types';

interface PropertyState {
  // State
  properties: Property[];
  activePropertyId: number | null;
  isLoadingProperties: boolean;
  isFetchingMoreProperties: boolean;
  propertyPage: number;
  propertyHasMore: boolean;

  // Actions
  fetchProperties: (refresh?: boolean) => Promise<Property[]>;
  selectProperty: (propertyId: number) => void;
  clearProperties: () => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  activePropertyId: null,
  isLoadingProperties: false,
  isFetchingMoreProperties: false,
  propertyPage: 1,
  propertyHasMore: true,

  /**
   * Fetch properties for the active vendor
   */
  fetchProperties: async (refresh = false) => {
    const { properties, propertyPage, propertyHasMore, isLoadingProperties, isFetchingMoreProperties } = get();
    
    // Prevent multiple requests
    if ((isLoadingProperties || isFetchingMoreProperties) && !refresh) return properties;
    if (!propertyHasMore && !refresh && properties.length > 0) return properties;

    const isFirstFetch = refresh || properties.length === 0;
    const page = isFirstFetch ? 1 : propertyPage + 1;
    
    set(isFirstFetch ? { isLoadingProperties: true } : { isFetchingMoreProperties: true });

    try {
      const response = await propertyService.getProperties({ page, limit: 15 });
      const newProperties = response.data.properties;
      const total = response.data.total;

      const allProperties = isFirstFetch ? newProperties : [...properties, ...newProperties];

      set({ 
        properties: allProperties, 
        propertyPage: page,
        propertyHasMore: allProperties.length < total,
        isLoadingProperties: false,
        isFetchingMoreProperties: false
      });

      // Auto-select first property if none selected
      if (allProperties.length > 0 && !get().activePropertyId) {
        set({ activePropertyId: allProperties[0].id });
      }

      return allProperties;
    } catch (error) {
      set({ isLoadingProperties: false, isFetchingMoreProperties: false });
      throw error;
    }
  },

  /**
   * Select the active property for operations
   */
  selectProperty: (propertyId: number) => {
    set({ activePropertyId: propertyId });
  },

  /**
   * Clear property state (used on vendor switch or logout)
   */
  clearProperties: () => {
    set({ 
      properties: [], 
      activePropertyId: null,
      propertyPage: 1,
      propertyHasMore: true,
      isLoadingProperties: false,
      isFetchingMoreProperties: false
    });
  },
}));
