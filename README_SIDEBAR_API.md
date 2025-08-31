# Sidebar API Documentation

## Overview
ระบบ API สำหรับจัดการเมนูใน Sidebar ที่รองรับ hierarchy structure, permissions, และการอัปเดตแบบ real-time

## API Endpoints

### 1. Menu Web Sidebar API (`/api/menu-web-sidebar`)

#### GET - ดึงข้อมูลเมนูสำหรับ Sidebar
```typescript
GET /api/menu-web-sidebar?userRole=admin&includeInvisible=false&includePermissions=true
```

**Query Parameters:**
- `userRole` (optional): Role ของผู้ใช้ (admin, superadmin, user)
- `includeInvisible` (optional): รวมเมนูที่ไม่ visible (default: false)
- `includePermissions` (optional): รวมข้อมูล permissions (default: false)

**Request Body (Optional):**
```json
{
  "permissions": [
    {
      "menuId": "menu-id-1",
      "canAdvance": true,
      "canViews": true,
      "canCreate": false,
      "canUpdate": false,
      "canDelete": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "menu-id-1",
      "name": "Dashboard",
      "link": "",
      "icon": "FaHome",
      "isVisible": true,
      "showOrder": 1,
      "head": false,
      "parentId": null,
      "canAdvance": true,
      "canViews": true,
      "canCreate": false,
      "canUpdate": false,
      "canDelete": false,
      "children": [
        {
          "id": "menu-id-2",
          "name": "Analytics",
          "link": "/analytics",
          "icon": "FaChart",
          "isVisible": true,
          "showOrder": 1,
          "head": false,
          "parentId": "menu-id-1",
          "children": []
        }
      ]
    }
  ],
  "message": "ดึงข้อมูลเมนูสำหรับ Sidebar สำเร็จ (5 รายการ)"
}
```

#### POST - อัปเดตลำดับเมนู
```typescript
POST /api/menu-web-sidebar
```

**Request Body:**
```json
{
  "menuOrders": [
    {
      "id": "menu-id-1",
      "showOrder": 1
    },
    {
      "id": "menu-id-2", 
      "showOrder": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "อัปเดตลำดับเมนูสำเร็จ"
}
```

#### PUT - อัปเดตการแสดงเมนู
```typescript
PUT /api/menu-web-sidebar
```

**Request Body:**
```json
{
  "menuId": "menu-id-1",
  "isVisible": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "ซ่อนเมนู \"Dashboard\" สำเร็จ"
}
```

### 2. Menu Permissions API (`/api/menu-permissions`)

#### GET - ดึงข้อมูล Permissions
```typescript
GET /api/menu-permissions?positionId=position-id-1&includeMenuDetails=true
```

**Query Parameters:**
- `positionId` (optional): ดึง permissions ตาม position
- `menuId` (optional): ดึง permissions ของเมนูเฉพาะ
- `includeMenuDetails` (optional): รวมรายละเอียดเมนู (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "position-id-1",
      "name": "Manager",
      "permissions": [
        {
          "menuId": "menu-id-1",
          "menuName": "Dashboard",
          "positionId": "position-id-1",
          "positionName": "Manager",
          "canAdvance": true,
          "canViews": true,
          "canCreate": false,
          "canUpdate": false,
          "canDelete": false
        }
      ]
    }
  ],
  "message": "ดึงข้อมูล permissions สำเร็จ (10 รายการ)"
}
```

#### POST - สร้าง Permission ใหม่
```typescript
POST /api/menu-permissions
```

**Request Body:**
```json
{
  "adminPositionId": "position-id-1",
  "menuId": "menu-id-1",
  "canAdvance": false,
  "canViews": true,
  "canCreate": false,
  "canUpdate": false,
  "canDelete": false
}
```

#### PUT - อัปเดต Permission
```typescript
PUT /api/menu-permissions
```

**Request Body:**
```json
{
  "permissionId": "permission-id-1",
  // หรือ
  "adminPositionId": "position-id-1",
  "menuId": "menu-id-1",
  
  "canAdvance": true,
  "canViews": true,
  "canCreate": false,
  "canUpdate": false,
  "canDelete": false
}
```

#### DELETE - ลบ Permission
```typescript
DELETE /api/menu-permissions?permissionId=permission-id-1
```

## Hook Usage

### useMenuSystem Hook

```typescript
import { useMenuSystem } from '@/hooks/useMenuSystem';

