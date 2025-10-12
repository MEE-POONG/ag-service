# 🔔 Notification System Documentation

## Overview

The AG Service notification system provides **two types of notifications**:

1. **In-App Notifications** - Notifications within the application UI
2. **Web Push Notifications (PWA)** - Browser push notifications that work even when the app is closed

Both systems are integrated with the chat system and work together to ensure agents never miss important updates.

---

## 📱 Features

### In-App Notifications
- ✅ Real-time notification dropdown in header
- ✅ Unread badge counter
- ✅ Mark as read/unread
- ✅ Click to navigate to relevant page
- ✅ Delete individual or all notifications
- ✅ Auto-expiration support
- ✅ Socket.io real-time updates

### Web Push Notifications (PWA)
- ✅ Browser push notifications
- ✅ Works when app is closed
- ✅ Click to open specific page
- ✅ Action buttons
- ✅ Persistent until dismissed
- ✅ Works offline (queued)
- ✅ Multi-device support

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Event Occurs                    │
│  (New Message, Assignment, etc.)        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Notification Creators              │
│  lib/notifications.ts                   │
│  lib/pushNotifications.ts               │
└─────────────┬───────────────────────────┘
              │
              ├──────────────┬─────────────┐
              ▼              ▼             ▼
      ┌──────────┐   ┌──────────┐  ┌──────────┐
      │ Database │   │ Socket.io│  │ Web Push │
      │  Save    │   │ Real-time│  │  Send    │
      └──────────┘   └──────────┘  └──────────┘
              │              │             │
              └──────────────┴─────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │    User Receives        │
              │  - In-app notification  │
              │  - Push notification    │
              └─────────────────────────┘
```

---

## 📁 File Structure

```
├── prisma/schema.prisma
│   ├── NotificationDB          # In-app notifications
│   └── PushSubscriptionDB      # Push subscriptions
├── pages/api/
│   ├── notifications/
│   │   ├── index.ts           # CRUD for notifications
│   │   └── count.ts           # Get unread count
│   └── push/
│       ├── vapid-key.ts       # Get VAPID public key
│       ├── subscribe.ts       # Subscribe to push
│       ├── unsubscribe.ts     # Unsubscribe from push
│       └── send.ts            # Send push notification
├── lib/
│   ├── notifications.ts       # In-app notification helpers
│   └── pushNotifications.ts   # Push notification helpers
├── hooks/
│   └── usePushNotifications.ts # Push notification hook
├── components/
│   ├── NotificationCenter.tsx      # In-app dropdown
│   └── PushNotificationSettings.tsx # Push settings UI
└── public/
    ├── manifest.json          # PWA manifest
    └── sw.js                  # Service worker
```

---

## 🚀 Setup

### 1. Environment Variables

Add to `.env` or `.env.local`:

```env
# VAPID Keys (generated earlier)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BERLvRjokEs1WnMLJBjMWq53xmtVu_4PMS-0NPMyAKziFoNEcYzIeByDhPL7sNWhMsGnIicOeSYd8R0TLvNewdQ
VAPID_PRIVATE_KEY=XbMtyZWDStyi0gfbEW25CjNkntMzb49mlA5tio_u3lg
VAPID_EMAIL=mailto:your-email@example.com
```

**Security**: Never commit `.env` files! Keep private keys secret.

### 2. Database Migration

Run Prisma migration to create tables:

```bash
pnpm db:push
# or
pnpm db:generate && prisma db push
```

### 3. PWA Icons

Create app icons in `/public/`:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

**Tip**: Use tools like [PWA Image Generator](https://www.pwabuilder.com/imageGenerator) to create icons.

---

## 💻 Usage

### In-App Notifications

#### Automatic (Chat Events)

Notifications are automatically created for:
- New messages
- Conversation assignments
- New conversations

#### Manual Creation

```typescript
import { createNotification } from '@/lib/notifications'

await createNotification({
  userId: 'user-id',
  type: 'info',
  title: 'Test Notification',
  message: 'This is a test',
  icon: '📢',
  actionUrl: '/some-page',
  actionLabel: 'View',
  expiresIn: 24 * 60 * 60 * 1000 // 24 hours
})
```

#### Preset Notifications

```typescript
import { 
  notifyNewMessage,
  notifyNewConversation,
  notifyConversationAssigned 
} from '@/lib/notifications'

// New message notification
await notifyNewMessage({
  userId: 'agent-id',
  senderName: 'John Doe',
  messagePreview: 'Hello, I need help...',
  conversationId: 'conversation-id'
})

