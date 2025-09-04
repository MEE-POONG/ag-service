# MenuWeb API Documentation

## Overview
ระบบ API สำหรับจัดการเมนูเว็บไซต์ (MenuWebDB) ที่รองรับการจัดการแบบ CRUD และการจัดเรียงลำดับการแสดงผล

## API Endpoints

### 1. `/api/menuweb` - Main CRUD Operations

#### GET - ดึงข้อมูลเมนู

**Single Menu by ID:**
```
GET /api/menuweb?id=MENU_ID
```

**All Menus with Filtering:**
```
GET /api/menuweb?keyword=search&status=visible&parentId=parent_id&head=true&page=1&pageSize=20
```

**Query Parameters:**
- `id` (string, optional): ID ของเมนูที่ต้องการดึง
- `keyword` (string, optional): คำค้นหาในชื่อ, คำอธิบาย, หรือลิงก์
- `status` (string, optional): `visible`, `hidden`, หรือ `all` (default: `all`)
- `parentId` (string, optional): ID ของเมนูหลัก
- `head` (boolean, optional): กรองตามสถานะ head
- `page` (number, optional): หน้าที่ต้องการ (default: 1)
- `pageSize` (number, optional): จำนวนรายการต่อหน้า (default: 50, max: 100)

**Response Success:**
```json
{
  "success": true,
  "data": [...], // MenuWebDB[] หรือ MenuWebDB
  "pagination": {
    "totalItems": 100,
    "totalPages": 5,
    "currentPage": 1,
    "pageSize": 20
  },
  "message": "ดึงข้อมูลเมนูสำเร็จ"
}
```

#### POST - สร้างเมนูใหม่

```
POST /api/menuweb
Content-Type: application/json

{
  "name": "เมนูใหม่",
  "description": "คำอธิบายเมนู",
  "isVisible": true,
  "showOrder": 1,
  "link": "/new-menu",
  "icon": "icon-name",
  "manager": ["userId1", "userId2"],
  "head": false,
  "parentId": "parent_menu_id",
  "canAdvance": false,
  "canViews": true,
  "canCreate": false,
  "canUpdate": false,
  "canDelete": false,
  "createdBy": "userId"
}
```

**Required Fields:**
- `name`: ชื่อเมนู
- `link`: ลิงก์เมนู
- `createdBy`: ผู้สร้าง

**Response Success:**
```json
{
  "success": true,
  "data": { /* MenuWebDB object */ },
  "message": "สร้างเมนูใหม่สำเร็จ"
}
```

#### PUT - อัปเดตเมนู

```
PUT /api/menuweb?id=MENU_ID
Content-Type: application/json

{
  "name": "ชื่อใหม่",
  "isVisible": false,
  "updatedBy": "userId"
}
```

**Required Fields:**
- `updatedBy`: ผู้แก้ไข

**Response Success:**
```json
{
  "success": true,
  "data": { /* Updated MenuWebDB object */ },
  "message": "อัปเดตเมนูสำเร็จ"
}
```

#### DELETE - ลบเมนู (Soft Delete)

```
DELETE /api/menuweb?id=MENU_ID
Content-Type: application/json

{
  "deleteBy": "userId"
}
```

**Response Success:**
```json
{
  "success": true,
  "data": { /* Deleted MenuWebDB object */ },
  "message": "ลบเมนูสำเร็จ"
}
```

### 2. `/api/menuweb/showorder` - Show Order Management

#### GET - ดึงข้อมูลทั้งหมดเรียงตาม showOrder

```
GET /api/menuweb/showorder
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "menus": [...], // MenuWebDB[] (flat array)
    "hierarchy": [...] // Hierarchical structure
  },
  "message": "ดึงข้อมูลเมนูทั้งหมดสำเร็จ จำนวน 50 รายการ"
}
```

#### PUT - อัปเดตลำดับการแสดง

```
PUT /api/menuweb/showorder
Content-Type: application/json

{
  "updates": [
    {
      "id": "menu_id_1",
      "showOrder": 1,
      "parentId": "parent_id"
    },
    {
      "id": "menu_id_2", 
      "showOrder": 2,
      "parentId": "parent_id"
    }
  ],
  "updatedBy": "userId"
}
```

**Required Fields:**
- `updates`: Array ของ objects ที่มี id และ showOrder
- `updatedBy`: ผู้แก้ไข

**Response Success:**
```json
{
  "success": true,
  "data": [...], // Updated MenuWebDB[]
  "message": "อัปเดตลำดับการแสดงสำเร็จ จำนวน 2 รายการ"
}
```

## Data Types

### MenuWebDB (Prisma Model)
```typescript
interface MenuWebDB {
  id: string
  name: string
  description?: string
  isVisible: boolean
  showOrder: number
  link: string
  icon?: string
  manager: string[]
  head: boolean
  parentId?: string
  canAdvance: boolean
  canViews: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  deleteBy?: string
}
```

