import { prisma } from '@/lib/prisma'
import { MenuWebDB, Prisma } from '@prisma/client'

// Type สำหรับสร้างเมนูใหม่
export interface CreateMenuWebData {
  name: string
  description?: string
  isVisible?: boolean
  showOrder?: number
  link: string
  icon?: string
  manager?: string[]
  head?: boolean
  parentId?: string | null
  canAdvance?: boolean
  canViews?: boolean
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  createdBy: string
}

// Type สำหรับอัปเดตเมนู
export interface UpdateMenuWebData {
  name?: string
  description?: string
  isVisible?: boolean
  showOrder?: number
  link?: string
  icon?: string
  manager?: string[]
  head?: boolean
  parentId?: string | null
  canAdvance?: boolean
  canViews?: boolean
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  updatedBy: string
}

// Type สำหรับ query filters
export interface MenuWebFilters {
  keyword?: string
  status?: 'visible' | 'hidden' | 'all'
  parentId?: string | null
  head?: boolean
  page?: number
  pageSize?: number
}

// Type สำหรับ response
export interface MenuWebResponse {
  success: boolean
  data?: any
  pagination?: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
  error?: string
  message?: string
}

class MenuWebModel {
  // ดึงข้อมูลเมนูทั้งหมดพร้อม filtering และ pagination
  static async getMenus(filters: MenuWebFilters = {}): Promise<{
    items: MenuWebDB[]
    total: number
    pagination: {
      totalItems: number
      totalPages: number
      currentPage: number
      pageSize: number
    }
  }> {
    const {
      keyword = '',
      status = 'all',
      parentId,
      head,
      page = 1,
      pageSize = 50
    } = filters

    const pageNum = Math.max(1, page)
    const pageSizeNum = Math.max(1, Math.min(100, pageSize)) // จำกัดไม่เกิน 100
    const skip = (pageNum - 1) * pageSizeNum

    // สร้าง where clause
    const whereClause: Prisma.MenuWebDBWhereInput = {
      
      // Filter by parentId
      ...(parentId !== undefined ? { 
        parentId: parentId === 'null' ? null : parentId 
      } : {}),
      // Filter by status (visibility)
      ...(status !== 'all' ? { 
        isVisible: status === 'visible' 
      } : {}),
      // Filter by head
      ...(head !== undefined ? { head } : {}),
      // Search by keyword
      ...(keyword ? {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { link: { contains: keyword, mode: 'insensitive' } }
        ]
      } : {})
    }