// Conversation assigned
await notifyConversationAssigned({
  userId: 'agent-id',
  assignedBy: 'Manager',
  customerName: 'Jane Smith',
  conversationId: 'conversation-id'
})
```

### Web Push Notifications

#### Frontend: Subscribe to Push

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications'

function MyComponent() {
  const { 
    isSupported, 
    isSubscribed, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications()

  return (
    <div>
      {isSupported ? (
        isSubscribed ? (
          <button onClick={unsubscribe}>
            Disable Push
          </button>
        ) : (
          <button onClick={subscribe}>
            Enable Push
          </button>
        )
      ) : (
        <p>Push not supported</p>
      )}
    </div>
  )
}
```

#### Backend: Send Push

```typescript
import { sendPushToUser, pushNewMessage } from '@/lib/pushNotifications'

// Custom push
await sendPushToUser('user-id', {
  title: 'Hello!',
  body: 'You have a new notification',
  icon: '/icon-192x192.png',
  data: { url: '/inbox' }
})

// Preset push
await pushNewMessage({
  userId: 'agent-id',
  senderName: 'Customer',
  messagePreview: 'Hi there!',
  conversationId: 'conv-id'
})
```

---

## 🎨 UI Components

### NotificationCenter

The notification dropdown in the header:

```tsx
import { NotificationCenter } from '@/components/NotificationCenter'

<NotificationCenter />
```

**Features**:
- Shows unread badge
- Lists recent notifications
- Mark as read on click
- Delete notifications
- Navigate to action URL
- Real-time updates via Socket.io

### PushNotificationSettings

Settings page component for push notifications:

```tsx
import { PushNotificationSettings } from '@/components/PushNotificationSettings'

<PushNotificationSettings />
```

**Features**:
- Permission request UI
- Subscribe/unsubscribe
- Status indicator
- Help text for denied permissions

---

## 📡 API Endpoints

### In-App Notifications

#### GET `/api/notifications`
List notifications for current user

**Query Params**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `unreadOnly` (boolean, default: false)
- `type` (string, optional)

**Response**:
```json
{
  "success": true,
  "data": [ {...notifications} ],
  "pagination": {
    "totalItems": 50,
    "totalPages": 3,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

#### POST `/api/notifications`
Create notification

**Body**:
```json
{
  "userId": "user-id",
  "type": "info",
  "title": "Title",
  "message": "Message",
  "icon": "🔔",
  "actionUrl": "/page",
  "actionLabel": "View"
}
```

#### PUT `/api/notifications`
Mark as read

**Body**:
```json
{
  "notificationIds": ["id1", "id2"],
  // or
  "markAll": true
}
```

#### DELETE `/api/notifications`
Delete notification

**Body**:
```json
{
  "notificationId": "id",
  // or
  "deleteAll": true
}
```

#### GET `/api/notifications/count`
Get unread count

**Response**:
```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

### Web Push Notifications

#### GET `/api/push/vapid-key`
Get VAPID public key

#### POST `/api/push/subscribe`
Subscribe to push

**Body**:
```json
{
  "subscription": {
    "endpoint": "...",
    "keys": { ... }
  },
  "userAgent": "..."
}
```

#### POST `/api/push/unsubscribe`
Unsubscribe from push

**Body**:
```json
{
  "endpoint": "..."
}
```

#### POST `/api/push/send`
Send push notification

**Body**:
```json
{
  "userId": "user-id",
  "title": "Title",
  "body": "Message",
  "icon": "/icon-192x192.png",
  "data": { "url": "/page" }
}
```

---

## 🔧 Customization

### Notification Types

Default types:
- `info` - General information (ℹ️)
- `success` - Success message (✅)
- `warning` - Warning (⚠️)
- `error` - Error (❌)
- `message` - Chat message (💬)
- `conversation` - New conversation (💬)
- `assignment` - Task assignment (👤)

### Custom Icons

Use emoji or icon names:

```typescript
await createNotification({
  icon: '🎉', // Emoji
  // or
  icon: 'FaCheckCircle' // React Icon name
})
```

### Expiration

Set notification expiration:

```typescript
await createNotification({
  expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
})
```

---

## 🧪 Testing

### Test In-App Notifications

```typescript
// In browser console or test file
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    type: 'info',
    title: 'Test',
    message: 'This is a test notification'
  })
})
```

### Test Push Notifications

