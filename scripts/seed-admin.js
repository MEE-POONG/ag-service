const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config({ quiet: true })

const prisma = new PrismaClient()

const ADMINS_TO_SEED = [
  {
    username: 'superadmin',
    password: 'Admin@5678',
    name: 'Administrator 01',
    email: 'ufa66.oa14@gmail.com',
    tel: '0800000002',
    isActive: true,
    position: {
      name: 'Super Admin',
      priority: 1,
      department: {
        name: 'IT Department',
        description: 'แผนกเทคโนโลยีสารสนเทศ',
      },
    },
  },
]

async function seedAdmins() {
  console.log('Starting admin user seeding...')

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Check your .env file before running this seed.')
  }

  // Check if there is an existing WebBaseDB to link
  let webBaseId = null
  try {
    const firstWeb = await prisma.webBaseDB.findFirst()
    if (firstWeb) {
      webBaseId = firstWeb.id
      console.log(`Found WebBaseDB: "${firstWeb.name}", will link admin to it.`)
    }
  } catch (e) {
    console.warn('Warning checking WebBaseDB:', e.message)
  }

  for (const adminData of ADMINS_TO_SEED) {
    console.log(`Processing admin: ${adminData.username}...`)

    // 1. Department
    const deptData = adminData.position.department
    const department = await prisma.adminDepartmentDB.upsert({
      where: { name: deptData.name },
      update: {
        description: deptData.description,
        isActive: true,
        isDeleted: false,
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
    const position = await prisma.adminPositionDB.upsert({
      where: {
        adminDepartmentId_name: {
          adminDepartmentId: department.id,
          name: adminData.position.name,
        },
      },
      update: {
        priority: adminData.position.priority,
        isActive: true,
        isDeleted: false,
        updatedBy: 'system',
        updatedAt: new Date()
      },
      create: {
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
    console.log(`  - Position: "${position.name}" ready (ID: ${position.id})`)

    const duplicatedEmail = await prisma.adminDB.findFirst({
      where: {
        email: adminData.email,
        username: { not: adminData.username },
      },
      select: { username: true, email: true },
    })

    if (duplicatedEmail) {
      throw new Error(
        `Cannot seed "${adminData.username}" because email "${adminData.email}" is already used by "${duplicatedEmail.username}".`
      )
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    // 4. Admin
    const existingAdmin = await prisma.adminDB.findUnique({
      where: { username: adminData.username },
      select: { email: true },
    })
    const emailChanged = Boolean(
      existingAdmin && existingAdmin.email.toLowerCase() !== adminData.email.toLowerCase()
    )
    const admin = await prisma.adminDB.upsert({
      where: { username: adminData.username },
      update: {
        password: hashedPassword,
        name: adminData.name,
        email: adminData.email,
        tel: adminData.tel,
        adminPositionId: position.id,
        webBaseId: webBaseId,
        isActive: adminData.isActive,
        ...(emailChanged
          ? { emailVerifiedAt: null, tokenVersion: { increment: 1 } }
          : {}),
        updatedBy: 'system',
        updatedAt: new Date()
      },
      create: {
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

    const savedAdmin = await prisma.adminDB.findUnique({
      where: { username: adminData.username },
      include: {
        adminPosition: {
          include: { adminDepartment: true },
        },
        webBase: true,
      },
    })

    if (!savedAdmin) {
      throw new Error(`Admin "${adminData.username}" was not found after seed.`)
    }

    const passwordMatches = await bcrypt.compare(adminData.password, savedAdmin.password)
    if (!passwordMatches) {
      throw new Error(`Password verification failed after seeding "${adminData.username}".`)
    }

    console.log(
      `  - Admin: "${admin.username}" saved (ID: ${admin.id}, department: ${savedAdmin.adminPosition.adminDepartment.name}, position: ${savedAdmin.adminPosition.name})`
    )
  }

  console.log('Seeding admin users completed successfully!')
}

seedAdmins()
  .catch((error) => {
    console.error('Error during admin seeding:')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
