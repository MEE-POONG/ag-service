# 🚀 AG Chat Widget - Quick Start Guide

## เริ่มใช้งานใน 5 นาที!

### ขั้นตอนที่ 1: รับ Widget Key

ติดต่อผู้ดูแลระบบหรือสร้าง Widget Key ผ่าน Admin Dashboard

### ขั้นตอนที่ 2: เพิ่มโค้ดในเว็บไซต์

เพิ่มโค้ดนี้ก่อนปิด `</body>` tag:

```html
<!-- Socket.io สำหรับ Real-time (แนะนำ) -->
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>

<!-- AG Chat Widget -->
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'YOUR_WIDGET_KEY',
    apiUrl: 'https://your-domain.com'
  });
</script>
```

### ขั้นตอนที่ 3: ทดสอบ

1. เปิดเว็บไซต์ของคุณ
2. คุณจะเห็นปุ่มแชทที่มุมขวาล่าง
3. คลิกเพื่อเปิดหน้าต่างแชท
4. ส่งข้อความทดสอบ

✅ **เสร็จแล้ว!** ระบบแชทพร้อมใช้งาน

---

## การเพิ่มข้อมูลลูกค้า (Optional แต่แนะนำ)

หากเว็บไซต์ของคุณมีระบบ Login สามารถส่งข้อมูลผู้ใช้ได้:

```html
<script>
  AGChat.init({
    widgetKey: 'YOUR_WIDGET_KEY',
    apiUrl: 'https://your-domain.com',
    customer: {
      customerId: 'user-12345',    // รหัสลูกค้าในระบบของคุณ
      name: 'สมชาย ใจดี',          // ชื่อ
      email: 'somchai@example.com', // อีเมล
      phone: '081-234-5678'         // เบอร์โทร (optional)
    }
  });
</script>
```

**ประโยชน์:**
- เจ้าหน้าที่รู้ว่ากำลังคุยกับใคร
- ไม่ต้องถามข้อมูลซ้ำ
- ติดตามประวัติการสนทนาได้
- ประสบการณ์ที่ดีกว่า

---

## ตัวอย่างแบบเต็ม

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
  <p>มีคำถาม? คลิกปุ่มแชทด้านล่างขวาเพื่อสอบถาม!</p>

  <!-- Your content here -->

  <!-- AG Chat Widget -->
  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
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
</body>
</html>
```

---

## การใช้งานกับ Popular Platforms

### WordPress

เพิ่มใน `footer.php` ก่อน `</body>`:

```php
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'YOUR_WIDGET_KEY',
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

### React

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load scripts
    const socketScript = document.createElement('script');
    socketScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
    document.body.appendChild(socketScript);

    const widgetScript = document.createElement('script');
    widgetScript.src = 'https://your-domain.com/chat-widget.js';
    widgetScript.onload = () => {
      window.AGChat.init({
        widgetKey: 'YOUR_WIDGET_KEY',
        apiUrl: 'https://your-domain.com'
      });
    };
    document.body.appendChild(widgetScript);

    return () => {
      if (window.AGChat) window.AGChat.destroy();
    };
  }, []);

  return <div>Your App</div>;
}
```

### Vue.js

```vue
<template>
  <div id="app">
    <!-- Your content -->
  </div>
</template>

<script>
export default {
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
      const socketScript = document.createElement('script');
      socketScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
      document.body.appendChild(socketScript);

      const widgetScript = document.createElement('script');
      widgetScript.src = 'https://your-domain.com/chat-widget.js';
      widgetScript.onload = () => {
        window.AGChat.init({
          widgetKey: 'YOUR_WIDGET_KEY',
          apiUrl: 'https://your-domain.com'
        });
      };
      document.body.appendChild(widgetScript);
    }
  }
};
</script>
```

### Next.js

```jsx
// pages/_app.js
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Load Socket.io
    const socketScript = document.createElement('script');
    socketScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
    document.body.appendChild(socketScript);

    // Load Widget
    const widgetScript = document.createElement('script');
    widgetScript.src = 'https://your-domain.com/chat-widget.js';
    widgetScript.onload = () => {
      window.AGChat?.init({
        widgetKey: process.env.NEXT_PUBLIC_WIDGET_KEY,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      });
    };
    document.body.appendChild(widgetScript);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

---

## Tips & Best Practices

### 1. ใช้ Real-time สำหรับประสบการณ์ที่ดีที่สุด

```html
<!-- เพิ่ม Socket.io -->
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
```

### 2. ส่งข้อมูลลูกค้าเสมอเมื่อมี

```javascript
customer: {
  customerId: 'unique-id',
  name: 'ชื่อลูกค้า',
  email: 'email@example.com'
}
```

### 3. Hide Widget บนหน้าที่ไม่ต้องการ

```javascript
// อย่าแสดง widget ในหน้า checkout
if (window.location.pathname !== '/checkout') {
  AGChat.init({ ... });
}
```

### 4. ใช้ปุ่มของคุณเองแทนปุ่ม default

```html
<button onclick="AGChat.open()">
  💬 ติดต่อเรา
</button>
```

### 5. Custom Colors ให้เข้ากับแบรนด์

```html
<style>
  :root {
    --ag-chat-primary: #YOUR_COLOR !important;
  }
</style>
```

---

## Troubleshooting

### Widget ไม่แสดง?

1. ✅ ตรวจสอบ Widget Key ถูกต้อง
2. ✅ ตรวจสอบ API URL ถูกต้อง
3. ✅ เปิด Console ดู errors (F12)
4. ✅ ลอง refresh หน้าเว็บ

### ข้อความส่งไม่ออก?

1. ✅ ตรวจสอบ internet connection
2. ✅ ดู Console logs
3. ✅ ตรวจสอบ CORS settings

### Real-time ไม่ทำงาน?

1. ✅ ตรวจสอบว่าได้ load Socket.io หรือไม่
2. ✅ ดู Network tab ใน DevTools
3. ✅ ตรวจสอบ WebSocket connection

---

## Next Steps

- 📖 [อ่าน Documentation ฉบับเต็ม](./WIDGET_INTEGRATION.md)
- 🎨 [ดูตัวอย่าง Demo](../public/widget-demo.html)
- 💻 [ศึกษา API Reference](./WIDGET_INTEGRATION.md#api-reference)
- 🎯 [เรียนรู้การปรับแต่ง](./WIDGET_INTEGRATION.md#การปรับแต่ง)

---

## ต้องการความช่วยเหลือ?

- 📧 Email: support@your-domain.com
- 💬 Live Chat: https://your-domain.com/support
- 📚 Docs: https://docs.your-domain.com

---

**Happy Chatting! 💬✨**

