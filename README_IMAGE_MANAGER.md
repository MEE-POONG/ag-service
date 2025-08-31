# Image Manager System

ระบบจัดการรูปภาพที่ปลอดภัยสำหรับ Next.js application ที่ใช้ Cloudflare Images และ Prisma

## คุณสมบัติ

- ✅ **อัพโหลดรูปภาพไปยัง Cloudflare Images**
- ✅ **จัดการรูปภาพในฐานข้อมูล**
- ✅ **ระบบ Rollback อัตโนมัติ** - ถ้าสร้างเนื้อหาไม่สำเร็จจะลบรูปภาพที่อัพโหลดแล้ว
- ✅ **ระบบจัดการรูปภาพเก่า** - เมื่ออัพเดทรูปภาพใหม่จะลบรูปภาพเก่าอัตโนมัติ
- ✅ **รองรับการใช้งานหลายที่** - ใช้ได้กับทุกส่วนของแอปพลิเคชัน
- ✅ **Type Safety** - ใช้ TypeScript อย่างเต็มรูปแบบ

## การติดตั้ง

### 1. Environment Variables

เพิ่ม environment variables ใน `.env.local`:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
DATABASE_URL=your_database_url
```

### 2. Prisma Schema

ตรวจสอบว่า Prisma schema มี model `ImageList`:

```prisma
model ImageList {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  imageUrl  String
  modelName String?
  nameFile  String
  createdAt DateTime @default(now())
  createdBy String
  updatedAt DateTime @updatedAt
  updatedBy String
  deleteBy  String?
  isDeleted Boolean  @default(false)
}
```

## การใช้งาน

### 1. การเพิ่มข้อมูลใหม่พร้อมรูปภาพ

```typescript
import { handleCreateWithImage } from '@/lib/imageManager';

const handleSubmit = async () => {
  const result = await handleCreateWithImage(
    selectedFile, // File | null
    {
      modelName: 'GameRankDB',
      userId: 'current-user-id',
      allowDuplicates: false,
    },
    async (imageUrl) => {
      // ฟังก์ชันสำหรับสร้างเนื้อหา
      const response = await fetch('/api/game/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameRank: formData.nameRank,
          number: formData.number,
          imgPreview: imageUrl || '', // ใช้ imageUrl ที่ได้จากอัพโหลด
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถเพิ่มข้อมูลได้');
      }

      return await response.json();
    }
  );

  if (result.success) {
    console.log('เพิ่มข้อมูลสำเร็จ:', result.data);
  } else {
    console.error('เกิดข้อผิดพลาด:', result.error);
  }
};
```

### 2. การแก้ไขข้อมูลพร้อมรูปภาพ

```typescript
import { handleUpdateWithImage } from '@/lib/imageManager';

const handleUpdate = async (itemId: string, currentImageId: string | null) => {
  const result = await handleUpdateWithImage(
    selectedFile, // File | null (รูปภาพใหม่)
    currentImageId, // string | null (ID รูปภาพปัจจุบัน)
    {
      modelName: 'GameRankDB',
      userId: 'current-user-id',
      allowDuplicates: false,
    },
    async (imageUrl) => {
      // ฟังก์ชันสำหรับอัพเดทเนื้อหา
      const response = await fetch(`/api/game/rank/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameRank: formData.nameRank,
          number: formData.number,
          imgPreview: imageUrl || currentImageId || '', // ใช้รูปภาพใหม่หรือเก่า
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถอัพเดทข้อมูลได้');
      }

      return await response.json();
    }
  );

  if (result.success) {
    console.log('อัพเดทสำเร็จ:', result.data);
    console.log('รูปภาพใหม่:', result.newImageId);
    console.log('รูปภาพเก่าที่ถูกลบ:', result.deleteImageId);
  } else {
    console.error('เกิดข้อผิดพลาด:', result.error);
  }
};
```

### 3. การลบข้อมูลพร้อมรูปภาพ

```typescript
import { handleDeleteWithImage } from '@/lib/imageManager';

const handleDelete = async (itemId: string, imageId: string | null) => {
  const result = await handleDeleteWithImage(
    imageId, // string | null (ID รูปภาพที่จะลบ)
    async () => {
      // ฟังก์ชันสำหรับลบเนื้อหา
      const response = await fetch(`/api/game/rank/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถลบข้อมูลได้');
      }

      return await response.json();
    },
    'current-user-id'
  );

  if (result.success) {
    console.log('ลบข้อมูลสำเร็จ:', result.data);
    console.log('รูปภาพที่ถูกลบ:', result.deleteImageId);
  } else {
    console.error('เกิดข้อผิดพลาด:', result.error);
  }
};
```

### 4. การอัพโหลดรูปภาพแบบพื้นฐาน

```typescript
import { uploadImage } from '@/lib/imageManager';

