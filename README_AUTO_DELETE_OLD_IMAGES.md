# ระบบลบรูปเก่าอัตโนมัติ (Auto Delete Old Images)

## ภาพรวม

ระบบนี้จะลบรูปภาพเก่าอัตโนมัติเมื่ออัพโหลดรูปใหม่สำหรับ `modelName` เดียวกัน โดยจะลบทั้งจาก **Cloudflare Images** และ **Database**

> ⚠️ **หมายเหตุ**: ฟังก์ชัน upload ไปยัง Cloudflare จะทำงานเฉพาะใน **API routes** เท่านั้น (server-side) เพื่อหลีกเลี่ยงปัญหา `import('fs')` ใน client-side 

## ฟีเจอร์หลัก

- ✅ **ลบอัตโนมัติ**: เมื่ออัพโหลดรูปใหม่ จะลบรูปเก่าของ model เดียวกันทันที
- ✅ **ลบจาก 2 ที่**: Cloudflare Images + Database (ImageList)
- ✅ **Error Handling**: หากลบ Cloudflare ไม่ได้ยังลบ Database ได้
- ✅ **Logging**: บันทึกการทำงานและ error ทั้งหมด
- ✅ **Manual Cleanup**: API สำหรับลบรูปเก่าแบบ manual


## การทำงาน

### 🔄 อัตโนมัติ (Auto Delete)

เมื่อเรียก API อัพโหลดรูป:

```
POST /api/upload/index.ts
POST /api/upload/v2.ts (เมื่อ allowDuplicates = false)
```

ระบบจะ:
1. ค้นหารูปเก่าที่มี `modelName` เดียวกัน
2. ลบรูปเก่าจาก Cloudflare Images
3. ลบข้อมูลจาก Database
4. อัพโหลดรูปใหม่

### 🧹 Manual Cleanup

สำหรับลบรูปเก่าแบบ manual:

```
DELETE /api/upload/cleanup
```

## วิธีใช้งาน

### 1. อัพโหลดรูปปกติ (จะลบรูปเก่าอัตโนมัติ)

**สำหรับ Client-side (React Components):**
```javascript
// ใช้ useImageUpload hook (แนะนำ)
import { useImageUpload } from '@/hooks/useImageUpload';

const { uploadSingle } = useImageUpload({
    modelName: 'user-profile-123',
    userId: 'admin'
});

const result = await uploadSingle(file);
```

**หรือเรียก API โดยตรง:**
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('modelName', 'user-profile-123');
formData.append('userId', 'admin');

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});
```

### 2. Manual Cleanup API

```javascript
// Hard Delete (ลบถาวร)
const response = await fetch('/api/upload/cleanup', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        modelName: 'user-profile-123',
        softDelete: false,
        userId: 'admin'
    })
});

// Soft Delete (ทำเครื่องหมายว่าลบ)
const response = await fetch('/api/upload/cleanup', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        modelName: 'user-profile-123',
        softDelete: true,
        userId: 'admin'
    })
});
```

## Utility Functions

### `deleteOldImagesForModel()`

ลบรูปเก่าทั้งหมดสำหรับ model ที่ระบุ (Hard Delete)

```typescript
import { deleteOldImagesForModel } from '@/lib/imageUtils';

const result = await deleteOldImagesForModel('user-profile-123', 'admin');
console.log(`Deleted ${result.deleteCount} images`);
if (result.errors.length > 0) {
    console.error('Errors:', result.errors);
}
```

### `softDeleteOldImagesForModel()`

ทำเครื่องหมายรูปเก่าว่าถูกลบ (Soft Delete)

```typescript
import { softDeleteOldImagesForModel } from '@/lib/imageUtils';

const result = await softDeleteOldImagesForModel('user-profile-123', 'admin');
console.log(`Soft delete ${result.deleteCount} images`);
```



## Response Format

### ✅ สำเร็จ

```json
{
    "success": true,
    "message": "Successfully delete 2 image(s) for model: user-profile-123",
    "data": {
        "modelName": "user-profile-123",
        "deleteCount": 2,
        "errors": [],
        "deletionType": "hard"
    }
}
```

### ⚠️ สำเร็จแต่มี Error บางส่วน

```json
{
    "success": true,
    "message": "Cleanup completed with some errors",
    "data": {
        "modelName": "user-profile-123", 
        "deleteCount": 1,
        "errors": [
            "Failed to delete image abc123 from Cloudflare"
        ],
        "deletionType": "hard"
    }
}
```

## Log Messages

### 📋 Console Logs

```
🗑️ Checking for old images to delete for model: user-profile-123
✅ Deleted old image: user-profile-123-1672531200000-123456.jpg for model: user-profile-123
✅ Deleted 2 old image(s) for model: user-profile-123
⚠️ Some errors occurred while deleting old images: [...]
❌ Error deleting old images: [error message]
```

### 🔍 Cloudflare Logs

```
✅ Image abc123 delete from Cloudflare successfully
❌ Failed to delete image from Cloudflare: [error details]
```

## การตั้งค่า Environment

ต้องมี Environment Variables:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
NEXT_PUBLIC_CLOUDFLARE_HASH=your_cloudflare_hash
```

## ข้อดี

1. **ประหยัดพื้นที่**: ไม่มีรูปเก่าสะสม
2. **ประหยัดค่าใช้จ่าย**: ลด storage cost ใน Cloudflare
3. **อัตโนมัติ**: ไม่ต้องลบ manual
4. **ปลอดภัย**: มี error handling และ logging

## ข้อควรระวัง

1. **ไม่สามารถกู้คืนได้**: รูปที่ลบถาวรจะกู้คืนไม่ได้
2. **ใช้เวลา**: การลบหลายรูปอาจใช้เวลานาน
3. **Network**: ต้องการการเชื่อมต่อ internet เพื่อลบจาก Cloudflare

## ตัวอย่างการใช้ในคอมโพเนนต์

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';

const MyComponent = () => {
    const { uploadImage, uploading, error } = useImageUpload();

    const handleUpload = async (file: File) => {
        // รูปเก่าจะถูกลบอัตโนมัติ
        const result = await uploadImage(file, {
            modelName: `user-profile-${userId}`,
            userId: currentUser.id
        });
        
        if (result.success) {
            console.log('Upload success:', result.data);
        }
    };

    return (
        <div>
            <input 
                type="file" 
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleUpload(e.target.files[0]);
                    }
                }}
            />
            {uploading && <p>กำลังอัพโหลด...</p>}
            {error && <p>Error: {error}</p>}
        </div>
    );
};
```

## สรุป

ระบบนี้ทำให้การจัดการรูปภาพเป็นไปอย่างอัตโนมัติและมีประสิทธิภาพ โดยไม่ต้องกังวลเรื่องรูปเก่าที่สะสมไว้ในระบบ 