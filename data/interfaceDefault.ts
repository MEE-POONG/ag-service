export interface Params {
    page: number;//หน้า
    pageSize: number;//จำนวนข้อมูลต่อหน้า
    keyword: string;//คำค้นหา
    totalPages: number;//จำนวนหน้า
    typeKeyword?: string;//ประเภทคำค้นหา
    status?: string;//สถานะ
    sortBy?: string;//ลำดับ
    sortOrder?: string;//ลำดับ
    search?: string;//คำค้นหา
    typeSearch?: string;//ประเภทคำค้นหา
    totalItems?: number;//จำนวนข้อมูล
    isActive?: boolean;//สถานะ
    isDeleted?: boolean;//ลบ
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        items: T[];
        pagination: Params;
    };
    error?: string;
}

export interface MenuItemBase {
    id: string;
    name: string;
    description: string | null;
    link: string;
    icon: string | null;
    showOrder: number;
    head: boolean;
    isVisible: boolean;
    canViews: boolean;
    canAdvance: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItemWithChildren extends MenuItemBase {
    children?: MenuItemWithChildren[];
    level: number;
    hasChildren: boolean;
}

export interface SearchFilters {
    keyword?: string;
    typeKeyword?: 'name' | 'description' | 'link';
    includeInactive?: boolean;
    parentId?: string;
}

export interface PermissionFilter {
    userRole?: string;
    userId?: string;
    checkPermissions?: boolean;
}
