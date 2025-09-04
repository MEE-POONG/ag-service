import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มต้นสร้างข้อมูล...')

  // สร้างแผนกเริ่มต้น
  // const itDepartment = await prisma.adminDepartmentDB.upsert({
  //   where: { name: 'IT Department' },
  //   update: {},
  //   create: {
  //     name: 'IT Department',
  //     description: 'แผนกเทคโนโลยีสารสนเทศ',
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // const hrDepartment = await prisma.adminDepartmentDB.upsert({
  //   where: { name: 'HR Department' },
  //   update: {},
  //   create: {
  //     name: 'HR Department',
  //     description: 'แผนกทรัพยากรบุคคล',
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  console.log('✅ สร้างแผนกสำเร็จ')

  // สร้างตำแหน่งเริ่มต้น
  // const superAdminPosition = await prisma.adminPositionDB.upsert({
  //   where: { name: 'Super Admin' },
  //   update: {},
  //   create: {
  //     name: 'Super Admin',
  //     description: 'ผู้ดูแลระบบสูงสุด',
  //     priority: 1,
  //     adminDepartmentId: itDepartment.id,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // const adminPosition = await prisma.adminPositionDB.upsert({
  //   where: { name: 'Admin' },
  //   update: {},
  //   create: {
  //     name: 'Admin',
  //     description: 'ผู้ดูแลระบบ',
  //     priority: 2,
  //     adminDepartmentId: itDepartment.id,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // const managerPosition = await prisma.adminPositionDB.upsert({
  //   where: { name: 'Manager' },
  //   update: {},
  //   create: {
  //     name: 'Manager',
  //     description: 'ผู้จัดการ',
  //     priority: 3,
  //     adminDepartmentId: hrDepartment.id,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  console.log('✅ สร้างตำแหน่งสำเร็จ')

  // สร้างเมนูเริ่มต้น
  // const dashboardMenu = await prisma.menuWebDB.upsert({
  //   where: { name: 'dashboard' },
  //   update: {},
  //   create: {
  //     name: 'dashboard',
  //     description: 'หน้าแดชบอร์ด',
  //     link: '',
  //     icon: 'home',
  //     showOrder: 1,
  //     head: false,
  //     canAdvance: true,
  //     canViews: true,
  //     canCreate: false,
  //     canUpdate: false,
  //     canDelete: false,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // const usersMenu = await prisma.menuWebDB.upsert({
  //   where: { name: 'users' },
  //   update: {},
  //   create: {
  //     name: 'users',
  //     description: 'จัดการผู้ใช้',
  //     link: '/admin/users',
  //     icon: 'users',
  //     showOrder: 2,
  //     head: false,
  //     canAdvance: true,
  //     canViews: true,
  //     canCreate: true,
  //     canUpdate: true,
  //     canDelete: true,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // const adminsMenu = await prisma.menuWebDB.upsert({
  //   where: { name: 'admins' },
  //   update: {},
  //   create: {
  //     name: 'admins',
  //     description: 'จัดการผู้ดูแลระบบ',
  //     link: '/admin/admins',
  //     icon: 'shield',
  //     showOrder: 3,
  //     head: false,
  //     canAdvance: true,
  //     canViews: true,
  //     canCreate: true,
  //     canUpdate: true,
  //     canDelete: true,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // const permissionsMenu = await prisma.menuWebDB.upsert({
  //   where: { name: 'permissions' },
  //   update: {},
  //   create: {
  //     name: 'permissions',
  //     description: 'จัดการสิทธิ์',
  //     link: '/admin/permissions',
  //     icon: 'lock',
  //     showOrder: 4,
  //     head: false,
  //     canAdvance: true,
  //     canViews: true,
  //     canCreate: true,
  //     canUpdate: true,
  //     canDelete: true,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // console.log('✅ สร้างเมนูสำเร็จ')

  // สร้างสิทธิ์เริ่มต้น
  // const superAdminPermissions = [
  //   { menuPageId: dashboardMenu.id, canAdvance: true, canViews: true, canCreate: true, canUpdate: true, canDelete: true },
  //   { menuPageId: usersMenu.id, canAdvance: true, canViews: true, canCreate: true, canUpdate: true, canDelete: true },
  //   { menuPageId: adminsMenu.id, canAdvance: true, canViews: true, canCreate: true, canUpdate: true, canDelete: true },
  //   { menuPageId: permissionsMenu.id, canAdvance: true, canViews: true, canCreate: true, canUpdate: true, canDelete: true },
  // ]

  // for (const permission of superAdminPermissions) {
  //   await prisma.adminDefaultPermissionDB.upsert({
  //     where: {
  //       adminPositionDBId_menuPageWebId: {
  //         adminPositionDBId: superAdminPosition.id,
  //         menuPageWebId: permission.menuPageId,
  //       },
  //     },
  //     update: {
  //       canAdvance: permission.canAdvance,
  //       canViews: permission.canViews,
  //       canCreate: permission.canCreate,
  //       canUpdate: permission.canUpdate,
  //       canDelete: permission.canDelete,
  //       updatedBy: 'system',
  //     },
  //     create: {
  //       adminPositionDBId: superAdminPosition.id,
  //       menuPageWebId: permission.menuPageId,
  //       canAdvance: permission.canAdvance,
  //       canViews: permission.canViews,
  //       canCreate: permission.canCreate,
  //       canUpdate: permission.canUpdate,
  //       canDelete: permission.canDelete,
  //       createdBy: 'system',
  //       updatedBy: 'system',
  //     },
  //   })
  // }

  // const adminPermissions = [
  //   { menuPageId: dashboardMenu.id, canAdvance: true, canViews: true, canCreate: false, canUpdate: false, canDelete: false },
  //   { menuPageId: usersMenu.id, canAdvance: true, canViews: true, canCreate: true, canUpdate: true, canDelete: false },
  //   { menuPageId: adminsMenu.id, canAdvance: false, canViews: true, canCreate: false, canUpdate: false, canDelete: false },
  //   { menuPageId: permissionsMenu.id, canAdvance: false, canViews: true, canCreate: false, canUpdate: false, canDelete: false },
  // ]

  // for (const permission of adminPermissions) {
  //   await prisma.adminDefaultPermissionDB.upsert({
  //     where: {
  //       adminPositionDBId_menuPageWebId: {
  //         adminPositionDBId: adminPosition.id,
  //         menuPageWebId: permission.menuPageId,
  //       },
  //     },
  //     update: {
  //       canAdvance: permission.canAdvance,
  //       canViews: permission.canViews,
  //       canCreate: permission.canCreate,
  //       canUpdate: permission.canUpdate,
  //       canDelete: permission.canDelete,
  //       updatedBy: 'system',
  //     },
  //     create: {
  //       adminPositionDBId: adminPosition.id,
  //       menuPageWebId: permission.menuPageId,
  //       canAdvance: permission.canAdvance,
  //       canViews: permission.canViews,
  //       canCreate: permission.canCreate,
  //       canUpdate: permission.canUpdate,
  //       canDelete: permission.canDelete,
  //       createdBy: 'system',
  //       updatedBy: 'system',
  //     },
  //   })
  // }

  console.log('✅ สร้างสิทธิ์เริ่มต้นสำเร็จ')

  // สร้างฐานข้อมูลเว็บเริ่มต้น
  // const webBase = await prisma.webBaseDB.upsert({
  //   where: { name: 'AG Main Database' },
  //   update: {},
  //   create: {
  //     name: 'AG Main Database',
  //     passS: 'superadmin123',
  //     passM: 'manager123',
  //     passA: 'admin123',
  //     otpS: '123456',
  //     otpM: '123456',
  //     otpA: '123456',
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  console.log('✅ สร้างฐานข้อมูลเว็บสำเร็จ')

  // สร้างผู้ดูแลระบบเริ่มต้น
  // const hashedPassword = await bcrypt.hash('admin123', 12)

  // สร้าง superadmin
  // const superAdmin = await prisma.adminDB.upsert({
  //   where: { username: 'superadmin' },
  //   update: {},
  //   create: {
  //     username: 'superadmin',
  //     password: hashedPassword,
  //     name: 'Super Administrator',
  //     email: 'superadmin@ag-db.com',
  //     tel: '0812345678',
  //     adminPositionId: superAdminPosition.id,
  //     webBaseId: webBase.id,
  //     isActive: true,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  // สร้าง admin ปกติ
  // const admin = await prisma.adminDB.upsert({
  //   where: { username: 'admin' },
  //   update: {},
  //   create: {
  //     username: 'admin',
  //     password: hashedPassword,
  //     name: 'Administrator',
  //     email: 'admin@ag-db.com',
  //     tel: '0812345679',
  //     adminPositionId: adminPosition.id,
  //     webBaseId: webBase.id,
  //     isActive: true,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  console.log('✅ สร้างผู้ดูแลระบบสำเร็จ')

  // สร้างผู้ใช้เริ่มต้น
  // const user = await prisma.userDB.upsert({
  //   where: { username: 'user' },
  //   update: {},
  //   create: {
  //     username: 'user',
  //     password: hashedPassword,
  //     firstname: 'User',
  //     lastname: 'Test',
  //     email: 'user@ag-db.com',
  //     tel: '0812345680',
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  console.log('✅ สร้างผู้ใช้สำเร็จ')

  // สร้างผู้ใช้ AG เริ่มต้น
  // const agUser = await prisma.aGUserDB.upsert({
  //   where: { userAg: 'AG001' },
  //   update: {},
  //   create: {
  //     userAg: 'AG001',
  //     userLogin: 'aguser',
  //     password: hashedPassword,
  //     adviser: 'Adviser 1',
  //     webBaseId: webBase.id,
  //     createdBy: 'system',
  //     updatedBy: 'system',
  //   },
  // })

  console.log('✅ สร้างผู้ใช้ AG สำเร็จ')

  // ข้อมูลเมนูหลัก
  const menuItems = [
    {
      name: 'Dashboard',
      description: 'หน้าแรกและสรุปข้อมูลของระบบ',
      link: '',
      icon: 'dashboard',
      showOrder: 1,
      head: false,
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'User Management',
      description: 'จัดการผู้ใช้งานระบบ',
      link: '/users',
      icon: 'users',
      showOrder: 2,
      head: true,
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Admin Management',
      description: 'จัดการผู้ดูแลระบบ',
      link: '/admin',
      icon: 'shield',
      showOrder: 3,
      head: true,
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Reports',
      description: 'รายงานและสถิติ',
      link: '/reports',
      icon: 'chart',
      showOrder: 4,
      head: true,
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Settings',
      description: 'ตั้งค่าระบบ',
      link: '/setting',
      icon: 'settings',
      showOrder: 5,
      head: true,
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    }
  ];

  // สร้างเมนูหลัก
  const createdMenus = [];
  // for (const item of menuItems) {
  //   const menu = await prisma.menuWebDB.upsert({
  //     where: { name: item.name },
  //     update: item,
  //     create: item
  //   });
  //   createdMenus.push(menu);
  // }

  // ข้อมูลเมนูย่อย
  const subMenuItems = [
    // User Management Sub-menus
    {
      name: 'User List',
      description: 'รายชื่อผู้ใช้งาน',
      link: '/users/list',
      icon: 'list',
      showOrder: 1,
      head: false,
      parentName: 'User Management',
      manager: ['create', 'update', 'delete'],
      canViews: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'User Profile',
      description: 'ข้อมูลส่วนตัวผู้ใช้',
      link: '/users/profile',
      icon: 'user',
      showOrder: 2,
      head: false,
      parentName: 'User Management',
      manager: ['update'],
      canViews: true,
      canUpdate: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    // Admin Management Sub-menus
    {
      name: 'Administrators',
      description: 'จัดการผู้ดูแลระบบ',
      link: '/admin/admins',
      icon: 'userShield',
      showOrder: 1,
      head: false,
      parentName: 'Admin Management',
      manager: ['create', 'update', 'delete'],
      canViews: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Departments',
      description: 'จัดการแผนก',
      link: '/admin/departments',
      icon: 'building',
      showOrder: 2,
      head: false,
      parentName: 'Admin Management',
      manager: ['create', 'update', 'delete'],
      canViews: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Positions',
      description: 'จัดการตำแหน่ง',
      link: '/admin/positions',
      icon: 'briefcase',
      showOrder: 3,
      head: false,
      parentName: 'Admin Management',
      manager: ['create', 'update', 'delete'],
      canViews: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Permissions',
      description: 'จัดการสิทธิ์การเข้าถึง',
      link: '/admin/permissions',
      icon: 'key',
      showOrder: 4,
      head: false,
      parentName: 'Admin Management',
      manager: ['create', 'update', 'delete'],
      canViews: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    // Reports Sub-menus
    {
      name: 'User Reports',
      description: 'รายงานผู้ใช้งาน',
      link: '/reports/users',
      icon: 'fileText',
      showOrder: 1,
      head: false,
      parentName: 'Reports',
      manager: ['export'],
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'System Reports',
      description: 'รายงานระบบ',
      link: '/reports/system',
      icon: 'barChart',
      showOrder: 2,
      head: false,
      parentName: 'Reports',
      manager: ['export'],
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Activity Logs',
      description: 'บันทึกกิจกรรม',
      link: '/reports/logs',
      icon: 'activity',
      showOrder: 3,
      head: false,
      parentName: 'Reports',
      manager: ['export'],
      canViews: true,
      canAdvance: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    // Settings Sub-menus
    {
      name: 'System Settings',
      description: 'ตั้งค่าระบบทั่วไป',
      link: '/setting/system',
      icon: 'cog',
      showOrder: 1,
      head: false,
      parentName: 'Settings',
      manager: ['update'],
      canViews: true,
      canUpdate: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Database Settings',
      description: 'ตั้งค่าฐานข้อมูล',
      link: '/setting/database',
      icon: 'database',
      showOrder: 2,
      head: false,
      parentName: 'Settings',
      manager: ['update'],
      canViews: true,
      canUpdate: true,
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      name: 'Security Settings',
      description: 'ตั้งค่าความปลอดภัย',
      link: '/setting/security',
      icon: 'lock',
      showOrder: 3,
      head: false,
      parentName: 'Settings',
      manager: ['update'],
      canViews: true,
      canUpdate: true,
      createdBy: 'system',
      updatedBy: 'system'
    }
  ];

  // สร้างเมนูย่อย
  // for (const subItem of subMenuItems) {
  //   const parent = createdMenus.find(m => m.name === subItem.parentName);
  //   if (parent) {
  //     const { parentName, ...itemData } = subItem;
  //     await prisma.menuWebDB.upsert({
  //       where: { name: itemData.name },
  //       update: {
  //         ...itemData,
  //         parentId: parent.id
  //       },
  //       create: {
  //         ...itemData,
  //         parentId: parent.id
  //       }
  //     });
  //   }
  // }

  console.log('✅ Seed data created successfully for MenuWebDB');
  console.log('📋 Created menu items:');
  console.log('  - Dashboard (no sub-items)');
  console.log('  - User Management (2 sub-items)');
  console.log('  - Admin Management (4 sub-items)');
  console.log('  - Reports (3 sub-items)');
  console.log('  - Settings (3 sub-items)');
  console.log('🎯 Total: 5 main menus + 12 sub-menus = 17 menu items');

  console.log('🎉 สร้างข้อมูลเริ่มต้นเสร็จสิ้น!')
  console.log('')
  console.log('📋 ข้อมูลการเข้าสู่ระบบ:')
  console.log('Super Admin: superadmin / admin123')
  console.log('Admin: admin / admin123')
  console.log('User: user / admin123')
  console.log('AG User: aguser / admin123')
}

/*
  การอัปเดต AdminDB ด้วยฟิลด์ profile ใหม่
  
  1. รันคำสั่ง: npx prisma db push
  2. รันคำสั่ง: npx prisma generate
  3. ตัวอย่างข้อมูล profile:
  
  {
    "avatar": "/uploads/default-avatar.png",
    "bio": "ผู้ดูแลระบบ AG-DB Portal", 
    "skills": ["Database Management", "System Administration"],
    "department": "IT Department",
    "joiningDate": "2024-01-01",
    "preferences": {
      "theme": "light",
      "language": "th", 
      "notifications": true
    }
  }
*/

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
