# Profile Field Documentation

## 📋 ภาพรวม

ฟิลด์ `profile` ใหม่ใน `AdminDB` เป็น JSON string ที่ใช้เก็บข้อมูลโปรไฟล์เพิ่มเติมของผู้ดูแลระบบ

## 🔄 การอัปเดตฐานข้อมูล

### 1. อัปเดต Database Schema
```bash
npx prisma db push
```

### 2. สร้าง TypeScript Types ใหม่
```bash
npx prisma generate
```

## 📝 โครงสร้างข้อมูล Profile

```typescript
interface ProfileData {
  avatar?: string           // ลิงก์รูปโปรไฟล์
  bio?: string             // คำแนะนำตัว
  skills?: string[]        // ทักษะ
  department?: string      // แผนก
  joiningDate?: string     // วันที่เริ่มงาน
  preferences?: {          // การตั้งค่าส่วนตัว
    theme?: 'light' | 'dark'
    language?: 'th' | 'en'
    notifications?: boolean
  }
  socialMedia?: {          // โซเชียลมีเดีย
    facebook?: string
    line?: string
    email?: string
  }
  workHistory?: Array<{    // ประวัติการทำงาน
    position: string
    startDate: string
    endDate?: string
    description?: string
  }>
}
```

## 💻 การใช้งานใน Code

### อ่านข้อมูล Profile
```typescript
import { AdminDB } from '@prisma/client'

function parseAdminProfile(admin: AdminDB): ProfileData | null {
  if (!admin.profile) return null
  
  try {
    return JSON.parse(admin.profile) as ProfileData
  } catch (error) {
    console.error('Invalid profile JSON:', error)
    return null
  }
}
```

### อัปเดตข้อมูล Profile
```typescript
import { prisma } from '@/lib/prisma'

async function updateAdminProfile(adminId: string, profileData: ProfileData) {
  return await prisma.adminDB.update({
    where: { id: adminId },
    data: {
      profile: JSON.stringify(profileData),
      updatedBy: 'system', // หรือ user id
    }
  })
}
```

## 🎨 การแสดงผลใน UI

### Component ตัวอย่าง
```tsx
import { User } from '@/hooks/useMenuSystem'

interface AdminProfileProps {
  user: User
}

export function AdminProfile({ user }: AdminProfileProps) {
  const profile = user.profile ? JSON.parse(user.profile) : null
  
  return (
    <div className="admin-profile">
      <div className="flex items-center space-x-3">
        <img 
          src={profile?.avatar || '/default-avatar.png'} 
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium">{user.name || user.username}</p>
          <p className="text-sm text-gray-500">
            {profile?.department || user.role}
          </p>
        </div>
      </div>
      
      {profile?.bio && (
        <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>
      )}
      
      {profile?.skills && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">ทักษะ:</p>
          <div className="flex flex-wrap gap-1">
            {profile.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

## 🔧 Migration ข้อมูลเดิม

```typescript
// scripts/migrate-profile.ts
import { prisma } from '@/lib/prisma'

async function migrateExistingAdmins() {
  const admins = await prisma.adminDB.findMany({
    where: {
      OR: [
        { profile: null },
        { profile: '' }
      ]
    }
  })

  for (const admin of admins) {
    const defaultProfile = {
      bio: `ผู้ดูแลระบบ - ${admin.name}`,
      department: 'IT Department',
      joiningDate: admin.createdAt.toISOString().split('T')[0],
      preferences: {
        theme: 'light',
        language: 'th',
        notifications: true
      }
    }

    await prisma.adminDB.update({
      where: { id: admin.id },
      data: {
        profile: JSON.stringify(defaultProfile),
        updatedBy: 'migration-script'
      }
    })
  }

  console.log(`✅ Migrated ${admins.length} admin profiles`)
}
```

## 📚 API Endpoints

### GET /api/admin/profile
```typescript
// pages/api/admin/profile.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const adminId = req.query.id as string
    
    const admin = await prisma.adminDB.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        profile: true
      }
    })
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    
    return res.json({
      ...admin,
      profile: admin.profile ? JSON.parse(admin.profile) : null
    })
  }
}
```

### PUT /api/admin/profile
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { adminId, profileData } = req.body
    
    const updatedAdmin = await prisma.adminDB.update({
      where: { id: adminId },
      data: {
        profile: JSON.stringify(profileData),
        updatedBy: req.session.user.id // หรือวิธีการ auth ของคุณ
      }
    })
    
    return res.json({ success: true, admin: updatedAdmin })
  }
}
```

## ⚠️ ข้อควรระวัง

1. **JSON Validation**: ตรวจสอบความถูกต้องของ JSON เสมอ
2. **Size Limit**: ระวังขนาดของข้อมูล profile ไม่ให้ใหญ่เกินไป
3. **Security**: ไม่เก็บข้อมูลสำคัญใน profile field
4. **Backup**: สำรองข้อมูลก่อนทำการ migration

## 🚀 Features ต่อไป

- [ ] UI สำหรับแก้ไข profile
- [ ] Upload รูปโปรไฟล์
- [ ] Validation schema
- [ ] Profile template
- [ ] Export/Import profile data 