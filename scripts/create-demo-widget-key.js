/**
 * Create Demo Widget Key
 * สร้าง Widget Key สำหรับ demo
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDemoWidgetKey() {
  try {
    // Find first admin user
    const admin = await prisma.adminDB.findFirst({
      where: { isActive: true }
    })

    if (!admin) {
      console.error('No active admin found. Please create an admin user first.')
      process.exit(1)
    }

    // Create demo widget key
    const widgetKey = await prisma.chatWidgetKeyDB.create({
      data: {
        name: 'Demo Widget Key',
        key: 'wk_1736688000000_demo123',
        domain: 'localhost:3000',
        description: 'Widget key สำหรับ demo และการทดสอบ',
        isActive: true,
        settings: {
          primaryColor: '#3B82F6',
          accentColor: '#10B981',
          headerTitle: 'Chat with us',
          headerSubtitle: "We're here to help",
          welcomeMessage: 'Hello! How can we help you today?',
          placeholderText: 'Type a message...',
          position: 'bottom-right',
          autoOpen: false,
          showAgentAvatar: true,
          showTimestamp: true,
          enableFileUpload: true,
          enableEmoji: true
        },
        createdBy: admin.id
      }
    })

    console.log('✅ Demo Widget Key created successfully!')
    console.log(`Key: ${widgetKey.key}`)
    console.log(`Domain: ${widgetKey.domain}`)
    console.log(`Name: ${widgetKey.name}`)
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Demo Widget Key already exists')
    } else {
      console.error('❌ Error creating demo widget key:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createDemoWidgetKey()
