# ✅ AG Chat Widget - การติดตั้งเสร็จสมบูรณ์

## 📦 สิ่งที่ได้สร้างขึ้น

### 1. 🔌 Public API Endpoints

สร้าง API endpoints สำหรับให้เว็บอื่นใช้งาน widget:

- **`/api/widget/init`** - Initialize widget และสร้าง customer session
- **`/api/widget/conversation`** - จัดการ conversations (GET/POST)
- **`/api/widget/messages`** - ส่งและรับข้อความ (GET/POST)

📁 ไฟล์:
```
pages/api/widget/
├── init.ts           # เริ่มต้น widget
├── conversation.ts   # จัดการ conversation
└── messages.ts       # ส่ง/รับข้อความ
```

### 2. 💻 Chat Widget SDK

สร้าง JavaScript SDK ที่เว็บอื่นสามารถฝังได้:

- **`chat-widget.js`** - Main widget script (~15KB)
- **`chat-widget.css`** - Widget styles
- รองรับ Real-time ด้วย Socket.io
- Responsive design
- Dark mode support
- Customizable colors

📁 ไฟล์:
```
public/
├── chat-widget.js    # Widget SDK
├── chat-widget.css   # Widget styles
└── widget-demo.html  # Demo page
```

### 3. 📚 Documentation

สร้าง documentation ภาษาไทยครบถ้วน:

- **Quick Start Guide** - เริ่มใช้งานใน 5 นาที
- **Full Integration Guide** - คู่มือแบบเต็ม
- **Widget README** - ภาพรวมของ widget
- **Demo Page** - หน้า demo พร้อมตัวอย่าง

📁 ไฟล์:
```
├── WIDGET_README.md
├── docs/
│   ├── WIDGET_QUICKSTART.md
│   ├── WIDGET_INTEGRATION.md
│   └── ...
└── public/
    └── widget-demo.html
```

---

## 🚀 วิธีใช้งาน (สำหรับเว็บอื่น)

### ขั้นตอนที่ 1: เปิด Server

```bash
# Development
npm run dev
# หรือ
pnpm dev

# Production
npm run build
npm start
```

### ขั้นตอนที่ 2: ทดสอบ Demo

เปิดเว็บเบราว์เซอร์:
```
http://localhost:3000/widget-demo.html
```

### ขั้นตอนที่ 3: นำ Widget ไปใช้ในเว็บอื่น

ให้เว็บอื่นเพิ่มโค้ดนี้ในหน้าเว็บ:

```html
<!-- Socket.io (สำหรับ Real-time) -->
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>

<!-- AG Chat Widget -->
<script src="http://localhost:3000/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'demo-widget-key',
    apiUrl: 'http://localhost:3000',
    customer: {
      customerId: 'user-12345',
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com'
    }
  });
</script>
```

---

## 🎨 ฟีเจอร์ที่รองรับ

### ✅ Core Features

- [x] Real-time chat ด้วย Socket.io
- [x] Send/receive messages
- [x] Create conversations
- [x] Customer information support
- [x] Responsive design
- [x] Dark mode
- [x] Unread badge
- [x] Typing indicators ready
- [x] Online status ready

### ✅ UI/UX Features

- [x] Modern, clean design
- [x] Smooth animations
- [x] Mobile responsive
- [x] Customizable colors
- [x] Welcome message
- [x] Auto-scroll
- [x] Loading states
- [x] Error handling

### ✅ Integration Features

- [x] Easy embed (2-3 lines)
- [x] Customer info tracking
- [x] CORS enabled
- [x] Token-based auth
- [x] Cross-domain support

---

## 📖 Documentation Links

1. **Quick Start** → `docs/WIDGET_QUICKSTART.md`
   - เริ่มใช้งานใน 5 นาที
   - ตัวอย่างโค้ดพร้อมใช้
   - ใช้กับ WordPress, React, Vue.js, Next.js

2. **Full Guide** → `docs/WIDGET_INTEGRATION.md`
   - การติดตั้งแบบละเอียด
   - API Reference
   - Customization
   - Troubleshooting
   - FAQ

