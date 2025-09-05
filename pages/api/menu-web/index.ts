import { NextApiRequest, NextApiResponse } from 'next'
import { MenuWebDB, Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface MenuWebResponse {
  success: boolean
  head?: any // เพิ่ม head property สำหรับคืนค่า parent menu
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MenuWebResponse>
) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res)
        break
      case 'POST':
        await handlePOST(req, res)
        break
      case 'PUT':
        await handlePUT(req, res)
        break
      case 'DELETE':
        await handleDELETE(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({
          success: false,
          error: `❌ Method ${req.method} not allowed`
        })
        break
    }
  } catch (error) {
    console.error('API Error:', error)

    res.status(500).json({
      success: false,
      error: `❌ ${error instanceof Error ? error.message : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'}`
    })
  }
}
async function updateParentHeadStatus(parentId: string, action: 'add' | 'remove') {
  if (!parentId) return;

  if (action === 'add') {
    // กรณีเพิ่มหรือย้ายเข้ากลุ่มใหม่ → ตั้ง head = true
    await prisma.menuWebDB.update({
      where: { id: parentId },
      data: { head: true },
    });
  }

  if (action === 'remove') {
    // ตรวจสอบว่ามีกี่เมนูย่อยเหลืออยู่
    const remainingChildren = await prisma.menuWebDB.count({
      where: { parentId },
    });

    if (remainingChildren === 0) {
      await prisma.menuWebDB.update({
        where: { id: parentId },
        data: { head: false },
      });
    }
  }
}

