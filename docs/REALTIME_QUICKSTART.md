# 🚀 Real-time Chat - Quick Start Guide

## What's New?

Your chat system now has **real-time updates** powered by WebSocket (Socket.io):

✅ **Instant message delivery** - No more polling or refresh needed  
✅ **Live typing indicators** - See when customers are typing  
✅ **Online/offline status** - Know who's available  
✅ **Real-time notifications** - Instant alerts for new conversations  
✅ **Auto-reconnection** - Resilient connection handling  

---

## Quick Start

### 1. Install Dependencies (Already Done ✓)

```bash
pnpm add socket.io socket.io-client
```

### 2. Start the Server

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

The server will start on `http://localhost:3000` with Socket.io enabled.

### 3. Test Real-time Features

1. Open **two browser windows** (or use incognito mode)
2. Login as an agent in both windows
3. Navigate to **Agent Inbox** (`/chat/agent/inbox`)
4. Start a conversation in one window
5. Watch it appear instantly in the other window! 🎉

---

## What Changed?

### New Files

1. **`server.js`** - Custom Next.js server with Socket.io
2. **`types/socket.ts`** - WebSocket event types
3. **`lib/socket.ts`** - Backend Socket.io utilities
4. **`hooks/useSocket.ts`** - Frontend React hook
5. **`docs/REALTIME_CHAT.md`** - Complete documentation

### Modified Files

1. **`package.json`** - Updated scripts to use custom server
2. **`pages/api/chat/conversations/index.ts`** - Added event emission
3. **`pages/api/chat/messages/index.ts`** - Added event emission
4. **`pages/chat/agent/inbox.tsx`** - Added real-time features

---

## Features Overview

### 🔴 Connection Status

A live indicator shows connection status in the top-right of the inbox:

- 🟢 **Connected** - Real-time updates active
- ⚪ **Disconnected** - Attempting to reconnect

### 💬 Real-time Messages

Messages appear **instantly** without refresh:

```typescript
// Automatic - no code needed!
// When agent/customer sends a message,
// it appears immediately in both windows
```

### ⌨️ Typing Indicators

See when someone is typing:

- Appears as "กำลังพิมพ์..." with animated dots
- Auto-hides after 3 seconds of inactivity
- Works for both agents and customers

### 🟢 Online Status

Green dot indicator shows who's online:

- Real-time presence tracking
- Displays next to user names
- Updates when users connect/disconnect

### 🔔 Notifications

Toast notifications for important events:

- New conversations
- New messages (when not viewing)
- System alerts

---

## Architecture Overview

```
┌─────────────────────┐
│   Next.js Frontend  │
│  (Agent Inbox UI)   │
│                     │
│  useSocket Hook     │
└──────────┬──────────┘
           │ WebSocket
           │ (Socket.io)
           │
┌──────────▼──────────┐
│  Custom Server      │
│  (server.js)        │
│                     │
│  Socket.io Server   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   API Routes        │
│  /api/chat/*        │
│                     │
│  Emit Events        │
└─────────────────────┘
```

### How It Works

1. **Frontend connects** to Socket.io server
2. **Agent joins rooms** (conversations they're viewing)
3. **API routes emit events** when data changes
4. **Socket.io broadcasts** to relevant rooms
5. **Frontend receives events** and updates UI

---

## Usage Examples

### Display Connection Status

```typescript
import { useSocket } from '@/hooks/useSocket'

function MyComponent() {
  const socket = useSocket({
    userId: user?.id,
    userType: 'agent',
    username: user?.name,
  })

  return (
    <div>
      Status: {socket.isConnected ? '🟢 Online' : '⚪ Offline'}
    </div>
  )
}
```

### Listen for New Messages

```typescript
useEffect(() => {
  if (!socket.isConnected) return

  return socket.onMessageNew((payload) => {
    console.log('New message:', payload.message)
    // Update UI automatically via React Query
  })
}, [socket])
```

### Show Typing Indicator

```typescript
const [isTyping, setIsTyping] = useState(false)

useEffect(() => {
  if (!socket.isConnected) return

  const cleanup = socket.onUserTyping((payload) => {
    if (payload.conversationId === currentConversation) {
      setIsTyping(true)
    }
  })

  return cleanup
}, [socket, currentConversation])
```

---

## Troubleshooting

### Server Won't Start

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart
pnpm dev
```

### Connection Shows "Disconnected"

**Check**:
1. ✓ Server is running (`node server.js`)
2. ✓ No proxy/firewall blocking WebSocket
3. ✓ Check browser console for errors

### Typing Indicator Not Working

**Check**:
1. ✓ Both users are in the same conversation room
2. ✓ Socket connection is established
3. ✓ Check browser console for event logs

### TypeScript Errors

**Solution**:
```bash
# Regenerate Prisma types
pnpm db:generate

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## Performance Notes

- **Efficient Broadcasting**: Events only sent to relevant users via rooms
- **Auto-reconnection**: Up to 5 attempts with exponential backoff
- **Graceful Fallback**: Falls back to polling if WebSocket fails
- **Optimized Updates**: React Query cache invalidation is selective

---

## Security

- Authentication required before joining rooms
- Room access controlled server-side
- CORS configured for your domain
- Rate limiting recommended for production

---

## Next Steps

### Extend Real-time Features

1. **Read Receipts** - Show when messages are read
2. **File Upload Progress** - Real-time upload status
3. **Agent Presence** - Show which agents are viewing what
4. **Video Calls** - Integrate WebRTC
5. **Screen Sharing** - For customer support

### Add to Other Pages

Use the `useSocket` hook in any component:

```typescript
import { useSocket } from '@/hooks/useSocket'

function AnyComponent() {
  const socket = useSocket({ ... })
  
  // Listen for events
  useEffect(() => {
    return socket.onNotification((payload) => {
      toast(payload.message)
    })
  }, [socket])
}
```

---

## Resources

- 📖 **Full Documentation**: `docs/REALTIME_CHAT.md`
- 🔧 **Socket.io Docs**: https://socket.io/docs/v4/
- 💡 **Examples**: See `pages/chat/agent/inbox.tsx`

---

## Support

**Questions?**
- Check `docs/REALTIME_CHAT.md` for detailed docs
- Review `hooks/useSocket.ts` for API reference
- Test with browser DevTools Network tab (WS filter)

---

**Enjoy your real-time chat! 🚀**