### CreateMenuWebData
```typescript
interface CreateMenuWebData {
  name: string                // Required
  description?: string
  isVisible?: boolean         // Default: true
  showOrder?: number          // Auto-increment if not provided
  link: string                // Required, must be unique
  icon?: string
  manager?: string[]          // Default: []
  head?: boolean              // Default: false
  parentId?: string | null
  canAdvance?: boolean        // Default: false
  canViews?: boolean          // Default: true
  canCreate?: boolean         // Default: false
  canUpdate?: boolean         // Default: false
  canDelete?: boolean         // Default: false
  createdBy: string           // Required
}
```

### UpdateMenuWebData
```typescript
interface UpdateMenuWebData {
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
  updatedBy: string           // Required
}
```

## Error Responses

### Common Error Format
```json
{
  "success": false,
  "error": "Error message in Thai"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created (POST)
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

### Common Validation Errors
- ชื่อเมนูนี้มีอยู่แล้ว
- Link นี้มีอยู่แล้ว
- ไม่พบเมนูหลักที่ระบุ
- ไม่สามารถลบเมนูที่มีเมนูย่อยได้ กรุณาลบเมนูย่อยก่อน
- ไม่สามารถกำหนดให้เป็น parent ของตัวเองได้

## Usage Examples

### TypeScript Frontend Integration

```typescript
// Get all menus
const response = await fetch('/api/menuweb?status=visible&page=1&pageSize=20')
const result = await response.json()

if (result.success) {
  console.log('Menus:', result.data)
  console.log('Pagination:', result.pagination)
}

// Create new menu
const newMenu = await fetch('/api/menuweb', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Dashboard',
    link: '',
    icon: 'dashboard',
    createdBy: 'admin'
  })
})

// Update menu visibility
await fetch(`/api/menuweb?id=${menuId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    isVisible: false,
    updatedBy: 'admin'
  })
})

// Update show order (drag & drop)
await fetch('/api/menuweb/showorder', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    updates: [
      { id: 'menu1', showOrder: 1 },
      { id: 'menu2', showOrder: 2 }
    ],
    updatedBy: 'admin'
  })
})
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react'

interface MenuWebAPI {
  success: boolean
  data: MenuWebDB[]
  pagination?: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
  error?: string
}

export function useMenuWeb(filters: MenuWebFilters = {}) {
  const [menus, setMenus] = useState<MenuWebDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.keyword) params.set('keyword', filters.keyword)
      if (filters.status) params.set('status', filters.status)
      if (filters.parentId) params.set('parentId', filters.parentId)
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.pageSize) params.set('pageSize', filters.pageSize.toString())

      const response = await fetch(`/api/menuweb?${params}`)
      const result: MenuWebAPI = await response.json()

      if (result.success) {
        setMenus(result.data)
        setError(null)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [filters])

  return { menus, loading, error, refetch: fetchMenus }
}
```

## Security Considerations

1. **Authentication**: ตรวจสอบสิทธิ์ผู้ใช้ก่อนการเข้าถึง API
2. **Authorization**: ตรวจสอบสิทธิ์การแก้ไข/ลบเมนู
3. **Input Validation**: ตรวจสอบข้อมูลที่รับเข้ามาทั้งหมด
4. **Sanitization**: ทำความสะอาดข้อมูลก่อนบันทึกลงฐานข้อมูล
5. **Rate Limiting**: จำกัดจำนวนการเรียกใช้ API
6. **CORS**: กำหนด CORS policies ที่เหมาะสม

## Performance Optimization

1. **Pagination**: ใช้ pagination สำหรับข้อมูลจำนวนมาก
2. **Caching**: Cache ข้อมูลเมนูที่ไม่เปลี่ยนแปลงบ่อย
3. **Database Indexing**: สร้าง index สำหรับฟิลด์ที่ใช้ในการค้นหา
4. **Lazy Loading**: โหลดเมนูย่อยแบบ lazy
5. **Compression**: ใช้ gzip compression สำหรับ response

## Testing

### Unit Tests
```typescript
// Test menu creation
test('should create new menu', async () => {
  const menuData = {
    name: 'Test Menu',
    link: '/test',
    createdBy: 'admin'
  }
  
  const response = await fetch('/api/menuweb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuData)
  })
  
  const result = await response.json()
  expect(result.success).toBe(true)
  expect(result.data.name).toBe('Test Menu')
})
```

### Integration Tests
```typescript
// Test menu hierarchy
test('should maintain proper hierarchy', async () => {
  // Create parent menu
  const parent = await createMenu({ name: 'Parent', link: '/parent' })
  
  // Create child menu
  const child = await createMenu({ 
    name: 'Child', 
    link: '/child', 
    parentId: parent.id 
  })
  
  // Verify hierarchy
  const hierarchy = await fetch('/api/menuweb/showorder')
  const result = await hierarchy.json()
  
  expect(result.data.hierarchy).toHaveLength(1)
  expect(result.data.hierarchy[0].children).toHaveLength(1)
})
``` 