// GET: ดึงข้อมูลเมนู
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', pageSize = '10', keyword = '', id, parentId } = req.query;

  // ✅ กรณีส่ง id มา → ดึงรายการเดียว
  if (typeof id === 'string' && id !== '') {
    try {
      const menu = await prisma.menuWebDB.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
          AdminDefaultPermissionDB: true,
        },
      });

      if (!menu) {
        return res.status(404).json({ success: false, error: '❌ ไม่พบเมนูที่ระบุ' });
      }

      // const parent = await prisma.menuWebDB.findUnique({ where: { id: menu.parentId } });
      return res.status(200).json({ success: true, data: menu, });


    } catch (error) {
      console.error('Error fetching single MenuWebDB:', error);
      return res.status(500).json({
        success: false,
        error: '❌ เกิดข้อผิดพลาดในการดึงเมนูเดี่ยว'
      });
    }
  }

  // ✅ ถ้าไม่มี id → ทำงานปกติแบบ list
  const pageNum = parseInt(page as string, 10) || 1;
  const pageSizeNum = parseInt(pageSize as string, 10) || 10;
  const skip = (pageNum - 1) * pageSizeNum;
  let menuHead: any = null;

  try {
    const whereClause: any = {
      
      name: {
        contains: keyword as string,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    if (parentId && parentId !== '') {
      // ✅ มีค่า → ไปดึงข้อมูลเมนูแม่
      menuHead = await prisma.menuWebDB.findUnique({
        where: { id: parentId as string },
      });
      whereClause.parentId = parentId;
    } else {
      // ✅ มี key parentId แต่เป็นค่าว่าง → ให้แสดงเฉพาะเมนูหลัก
      whereClause.parentId = null;
    }

    const [menus, totalMenus] = await Promise.all([
      prisma.menuWebDB.findMany({
        where: whereClause,
        skip,
        take: pageSizeNum,
        orderBy: { showOrder: 'asc' },
        include: {
          parent: true,
          children: true,
          AdminDefaultPermissionDB: true,
        },
      }),
      prisma.menuWebDB.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      head: menuHead,
      data: menus,
      pagination: {
        totalItems: totalMenus,
        totalPages: Math.ceil(totalMenus / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
    });
  } catch (error) {
    console.error('Error fetching MenuWebDB:', error);
    res.status(500).json({
      success: false,
      error: '❌ Error fetching menu data'
    });
  }
}

// POST: สร้างเมนูใหม่
async function handlePOST(req: NextApiRequest, res: NextApiResponse<MenuWebResponse>) {
  console.log('Received data:', req.body);

  const {
    name, description, isVisible, showOrder,
    link, icon, manager, head, parentId,
    canAdvance, canViews, canCreate, canUpdate, canDelete,
    createdBy
  } = req.body;

  console.log('Parsed data:', {
    name, description, isVisible, showOrder,
    link, icon, manager, head, parentId,
    canAdvance, canViews, canCreate, canUpdate, canDelete,
    createdBy
  });

  // ✅ 1. ตรวจสอบค่าว่างและประเภทข้อมูลเบื้องต้น
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, error: '⚠️ กรุณาระบุชื่อเมนู' });
  }

  if (!link || typeof link !== 'string' || link.trim() === '') {
    return res.status(400).json({ success: false, error: '⚠️ กรุณาระบุลิงก์เมนู' });
  }

  if (!createdBy || typeof createdBy !== 'string' || createdBy.trim() === '') {
    return res.status(400).json({ success: false, error: '⚠️ กรุณาระบุผู้สร้าง' });
  }

  console.log('Validation passed');

  // ✅ 2. ตรวจสอบชื่อเมนูซ้ำ (ทุกระดับ)
  const existingMenuByName = await prisma.menuWebDB.findFirst({
    where: {
      name: name.trim(),
      
    }
  });

  if (existingMenuByName) {
    return res.status(400).json({
      success: false,
      error: '⚠️ ชื่อเมนูนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น'
    });
  }

  // ✅ 3. ตรวจสอบ `link + parentId` ซ้ำ — ห้ามซ้ำกันทั้งคู่
  const duplicateLinkAndParent = await prisma.menuWebDB.findFirst({
    where: {
      link: link.trim(),
      parentId: parentId || null,
      
    }
  });

  if (duplicateLinkAndParent) {
    return res.status(400).json({
      success: false,
      error: '⚠️ มีเมนูที่ใช้ลิงก์นี้ร่วมกับกลุ่มเมนูนี้อยู่แล้ว กรุณาเปลี่ยนลิงก์หรือเปลี่ยนกลุ่มเมนู'
    });
  }

  // ✅ 4. กำหนดลำดับการแสดง (showOrder) ให้เป็นลำดับล่าสุดในกลุ่มตัวเอง
  let nextShowOrder = showOrder;
  if (typeof nextShowOrder !== 'number' || nextShowOrder <= 0) {
    // หาลำดับสูงสุดในกลุ่มเดียวกัน (ทั้งกลุ่มไม่มีแม่และกลุ่มแม่คนเดียวกัน)
    const whereCondition = parentId && typeof parentId === 'string' 
      ? { parentId: parentId,  } // กลุ่มแม่คนเดียวกัน
      : { parentId: null,  };   // กลุ่มไม่มีแม่

    const lastMenu = await prisma.menuWebDB.findFirst({
      where: whereCondition,
      orderBy: { showOrder: 'desc' }
    });
    
    nextShowOrder = lastMenu ? lastMenu.showOrder + 1 : 1;
    
    console.log(`📋 กำหนด showOrder สำหรับกลุ่ม ${parentId ? `แม่: ${parentId}` : 'ไม่มีแม่'}: ${nextShowOrder}`);
  }

  // ✅ 5. เตรียมข้อมูลเพื่อบันทึกลงฐานข้อมูล
  const menuData = {
    name: name.trim(),
    description: description ? description.trim() : null,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
    showOrder: nextShowOrder,
    link: link.trim(),
    icon: icon ? icon.trim() : null,
    manager: Array.isArray(manager) ? manager : [],
    head: typeof head === 'boolean' ? head : false,
    parentId: parentId && typeof parentId === 'string' ? parentId : null,
    canAdvance: typeof canAdvance === 'boolean' ? canAdvance : false,
    canViews: typeof canViews === 'boolean' ? canViews : true,
    canCreate: typeof canCreate === 'boolean' ? canCreate : false,
    canUpdate: typeof canUpdate === 'boolean' ? canUpdate : false,
    canDelete: typeof canDelete === 'boolean' ? canDelete : false,
    createdBy: createdBy.trim(),
    updatedBy: createdBy.trim()
  };

  // ✅ 6. บันทึกลงฐานข้อมูล
  try {
    const newMenu = await prisma.menuWebDB.create({
      data: menuData
    });

    if (menuData.parentId) {
      await updateParentHeadStatus(menuData.parentId, 'add');
    }

    console.log('Menu created successfully:', newMenu);

    return res.status(201).json({
      success: true,
      data: newMenu,
      message: '✅ สร้างเมนูใหม่สำเร็จ'
    });
  } catch (error) {
    console.error('❌ Error creating menu:', error);
    return res.status(500).json({
      success: false,
      error: '❌ เกิดข้อผิดพลาดในการสร้างเมนู'
    });
  }
}

