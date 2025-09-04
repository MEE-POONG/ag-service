// Centralized React Query keys to avoid typos

export const qk = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  menus: {
    showOrder: ['menu-web', 'showorder'] as const,
    all: ['menu-web', 'all'] as const,
    list: (page: number, pageSize: number, keyword: string, parentId?: string) =>
      ['menu-web', 'list', { page, pageSize, keyword, parentId: parentId || '' }] as const,
  },
  admins: {
    list: ['admins', 'list'] as const,
    detail: (id: string) => ['admins', 'detail', id] as const,
  },
  agUsers: {
    base: ['aguseraccounts', 'list'] as const,
    list: (keyword: string) => ['aguseraccounts', 'list', { keyword }] as const,
    listPaged: (keyword: string, page: number, pageSize: number) =>
      ['aguseraccounts', 'list', { keyword, page, pageSize }] as const,
    detail: (id: string) => ['aguseraccounts', 'detail', id] as const,
  },
  settings: {
    root: ['settings'] as const,
  },
  positions: {
    list: ['admin-positions', 'list'] as const,
    byDepartment: (id: string) => ['admin-positions', 'byDepartment', id] as const,
  },
  departments: {
    list: ['admin-departments', 'list'] as const,
  },
  images: {
    list: (page: number, pageSize: number, keyword: string) => ['image-list', { page, pageSize, keyword }] as const,
  },
  webBase: {
    list: (search: string, status: string, page: number, pageSize: number) =>
      ['web-base', { search, status, page, pageSize }] as const,
  },
} as const