const handleUpload = async (file: File) => {
  const result = await uploadImage(file, {
    modelName: 'GameRankDB',
    userId: 'current-user-id',
    allowDuplicates: false,
  });

  if (result.success) {
    console.log('อัพโหลดสำเร็จ:', result.imageId);
    console.log('URL รูปภาพ:', result.imageUrl);
  } else {
    console.error('อัพโหลดล้มเหลว:', result.error);
  }
};
```

### 5. การลบรูปภาพ

```typescript
import { deleteImage } from '@/lib/imageManager';

const handleDeleteImage = async (imageId: string) => {
  const result = await deleteImage(imageId, false, 'current-user-id'); // false = hard delete

  if (result.success) {
    console.log('ลบรูปภาพสำเร็จ:', result.message);
  } else {
    console.error('ลบรูปภาพล้มเหลว:', result.error);
  }
};
```

## API Endpoints

### POST `/api/upload/v2`
อัพโหลดรูปภาพ

**Request:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('modelName', 'GameRankDB');
formData.append('userId', 'user-id');
formData.append('allowDuplicates', 'false');
```

**Response:**
```json
{
  "success": true,
  "data": [{
    "id": "image-id",
    "imageId": "cloudflare-image-id",
    "imageUrl": "https://imagedelivery.net/...",
    "thumbnailUrl": "https://imagedelivery.net/...",
    "originalName": "example.jpg",
    "modelName": "GameRankDB",
    "variants": {
      "public": "https://imagedelivery.net/...",
      "thumbnail": "https://imagedelivery.net/...",
      "small": "https://imagedelivery.net/...",
      "medium": "https://imagedelivery.net/...",
      "large": "https://imagedelivery.net/..."
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }],
  "imageUrl": "cloudflare-image-id",
  "imageId": "image-id"
}
```

### DELETE `/api/upload/v2`
ลบรูปภาพ

**Request:**
```json
{
  "imageId": "image-id",
  "softDelete": true,
  "userId": "user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image delete successfully",
  "data": {
    "id": "image-id",
    "imageId": "cloudflare-image-id",
    "imageUrl": "https://imagedelivery.net/...",
    "isDeleted": true
  }
}
```

### GET `/api/upload/v2`
ดึงรายการรูปภาพ

**Query Parameters:**
- `modelName` - กรองตามชื่อโมเดล
- `page` - หน้าที่ต้องการ (default: 1)
- `limit` - จำนวนรายการต่อหน้า (default: 20)
- `search` - ค้นหาจากชื่อไฟล์

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## ระบบความปลอดภัย

### 1. การ Rollback อัตโนมัติ
- ถ้าสร้างเนื้อหาไม่สำเร็จ → ลบรูปภาพที่อัพโหลดแล้ว
- ถ้าอัพเดทเนื้อหาไม่สำเร็จ → ลบรูปภาพใหม่ที่อัพโหลดแล้ว

### 2. การจัดการรูปภาพเก่า
- เมื่ออัพเดทรูปภาพใหม่ → ลบรูปภาพเก่าอัตโนมัติ
- เมื่อลบข้อมูล → ลบรูปภาพที่เกี่ยวข้องด้วย

### 3. การตรวจสอบไฟล์
- รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP, SVG)
- ขนาดไฟล์สูงสุด 10MB
- ตรวจสอบไฟล์ซ้ำ (ถ้าไม่เปิด allowDuplicates)

## ตัวอย่างการใช้งานจริง

ดูตัวอย่างการใช้งานใน `examples/GameRankExample.tsx`

## การแก้ไขปัญหา

### 1. อัพโหลดไม่สำเร็จ
- ตรวจสอบ environment variables
- ตรวจสอบขนาดไฟล์ (ไม่เกิน 10MB)
- ตรวจสอบประเภทไฟล์

### 2. ลบรูปภาพไม่สำเร็จ
- ตรวจสอบว่า imageId ถูกต้อง
- ตรวจสอบสิทธิ์การเข้าถึง Cloudflare API

### 3. ข้อมูลไม่ตรงกัน
- ตรวจสอบ modelName ว่าตรงกับที่ใช้ในฐานข้อมูล
- ตรวจสอบ userId ว่าถูกต้อง

## การพัฒนาเพิ่มเติม

### 1. เพิ่มการรองรับหลายไฟล์
```typescript
// อนาคต: รองรับการอัพโหลดหลายไฟล์พร้อมกัน
const result = await handleCreateWithMultipleImages(
  files,
  options,
  createContent
);
```

### 2. เพิ่มการจัดการรูปภาพแบบ Batch
```typescript
// อนาคต: ลบรูปภาพหลายรูปพร้อมกัน
const results = await deleteMultipleImages(imageIds, false, userId);
```

### 3. เพิ่มการตรวจสอบรูปภาพ
```typescript
// อนาคต: ตรวจสอบว่ารูปภาพมีอยู่จริง
const exists = await imageExists(imageId);
``` 