# Adjust Bet System Setup Guide

## ภาพรวม
ระบบ Adjust Bet เป็นระบบจัดการการปรับเบทสำหรับลูกค้าในระบบ AG Service โดยรองรับการตั้งค่าหลายเกมและหลายประเภท

## โครงสร้างระบบ

### 1. Types และ Interfaces
- `types/adjustBet.ts` - กำหนด TypeScript interfaces สำหรับข้อมูล Adjust Bet
- รองรับเกมทั้งหมด: Sportsbook, Sexy, SA, Slot ITP, Slot JOKER, Slot PLAYSTAR, Cockfight, Muay Step, Virtual Sports

### 2. Database Schema
```prisma
model AdjustBet {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  description String?
  data        Json     // เก็บข้อมูล Adjust Bet ทั้งหมดเป็น JSON
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3. API Endpoints
- `GET /api/adjust-bet` - ดึงรายการ Adjust Bet
- `POST /api/adjust-bet` - สร้าง Adjust Bet ใหม่
- `GET /api/adjust-bet/[id]` - ดึง Adjust Bet เดียว
- `PUT /api/adjust-bet/[id]` - อัพเดท Adjust Bet
- `DELETE /api/adjust-bet/[id]` - ลบ Adjust Bet

### 4. Components
- `ModalAdJustBet.tsx` - Modal สำหรับ CRUD operations
- `pages/bot-ag/adjust-bet.tsx` - หน้าจัดการรายการ Adjust Bet

### 5. Hooks
- `useAdjustBet.ts` - Custom hook สำหรับจัดการข้อมูล Adjust Bet

## การติดตั้ง

### 1. อัพเดท Database Schema
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 2. ตรวจสอบไฟล์ที่สร้าง
- ✅ `types/adjustBet.ts`
- ✅ `container/bot-ag/ModalAdJustBet.tsx`
- ✅ `pages/api/adjust-bet/index.ts`
- ✅ `pages/api/adjust-bet/[id].ts`
- ✅ `hooks/useAdjustBet.ts`
- ✅ `pages/bot-ag/adjust-bet.tsx`
- ✅ `data/adjustBetSamples.ts`

## การใช้งาน

### 1. เข้าถึงระบบ
ไปที่ `/bot-ag` แล้วคลิกที่ "Adjust Bet"

### 2. สร้าง Adjust Bet ใหม่
1. คลิกปุ่ม "สร้างใหม่"
2. กรอกข้อมูลพื้นฐาน:
   - ชื่อ (required)
   - รหัสลูกค้า (required)
   - Username AG (required)
   - PIN/OTP (required)
   - คำอธิบาย (optional)

3. ตั้งค่าเกมต่างๆ:
   - **Sportsbook**: ตั้งค่าคอมมิชชั่นและขีดจำกัด
   - **Sexy (RBF)**: ตั้งค่า profile
   - **SA (RAR)**: ตั้งค่าคอมมิชชั่นและ profile
   - **Slot Games**: เปิด/ปิดการใช้งาน
   - **Cockfight (RBG)**: ตั้งค่าคอมมิชชั่น
   - **Muay Step (RBM)**: เปิด/ปิดการใช้งาน
   - **Virtual Sports (RBO)**: เปิด/ปิดการใช้งาน

4. คลิก "สร้าง" เพื่อบันทึก

### 3. แก้ไข Adjust Bet
1. คลิกปุ่ม "แก้ไข" ในรายการ
2. แก้ไขข้อมูลตามต้องการ
3. คลิก "บันทึก" เพื่ออัพเดท

### 4. ดูรายละเอียด
คลิกปุ่ม "ดู" เพื่อดูรายละเอียดแบบ read-only

### 5. ลบ Adjust Bet
คลิกปุ่ม "ลบ" และยืนยันการลบ

## ตัวอย่างข้อมูล

ระบบมีตัวอย่างข้อมูล 8 แบบ:
1. **ลูกค้าทั่วไป** - Sportsbook + Sexy
2. **ลูกค้า VIP** - ทุกเกมเปิดใช้งาน
3. **ลูกค้า Slot เท่านั้น** - เปิดเฉพาะ Slot games
4. **ลูกค้า Sportsbook เท่านั้น** - เปิดเฉพาะ Sportsbook
5. **ลูกค้า Cockfight + Muay Step** - เปิดเฉพาะเกมต่อสู้
6. **ลูกค้า SA (RAR) เท่านั้น** - เปิดเฉพาะ SA
7. **ลูกค้า Virtual Sports เท่านั้น** - เปิดเฉพาะ Virtual Sports
8. **ลูกค้า Sexy + SA** - เปิดเฉพาะ Sexy และ SA

## ข้อมูลที่เก็บ

### Sportsbook
- **Commission**: main, x12, par, other (เปอร์เซ็นต์)
- **Limits**: transLimit, beforeRun, maxX12, matchLimitX12, maxPar, par, maxOther, matchLimitOther, maxOS, matchLimitOS

### Sexy (RBF)
- **Profile**: 1, 2, 3, etc.

### SA (RAR)
- **Commission RAR**: เปอร์เซ็นต์
- **Profile**: 1, 2, 3, etc.

### Slot Games
- **Slot ITP (RAS)**: เปิด/ปิด
- **Slot JOKER (RAU)**: เปิด/ปิด
- **Slot PLAYSTAR (RBL)**: เปิด/ปิด

### Cockfight (RBG)
- **Commission RBG**: เปอร์เซ็นต์

### Muay Step (RBM)
- เปิด/ปิดการใช้งาน

### Virtual Sports (RBO)
- เปิด/ปิดการใช้งาน

## API Usage

### สร้าง Adjust Bet
```typescript
const response = await fetch('/api/adjust-bet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'ลูกค้า VIP',
    description: 'การตั้งค่าสำหรับลูกค้า VIP',
    data: {
      customer: 'ufh27oa10001',
      usernameAG: 'ufh27oa1ufa66',
      agBaseUrl: 'https://ag.ufabet.com',
      pinUsed: '221308',
      sportsbook: {
        enabled: true,
        commission: { main: 0, x12: 0, par: 0, other: 0 },
        limits: { transLimit: 50000, beforeRun: 50000, /* ... */ }
      },
      // ... เกมอื่นๆ
    }
  })
});
```

### ดึงรายการ Adjust Bet
```typescript
const response = await fetch('/api/adjust-bet?page=1&limit=10&search=VIP');
const data = await response.json();
```

### อัพเดท Adjust Bet
```typescript
const response = await fetch(`/api/adjust-bet/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'ชื่อใหม่',
    data: { /* ข้อมูลใหม่ */ }
  })
});
```

### ลบ Adjust Bet
```typescript
const response = await fetch(`/api/adjust-bet/${id}`, {
  method: 'DELETE'
});
```

## การใช้งาน Hook

```typescript
import { useAdjustBet } from '@/hooks/useAdjustBet';

function MyComponent() {
  const {
    adjustBets,
    isLoading,
    error,
    fetchAdjustBets,
    createAdjustBet,
    updateAdjustBet,
    deleteAdjustBet
  } = useAdjustBet();

  // ดึงข้อมูล
  useEffect(() => {
    fetchAdjustBets({ page: 1, limit: 10 });
  }, []);

  // สร้างใหม่
  const handleCreate = async () => {
    const result = await createAdjustBet({
      name: 'ชื่อใหม่',
      description: 'คำอธิบาย',
      data: { /* ข้อมูล */ }
    });
  };

  return (
    <div>
      {isLoading ? 'กำลังโหลด...' : (
        <div>
          {adjustBets.map(adjustBet => (
            <div key={adjustBet.id}>{adjustBet.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## การค้นหาและกรอง

ระบบรองรับการค้นหาและกรองข้อมูล:
- **ค้นหาตามชื่อ**: ใช้ชื่อ Adjust Bet
- **ค้นหาตามรหัสลูกค้า**: ใช้รหัสลูกค้า
- **ค้นหาตาม Username AG**: ใช้ username AG
- **เรียงลำดับ**: ตามวันที่สร้าง, ชื่อ, ฯลฯ
- **Pagination**: แบ่งหน้าข้อมูล

## การจัดการ Error

ระบบมีการจัดการ error ที่ครอบคลุม:
- **Validation Errors**: ตรวจสอบข้อมูลที่จำเป็น
- **Duplicate Errors**: ตรวจสอบชื่อซ้ำ
- **Network Errors**: จัดการข้อผิดพลาดเครือข่าย
- **Server Errors**: จัดการข้อผิดพลาดเซิร์ฟเวอร์

## Security

- ข้อมูลถูกเก็บในฐานข้อมูล MongoDB
- ใช้ Prisma ORM สำหรับความปลอดภัย
- มีการ validate ข้อมูลทั้งฝั่ง client และ server
- รองรับการ audit log (สามารถเพิ่มได้)

## การขยายระบบ

### เพิ่มเกมใหม่
1. เพิ่ม interface ใน `types/adjustBet.ts`
2. อัพเดท Modal component
3. อัพเดท API validation
4. อัพเดท UI

### เพิ่มฟีเจอร์ใหม่
1. เพิ่ม field ใน database schema
2. อัพเดท types และ interfaces
3. อัพเดท API endpoints
4. อัพเดท UI components

## Troubleshooting

### ปัญหาที่พบบ่อย
1. **"Name already exists"**: ชื่อซ้ำกับที่มีอยู่แล้ว
2. **"Required fields missing"**: กรอกข้อมูลไม่ครบ
3. **"Database connection error"**: เชื่อมต่อฐานข้อมูลไม่ได้

### การแก้ไข
1. ตรวจสอบชื่อที่ไม่ซ้ำ
2. กรอกข้อมูลที่จำเป็นให้ครบ
3. ตรวจสอบการเชื่อมต่อฐานข้อมูล

## การอัพเดท

เมื่อต้องการอัพเดทระบบ:
1. อัพเดท database schema
2. รัน `npm run db:generate`
3. รัน `npm run db:push`
4. อัพเดท code ตามความจำเป็น
5. ทดสอบการทำงาน
