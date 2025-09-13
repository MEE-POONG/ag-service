import { AdminDB, AdminDepartmentDB, AdminPositionDB, WebBaseDB, AgQueueJobDB } from "@prisma/client";

export interface PageParams {
    page: number;
    pageSize: number;
    keyword: string;
    typeKeyword?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    typeSearch?: string;
    totalItems?: number;
    totalPages: number;
    isActive?: boolean;
    isDeleted?: boolean;
}

// AdminDB ที่มีการขยายความ
export interface ExtendedAdminDB extends AdminDB {
    adminPosition?: AdminPositionDB & {
        adminDepartment?: {
            name: string;
        } | null;
        AdminDefaultPermissionDB?: {
            menuPage: {
                name: string;
                id: string;
            };
        }[];
    } | null;
    webBase?: {
        id: string;
        name: string;
    } | null;
    permissions?: string[];
    role?: 'admin' | 'superadmin'; // Add role property for admin system
    isSuperAdmin?: boolean; // Add isSuperAdmin flag
}

export interface ExtendedWebBaseDB extends WebBaseDB {
    _count?: {
        AdminDB: number;
        AGUserDB: number;
    };
}

// ตำแหน่งที่มีการขยายความ
export interface ExtendedAdminDepartment extends AdminDepartmentDB {
    adminPositions: AdminPositionDB[];
}

// AgQueueJobDB interface
export interface ExtendedAgQueueJobDB extends AgQueueJobDB {
    // Additional fields if needed in the future
}
