# 🚀 Real-time Chat with WebSocket (Socket.io)

## Overview

The chat system now supports real-time bidirectional communication using Socket.io WebSocket technology. This enables instant updates without polling, including:

- ✅ **Real-time messages** - Instant message delivery
- ✅ **Typing indicators** - See when someone is typing
- ✅ **Online/offline status** - Track user presence
- ✅ **Live conversation updates** - Status changes, assignments, etc.
- ✅ **Push notifications** - System alerts and updates
- ✅ **Auto-reconnection** - Resilient connection handling

---

## Architecture

### Custom Next.js Server

The application uses a custom Node.js server (`server.js`) that:
1. Runs the Next.js application
2. Attaches Socket.io to the same HTTP server
3. Handles WebSocket connections alongside HTTP requests

**Server File**: `server.js`

```javascript
const httpServer = createServer(...)
const io = new Server(httpServer, { ... })
global.io = io // Make available to API routes
```

### Socket.io Configuration

**Path**: `/socket.io/`
**Transports**: WebSocket (primary), Polling (fallback)
**CORS**: Configured for development and production

---

## File Structure

```
├── server.js                    # Custom Next.js + Socket.io server
├── types/
│   └── socket.ts               # TypeScript event types and interfaces
├── lib/
│   └── socket.ts               # Backend Socket.io utility functions
├── hooks/
│   └── useSocket.ts            # Frontend Socket.io React hook
└── pages/
    ├── api/chat/
    │   ├── conversations/      # Updated to emit events
    │   └── messages/           # Updated to emit events
    └── agent/
        └── inbox.tsx           # Updated with real-time features
```

---

## Backend Implementation

### 1. Socket Event Types (`types/socket.ts`)

Defines all WebSocket events and payloads:

```typescript
export enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Presence
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_TYPING = 'user:typing',
  
  // Conversations
  CONVERSATION_NEW = 'conversation:new',
  CONVERSATION_UPDATED = 'conversation:updated',
  
  // Messages
  MESSAGE_NEW = 'message:new',
  MESSAGE_READ = 'message:read',
  // ...
}
```

### 2. Socket Utility (`lib/socket.ts`)

Provides helper functions for API routes to emit events:

```typescript
import { emitNewMessage, emitConversationUpdated } from '@/lib/socket'

// In API route
const message = await prisma.chatMessageDB.create({ ... })
emitNewMessage(conversationId, message)
```

**Available Functions**:
- `emitNewConversation(conversation)`
- `emitConversationUpdated(conversation)`
- `emitConversationDeleted(conversationId, customerId?)`
- `emitConversationAssigned(...)`
- `emitNewMessage(conversationId, message)`
- `emitMessageUpdated(conversationId, message)`
- `emitMessageDeleted(conversationId, messageId)`
- `emitMessagesRead(conversationId, messageIds, readBy, readByType)`
- `emitCustomerUpdated(customer)`
- `sendNotification(userId, type, title, message, data?)`
- `broadcastNotification(type, title, message, data?)`

### 3. Room Management

Socket.io uses **rooms** to efficiently broadcast to specific users:

- `agent:{agentId}` - Individual agent rooms
- `agents:all` - All agents (for broadcasts)
- `conversation:{conversationId}` - Conversation-specific rooms
- `customer:{customerId}` - Individual customer rooms

---

## Frontend Implementation

### 1. useSocket Hook (`hooks/useSocket.ts`)

Custom React hook that manages the Socket.io connection:

```typescript
const socket = useSocket({
  userId: user?.id,
  userType: 'agent',
  username: user?.name,
  autoConnect: true,
})

// Connection state
socket.isConnected

// Join/leave rooms
socket.joinConversationRoom(conversationId)
socket.leaveConversationRoom(conversationId)

// Typing indicators
socket.emitTyping(conversationId)
socket.emitStopTyping(conversationId)

// Event listeners
socket.onMessageNew((payload) => {
  console.log('New message:', payload)
})
```

### 2. Event Listeners

All event listener functions return a **cleanup function**:

