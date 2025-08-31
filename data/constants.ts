// Application Constants

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'ใช้งาน',
  [USER_STATUS.INACTIVE]: 'ไม่ใช้งาน',
  [USER_STATUS.PENDING]: 'รอการอนุมัติ',
  [USER_STATUS.SUSPENDED]: 'ถูกระงับ'
} as const;

export const USER_STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'text-green-700 bg-green-100',
  [USER_STATUS.INACTIVE]: 'text-red-700 bg-red-100',
  [USER_STATUS.PENDING]: 'text-yellow-700 bg-yellow-100',
  [USER_STATUS.SUSPENDED]: 'text-gray-700 bg-gray-100'
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  AGUSER: 'aguser',
  MANAGER: 'manager',
  VIEWER: 'viewer'
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'ผู้ดูแลระบบ',
  [USER_ROLES.USER]: 'ผู้ใช้',
  [USER_ROLES.AGUSER]: 'ผู้ใช้ AG',
  [USER_ROLES.MANAGER]: 'ผู้จัดการ',
  [USER_ROLES.VIEWER]: 'ผู้ดู'
} as const;

// Permissions
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard',
  
  // User Management
  USERS_VIEW: 'users',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Admin Management
  ADMINS_VIEW: 'admins',
  ADMINS_CREATE: 'admins.create',
  ADMINS_EDIT: 'admins.edit',
  ADMINS_DELETE: 'admins.delete',
  
  // Department Management
  DEPARTMENTS_VIEW: 'departments',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_EDIT: 'departments.edit',
  DEPARTMENTS_DELETE: 'departments.delete',
  
  // Position Management
  POSITIONS_VIEW: 'positions',
  POSITIONS_CREATE: 'positions.create',
  POSITIONS_EDIT: 'positions.edit',
  POSITIONS_DELETE: 'positions.delete',
  
  // Permission Management
  PERMISSIONS_VIEW: 'permissions',
  PERMISSIONS_MANAGE: 'permissions.manage',
  
  // AG Database
  AG_WEBSITES_VIEW: 'ag_websites',
  AG_WEBSITES_CREATE: 'ag_websites.create',
  AG_WEBSITES_EDIT: 'ag_websites.edit',
  AG_WEBSITES_DELETE: 'ag_websites.delete',
  
  AG_USERS_VIEW: 'ag_users',
  AG_USERS_CREATE: 'ag_users.create',
  AG_USERS_EDIT: 'ag_users.edit',
  AG_USERS_DELETE: 'ag_users.delete',
  
  // Reports
  REPORTS_VIEW: 'reports',
  REPORTS_EXPORT: 'reports.export',
  
  // Documents
  DOCUMENTS_VIEW: 'documents',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DELETE: 'documents.delete',
  
  // Settings
  SYSTEM_SETTINGS: 'system_settings',
  BACKUP_RESTORE: 'backup',
  ACTIVITY_LOG: 'activity_log'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 25, 50, 100]
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  THAI_LONG: 'D MMMM YYYY',
  THAI_SHORT: 'D MMM YY'
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENT_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
} as const;

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: {
    CREATED: 'สร้างข้อมูลสำเร็จ',
    UPDATED: 'อัปเดตข้อมูลสำเร็จ',
    DELETED: 'ลบข้อมูลสำเร็จ',
    RETRIEVED: 'ดึงข้อมูลสำเร็จ'
  },
  ERROR: {
    NOT_FOUND: 'ไม่พบข้อมูล',
    UNAUTHORIZED: 'ไม่มีสิทธิ์เข้าถึง',
    FORBIDDEN: 'ถูกห้ามเข้าถึง',
    VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง',
    SERVER_ERROR: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์',
    NETWORK_ERROR: 'เกิดข้อผิดพลาดเครือข่าย'
  }
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ag_db_auth_token',
  USER_DATA: 'ag_db_user_data',
  SIDEBAR_COLLAPSED: 'ag_db_sidebar_collapsed',
  THEME_PREFERENCE: 'ag_db_theme',
  LANGUAGE_PREFERENCE: 'ag_db_language'
} as const;

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
  TEST: 'test'
} as const;

// Default Values
export const DEFAULTS = {
  AVATAR_URL: '/images/default-avatar.png',
  LOGO_URL: '/images/logo.png',
  COMPANY_NAME: 'AG-DB Portal',
  COPYRIGHT_YEAR: new Date().getFullYear(),
  CONTACT_EMAIL: 'admin@agdb.com',
  SUPPORT_PHONE: '02-xxx-xxxx'
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    REGEX: /^[a-zA-Z0-9_]+$/
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    REGEX: /^[0-9]{10}$/
  }
} as const;

// Export types for TypeScript
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]; 
