# Image Upload API Documentation

## Overview
ระบบ upload รูปภาพที่ปรับปรุงแล้ว รองรับการอัปโหลดรูปภาพไปยัง Cloudflare Images และบันทึกข้อมูลใน ImageList model

## Features
- ✅ **Single & Multiple Upload** - รองรับการอัปโหลดไฟล์เดียวหรือหลายไฟล์
- ✅ **Project Organization** - จัดกลุ่มรูปภาพตาม modelName/projectName
- ✅ **Cloudflare Integration** - อัปโหลดไปยัง Cloudflare Images พร้อม CDN
- ✅ **Image Variants** - สร้าง URL สำหรับรูปภาพหลายขนาด (thumbnail, small, medium, large)
- ✅ **Duplicate Protection** - ป้องกันไฟล์ซ้ำ (สามารถปิดได้)
- ✅ **Soft Delete** - ลบแบบ soft delete (มีตัวเลือกลบถาวร)
- ✅ **File Validation** - ตรวจสอบประเภทไฟล์และขนาด
- ✅ **Pagination** - รองรับการแบ่งหน้าและค้นหา
- ✅ **Error Handling** - จัดการข้อผิดพลาดอย่างครอบคลุม

## Environment Variables
```env
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
CLOUDFLARE_HASH="your-cloudflare-account-hash"
```

## API Endpoints

### 1. Upload Images
**POST** `/api/upload`

#### Single File Upload
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('modelName', 'project-name');
formData.append('userId', 'user-id');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

#### Multiple Files Upload
```javascript
const formData = new FormData();
files.forEach(file => {
  formData.append('files', file);
});
formData.append('modelName', 'project-name');
formData.append('userId', 'user-id');

const response = await fetch('/api/upload?multiple=true', {
  method: 'POST',
  body: formData
});
```

#### Request Parameters
- `file` (single) or `files` (multiple) - ไฟล์รูปภาพที่จะอัปโหลด
- `modelName` or `projectName` - ชื่อโปรเจคที่รูปภาพเป็นของ
- `userId` (optional) - ID ของผู้ใช้ที่อัปโหลด (default: 'system')
- `allowDuplicates` (optional) - อนุญาตให้อัปโหลดไฟล์ซ้ำ (default: false)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "generated-id",
      "imageId": "cloudflare-image-id",
      "imageUrl": "https://imagedelivery.net/account-hash/image-id/public",
      "thumbnailUrl": "https://imagedelivery.net/account-hash/image-id/thumbnail",
      "originalName": "example.jpg",
      "modelName": "project-name",
      "variants": {
        "public": "https://imagedelivery.net/account-hash/image-id/public",
        "thumbnail": "https://imagedelivery.net/account-hash/image-id/thumbnail",
        "small": "https://imagedelivery.net/account-hash/image-id/small",
        "medium": "https://imagedelivery.net/account-hash/image-id/medium",
        "large": "https://imagedelivery.net/account-hash/image-id/large"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "fileSize": 1024000,
      "metadata": {...}
    }
  ],
  "failed": [
    {
      "filename": "duplicate.jpg",
      "error": "File already exists"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1,
    "project": "project-name"
  },
  "message": "Upload completed: 1/2 files uploaded successfully (1 failed)"
}
```

### 2. Get Images
**GET** `/api/upload`

#### Query Parameters
- `modelName` - กรองตามชื่อโปรเจค
- `page` - หน้าที่ต้องการ (default: 1)
- `limit` - จำนวนรายการต่อหน้า (default: 20)
- `search` - ค้นหาจากชื่อไฟล์

#### Example
```javascript
const response = await fetch('/api/upload?modelName=project-name&page=1&limit=10');
```

#### Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 3. Delete Images
**DELETE** `/api/upload`

#### Request Body
```json
{
  "imageId": "image-id",
  "softDelete": true,
  "userId": "user-id"
}
```

#### Parameters
- `imageId` or `imageUrl` - ID หรือ URL ของรูปภาพที่จะลบ
- `softDelete` (optional) - ลบแบบ soft delete (default: true)
- `userId` (optional) - ID ของผู้ใช้ที่ลบ (default: 'system')

## Image Variants
ระบบสร้าง URL สำหรับรูปภาพหลายขนาดโดยอัตโนมัติ:

- **thumbnail** - 150px wide
- **small** - 320px wide  
- **medium** - 640px wide
- **large** - 1024px wide
- **public** - 1920px wide (original size)

## File Validation
- **Supported formats**: JPEG, PNG, GIF, WebP, SVG
- **Maximum file size**: 10MB
- **Maximum files per upload**: 10 files

## Error Handling
API จะคืนข้อผิดพลาดในรูปแบบต่อไปนี้:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Usage Examples

### React Component Example
```jsx
import React, { useState } from 'react';

const ImageUploader = ({ projectName }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  const handleUpload = async (files) => {
    setUploading(true);
    
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('modelName', projectName);
    
    try {
      const response = await fetch('/api/upload?multiple=true', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setImages(prev => [...prev, ...result.data]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files)}
        disabled={uploading}
      />
      
      <div className="grid grid-cols-4 gap-4">
        {images.map(img => (
          <img
            key={img.id}
            src={img.thumbnailUrl}
            alt={img.originalName}
            className="w-full h-32 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
};
```

### Next.js API Route Example
```javascript
// pages/api/my-upload.js
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Forward to upload API
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
      method: 'POST',
      body: req.body,
      headers: req.headers
    });
    
    const result = await uploadResponse.json();
    res.status(uploadResponse.status).json(result);
  }
}
```

## Database Schema
```prisma
model ImageList {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  imageUrl  String   // Cloudflare image ID
  modelName String?  // Project/module name
  nameFile  String   // Original filename
  createdAt DateTime @default(now())
  createdBy String
  updatedAt DateTime @updatedAt
  updatedBy String
  deleteBy  String?
}
```

## Key Benefits

1. **ไม่ต้อง Join ImageList** - URL ของรูปภาพสามารถใช้ได้ทันทีโดยไม่ต้องเชื่อมโยงกับ ImageList
2. **Project Organization** - จัดกลุ่มรูปภาพตามโปรเจคได้อย่างชัดเจน
3. **CDN Performance** - ใช้ Cloudflare Images CDN เพื่อประสิทธิภาพสูง
4. **Responsive Images** - รองรับรูปภาพหลายขนาดสำหรับการแสดงผลที่เหมาะสม
5. **Data Integrity** - ป้องกันไฟล์ซ้ำและจัดการข้อผิดพลาดอย่างครอบคลุม 