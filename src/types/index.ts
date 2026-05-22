/**
 * Shared TypeScript types for the vendor mobile app
 */

/** Matches backend SuccessResponse<T> format */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Matches backend error response format */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  error?: unknown;
}

/** User profile from backend */
export interface UserProfile {
  firstName: string;
  lastName: string;
}

/** User object from backend auth responses */
export interface User {
  id: number;
  email: string | null;
  phone: string;
  profile: UserProfile;
}

/** Vendor info from /api/v1/vendor/ */
export interface Vendor {
  vendor: {
    id: number;
    name: string;
    createdBy: number;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: number;
    email: string | null;
    phone: string | null;
    profile: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      dob?: string;
    } | null;
  } | null;
}

/** Property from /api/v1/property/ */
export interface Property {
  id: number;
  vendorId: number;
  createdBy: number;
  propertyType: 'pg' | 'apartment' | 'co_living' | 'hostel' | 'villa' | 'independent_house';
  name: string;
  slug: string;
  description: string | null;
  address: number | null;
  amenities: string[];
  rules: {
    checkInTime?: string;
    checkOutTime?: string;
    petsAllowed?: boolean;
    smokingAllowed?: boolean;
    alcoholAllowed?: boolean;
    visitorPolicy?: string;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    gateClosingTime?: string;
  } | null;
  contact: {
    phone?: string;
    email?: string;
    emergencyPhone?: string;
    caretakerName?: string;
    caretakerPhone?: string;
  } | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Properties list response */
export interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
}

/** Payload for creating a new property */
export interface CreatePropertyPayload {
  name: string;
  slug: string;
  propertyType: Property['propertyType'];
  description?: string;
  amenities?: string[];
  rules?: Record<string, any>;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  contact: {
    phone?: string;
    email?: string;
    emergencyPhone?: string;
    caretakerName?: string;
    caretakerPhone?: string;
  };
}

/** OTP request payload */
export interface RequestOtpPayload {
  phone: string;
  type: 'vendor' | 'tenant';
}

/** OTP verification payload */
export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  purpose: string;
}

/** Profile completion payload (Unified for signup and vendor setup) */
export interface CompleteProfilePayload {
  firstName?: string;
  lastName?: string;
  vendorName: string;
  email?: string;
  tempToken: string;
}

/** Request OTP response */
export interface RequestOtpResponse {
  purpose: string;
}

/** Verify OTP response — login */
export interface VerifyOtpLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  isNewUser: false;
  needsVendorSetup: false;
}

/** Verify OTP response — signup (needs profile completion) */
export interface VerifyOtpSignupResponse {
  tempToken: string;
  isNewUser: true;
  needsVendorSetup: true;
}

/** Verify OTP response — existing user needs vendor setup */
export interface VerifyOtpVendorSetupResponse {
  tempToken: string;
  isNewUser: false;
  needsVendorSetup: true;
}

export type VerifyOtpResponse =
  | VerifyOtpLoginResponse
  | VerifyOtpSignupResponse
  | VerifyOtpVendorSetupResponse;

/** Complete profile response */
export interface CompleteProfileResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Refresh token response */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/** Vendors list response */
export interface VendorsResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
}

/** Permissions list */
export type Permission =
  | 'manage_units'
  | 'manage_tenants'
  | 'manage_staff'
  | 'manage_property'
  | 'view_property'
  | 'manage_pricing'
  | 'collect_rent';

/** Matches backend permission_presets table */
export interface PermissionPreset {
  id: number;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

/** Matches backend property_roles table */
export interface PropertyRole {
  id: number;
  name: string;
  roleId: number | null; // links to global roles table for system roles, null for custom roles
  vendorId: number | null; // null for system roles, set for custom vendor roles
  permissionPresetId: number;
  createdAt: string;
  updatedAt: string;
}

/** Matches backend vendor_team table */
export interface VendorTeamMember {
  id: number;
  vendorRoleId: number;
  name: string;
  phone: string;
  roleId: number; // default property role for this staff member
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/** Matches backend property_team_members table */
export interface PropertyTeamMember {
  id: number;
  propertyId: number;
  teamMemberId: number; // links to vendor_team
  overrideRoleId: number | null; // property-level role override
  addPermissions: Permission[];
  subtractPermissions: Permission[];
  status: 'pending' | 'active' | 'inactive';
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