```typescript
useEffect(() => {
  if (!socket.isConnected) return
  
  return socket.onMessageNew((payload) => {
    // Handle new message
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  })
}, [socket])
```

**Available Listeners**:
- `onUserOnline(callback)`
- `onUserOffline(callback)`
- `onUserTyping(callback)`
- `onUserStopTyping(callback)`
- `onConversationNew(callback)`
- `onConversationUpdated(callback)`
- `onConversationDeleted(callback)`
- `onConversationAssigned(callback)`
- `onMessageNew(callback)`
- `onMessageUpdated(callback)`
- `onMessageDeleted(callback)`
- `onMessageRead(callback)`
- `onCustomerUpdated(callback)`
- `onNotification(callback)`

---

## Usage Examples

### Example 1: Real-time Message Updates

```typescript
import { useSocket } from '@/hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'

function ChatComponent() {
  const queryClient = useQueryClient()
  const socket = useSocket({ ... })
  
  useEffect(() => {
    if (!socket.isConnected) return
    
    return socket.onMessageNew((payload) => {
      // Update React Query cache
      queryClient.invalidateQueries({ 
        queryKey: ['messages', payload.conversationId] 
      })
      
      // Show notification
      toast(`New message from ${payload.message.senderName}`)
    })
  }, [socket, queryClient])
  
  return <div>...</div>
}
```

### Example 2: Typing Indicators

```typescript
function MessageInput({ conversationId }: { conversationId: string }) {
  const socket = useSocket({ ... })
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const handleTyping = () => {
    // Emit typing event
    socket.emitTyping(conversationId)
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Auto-stop after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emitStopTyping(conversationId)
    }, 3000)
  }
  
  return (
    <textarea
      onChange={(e) => {
        setValue(e.target.value)
        handleTyping()
      }}
      onBlur={() => socket.emitStopTyping(conversationId)}
    />
  )
}
```

### Example 3: Online Status

```typescript
function UserList() {
  const socket = useSocket({ ... })
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  
  useEffect(() => {
    if (!socket.isConnected) return
    
    const cleanupOnline = socket.onUserOnline((payload) => {
      setOnlineUsers(prev => new Set([...prev, payload.userId]))
    })
    
    const cleanupOffline = socket.onUserOffline((payload) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(payload.userId)
        return next
      })
    })
    
    return () => {
      cleanupOnline()
      cleanupOffline()
    }
  }, [socket])
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          {user.name}
          {onlineUsers.has(user.id) && <span>🟢 Online</span>}
        </div>
      ))}
    </div>
  )
}
```

### Example 4: Room Management

```typescript
function ConversationView({ conversationId }: Props) {
  const socket = useSocket({ ... })
  
  useEffect(() => {
    if (!conversationId || !socket.isConnected) return
    
    // Join room when viewing conversation
    socket.joinConversationRoom(conversationId)
    
    // Leave room on unmount or conversation change
    return () => {
      socket.leaveConversationRoom(conversationId)
    }
  }, [conversationId, socket])
  
  return <div>...</div>
}
```

---

## Running the Application

### Development

```bash
pnpm dev
# or
npm run dev
```

This starts the custom server with Socket.io on `http://localhost:3000`

### Production

```bash
# Build Next.js
pnpm build

# Start with custom server
pnpm start
```

### Fallback to Standard Next.js (without WebSocket)

If you need to run without Socket.io:

```bash
pnpm dev:next    # Development
pnpm start:next  # Production
```

---

## Environment Variables

```env
# Optional - defaults to localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server configuration
PORT=3000
HOSTNAME=localhost
NODE_ENV=development
```

---

## Connection States

### Client Connection Lifecycle

1. **Connecting** - Initial connection attempt
2. **Connected** - Successfully connected (`socket.isConnected = true`)
3. **Disconnected** - Connection lost
4. **Reconnecting** - Automatic reconnection attempts (up to 5 times)
5. **Reconnected** - Successfully reconnected

### Connection Status UI

Display connection status to users:

```typescript
<div className={socket.isConnected ? 'online' : 'offline'}>
  {socket.isConnected ? (
    <>
      <div className="green-dot animate-pulse" />
      Connected
    </>
  ) : (
    <>
      <div className="gray-dot" />
      Disconnected
    </>
  )}
</div>
```

