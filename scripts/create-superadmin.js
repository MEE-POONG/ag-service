const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('🔐 กำลังสร้าง superadmin user...')

    // Check if superadmin already exists
    const existingSuperAdmin = await prisma.adminDB.findFirst({
      where: { username: 'superadmin' }
    })

    if (existingSuperAdmin) {
      console.log('✅ superadmin มีอยู่แล้วในระบบ')
      return
    }

    // Get IT Department and Super Admin Position
    const itDepartment = await prisma.adminDepartmentDB.findFirst({
      where: { name: 'IT Department' }
    })

    const superAdminPosition = await prisma.adminPositionDB.findFirst({
      where: { name: 'Super Admin' }
    })

    const webBase = await prisma.webBaseDB.findFirst({
      where: { name: 'AG Main Database' }
    })

    if (!itDepartment || !superAdminPosition || !webBase) {
      console.log('❌ ต้องรัน seed ฐานข้อมูลก่อน: npx prisma db seed')
      return
    }

    // Create superadmin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.adminDB.create({
      data: {
        username: 'superadmin',
        password: hashedPassword,
        name: 'Super Administrator',
        email: 'superadmin@ag-db.com',
        tel: '0812345678',
        adminPositionId: superAdminPosition.id,
        webBaseId: webBase.id,
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
      },
    })

    console.log('✅ สร้าง superadmin สำเร็จ!')
    console.log('📋 ข้อมูลการเข้าสู่ระบบ:')
    console.log('Username: superadmin')
    console.log('Password: admin123')
    console.log('Email:', superAdmin.email)
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
