const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const ADMINS_TO_SEED = [
  {
    username: 'superadmin',
    password: 'Admin@5678',
    name: 'Administrator 01',
    email: 'admin01@ag-service.com',
    tel: '0800000002',
    isActive: true,
    position: {
      name: 'Admin',
      priority: 2,
      department: {
        name: 'IT Department',
        description: 'แผนกเทคโนโลยีสารสนเทศ',
      },
    },
  },
]

async function seedAdmins() {
  try {
    console.log('🌱 Starting admin user seeding...')

    // Check if there is an existing WebBaseDB to link
    let webBaseId = null
    try {
      const firstWeb = await prisma.webBaseDB.findFirst()
      if (firstWeb) {
        webBaseId = firstWeb.id
        console.log(`ℹ️ Found WebBaseDB: "${firstWeb.name}", will link admin to it.`)
      }
    } catch (e) {
      console.warn('⚠️ Warning checking WebBaseDB:', e.message)
    }

    for (const adminData of ADMINS_TO_SEED) {
      console.log(`Processing admin: ${adminData.username}...`)

      // 1. Department
      const deptData = adminData.position.department
      const department = await prisma.adminDepartmentDB.upsert({
        where: { name: deptData.name },
        update: {
          description: deptData.description,
          updatedBy: 'system',
          updatedAt: new Date()
        },
        create: {
          name: deptData.name,
          description: deptData.description,
          isActive: true,
          isDeleted: false,
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`  - Department: "${department.name}" (ID: ${department.id})`)

      // 2. Position
      let position = await prisma.adminPositionDB.findFirst({
        where: {
          name: adminData.position.name,
          adminDepartmentId: department.id
        }
      })

      if (position) {
        position = await prisma.adminPositionDB.update({
          where: { id: position.id },
          data: {
            priority: adminData.position.priority,
            updatedBy: 'system',
            updatedAt: new Date()
          }
        })
        console.log(`  - Position: "${position.name}" updated (ID: ${position.id})`)
      } else {
        position = await prisma.adminPositionDB.create({
          data: {
            name: adminData.position.name,
            priority: adminData.position.priority,
            adminDepartmentId: department.id,
            isActive: true,
            isDeleted: false,
            createdBy: 'system',
            updatedBy: 'system',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`  - Position: "${position.name}" created (ID: ${position.id})`)
      }

      // 3. Hash Password
      const hashedPassword = await bcrypt.hash(adminData.password, 12)

      // 4. Admin
      const existingAdmin = await prisma.adminDB.findUnique({
        where: { username: adminData.username }
      })

      if (existingAdmin) {
        const updatedAdmin = await prisma.adminDB.update({
          where: { username: adminData.username },
          data: {
            password: hashedPassword,
            name: adminData.name,
            email: adminData.email,
            tel: adminData.tel,
            adminPositionId: position.id,
            webBaseId: webBaseId,
            isActive: adminData.isActive,
            updatedBy: 'system',
            updatedAt: new Date()
          }
        })
        console.log(`  - Admin: "${updatedAdmin.username}" updated (ID: ${updatedAdmin.id})`)
      } else {
        const newAdmin = await prisma.adminDB.create({
          data: {
            username: adminData.username,
            password: hashedPassword,
            name: adminData.name,
            email: adminData.email,
            tel: adminData.tel,
            adminPositionId: position.id,
            webBaseId: webBaseId,
            isActive: adminData.isActive,
            createdBy: 'system',
            updatedBy: 'system',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`  - Admin: "${newAdmin.username}" created (ID: ${newAdmin.id})`)
      }
    }

    console.log('🎉 Seeding admin users completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmins()
