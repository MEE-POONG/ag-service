export interface Params {
    page: number;
    pageSize: number;
    keyword: string;
    totalPages: number;
    typeKeyword?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    typeSearch?: string;
    totalItems?: number;
    isActive?: boolean;
    isDeleted?: boolean;
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