// PUT: อัปเดตเมนู
async function handlePUT(req: NextApiRequest, res: NextApiResponse<MenuWebResponse>) {
  const {
    id,
    name,
    description,
    isVisible,
    showOrder,
    link,
    icon,
    manager,
    head,
    parentId,
    canAdvance,
    canViews,
    canCreate,
    canUpdate,
    canDelete,
    updatedBy
  } = req.body

  // Validation
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: '⚠️ กรุณาระบุ ID ของเมนู'
    })
  }

  if (!updatedBy || typeof updatedBy !== 'string' || updatedBy.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '⚠️ กรุณาระบุผู้แก้ไข'
    })
  }

  // Check if menu exists
  const existingMenu = await prisma.menuWebDB.findUnique({
    where: { id }
  })

  if (!existingMenu) {
    return res.status(404).json({
      success: false,
      error: '❌ ไม่พบเมนูที่ระบุ'
    })
  }

  // Prepare update data
  const updateData: any = {
    updatedBy: updatedBy.trim(),
    updatedAt: new Date()
  }

  if (name !== undefined) updateData.name = typeof name === 'string' ? name.trim() : existingMenu.name
  if (description !== undefined) updateData.description = typeof description === 'string' ? description.trim() : null
  if (isVisible !== undefined) updateData.isVisible = typeof isVisible === 'boolean' ? isVisible : existingMenu.isVisible
  if (showOrder !== undefined) updateData.showOrder = typeof showOrder === 'number' ? showOrder : existingMenu.showOrder
  if (link !== undefined) updateData.link = typeof link === 'string' ? link.trim() : existingMenu.link
  if (icon !== undefined) updateData.icon = typeof icon === 'string' ? icon.trim() : null
  if (manager !== undefined) updateData.manager = Array.isArray(manager) ? manager : existingMenu.manager
  if (head !== undefined) updateData.head = typeof head === 'boolean' ? head : existingMenu.head
  if (parentId !== undefined) updateData.parentId = typeof parentId === 'string' ? parentId : null
  if (canAdvance !== undefined) updateData.canAdvance = typeof canAdvance === 'boolean' ? canAdvance : existingMenu.canAdvance
  if (canViews !== undefined) updateData.canViews = typeof canViews === 'boolean' ? canViews : existingMenu.canViews
  if (canCreate !== undefined) updateData.canCreate = typeof canCreate === 'boolean' ? canCreate : existingMenu.canCreate
  if (canUpdate !== undefined) updateData.canUpdate = typeof canUpdate === 'boolean' ? canUpdate : existingMenu.canUpdate
  if (canDelete !== undefined) updateData.canDelete = typeof canDelete === 'boolean' ? canDelete : existingMenu.canDelete

  const updatedMenu = await prisma.menuWebDB.update({
    where: { id },
    data: updateData
  })
  // หากเปลี่ยน parentId → อัปเดตแม่เดิมให้กลายเป็น head = false (ถ้าไม่มีลูก)
  if (updateData.parentId) {
    await updateParentHeadStatus(updateData.parentId, 'add');
  }

  // หากเปลี่ยน parentId → อัปเดตแม่เดิมให้กลายเป็น head = false (ถ้าไม่มีลูก)
  if (
    existingMenu.parentId &&
    updateData.parentId &&
    existingMenu.parentId !== updateData.parentId
  ) {
    await updateParentHeadStatus(existingMenu.parentId, 'remove');
  }
  res.status(200).json({
    success: true,
    data: updatedMenu,
    message: '✅ อัปเดตเมนูสำเร็จ'
  })
}

// DELETE: ลบเมนู (hard delete)
async function handleDELETE(req: NextApiRequest, res: NextApiResponse<MenuWebResponse>) {
  const { id, deleteBy } = req.body
  console.log("🚀 ~ handleDELETE ~ id:", id)

  // Validation
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: '⚠️ กรุณาระบุ ID ของเมนู'
    })
  }
  console.log(400, " 🚀 ~ handleDELETE ~ id:", id)
  if (!deleteBy || typeof deleteBy !== 'string' || deleteBy.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '⚠️ กรุณาระบุผู้ลบ'
    })
  }

  // Check if menu has children
  const children = await prisma.menuWebDB.findMany({
    where: { parentId: id }
  })

  if (children.length > 0) {
    console.log(413, " 🚀 ~ handleDELETE ~ children:", children)
    for (const child of children) {
      await prisma.menuWebDB.delete({
        where: { id: child.id }
      })
    }
  }

  // Check if menu exists
  const existingMenu = await prisma.menuWebDB.findUnique({
    where: { id }
  })

  if (!existingMenu) {
    return res.status(404).json({
      success: false,
      error: '❌ ไม่พบเมนูที่ระบุ'
    })
  }



  // Hard delete
  const deletedMenu = await prisma.menuWebDB.delete({
    where: { id }
  })

  if (existingMenu.parentId) {
    await updateParentHeadStatus(existingMenu.parentId, 'remove');
  }

  res.status(200).json({
    success: true,
    data: deletedMenu,
    message: '✅ ลบเมนูสำเร็จ'
  })
} 