---

## Debugging

### Enable Socket.io Debug Logs

**Server** (`server.js`):
```javascript
console.log(`[Socket] Client connected: ${socket.id}`)
console.log(`[Socket] Authenticated: ${username} (${userType})`)
```

**Client** (`useSocket.ts`):
```typescript
console.log('[Real-time] New message:', payload)
console.log('[Socket] Connected:', socket.id)
```

### Browser DevTools

Check WebSocket connection in Chrome DevTools:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **WS** (WebSocket)
4. Look for `/socket.io/?EIO=4&transport=websocket`

### Common Issues

**Issue**: Connection not established
- ✓ Check if custom server is running (`node server.js`)
- ✓ Verify Socket.io client version matches server
- ✓ Check CORS settings
- ✓ Ensure `userId` and `userType` are provided

**Issue**: Events not received
- ✓ Verify room joins (`socket.joinConversationRoom()`)
- ✓ Check event names match exactly
- ✓ Ensure cleanup functions are called

**Issue**: Multiple connections
- ✓ Check for duplicate `useSocket` calls
- ✓ Verify cleanup in `useEffect` dependencies

---

## Performance Considerations

### Optimization Tips

1. **Selective Invalidation**: Only invalidate affected queries
   ```typescript
   // ❌ Bad
   queryClient.invalidateQueries({ queryKey: ['chat'] })
   
   // ✅ Good
   queryClient.invalidateQueries({ 
     queryKey: ['messages', conversationId] 
   })
   ```

2. **Debounce Typing**: Limit typing event frequency
   ```typescript
   const handleTyping = debounce(() => {
     socket.emitTyping(conversationId)
   }, 300)
   ```

3. **Room Management**: Leave rooms when not needed
   ```typescript
   useEffect(() => {
     socket.joinConversationRoom(id)
     return () => socket.leaveConversationRoom(id)
   }, [id])
   ```

4. **Event Listener Cleanup**: Always return cleanup functions
   ```typescript
   useEffect(() => {
     return socket.onMessageNew(handler) // Returns cleanup
   }, [socket])
   ```

---

## Security Considerations

### Authentication

- Socket connections authenticate using `userId`, `userType`, and `username`
- Consider adding JWT token validation in production

### Room Authorization

- Verify user permissions before joining rooms
- Implement server-side access control for sensitive conversations

### Rate Limiting

- Consider implementing rate limits for typing events
- Throttle reconnection attempts

---

## Testing

### Manual Testing

1. Open two browser windows/tabs
2. Login as different agents
3. Send messages between conversations
4. Verify real-time updates in both windows

### Test Checklist

- [ ] Messages appear instantly in recipient's inbox
- [ ] Typing indicators show/hide correctly
- [ ] Online status updates when users connect/disconnect
- [ ] Conversation updates reflect immediately
- [ ] Reconnection works after network interruption
- [ ] No duplicate events received
- [ ] Events cleaned up on unmount

---

## Future Enhancements

- 🔄 **Read receipts** - Show when messages are read
- 📱 **Push notifications** - Browser notifications
- 🔔 **Sound alerts** - Audio notifications for new messages
- 📊 **Analytics** - Track real-time metrics
- 🌍 **Presence channels** - Who's viewing what
- 📎 **File upload progress** - Real-time upload status
- 🎥 **Video/Voice calls** - WebRTC integration
- 🤖 **Chatbot integration** - AI-powered auto-responses

---

## Troubleshooting

### Server Won't Start

```bash
# Error: Address already in use
# Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
pnpm dev
```

### Socket.io Version Mismatch

```bash
# Ensure client and server versions match
pnpm list socket.io socket.io-client
```

### TypeScript Errors

```bash
# Regenerate types
pnpm db:generate
```

---

## Support

For issues or questions:
1. Check console logs (server and browser)
2. Verify Socket.io connection in DevTools
3. Review this documentation
4. Check Socket.io official docs: https://socket.io/docs/v4/

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Socket.io Version**: 4.8.1