1. **Subscribe** in Push Settings page
2. **Send test push**:
```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "Test Push",
    "body": "Hello from push!"
  }'
```
3. **Close browser** - should still receive notification

---

## 🐛 Troubleshooting

### In-App Notifications Not Showing

**Check**:
1. ✓ User is logged in
2. ✓ NotificationCenter component is in header
3. ✓ Socket.io connected (green dot)
4. ✓ Database has notification records

### Push Notifications Not Working

**Common Issues**:

1. **Not Supported**
   - Use Chrome, Firefox, or Edge (latest versions)
   - HTTPS required (localhost works for dev)

2. **Permission Denied**
   - User must grant permission
   - Reset in browser settings: `chrome://settings/content/notifications`

3. **Service Worker Not Registered**
   - Check DevTools → Application → Service Workers
   - Verify `/sw.js` file exists

4. **VAPID Keys Missing**
   - Verify environment variables set
   - Restart server after adding keys

5. **Subscription Failed**
   - Check browser console for errors
   - Verify VAPID public key matches

---

## 🔒 Security

### VAPID Keys

- **Never expose private key** in frontend code
- Store in environment variables
- Different keys for dev/production recommended

### Database Security

- Notifications scoped to user ID
- Authorization checked in API routes
- Sensitive data excluded from notifications

### Push Subscriptions

- Subscriptions tied to user accounts
- Inactive subscriptions auto-disabled after failures
- Endpoint uniqueness enforced

---

## 📊 Monitoring

### Cleanup Jobs

Run periodically to clean old data:

```typescript
import { 
  deleteExpiredNotifications,
  deleteOldReadNotifications 
} from '@/lib/notifications'

// Delete expired
await deleteExpiredNotifications()

// Delete old read (30+ days)
await deleteOldReadNotifications(30)
```

### Push Subscription Health

Query failed subscriptions:

```sql
SELECT * FROM "PushSubscriptionDB"
WHERE "failCount" >= 5 OR "isActive" = false;
```

---

## 🚀 Best Practices

### 1. Don't Over-Notify

- Only send important notifications
- Allow users to configure preferences
- Respect quiet hours (future feature)

### 2. Clear Action URLs

```typescript
// ✅ Good
actionUrl: '/chat/agent/inbox?conversation=123'

// ❌ Bad
actionUrl: '/inbox' // No context
```

### 3. Descriptive Messages

```typescript
// ✅ Good
message: 'John Doe: "I need help with my order #1234"'

// ❌ Bad
message: 'New message' // Too vague
```

### 4. Handle Failures Gracefully

```typescript
try {
  await sendPushToUser(userId, payload)
} catch (error) {
  console.error('Push failed:', error)
  // Don't fail the main operation
}
```

---

## 📈 Future Enhancements

- [ ] **Notification Preferences** - Per-type toggle
- [ ] **Quiet Hours** - Schedule DND times
- [ ] **Sound Alerts** - Audio notifications
- [ ] **Email Notifications** - Email backup
- [ ] **SMS Notifications** - Critical alerts
- [ ] **Notification History** - Full audit log
- [ ] **Bulk Operations** - Mass send
- [ ] **A/B Testing** - Notification variants
- [ ] **Analytics** - Open rates, click rates

---

## 🆘 Support

### Debugging Checklist

- [ ] Check browser console for errors
- [ ] Verify environment variables set
- [ ] Check Socket.io connection status
- [ ] Verify service worker registered
- [ ] Test with simple notification first
- [ ] Check database for records
- [ ] Review server logs

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "VAPID key not configured" | Missing env var | Add NEXT_PUBLIC_VAPID_PUBLIC_KEY |
| "Push not supported" | Old browser | Update browser |
| "Permission denied" | User blocked | Reset in browser settings |
| "Subscription not found" | Not subscribed | Subscribe first |

---

**Documentation Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Production Ready

---

## Quick Reference

### Import Paths

```typescript
// Hooks
import { usePushNotifications } from '@/hooks/usePushNotifications'

// Components
import { NotificationCenter } from '@/components/NotificationCenter'
import { PushNotificationSettings } from '@/components/PushNotificationSettings'

// Utilities
import { createNotification, notifyNewMessage } from '@/lib/notifications'
import { sendPushToUser, pushNewMessage } from '@/lib/pushNotifications'
```

### Quick Test

```bash
# 1. Create notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","type":"info","title":"Test","message":"Hello"}'

# 2. Send push
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","title":"Test","body":"Push!"}'
```

**Happy Notifying! 🔔**