const MyComponent = () => {
  const user = {
    role: 'admin',
    permissions: [
      {
        menuId: 'menu-id-1',
        canViews: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canAdvance: true
      }
    ]
  };

  const { 
    menuItems, 
    loading, 
    error, 
    refreshMenus,
    updateMenuOrder,
    updateMenuVisibility 
  } = useMenuSystem(user);

  // อัปเดตลำดับเมนู
  const handleUpdateOrder = async () => {
    const newOrder = [
      { id: 'menu-1', showOrder: 1 },
      { id: 'menu-2', showOrder: 2 }
    ];
    
    const success = await updateMenuOrder(newOrder);
    if (success) {
      console.log('Updated menu order successfully');
    }
  };

  // อัปเดตการแสดงเมนู
  const handleToggleVisibility = async (menuId: string, isVisible: boolean) => {
    const success = await updateMenuVisibility(menuId, isVisible);
    if (success) {
      console.log('Updated menu visibility successfully');
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {menuItems.map(item => (
        <div key={item.id}>
          {item.name}
          {item.children && item.children.length > 0 && (
            <div>
              {item.children.map(child => (
                <div key={child.id}>{child.name}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

## Helper Functions

### hasMenuPermission
```typescript
import { hasMenuPermission } from '@/hooks/useMenuSystem';

const canView = hasMenuPermission(user, 'menu-id-1', 'canViews');
const canCreate = hasMenuPermission(user, 'menu-id-1', 'canCreate');
```

### getMenuPermissions
```typescript
import { getMenuPermissions } from '@/hooks/useMenuSystem';

const permissions = getMenuPermissions(user, 'menu-id-1');
if (permissions) {
  console.log('User can view:', permissions.canViews);
  console.log('User can create:', permissions.canCreate);
}
```

## Error Handling

### API Error Responses
```json
{
  "success": false,
  "error": "เกิดข้อผิดพลาดในการดึงข้อมูลเมนู",
  "message": "Error details here"
}
```

### Common Error Codes
- `400`: Bad Request - ข้อมูลไม่ถูกต้อง
- `401`: Unauthorized - ไม่มีสิทธิ์เข้าถึง
- `404`: Not Found - ไม่พบข้อมูล
- `405`: Method Not Allowed - Method ไม่ถูกต้อง
- `500`: Internal Server Error - เกิดข้อผิดพลาดของระบบ

## Performance Optimization

### Caching Strategy
- Menu hierarchy จะถูก cache ที่ client-side
- ใช้ `refreshMenus()` เพื่อ refresh cache
- Auto-refresh เมื่อ user role เปลี่ยนแปลง

### Best Practices
1. **เรียก API ครั้งเดียว**: ใช้ `useMenuSystem` hook แทนการเรียก API โดยตรง
2. **Permission Checking**: ใช้ `hasMenuPermission` helper function
3. **Error Handling**: ตรวจสอบ `error` state จาก hook
4. **Loading State**: แสดง loading indicator ขณะโหลดข้อมูล

## Security Considerations

### Permission-Based Access
- เมนูจะถูกกรองตาม user permissions
- Admin และ superadmin มีสิทธิ์ทั้งหมด
- User ทั่วไปจะเห็นเฉพาะเมนูที่มีสิทธิ์

### Data Validation
- ตรวจสอบ input ทุกครั้งก่อนบันทึก
- ใช้ Prisma schema validation
- Sanitize user input เพื่อป้องกัน injection attacks

## Migration Guide

### จาก API เก่า → API ใหม่
1. แทนที่ `/api/menu-web` ด้วย `/api/menu-web-sidebar`
2. ใช้ `MenuWebDBWithChildren` type แทน `MenuItem`
3. ปรับ field names: `href` → `link`
4. ใช้ `useMenuSystem` hook ใหม่

### Breaking Changes
- `MenuItem` interface ถูกแทนที่ด้วย `MenuWebDB` + children
- Field `href` เปลี่ยนเป็น `link`
- การจัดการ permissions ถูกย้ายไปยัง API แยก

## Testing

### Unit Tests
```typescript
// Example test for useMenuSystem hook
import { renderHook, act } from '@testing-library/react';
import { useMenuSystem } from '@/hooks/useMenuSystem';

test('should load menu items', async () => {
  const { result } = renderHook(() => useMenuSystem({
    role: 'admin',
    permissions: []
  }));

  expect(result.current.loading).toBe(true);
  
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.menuItems).toHaveLength(5);
});
```

### Integration Tests
```typescript
// Example API test
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/menu-web-sidebar';

test('GET /api/menu-web-sidebar', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    query: { userRole: 'admin' }
  });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(200);
  const data = JSON.parse(res._getData());
  expect(data.success).toBe(true);
  expect(data.data).toBeInstanceOf(Array);
});
``` 