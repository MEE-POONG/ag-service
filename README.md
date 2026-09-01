# AG-DB Portal

ระบบจัดการฐานข้อมูลและผู้ใช้ AG ที่ครบครัน พร้อมระบบสิทธิ์และการจัดการผู้ดูแลระบบ

## คุณสมบัติหลัก

### 🔐 ระบบ Authentication
- การเข้าสู่ระบบด้วย username/password
- ระบบ JWT Token
- การจัดการ session
- ระบบ Log การใช้งาน

### 👥 การจัดการผู้ใช้
- จัดการข้อมูลผู้ใช้ทั่วไป (UserDB)
- จัดการผู้ดูแลระบบ (AdminDB)
- จัดการผู้ใช้ AG (AGUserDB)
- ระบบสิทธิ์และการเข้าถึง

### 🏢 ระบบองค์กร
- จัดการแผนก (AdminDepartmentDB)
- จัดการตำแหน่ง (AdminPositionDB)
- ระบบสิทธิ์เริ่มต้นตามตำแหน่ง

### 🗂️ ระบบเมนูและสิทธิ์
- จัดการเมนูและหน้าของเว็บ
- ระบบสิทธิ์การเข้าถึง (CRUD)
- การจัดการเมนูแบบลำดับชั้น

### 📊 ระบบฐานข้อมูล
- จัดการฐานข้อมูลเว็บ (WebBaseDB)
- ระบบจัดการไฟล์รูปภาพ
- ประวัติการใช้งาน (Activity Log)

## โครงสร้างฐานข้อมูล

### ตารางหลัก
- **UserDB**: ผู้ใช้ทั่วไป
- **AdminDB**: ผู้ดูแลระบบ
- **AGUserDB**: ผู้ใช้ AG
- **WebBaseDB**: ฐานข้อมูลเว็บ

### ตารางระบบสิทธิ์
- **AdminDepartmentDB**: แผนก
- **AdminPositionDB**: ตำแหน่ง
- **AdminDefaultPermissionDB**: สิทธิ์เริ่มต้น
- **MenuWebDB**: เมนูและหน้า

### ตารางเสริม
- **ImageList**: จัดการไฟล์รูปภาพ
- **ActivityLogDB**: ประวัติการใช้งาน

## การติดตั้ง

### วิธีที่ 1: การติดตั้งแบบ Local Development

#### 1. ติดตั้ง Dependencies
```bash
npm install
```

#### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และกำหนดค่าต่อไปนี้:
```env
DATABASE_URL="mongodb://localhost:27017/ag-db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-here"
```

#### 3. ตั้งค่าฐานข้อมูล
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# สร้างข้อมูลเริ่มต้น
npm run db:seed

# Open Prisma Studio (optional)
npm run db:studio
```

#### 4. รันแอปพลิเคชัน
```bash
npm run dev
```

### วิธีที่ 2: การติดตั้งแบบ Docker (แนะนำ)

#### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd ag-db
```

#### 2. รันด้วย Docker Compose
```bash
# สร้างและรัน containers
docker-compose up -d

# ดู logs
docker-compose logs -f

# หยุดการทำงาน
docker-compose down
```

#### 3. เข้าถึงแอปพลิเคชัน
- **AG-DB Portal**: http://localhost:3000
- **MongoDB Express**: http://localhost:8081 (admin/password123)

#### 4. สร้างข้อมูลเริ่มต้น (หลังจากรัน Docker)
```bash
# เข้าไปใน container
docker exec -it ag-db-portal sh

# รัน seed script
npm run db:seed
```

## การใช้งาน

### 1. เข้าสู่ระบบ
- ไปที่ `http://localhost:3000`
- คลิก "เข้าสู่ระบบ"
- กรอก username และ password

### ข้อมูลการเข้าสู่ระบบเริ่มต้น:
- **Super Admin**: `superadmin` / `admin123`
- **Admin**: `admin` / `admin123`
- **User**: `user` / `admin123`
- **AG User**: `aguser` / `admin123`

### 2. หน้า Dashboard
- แสดงเมนูหลักตามสิทธิ์ของผู้ใช้
- จัดการผู้ใช้ ระบบ Admin ฐานข้อมูล AG
- ดูประวัติการใช้งาน

### 3. จัดการผู้ใช้
- เพิ่ม/แก้ไข/ลบผู้ใช้
- เปลี่ยนสถานะการใช้งาน
- จัดการข้อมูลส่วนตัว

### 4. ระบบ Admin
- จัดการผู้ดูแลระบบ
- จัดการแผนกและตำแหน่ง
- กำหนดสิทธิ์การเข้าถึง

## โครงสร้างโปรเจค

```
ag-db/
├── app/
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentication APIs
│   │   └── users/          # User management APIs
│   ├── admin/              # Admin pages
│   ├── auth/               # Auth pages
│   ├── dashboard/          # Dashboard
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── lib/
│   ├── auth.ts             # Authentication utilities
│   └── prisma.ts           # Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Docker image
├── package.json
├── tailwind.config.js
└── README.md
```

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **ORM**: Prisma
- **Authentication**: JWT, bcryptjs
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form, Zod
- **Notifications**: React Hot Toast
- **Containerization**: Docker, Docker Compose

## การพัฒนา

### สร้าง API Route ใหม่
```bash
# สร้างไฟล์ใน app/api/[route]/route.ts
```

### สร้างหน้าใหม่
```bash
# สร้างไฟล์ใน app/[page]/page.tsx
```

### อัพเดท Schema
```bash
# แก้ไข prisma/schema.prisma
npm run db:generate
npm run db:push
```

### รัน Seed Script
```bash
# สร้างข้อมูลเริ่มต้น
npm run db:seed
```

## การ Deploy

### Vercel
1. Push code ไปยัง GitHub
2. เชื่อมต่อกับ Vercel
3. ตั้งค่า Environment Variables
4. Deploy

### Docker Production
```bash
# Build production image
docker build -t ag-db-portal:latest .

# Run with production environment
docker run -d \
  --name ag-db-portal \
  -p 10001:3000 \
  -e DATABASE_URL="your-mongodb-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e JWT_SECRET="your-jwt-secret" \
  ag-db-portal:latest
```

Production เปิดใช้งานผ่าน host port `10001` ส่วนแอปภายใน container ยังคงฟังที่ port `3000`

### Docker Compose Production
```bash
# สร้างไฟล์ docker-compose.prod.yml
# และรันด้วย
docker-compose -f docker-compose.prod.yml up -d
```

## การจัดการฐานข้อมูล

### MongoDB Express
- เข้าถึงได้ที่ http://localhost:8081
- Username: admin
- Password: password123

### Prisma Studio
```bash
npm run db:studio
```

### Backup Database
```bash
# Backup
docker exec ag-db-mongodb mongodump --out /backup

# Restore
docker exec ag-db-mongodb mongorestore /backup
```

## การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อฐานข้อมูล
1. ตรวจสอบ DATABASE_URL ใน .env.local
2. ตรวจสอบว่า MongoDB กำลังทำงาน
3. ตรวจสอบ firewall settings

### ปัญหา Docker
```bash
# ลบ containers และ volumes
docker-compose down -v

# สร้างใหม่
docker-compose up -d --build
```

### ปัญหา Prisma
```bash
# Reset database
npm run db:push --force-reset

# Regenerate client
npm run db:generate
```

## การสนับสนุน

หากมีปัญหาหรือคำถาม กรุณาสร้าง Issue ใน GitHub repository

## License

MIT License
