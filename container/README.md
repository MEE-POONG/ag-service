# Container Structure Documentation

## 📁 โครงสร้าง Container

Container structure ถูกออกแบบเพื่อแยกการจัดการ business logic และ UI components ออกจากหน้าหลัก ทำให้โค้ดสะอาด บำรุงรักษาง่าย และสามารถนำกลับมาใช้ได้

```
container/
├── menuweb/              # จัดการเมนูเว็บ
├── auth/                 # การเข้าสู่ระบบ
├── dashboard/            # หน้าแดชบอร์ด
├── admin/               # จัดการผู้ดูแลระบบ
└── settings/            # การตั้งค่าต่างๆ
```

## 🎯 หลักการของ Container

### 1. Business Logic Hook (use*.ts)
- จัดการ state และ API calls
- ประมวลผล business logic
- Return functions และ data สำหรับ UI

### 2. UI Components (*.tsx)
- แสดงผล UI เท่านั้น
- รับ props จาก parent component
- ไม่มี business logic

### 3. Index File (index.ts)
- Export ทุก components ใน folder
- ทำให้ import ง่ายขึ้น

## 📋 ตัวอย่างการใช้งาน

### MenuWeb Container

```typescript
// pages/setting/menuweb.tsx
import {
  useMenuWebManagement,
  MenuWebFilters,
  MenuWebTable,
  MenuWebForm,
  MenuWebModal,
  MenuWebPagination
} from '@/container/menuweb'

const MenuWebManagement = () => {
  const {
    menus, loading, error,
    searchKeyword, setSearchKeyword,
    // ... other states and functions
  } = useMenuWebManagement()

  return (
    <TheLayout>
      <MenuWebFilters
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        // ... other props
      />
      <MenuWebTable menus={menus} loading={loading} error={error} />
      {/* ... other components */}
    </TheLayout>
  )
}
```

### Auth Container

```typescript
// pages/auth/login.tsx
import { useLogin, LoginForm } from '@/container/auth'

const LoginPage = () => {
  const { formData, setFormData, loading, error, handleLogin } = useLogin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <LoginForm
        formData={formData}
        setFormData={setFormData}
        loading={loading}
        error={error}
        onSubmit={handleLogin}
      />
    </div>
  )
}
```

## 🔧 การแก้ไขปัญหา Login

### ปัญหาที่พบ:
Login สำเร็จแต่ไม่ redirect ไป dashboard

### สาเหตุ:
API login response format:
```json
{ "message": "เข้าสู่ระบบสำเร็จ", "user": {...}, "token": "..." }
```

แต่ useLogin hook เดิมเช็ค `result.success` ซึ่งไม่มีใน response

### การแก้ไข:
```typescript
// container/auth/useLogin.ts
if (result.user && result.token) {
  router.push('')
} else if (response.status === 200 && result.message) {
  router.push('')
}
```

## 🌟 ข้อดีของ Container Structure

1. **แยกหน้าที่ชัดเจน**: Business logic แยกจาก UI
2. **นำกลับมาใช้ได้**: Components สามารถใช้ในหน้าอื่นได้
3. **บำรุงรักษาง่าย**: แก้ไขส่วนใดส่วนหนึ่งไม่กระทบส่วนอื่น
4. **ทดสอบง่าย**: แต่ละ component ทดสอบแยกได้
5. **Code ที่สะอาด**: ไฟล์หลักสั้นและอ่านง่าย

## 📝 แนวทางการสร้าง Container ใหม่

1. สร้าง folder ใน `container/` ตามชื่อหน้า
2. สร้าง custom hook `use[PageName].ts` สำหรับ business logic
3. สร้าง UI components `[ComponentName].tsx`
4. สร้าง `index.ts` สำหรับ export
5. อัปเดตหน้าหลักให้ใช้ container

### Template สำหรับ Custom Hook:

```typescript
// container/[page]/use[Page].ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export const use[Page] = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add your business logic here

  return {
    loading,
    error,
    // ... other states and functions
  }
}
```

### Template สำหรับ Component:

```typescript
// container/[page]/[Component].tsx
import React from 'react'

interface [Component]Props {
  // Define props here
}

export const [Component]: React.FC<[Component]Props> = ({
  // Destructure props here
}) => {
  return (
    <div>
      {/* Add your UI here */}
    </div>
  )
}
``` 