3. **Widget README** → `WIDGET_README.md`
   - ภาพรวมของ widget
   - Features list
   - Performance metrics
   - Browser support

4. **Demo Page** → `public/widget-demo.html`
   - ทดสอบ widget
   - ตัวอย่างการใช้งานจริง
   - Interactive examples

---

## 🧪 การทดสอบ

### ทดสอบบนเครื่อง Local

1. เปิด server (http://localhost:3000)
2. เปิด demo page: http://localhost:3000/widget-demo.html
3. คลิกปุ่มแชท ทดสอบส่งข้อความ

### ทดสอบบนเว็บอื่น

สร้างไฟล์ `test.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Test Widget</title>
</head>
<body>
  <h1>ทดสอบ AG Chat Widget</h1>

  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  <script src="http://localhost:3000/chat-widget.js"></script>
  <script>
    AGChat.init({
      widgetKey: 'demo-widget-key',
      apiUrl: 'http://localhost:3000',
      customer: {
        customerId: 'test-' + Date.now(),
        name: 'ทดสอบ',
        email: 'test@example.com'
      }
    });
  </script>
</body>
</html>
```

เปิดไฟล์นี้ในเบราว์เซอร์ → Widget จะปรากฏและใช้งานได้!

---

## 🎯 ตัวอย่างการใช้งานกับ Frameworks

### React

```jsx
useEffect(() => {
  const socketScript = document.createElement('script');
  socketScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
  document.body.appendChild(socketScript);

  const widgetScript = document.createElement('script');
  widgetScript.src = 'http://localhost:3000/chat-widget.js';
  widgetScript.onload = () => {
    window.AGChat.init({
      widgetKey: 'demo-widget-key',
      apiUrl: 'http://localhost:3000'
    });
  };
  document.body.appendChild(widgetScript);

  return () => window.AGChat?.destroy();
}, []);
```

### Vue.js

```vue
<script>
export default {
  mounted() {
    this.loadChatWidget();
  },
  beforeUnmount() {
    window.AGChat?.destroy();
  },
  methods: {
    loadChatWidget() {
      const socketScript = document.createElement('script');
      socketScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
      document.body.appendChild(socketScript);

      const widgetScript = document.createElement('script');
      widgetScript.src = 'http://localhost:3000/chat-widget.js';
      widgetScript.onload = () => {
        window.AGChat.init({
          widgetKey: 'demo-widget-key',
          apiUrl: 'http://localhost:3000'
        });
      };
      document.body.appendChild(widgetScript);
    }
  }
};
</script>
```

### WordPress

เพิ่มใน `footer.php`:

```php
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script src="http://localhost:3000/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'demo-widget-key',
    apiUrl: 'http://localhost:3000',
    <?php if (is_user_logged_in()): ?>
    customer: {
      customerId: '<?php echo get_current_user_id(); ?>',
      name: '<?php echo wp_get_current_user()->display_name; ?>',
      email: '<?php echo wp_get_current_user()->user_email; ?>'
    }
    <?php endif; ?>
  });
</script>
```

---

## 🔧 Configuration Options

```javascript
AGChat.init({
  // Required
  widgetKey: 'YOUR_WIDGET_KEY',  // Widget key สำหรับยืนยันตัวตน
  apiUrl: 'https://meetanggroup.com',  // URL ของ AG Chat API

  // Optional - Customer info
  customer: {
    customerId: 'user-123',      // รหัสลูกค้า (unique)
    name: 'John Doe',            // ชื่อ
    email: 'john@example.com',   // อีเมล
    phone: '081-234-5678',       // เบอร์โทร
    metadata: {                  // ข้อมูลเพิ่มเติมใดๆ
      plan: 'premium',
      customField: 'value'
    }
  }
});
```

---

## 🎨 Customization

### เปลี่ยนสี

```html
<style>
  :root {
    --ag-chat-primary: #8B5CF6 !important;  /* สีม่วง */
    --ag-chat-accent: #F59E0B !important;   /* สีส้ม */
  }
</style>
```

### เปลี่ยนตำแหน่ง

```html
<style>
  .ag-chat-widget {
    left: 20px !important;    /* วางซ้าย */
    right: auto !important;
  }
</style>
```

### ใช้ปุ่มของคุณเอง

```html
<button onclick="AGChat.open()">
  💬 ติดต่อเรา
</button>
```

---

## 📊 API Endpoints

### POST /api/widget/init
Initialize widget และสร้าง customer session

**Request:**
```json
{
  "widgetKey": "demo-widget-key",
  "customerInfo": {
    "customerId": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "widgetId": "demo-widget-key",
    "settings": { ... },
    "customerId": "mongodb-id",
    "token": "base64-encoded-token"
  }
}
```

### GET /api/widget/conversation
ดึง conversation ที่ active

**Headers:**
```
X-Widget-Token: {token}
```

### POST /api/widget/messages
ส่งข้อความ

**Headers:**
```
X-Widget-Token: {token}
```

**Request:**
```json
{
  "conversationId": "conv-id",
  "content": "Hello!",
  "messageType": "text"
}
```

---

## ⚠️ สิ่งที่ต้องทำก่อน Deploy Production

### 1. Widget Key Management

ปัจจุบัน accept ทุก widget key เพื่อการ dev  
**ใน production ต้อง:**
- สร้างระบบจัดการ widget keys
- Validate widget key กับ registered domains
- Rate limiting

### 2. Security

- [ ] Implement proper JWT token validation
- [ ] Add rate limiting
- [ ] Validate CORS origins
- [ ] Secure WebSocket connections (WSS)
- [ ] Input sanitization

### 3. Performance

- [ ] CDN สำหรับ widget files
- [ ] Caching strategy
- [ ] Database indexing
- [ ] Load testing

### 4. Monitoring

- [ ] Error tracking (Sentry)
- [ ] Analytics
- [ ] Performance monitoring
- [ ] Uptime monitoring

---

## 🐛 Troubleshooting

### TypeScript Errors?

```bash
# Regenerate Prisma client
npx prisma generate

# ลบ TypeScript cache
rm -f tsconfig.tsbuildinfo

# Restart TypeScript server
# ใน VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Widget ไม่แสดง?

1. ตรวจสอบ Console errors (F12)
2. ตรวจสอบ Network tab
3. ตรวจสอบ CORS settings
4. ลอง hard refresh (Cmd+Shift+R)

### Real-time ไม่ทำงาน?

1. ตรวจสอบว่าได้ load Socket.io client
2. ดู WebSocket connection ใน Network tab
3. ตรวจสอบ server.js กำลังรันอยู่

---

## 📞 Support

หากมีปัญหาหรือคำถาม:

- 📧 Email: support@your-domain.com
- 💬 Live Chat: เปิด widget-demo.html แล้วแชท
- 📚 Docs: อ่าน documentation ใน `docs/`

---

## ✨ Next Steps

1. **ทดสอบ widget** → เปิด `http://localhost:3000/widget-demo.html`
2. **อ่าน docs** → เปิด `docs/WIDGET_QUICKSTART.md`
3. **ทดสอบบนเว็บอื่น** → ใช้โค้ดตัวอย่างข้างบน
4. **Customize** → แก้สี ข้อความ ตามต้องการ
5. **Deploy** → เตรียม production deployment

---

## 🎉 สรุป

คุณได้:
- ✅ Public API endpoints สำหรับ widget
- ✅ Chat Widget SDK (JavaScript + CSS)
- ✅ Real-time support ด้วย Socket.io
- ✅ Responsive design
- ✅ Documentation ภาษาไทยครบถ้วน
- ✅ Demo page พร้อมใช้
- ✅ ตัวอย่างการใช้งานกับ frameworks ต่างๆ

**ระบบพร้อมใช้งานแล้ว! 🚀**

---

**Created:** October 12, 2025  
**Version:** 1.0.0  
**Author:** AG Chat Team

