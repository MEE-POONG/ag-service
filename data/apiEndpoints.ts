// API Base Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
  },

  // Users Management
  USERS: {
    LIST: `${API_BASE_URL}/users`,
    CREATE: `${API_BASE_URL}/users`,
    UPDATE: (id: string) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/users/${id}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/users/${id}/toggle-status`,
  },

  // Admins Management
  ADMINS: {
    LIST: `${API_BASE_URL}/admins`,
    CREATE: `${API_BASE_URL}/admins`,
    UPDATE: (id: string) => `${API_BASE_URL}/admins/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/admins/${id}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/admins/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/admins/${id}/toggle-status`,
  },

  // Departments Management
  DEPARTMENTS: {
    LIST: `${API_BASE_URL}/departments`,
    CREATE: `${API_BASE_URL}/departments`,
    UPDATE: (id: string) => `${API_BASE_URL}/departments/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/departments/${id}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/departments/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/departments/${id}/toggle-status`,
  },

  // Admin Positions Management
  ADMIN_POSITIONS: {
    LIST: `${API_BASE_URL}/admin-positions`,
    CREATE: `${API_BASE_URL}/admin-positions`,
    UPDATE: (id: string) => `${API_BASE_URL}/admin-positions/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/admin-positions/${id}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/admin-positions/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/admin-positions/${id}/toggle-status`,
    BY_DEPARTMENT: (departmentId: string) => `${API_BASE_URL}/admin-positions/department/${departmentId}`,
  },

  // Permissions Management
  PERMISSIONS: {
    LIST: `${API_BASE_URL}/permissions`,
    CREATE: `${API_BASE_URL}/permissions`,
    UPDATE: (id: string) => `${API_BASE_URL}/permissions/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/permissions/${id}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/permissions/${id}`,
    USER_PERMISSIONS: (userId: string) => `${API_BASE_URL}/permissions/user/${userId}`,
  },

  // WebBases Management
  WEBBASES: {
    LIST: `${API_BASE_URL}/webbases`,
    CREATE: `${API_BASE_URL}/webbases`,
    UPDATE: (id: string) => `${API_BASE_URL}/webbases/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/webbases/${id}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/webbases/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/webbases/${id}/toggle-status`,
  },

  // AG Users Management
  AG_USERS: {
    LIST: `${API_BASE_URL}/ag-users`,
    CREATE: `${API_BASE_URL}/ag-users`,
    UPDATE: (id: string) => `${API_BASE_URL}/ag-users/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/ag-users/${id}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/ag-users/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/ag-users/${id}/toggle-status`,
    BY_WEBBASE: (webBaseId: string) => `${API_BASE_URL}/ag-users/webbase/${webBaseId}`,
  },

  // Reports
  REPORTS: {
    DASHBOARD_STATS: `${API_BASE_URL}/reports-stats`,
    USERS_REPORT: `${API_BASE_URL}/reports/users`,
    ADMINS_REPORT: `${API_BASE_URL}/reports/admins`,
    DEPARTMENTS_REPORT: `${API_BASE_URL}/reports/departments`,
    ACTIVITY_LOG: `${API_BASE_URL}/reports/activity-log`,
    EXPORT_USERS: `${API_BASE_URL}/reports/export/users`,
    EXPORT_ADMINS: `${API_BASE_URL}/reports/export/admins`,
  },

  // Settings
  SETTINGS: {
    SYSTEM_INFO: `${API_BASE_URL}/setting/system`,
    BACKUP: `${API_BASE_URL}/setting/backup`,
    RESTORE: `${API_BASE_URL}/setting/restore`,
    ACTIVITY_LOG: `${API_BASE_URL}/setting/activity-log`,
    UPDATE_SETTINGS: `${API_BASE_URL}/setting/update`,
  },

  // File Upload
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/upload/image`,
    DOCUMENT: `${API_BASE_URL}/upload/document`,
    AVATAR: `${API_BASE_URL}/upload/avatar`,
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { [key: string]: string[] };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request Types
export interface ApiRequestConfig {
  method?: keyof typeof HTTP_METHODS;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
}

// Common Query Parameters
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'all';
}

// Helper function to build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function to get full endpoint URL with query params
export const getEndpointWithParams = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  return `${endpoint}${buildQueryString(params)}`;
}; 
