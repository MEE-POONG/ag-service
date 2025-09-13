# Partners API Documentation

## Overview
API สำหรับจัดการข้อมูลพันธมิตร (Partners) ในระบบ AG Service

## Endpoints

### 1. GET /api/partners
ดึงรายการพันธมิตรทั้งหมด

**Request:**
```http
GET /api/partners
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "agentId": "507f1f77bcf86cd799439012",
      "bankName": "กสิกรไทย",
      "bankNumber": "1234567890",
      "name": "สาโรจน์",
      "tel": "0915239792",
      "line": "",
      "status": "active",
      "method": "normal",
      "startDate": "2021-05-21T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "system",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": "system",
      "agent": {
        "id": "507f1f77bcf86cd799439012",
        "username": "agent001",
        "userLogin": "agent001",
        "webname": "Web Agent 001",
        "position": "Agent"
      }
    }
  ]
}
```

### 2. POST /api/partners
สร้างพันธมิตรใหม่

**Request:**
```http
POST /api/partners
Content-Type: application/json

{
  "agentId": "507f1f77bcf86cd799439012",
  "bankName": "กสิกรไทย",
  "bankNumber": "1234567890",
  "name": "สาโรจน์",
  "tel": "0915239792",
  "line": "",
  "status": "active",
  "method": "normal",
  "startDate": "2024-01-01T00:00:00.000Z",
  "createdBy": "system"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "agentId": "507f1f77bcf86cd799439012",
    "bankName": "กสิกรไทย",
    "bankNumber": "1234567890",
    "name": "สาโรจน์",
    "tel": "0915239792",
    "line": "",
    "status": "active",
    "method": "normal",
    "startDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "system",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": "system",
    "agent": {
      "id": "507f1f77bcf86cd799439012",
      "username": "agent001",
      "userLogin": "agent001",
      "webname": "Web Agent 001",
      "position": "Agent"
    }
  },
  "message": "สร้างสำเร็จ"
}
```

### 3. PUT /api/partners
อัปเดตข้อมูลพันธมิตร (ส่ง ID ใน body)

**Request:**
```http
PUT /api/partners
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439011",
  "name": "สาโรจน์ (แก้ไขแล้ว)",
  "tel": "0823456789",
  "updatedBy": "admin_user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "agentId": "507f1f77bcf86cd799439012",
    "bankName": "กสิกรไทย",
    "bankNumber": "1234567890",
    "name": "สาโรจน์ (แก้ไขแล้ว)",
    "tel": "0823456789",
    "line": "",
    "status": "active",
    "method": "normal",
    "startDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "system",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "updatedBy": "admin_user",
    "agent": {
      "id": "507f1f77bcf86cd799439012",
      "username": "agent001",
      "userLogin": "agent001",
      "webname": "Web Agent 001",
      "position": "Agent"
    }
  },
  "message": "อัปเดตสำเร็จ"
}
```

### 4. DELETE /api/partners
ลบพันธมิตร (ส่ง ID ใน body)

**Request:**
```http
DELETE /api/partners
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ลบข้อมูลสำเร็จ"
}
```

### 5. GET /api/partners/[id]
ดึงข้อมูลพันธมิตรตาม ID

**Request:**
```http
GET /api/partners/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "agentId": "507f1f77bcf86cd799439012",
    "bankName": "กสิกรไทย",
    "bankNumber": "1234567890",
    "name": "สาโรจน์",
    "tel": "0915239792",
    "line": "",
    "status": "active",
    "method": "normal",
    "startDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "system",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": "system",
    "agent": {
      "id": "507f1f77bcf86cd799439012",
      "username": "agent001",
      "userLogin": "agent001",
      "webname": "Web Agent 001",
      "position": "Agent"
    }
  }
}
```

### 6. PUT /api/partners/[id]
อัปเดตข้อมูลพันธมิตรตาม ID

**Request:**
```http
PUT /api/partners/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "name": "สาโรจน์ (แก้ไขแล้ว)",
  "tel": "0823456789",
  "updatedBy": "admin_user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "agentId": "507f1f77bcf86cd799439012",
    "bankName": "กสิกรไทย",
    "bankNumber": "1234567890",
    "name": "สาโรจน์ (แก้ไขแล้ว)",
    "tel": "0823456789",
    "line": "",
    "status": "active",
    "method": "normal",
    "startDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "system",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "updatedBy": "admin_user",
    "agent": {
      "id": "507f1f77bcf86cd799439012",
      "username": "agent001",
      "userLogin": "agent001",
      "webname": "Web Agent 001",
      "position": "Agent"
    }
  },
  "message": "อัปเดตสำเร็จ"
}
```

### 7. DELETE /api/partners/[id]
ลบพันธมิตรตาม ID

**Request:**
```http
DELETE /api/partners/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "ลบข้อมูลสำเร็จ"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "agentId จำเป็น"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "ไม่พบข้อมูลพันธมิตร"
}
```

### 405 Method Not Allowed
```json
{
  "success": false,
  "error": "Method Not Allowed"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server error"
}
```

## Required Fields

### POST /api/partners
- `agentId` (required): ID ของ AG User
- `bankName` (required): ชื่อธนาคาร
- `bankNumber` (required): เลขบัญชี
- `name` (required): ชื่อบัญชี

### Optional Fields
- `tel`: เบอร์โทรศัพท์
- `line`: Line ID
- `status`: สถานะ (default: 'active')
- `method`: วิธีคิด (default: 'normal')
- `startDate`: วันที่เริ่มทำงาน (default: current date)
- `createdBy`: ผู้สร้าง (default: 'system')

## Database Schema

```prisma
model PartnerDB {
  id         String          @id @default(auto()) @map("_id") @db.ObjectId
  agentId    String          @db.ObjectId
  agent      AgUserAccountDB @relation(fields: [agentId], references: [id], onDelete: Cascade)
  bankName   String
  bankNumber String
  name       String
  tel        String
  line       String
  status     String
  method     String
  startDate  DateTime
  createdAt  DateTime        @default(now()) @db.Date
  createdBy  String
  updatedAt  DateTime        @updatedAt @db.Date
  updatedBy  String
}
```

## Testing

ใช้ไฟล์ `test-partners-api.js` เพื่อทดสอบ API endpoints ทั้งหมด:

```bash
node test-partners-api.js
```

## Usage in Frontend

```typescript
import { API_ENDPOINTS } from '@/data/apiEndpoints';
import axios from '@/lib/axios';

// Get all partners
const partners = await axios.get(API_ENDPOINTS.PARTNERS.LIST);

// Create new partner
const newPartner = await axios.post(API_ENDPOINTS.PARTNERS.CREATE, partnerData);

// Update partner
const updatedPartner = await axios.put(API_ENDPOINTS.PARTNERS.UPDATE(id), updateData);

// Delete partner
await axios.delete(API_ENDPOINTS.PARTNERS.DELETE(id));

// Get partner by ID
const partner = await axios.get(API_ENDPOINTS.PARTNERS.GET_BY_ID(id));
```
