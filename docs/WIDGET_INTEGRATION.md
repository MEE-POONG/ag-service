# 💬 AG Chat Widget - คู่มือการติดตั้งและใช้งาน

## 📖 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [การติดตั้ง](#การติดตั้ง)
3. [การกำหนดค่า](#การกำหนดค่า)
4. [API Reference](#api-reference)
5. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
6. [การปรับแต่ง](#การปรับแต่ง)
7. [คำถามที่พบบ่อย](#คำถามที่พบบ่อย)

---

## ภาพรวม

AG Chat Widget เป็น embeddable chat widget ที่ทำให้เว็บไซต์ของคุณสามารถมีระบบแชทแบบ real-time ได้ในทันที โดยไม่ต้องพัฒนาระบบแชทเอง

### ✨ ฟีเจอร์หลัก

- ✅ **Easy Integration** - ติดตั้งง่าย เพียง 2-3 บรรทัดโค้ด
- ✅ **Real-time Chat** - แชทแบบ real-time ด้วย WebSocket
- ✅ **Responsive Design** - รองรับทุกขนาดหน้าจอ (Desktop, Tablet, Mobile)
- ✅ **Customizable** - ปรับแต่งสี ข้อความ และตำแหน่งได้ตามต้องการ
- ✅ **Dark Mode** - รองรับโหมดมืดอัตโนมัติ
- ✅ **Unread Counter** - แสดงจำนวนข้อความที่ยังไม่ได้อ่าน
- ✅ **Customer Info** - ส่งข้อมูลลูกค้าเพื่อประสบการณ์ที่ดีขึ้น

---

## การติดตั้ง

### วิธีที่ 1: Basic Installation (แนะนำสำหรับผู้เริ่มต้น)

เพิ่มโค้ดนี้ก่อนปิด `</body>` tag ในหน้า HTML ของคุณ:

```html
<!-- AG Chat Widget -->
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'YOUR_WIDGET_KEY',
    apiUrl: 'https://your-domain.com'
  });
</script>
```

### วิธีที่ 2: With Customer Information

หากคุณมีข้อมูลผู้ใช้ (เช่น หลังจาก Login แล้ว) สามารถส่งข้อมูลได้:

```html
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'YOUR_WIDGET_KEY',
    apiUrl: 'https://your-domain.com',
    customer: {
      customerId: 'user-12345',
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      phone: '081-234-5678'
    }
  });
</script>
```

### วิธีที่ 3: With Real-time Support (Socket.io)

สำหรับการแชทแบบ real-time เพิ่ม Socket.io client:

```html
<!-- Socket.io for real-time updates -->
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>

<!-- AG Chat Widget -->
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'YOUR_WIDGET_KEY',
    apiUrl: 'https://your-domain.com',
    customer: {
      customerId: 'user-12345',
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com'
    }
  });
</script>
```

---

## การกำหนดค่า

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `widgetKey` | string | ✅ Yes | - | Widget key สำหรับยืนยันตัวตน |
| `apiUrl` | string | ✅ Yes | - | URL ของ AG Chat API |
| `customer` | object | ❌ No | `{}` | ข้อมูลลูกค้า |
| `customer.customerId` | string | ❌ No | auto-generated | รหัสลูกค้า (unique) |
| `customer.name` | string | ❌ No | 'Guest' | ชื่อลูกค้า |
| `customer.email` | string | ❌ No | - | อีเมล |
| `customer.phone` | string | ❌ No | - | เบอร์โทร |
| `customer.metadata` | object | ❌ No | `{}` | ข้อมูลเพิ่มเติมใดๆ |

### Widget Settings (จัดการผ่าน Admin Dashboard)

Widget settings สามารถกำหนดผ่าน Admin Dashboard และจะ auto-load ให้อัตโนมัติ:

- `primaryColor` - สีหลักของ widget (เช่น ปุ่ม, header)
- `accentColor` - สีเสริม
- `headerTitle` - หัวข้อที่แสดงบน header
- `headerSubtitle` - คำอธิบายใต้หัวข้อ
- `welcomeMessage` - ข้อความต้อนรับ
- `placeholderText` - ข้อความใน input box
- `position` - ตำแหน่ง widget (`bottom-right` หรือ `bottom-left`)
- `autoOpen` - เปิด widget อัตโนมัติเมื่อโหลดหน้า
- `showAgentAvatar` - แสดงรูปโปรไฟล์เจ้าหน้าที่
- `showTimestamp` - แสดงเวลาส่งข้อความ
- `enableFileUpload` - เปิดใช้การส่งไฟล์
- `enableEmoji` - เปิดใช้ emoji

---

## API Reference

### AGChat.init(config)

เริ่มต้นใช้งาน widget

```javascript
AGChat.init({
  widgetKey: 'YOUR_WIDGET_KEY',
  apiUrl: 'https://your-domain.com',
  customer: {
    customerId: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

**Returns:** `Promise<void>`

### AGChat.open()

เปิดหน้าต่างแชท

```javascript
AGChat.open();
```

### AGChat.close()

ปิดหน้าต่างแชท

```javascript
AGChat.close();
```

### AGChat.destroy()

ลบ widget ออกจากหน้าเว็บ

```javascript
AGChat.destroy();
```

---

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: Basic HTML Page

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>ยินดีต้อนรับสู่เว็บไซต์ของเรา</h1>
  <p>สามารถติดต่อเราผ่านแชทด้านล่างขวาได้เลย</p>

  <!-- AG Chat Widget -->
  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  <script src="https://your-domain.com/chat-widget.js"></script>
  <script>
    AGChat.init({
      widgetKey: 'demo-widget-key',
      apiUrl: 'https://your-domain.com'
    });
  </script>
</body>
</html>
```

### ตัวอย่างที่ 2: React Application

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load Socket.io
    const socketScript = document.createElement('script');
    socketScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
    document.body.appendChild(socketScript);

    // Load AG Chat Widget
    const widgetScript = document.createElement('script');
    widgetScript.src = 'https://your-domain.com/chat-widget.js';
    widgetScript.onload = () => {
      window.AGChat.init({
        widgetKey: 'YOUR_WIDGET_KEY',
        apiUrl: 'https://your-domain.com',
        customer: {
          customerId: 'user-123',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com'
        }
      });
    };
    document.body.appendChild(widgetScript);

    // Cleanup
    return () => {
      if (window.AGChat) {
        window.AGChat.destroy();
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>My React App</h1>
      {/* Your content */}
    </div>
  );
}

export default App;
```

### ตัวอย่างที่ 3: Vue.js Application

```vue
<template>
  <div id="app">
    <h1>My Vue App</h1>
    <!-- Your content -->
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.loadChatWidget();
  },
  beforeUnmount() {
    if (window.AGChat) {
      window.AGChat.destroy();
    }
  },
  methods: {
    loadChatWidget() {
      // Load Socket.io
      const socketScript = document.createElement('script');
      socketScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
      document.body.appendChild(socketScript);

      // Load widget
      const widgetScript = document.createElement('script');
      widgetScript.src = 'https://your-domain.com/chat-widget.js';
      widgetScript.onload = () => {
        window.AGChat.init({
          widgetKey: 'YOUR_WIDGET_KEY',
          apiUrl: 'https://your-domain.com',
          customer: {
            customerId: 'user-123',
            name: 'สมชาย ใจดี',
            email: 'somchai@example.com'
          }
        });
      };
      document.body.appendChild(widgetScript);
    }
  }
};
</script>
```

### ตัวอย่างที่ 4: WordPress

เพิ่มโค้ดนี้ใน `footer.php` ก่อน `</body>`:

```php
<!-- AG Chat Widget -->
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: '<?php echo get_option('ag_chat_widget_key'); ?>',
    apiUrl: 'https://your-domain.com',
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

### ตัวอย่างที่ 5: เปิด Widget ด้วยปุ่มของคุณเอง

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Custom Button Example</title>
  <style>
    .contact-button {
      position: fixed;
      bottom: 20px;
      left: 20px;
      padding: 12px 24px;
      background: #3B82F6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>My Website</h1>
  
  <!-- Your custom button -->
  <button class="contact-button" onclick="openChat()">
    💬 ติดต่อเรา
  </button>

  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  <script src="https://your-domain.com/chat-widget.js"></script>
  <script>
    // Initialize widget
    AGChat.init({
      widgetKey: 'YOUR_WIDGET_KEY',
      apiUrl: 'https://your-domain.com'
    });

    // Custom function to open chat
    function openChat() {
      AGChat.open();
    }
  </script>
</body>
</html>
```

---

## การปรับแต่ง

### Custom Colors

แม้ว่าสีจะตั้งค่าผ่าน admin dashboard แต่คุณสามารถ override ด้วย CSS ได้:

```html
<style>
  :root {
    --ag-chat-primary: #8B5CF6 !important;  /* สีม่วง */
    --ag-chat-accent: #F59E0B !important;   /* สีส้ม */
  }
</style>
```

### Custom Position

เปลี่ยนตำแหน่งของ widget:

```html
<style>
  .ag-chat-widget {
    bottom: 20px;
    left: 20px;      /* วางซ้าย */
    right: auto !important;
  }
</style>
```

### Hide Widget on Specific Pages

```html
<script>
  // อย่าแสดง widget ในหน้า checkout
  if (window.location.pathname !== '/checkout') {
    AGChat.init({
      widgetKey: 'YOUR_WIDGET_KEY',
      apiUrl: 'https://your-domain.com'
    });
  }
</script>
```

### Conditional Loading

```html
<script>
  // แสดง widget เฉพาะในเวลาทำการ
  const now = new Date();
  const hour = now.getHours();
  const isBusinessHours = hour >= 9 && hour < 18;

  if (isBusinessHours) {
    AGChat.init({
      widgetKey: 'YOUR_WIDGET_KEY',
      apiUrl: 'https://your-domain.com'
    });
  }
</script>
```

---

## คำถามที่พบบ่อย

### Q: จะได้ Widget Key ได้จากไหน?

A: ติดต่อผู้ดูแลระบบเพื่อขอ Widget Key หรือสร้างใน Admin Dashboard

### Q: รองรับ Browser อะไรบ้าง?

A: รองรับ Browser ทุกตัวที่ทันสมัย:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Q: ใช้งานฟรีหรือไม่?

A: ติดต่อผู้ดูแลระบบเพื่อขอข้อมูลราคา

### Q: Widget ส่งผลต่อความเร็วเว็บไซต์ไหม?

A: ไม่เท่าไหร่ เนื่องจาก:
- Script มีขนาดเล็ก (~15KB gzipped)
- โหลดแบบ async ไม่บล็อกหน้าเพจ
- CSS แยกไฟล์โหลดแบบ lazy

### Q: สามารถใช้กับ E-commerce ได้ไหม?

A: ได้ รองรับทุก platform:
- WooCommerce (WordPress)
- Shopify
- Magento
- Custom e-commerce

### Q: รองรับหลายภาษาไหม?

A: ใช่ ปัจจุบันรองรับ:
- ภาษาไทย
- English
- (เพิ่มได้ตามต้องการผ่าน settings)

### Q: มี Mobile App ไหม?

A: ปัจจุบันเป็น Web Widget สำหรับเจ้าหน้าที่ใช้ Admin Dashboard แต่ลูกค้าใช้ผ่าน widget บนเว็บได้ทั้ง desktop และ mobile

### Q: ข้อมูลการแชทเก็บที่ไหน?

A: เก็บในฐานข้อมูลของระบบ AG Chat ปลอดภัยและสามารถ export ได้

### Q: แชทได้กี่คนพร้อมกัน?

A: ไม่จำกัดจำนวนผู้ใช้ ขึ้นกับ plan และ server capacity

### Q: มี API สำหรับ developer ไหม?

A: ใช่ มี REST API และ WebSocket API สำหรับการพัฒนาขั้นสูง

---

## 🔧 Troubleshooting

### Widget ไม่แสดง

1. ตรวจสอบว่า script ถูก load หรือไม่ (เปิด Developer Console)
2. ตรวจสอบ Widget Key ถูกต้องหรือไม่
3. ตรวจสอบ CORS settings ของ server
4. ตรวจสอบว่าไม่มี JavaScript errors

### ข้อความส่งไม่ออก

1. ตรวจสอบ network connection
2. ตรวจสอบ API URL ถูกต้องหรือไม่
3. ดู Console logs เพื่อหา errors
4. ลอง refresh หน้าเว็บ

### Real-time ไม่ทำงาน

1. ตรวจสอบว่าได้ load Socket.io client หรือไม่
2. ตรวจสอบ WebSocket connection ใน Network tab
3. ตรวจสอบ Firewall/Proxy settings

---

## 📞 ติดต่อและสนับสนุน

หากมีปัญหาหรือต้องการความช่วยเหลือ:

- 📧 Email: support@your-domain.com
- 💬 Live Chat: https://your-domain.com/support
- 📚 Documentation: https://docs.your-domain.com
- 🐛 Report Issues: https://github.com/your-repo/issues

---

## 📄 License

Copyright © 2025 AG Chat. All rights reserved.

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Author:** AG Chat Team

