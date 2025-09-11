# Adjust Bet System Updates

## การอัพเดทล่าสุด

### 1. การเปลี่ยนแปลงใน Form

#### ฟิลด์ที่เปลี่ยนแปลง:
- **ชื่อ**: ไม่ต้องกรอก (สร้างอัตโนมัติจาก AG User ที่เลือก)
- **รหัสลูกค้า**: กรอกเอง (text input)
- **Username AG**: เอามาจาก AgUserAccountDB.username (ใช้ search autocomplete)
- **PIN/OTP**: ไม่ต้องกรอก (ว่างเปล่า)
- **Commission (Main, X12, Par, Other)**: Read Only

#### ฟิลด์ใหม่:
- **AG User Search**: Search autocomplete ที่แสดง AgUserAccountDB.username
- **Auto-generated Name**: สร้างชื่ออัตโนมัติจาก AG User ที่เลือก

### 2. การทำงานของ AG User Search

#### Features:
- **Search Autocomplete**: ค้นหาตาม username หรือ userLogin
- **Dropdown Display**: แสดงข้อมูล username, userLogin, webname, position
- **Auto Selection**: เลือก AG User แล้วจะ auto-fill ข้อมูล
- **Click Outside**: ปิด dropdown เมื่อคลิกข้างนอก

#### ข้อมูลที่แสดงใน Dropdown:
```
Username: ufh27oa1ufa66
User Login: ufh27oa10001 | Web: ufabet.com | Position: Agent
```

#### ข้อมูลที่แสดงเมื่อเลือกแล้ว:
```
เลือกแล้ว: ufh27oa1ufa66
User Login: ufh27oa10001 | Web: ufabet.com | Position: Agent
```

### 3. การสร้างชื่ออัตโนมัติ

เมื่อเลือก AG User ในโหมด Create:
- **ชื่อ**: `{username} - Adjust Bet`
- **คำอธิบาย**: `การตั้งค่าปรับเบทสำหรับ {username} ({customer})`

ตัวอย่าง:
- ชื่อ: `ufh27oa1ufa66 - Adjust Bet`
- คำอธิบาย: `การตั้งค่าปรับเบทสำหรับ ufh27oa1ufa66 (ufh27oa10001)`

### 4. การจัดการข้อมูล

#### Create Mode:
1. กรอกรหัสลูกค้า
2. เลือก AG User จาก dropdown
3. ระบบจะ auto-fill ชื่อและคำอธิบาย
4. ตั้งค่าเกมต่างๆ
5. บันทึก

#### Edit Mode:
1. ระบบจะโหลด AG User ที่เกี่ยวข้อง
2. แสดงข้อมูลเดิมใน dropdown
3. สามารถเปลี่ยน AG User ได้
4. แก้ไขการตั้งค่าต่างๆ
5. บันทึก

#### View Mode:
1. แสดงข้อมูลแบบ read-only
2. ไม่สามารถแก้ไขได้

### 5. การ Validation

#### ฟิลด์ที่จำเป็น:
- **รหัสลูกค้า**: ต้องกรอกรหัสลูกค้า
- **AG User**: ต้องเลือก AG User จาก dropdown

#### ฟิลด์ที่ไม่จำเป็น:
- ชื่อ (สร้างอัตโนมัติ)
- PIN/OTP (ว่างเปล่า)
- Commission (read-only)

### 6. API Integration

#### AG User Accounts API:
- **Endpoint**: `/api/aguseraccounts`
- **Method**: GET
- **Response**: รายการ AG User Accounts
- **Fields**: id, username, userLogin, webname, origin, position

#### Adjust Bet API:
- **Create**: ใช้ selectedAgUser.userLogin เป็น customer
- **Update**: รองรับการเปลี่ยน AG User
- **Data Structure**: เหมือนเดิม แต่ customer และ usernameAG มาจาก AG User

### 7. การใช้งาน

#### สร้าง Adjust Bet ใหม่:
1. ไปที่ `/bot-ag/adjust-bet`
2. คลิก "สร้างใหม่"
3. กรอกรหัสลูกค้า
4. ค้นหาและเลือก AG User
5. ระบบจะ auto-fill ชื่อและคำอธิบาย
6. ตั้งค่าเกมต่างๆ
7. คลิก "สร้าง"