    // ดึงข้อมูลพร้อม count
    const [items, total] = await Promise.all([
      prisma.menuWebDB.findMany({
        where: whereClause,
        skip,
        take: pageSizeNum,
        orderBy: [
          { showOrder: 'asc' },
          { name: 'asc' }
        ],
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              link: true
            }
          },
          children: {
            where: {  },
            select: {
              id: true,
              name: true,
              link: true,
              showOrder: true,
              isVisible: true
            },
            orderBy: { showOrder: 'asc' }
          }
        }
      }),
      prisma.menuWebDB.count({ where: whereClause })
    ])

    return {
      items,
      total,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      }
    }
  }

  // ดึงข้อมูลเมนูตาม ID
  static async getMenuById(id: string): Promise<MenuWebDB | null> {
    return await prisma.menuWebDB.findFirst({
      where: {
        id,
        
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            link: true
          }
        },
        children: {
          where: {  },
          select: {
            id: true,
            name: true,
            link: true,
            showOrder: true,
            isVisible: true
          },
          orderBy: { showOrder: 'asc' }
        }
      }
    })
  }

  // สร้างเมนูใหม่
  static async createMenu(data: CreateMenuWebData): Promise<MenuWebDB> {
    // ตรวจสอบ duplicate name
    const existingName = await prisma.menuWebDB.findFirst({
      where: {
        name: data.name.trim(),
        
      }
    })

    if (existingName) {
      throw new Error('ชื่อเมนูนี้มีอยู่แล้ว')
    }

    // ตรวจสอบ duplicate link
    const existingLink = await prisma.menuWebDB.findFirst({
      where: {
        link: data.link.trim(),
        
      }
    })

    if (existingLink) {
      throw new Error('Link นี้มีอยู่แล้ว')
    }

    // ตรวจสอบ parent ถ้ามี
    if (data.parentId) {
      const parentExists = await prisma.menuWebDB.findFirst({
        where: {
          id: data.parentId,
          
        }
      })

      if (!parentExists) {
        throw new Error('ไม่พบเมนูหลักที่ระบุ')
      }
    }

    // หา showOrder ถัดไป ถ้าไม่ได้ระบุ
    let showOrder = data.showOrder || 0
    if (!data.showOrder) {
      const lastMenu = await prisma.menuWebDB.findFirst({
        where: {
          parentId: data.parentId || null,
          
        },
        orderBy: { showOrder: 'desc' }
      })
      showOrder = (lastMenu?.showOrder || 0) + 1
    }

    return await prisma.menuWebDB.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim(),
        isVisible: data.isVisible ?? true,
        showOrder,
        link: data.link.trim(),
        icon: data.icon?.trim(),
        manager: data.manager || [],
        head: data.head ?? false,
        parentId: data.parentId || null,
        canAdvance: data.canAdvance ?? false,
        canViews: data.canViews ?? true,
        canCreate: data.canCreate ?? false,
        canUpdate: data.canUpdate ?? false,
        canDelete: data.canDelete ?? false,
        createdBy: data.createdBy,
        updatedBy: data.createdBy
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  // อัปเดตเมนู
  static async updateMenu(id: string, data: UpdateMenuWebData): Promise<MenuWebDB> {
    // ตรวจสอบว่าเมนูมีอยู่จริง
    const existingMenu = await prisma.menuWebDB.findFirst({
      where: {
        id,
        
      }
    })

    if (!existingMenu) {
      throw new Error('ไม่พบเมนูที่ต้องการอัปเดต')
    }

    // ตรวจสอบ duplicate name (ถ้ามีการเปลี่ยน)
    if (data.name && data.name.trim() !== existingMenu.name) {
      const duplicateName = await prisma.menuWebDB.findFirst({
        where: {
          name: data.name.trim(),
          id: { not: id },
          
        }
      })

      if (duplicateName) {
        throw new Error('ชื่อเมนูนี้มีอยู่แล้ว')
      }
    }

    // ตรวจสอบ duplicate link (ถ้ามีการเปลี่ยน)
    if (data.link && data.link.trim() !== existingMenu.link) {
      const duplicateLink = await prisma.menuWebDB.findFirst({
        where: {
          link: data.link.trim(),
          id: { not: id },
          
        }
      })

      if (duplicateLink) {
        throw new Error('Link นี้มีอยู่แล้ว')
      }
    }

    // ตรวจสอบ parent (ถ้ามีการเปลี่ยน)
    if (data.parentId && data.parentId !== existingMenu.parentId) {
      // ป้องกันการสร้าง circular reference
      if (data.parentId === id) {
        throw new Error('ไม่สามารถกำหนดให้เป็น parent ของตัวเองได้')
      }

      const parentExists = await prisma.menuWebDB.findFirst({
        where: {
          id: data.parentId,
          
        }
      })

      if (!parentExists) {
        throw new Error('ไม่พบเมนูหลักที่ระบุ')
      }
    }

    return await prisma.menuWebDB.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() }),
        ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
        ...(data.showOrder !== undefined && { showOrder: data.showOrder }),
        ...(data.link && { link: data.link.trim() }),
        ...(data.icon !== undefined && { icon: data.icon?.trim() }),
        ...(data.manager !== undefined && { manager: data.manager }),
        ...(data.head !== undefined && { head: data.head }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.canAdvance !== undefined && { canAdvance: data.canAdvance }),
        ...(data.canViews !== undefined && { canViews: data.canViews }),
        ...(data.canCreate !== undefined && { canCreate: data.canCreate }),
        ...(data.canUpdate !== undefined && { canUpdate: data.canUpdate }),
        ...(data.canDelete !== undefined && { canDelete: data.canDelete }),
        updatedAt: new Date(),
        updatedBy: data.updatedBy
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  // ลบเมนู (soft delete)
  static async deleteMenu(id: string, deleteBy: string): Promise<MenuWebDB> {
    // ตรวจสอบว่าเมนูมีอยู่จริง
    const existingMenu = await prisma.menuWebDB.findFirst({
      where: {
        id,
        
      }
    })

    if (!existingMenu) {
      throw new Error('ไม่พบเมนูที่ต้องการลบ')
    }

    // ตรวจสอบว่ามีเมนูย่อยหรือไม่
    const hasChildren = await prisma.menuWebDB.findFirst({
      where: {
        parentId: id,
        
      }
    })

    if (hasChildren) {
      throw new Error('ไม่สามารถลบเมนูที่มีเมนูย่อยได้ กรุณาลบเมนูย่อยก่อน')
    }

    return await prisma.menuWebDB.update({
      where: { id },
      data: {
        isDeleted: true,
        deleteBy: deleteBy,
        updatedAt: new Date(),
        updatedBy: deleteBy
      }
    })
  }

  // อัปเดตลำดับการแสดง
  static async updateShowOrder(updates: { id: string; showOrder: number }[], updatedBy: string): Promise<void> {
    const updatePromises = updates.map(({ id, showOrder }) =>
      prisma.menuWebDB.update({
        where: { id },
        data: {
          showOrder,
          updatedAt: new Date(),
          updatedBy
        }
      })
    )

    await Promise.all(updatePromises)
  }

  // ดึงข้อมูลทั้งหมดเรียงตาม showOrder (สำหรับ showorder endpoint)
  static async getAllMenusOrderedByShowOrder(): Promise<MenuWebDB[]> {
    return await prisma.menuWebDB.findMany({
      where: {
        
      },
      orderBy: [
        { showOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          where: {  },
          select: {
            id: true,
            name: true,
            showOrder: true
          },
          orderBy: { showOrder: 'asc' }
        }
      }
    })
  }

  // ตรวจสอบสิทธิ์การเข้าถึงเมนู
  static async checkMenuAccess(menuId: string, userId: string, permission: 'canViews' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canAdvance'): Promise<boolean> {
    const menu = await prisma.menuWebDB.findFirst({
      where: {
        id: menuId,
        
      }
    })

    if (!menu) return false

    // ตรวจสอบ permission พื้นฐานของเมนู
    return menu[permission] || false
  }
}

export default MenuWebModel 
