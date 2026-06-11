const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const menuItems = [
  // เมนูหลัก - ระดับบนสุด
  {
    id: "dashboard",
    name: "หน้าหลัก",
    description: "หน้าหลัก",
    isVisible: true,
    showOrder: 1,
    head: true,
    link: "",
    icon: "FaHome",
    manager: [],
    parentId: null,
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "reports",
    name: "รายงาน",
    description: "รายงานและสถิติการใช้งานระบบ",
    isVisible: true,
    showOrder: 2,
    head: true,
    link: "/reports",
    icon: "FaChartBar",
    manager: [],
    parentId: null,
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  // เมนูย่อยของ reports
  {
    id: "documents",
    name: "จัดการเอกสาร",
    description: "จัดการและอัปโหลดเอกสารต่างๆ",
    isVisible: true,
    showOrder: 1,
    head: false,
    link: "/reports/documents",
    icon: "FaFileAlt",
    manager: ["/create", "/edit", "/delete"],
    parentId: "reports",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "bot-management",
    name: "จัดการบอท",
    description: "จัดการบอท",
    isVisible: true,
    showOrder: 2,
    head: false,
    link: "/reports/bot-management",
    icon: "FaRobot",
    manager: ["/create", "/edit", "/delete"],
    parentId: "reports",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  // เมนูพันธมิตร
  {
    id: "partner",
    name: "พันธมิตร",
    description: "จัดการข้อมูลพันธมิตรและสมาชิก",
    isVisible: true,
    showOrder: 3,
    head: true,
    link: "/partner",
    icon: "FaHandshake",
    manager: [],
    parentId: null,
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "ag-user",
    name: "AG User",
    description: "จัดการข้อมูล AG User",
    isVisible: true,
    showOrder: 1,
    head: false,
    link: "/partner/ag-user",
    icon: "FaUser",
    manager: ["/create", "/edit", "/delete"],
    parentId: "partner",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "members",
    name: "สมาชิก",
    description: "จัดการข้อมูลสมาชิก",
    isVisible: true,
    showOrder: 2,
    head: false,
    link: "/partner/members",
    icon: "FaUsers",
    manager: ["/create", "/edit", "/delete"],
    parentId: "partner",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  // เมนูจัดการผู้ดูแล
  {
    id: "admin-management",
    name: "จัดการผู้ดูแล",
    description: "จัดการข้อมูลผู้ดูแลระบบและแผนกงาน",
    isVisible: true,
    showOrder: 4,
    head: true,
    link: "/admin-management",
    icon: "FaUserShield",
    manager: [],
    parentId: null,
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "admin-admins",
    name: "ผู้ดูแล",
    description: "จัดการข้อมูลผู้ดูแลระบบ",
    isVisible: true,
    showOrder: 1,
    head: false,
    link: "/admin-management/admins",
    icon: "FaUserCog",
    manager: ["/add", "/edit", "/delete"],
    parentId: "admin-management",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "admin-departments",
    name: "แผนกงาน",
    description: "จัดการข้อมูลแผนกงาน",
    isVisible: true,
    showOrder: 2,
    head: false,
    link: "/admin-management/departments",
    icon: "FaBuilding",
    manager: ["/create", "/edit", "/delete"],
    parentId: "admin-management",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  // เมนูระบบผู้ดูแล
  {
    id: "admin",
    name: "ระบบผู้ดูแล",
    description: "ระบบจัดการผู้ใช้และสิทธิ์",
    isVisible: true,
    showOrder: 5,
    head: true,
    link: "/admin",
    icon: "FaShieldAlt",
    manager: [],
    parentId: null,
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "admin-users",
    name: "จัดการผู้ใช้",
    description: "จัดการข้อมูลผู้ใช้ระบบ",
    isVisible: true,
    showOrder: 1,
    head: false,
    link: "/admin/users",
    icon: "FaUsers",
    manager: ["/create", "/edit", "/delete"],
    parentId: "admin",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "admin-permissions",
    name: "จัดการสิทธิ์",
    description: "จัดการสิทธิ์การเข้าถึงระบบ",
    isVisible: true,
    showOrder: 2,
    head: false,
    link: "/admin/permissions",
    icon: "FaKey",
    manager: ["/create", "/edit", "/delete"],
    parentId: "admin",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "admin-system-departments",
    name: "แผนกระบบ",
    description: "จัดการแผนกระบบ",
    isVisible: true,
    showOrder: 3,
    head: false,
    link: "/admin/departments",
    icon: "FaSitemap",
    manager: ["/create", "/edit", "/delete"],
    parentId: "admin",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  // เมนูตั้งค่า
  {
    id: "setting",
    name: "ตั้งค่า",
    description: "ตั้งค่าข้อมูลภายในเว็บ",
    isVisible: true,
    showOrder: 6,
    head: true,
    link: "/setting",
    icon: "FaCog",
    manager: [],
    parentId: null,
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "setting-index",
    name: "ข้อมูลหน้าเว็บ",
    description: "ตั้งค่าข้อมูลภายในเว็บและหน้าเว็บ",
    isVisible: true,
    showOrder: 1,
    head: false,
    link: "/setting",
    icon: "FaGlobe",
    manager: ["/edit"],
    parentId: "setting",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "web-ag",
    name: "เว็บเกมส์",
    description: "ข้อมูลเว็บเกมส์",
    showOrder: 2,
    isVisible: true,
    head: false,
    link: "/setting/web-ag",
    icon: "FaGamepad",
    manager: ["/create", "/edit", "/delete"],
    parentId: "setting",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  },
  {
    id: "menuweb",
    name: "เมนูเว็บเพจ",
    description: "ข้อมูลเมนูเว็บเพจ",
    isVisible: true,
    showOrder: 3,
    head: false,
    link: "/setting/menuweb",
    icon: "FaList",
    manager: ["/create", "/edit", "/delete"],
    parentId: "setting",
    canAdvance: true,
    canViews: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    createdBy: "system",
    updatedBy: "system",
    deleteBy: null,

  }
]

async function seedMenuItems() {
  try {
    // console.log('🌱 Starting menu items seeding...')

    // Seed new menu items
    const createdItems = []
    for (const item of menuItems) {
      try {
        const existingItem = await prisma.menuWebDB.findUnique({
          where: { id: item.id }
        })

        if (existingItem) {
          // Update existing item
          const updatedItem = await prisma.menuWebDB.update({
            where: { id: item.id },
            data: {
              name: item.name,
              description: item.description,
              isVisible: item.isVisible,
              showOrder: item.showOrder,
              head: item.head,
              link: item.link,
              icon: item.icon,
              manager: item.manager,
              parentId: item.parentId,
              canAdvance: item.canAdvance,
              canViews: item.canViews,
              canCreate: item.canCreate,
              canUpdate: item.canUpdate,
              canDelete: item.canDelete,
              updatedBy: 'system'
            }
          })
          createdItems.push({ action: 'updated', item: updatedItem })
          // console.log(`✅ Updated: ${item.name}`)
        } else {
          // Create new item
          const newItem = await prisma.menuWebDB.create({
            data: {
              id: item.id,
              name: item.name,
              description: item.description,
              isVisible: item.isVisible,
              showOrder: item.showOrder,
              head: item.head,
              link: item.link,
              icon: item.icon,
              manager: item.manager,
              parentId: item.parentId,
              canAdvance: item.canAdvance,
              canViews: item.canViews,
              canCreate: item.canCreate,
              canUpdate: item.canUpdate,
              canDelete: item.canDelete,
              createdBy: 'system',
              updatedBy: 'system'
            }
          })
          createdItems.push({ action: 'created', item: newItem })
          // console.log(`✨ Created: ${item.name}`)
        }
      } catch (itemError) {
        console.error(`❌ Error processing item ${item.id}:`, itemError.message)
        createdItems.push({
          action: 'error',
          itemId: item.id,
          error: itemError.message
        })
      }
    }

    // Get final menu structure
    const finalMenus = await prisma.menuWebDB.findMany({
      orderBy: [
        { showOrder: 'asc' },
        { name: 'asc' }
      ],
      where: {}
    })

    // console.log(`\n🎉 Successfully processed ${menuItems.length} menu items`)
    // console.log(`📊 Total menus in database: ${finalMenus.length}`)

    const summary = createdItems.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1
      return acc
    }, {})

    // console.log('📈 Summary:', summary)

  } catch (error) {
    console.error('❌ Seed error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedMenuItems() 