#### แก้ไข Adjust Bet:
1. คลิกปุ่ม "แก้ไข" ในรายการ
2. ระบบจะโหลด AG User ที่เกี่ยวข้อง
3. สามารถเปลี่ยน AG User ได้
4. แก้ไขการตั้งค่าต่างๆ
5. คลิก "บันทึก"

### 8. ตัวอย่างการใช้งาน

#### การเลือก AG User:
```typescript
// ค้นหา AG User
const searchTerm = "ufh27oa1";
const filteredUsers = agUserAccounts.filter(agUser =>
  agUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
  agUser.userLogin.toLowerCase().includes(searchTerm.toLowerCase())
);

// เลือก AG User
const selectedUser = {
  id: "507f1f77bcf86cd799439011",
  username: "ufh27oa1ufa66",
  userLogin: "ufh27oa10001",
  webname: "ufabet.com",
  position: "Agent"
};

// Auto-generate name
const autoName = `${selectedUser.username} - Adjust Bet`;
const autoDescription = `การตั้งค่าปรับเบทสำหรับ ${selectedUser.username} (${selectedUser.userLogin})`;
```

#### การสร้าง Adjust Bet:
```typescript
const adjustBetData = {
  name: "ufh27oa1ufa66 - Adjust Bet",
  description: "การตั้งค่าปรับเบทสำหรับ ufh27oa1ufa66 (ufh27oa10001)",
  data: {
    customer: "ufh27oa10001", // จาก formData.customer
    usernameAG: "ufh27oa1ufa66", // จาก selectedAgUser.username
    agBaseUrl: "https://ag.ufabet.com",
    pinUsed: "", // ว่างเปล่า
    sportsbook: {
      enabled: true,
      commission: {
        main: 0, // read-only
        x12: 0, // read-only
        par: 0, // read-only
        other: 0 // read-only
      },
      limits: {
        // ตั้งค่าได้
      }
    }
    // ... เกมอื่นๆ
  }
};
```

### 9. การแก้ไขปัญหา

#### ปัญหาที่พบบ่อย:
1. **"กรุณากรอกรหัสลูกค้า"**: ยังไม่ได้กรอกรหัสลูกค้า
2. **"กรุณาเลือก AG User"**: ยังไม่ได้เลือก AG User
3. **Dropdown ไม่แสดง**: ตรวจสอบการเชื่อมต่อ API
4. **ข้อมูลไม่ตรง**: ตรวจสอบการ mapping ข้อมูล

#### การแก้ไข:
1. กรอกรหัสลูกค้าในช่อง text input
2. เลือก AG User จาก dropdown
3. ตรวจสอบ network tab ใน browser
4. ตรวจสอบการ mapping ข้อมูลใน code

### 10. การทดสอบ

#### Test Cases:
1. **สร้างใหม่**: กรอกรหัสลูกค้า, เลือก AG User และสร้าง Adjust Bet
2. **แก้ไข**: แก้ไข Adjust Bet ที่มีอยู่
3. **ดูข้อมูล**: ดูรายละเอียด Adjust Bet
4. **ค้นหา**: ค้นหา AG User ใน dropdown
5. **Validation**: ทดสอบ validation rules

#### Expected Results:
- ชื่อสร้างอัตโนมัติ
- รหัสลูกค้าสามารถกรอกได้
- Commission เป็น read-only
- PIN/OTP ว่างเปล่า
- AG User search ทำงานได้
- ข้อมูลถูกต้อง

### 11. การอัพเดทในอนาคต

#### Features ที่อาจเพิ่ม:
1. **Bulk Import**: นำเข้าข้อมูลหลายรายการ
2. **Template System**: ระบบ template สำหรับการตั้งค่า
3. **History Tracking**: ติดตามประวัติการเปลี่ยนแปลง
4. **Export/Import**: ส่งออก/นำเข้าข้อมูล

#### การปรับปรุง:
1. **Performance**: ปรับปรุงความเร็วการค้นหา
2. **UI/UX**: ปรับปรุงการใช้งาน
3. **Validation**: เพิ่ม validation rules
4. **Error Handling**: ปรับปรุงการจัดการ error
