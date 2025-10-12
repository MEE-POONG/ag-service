# WebSocket Connection Fix

## Problem

The application was experiencing WebSocket connection errors:
```
WebSocket connection to 'wss://meetanggroup.com/socket.io/?EIO=4&transport=websocket' failed: 
WebSocket is closed before the connection is established.
```

## Root Causes

1. **Missing Custom Server**: The `package.json` referenced `server.js` but the file didn't exist
2. **Wrong Socket Path in Widget**: The chat widget wasn't specifying the correct Socket.IO path
3. **Transport Order**: WebSocket was attempted before polling, causing connection issues
4. **Next.js API Route Limitation**: Socket.IO doesn't work reliably in Next.js API routes without a custom server

## Solutions Implemented

### 1. Created Custom Server (`server.js`)

A new custom Next.js server with integrated Socket.IO support:

- ✅ Properly initializes Socket.IO with `/api/socket` path
- ✅ Handles authentication and room management
- ✅ Supports both agent and customer connections
- ✅ Implements typing indicators and real-time events
- ✅ Includes graceful shutdown handling
- ✅ Works in both development and production

### 2. Fixed Chat Widget Socket Connection

Updated `public/chat-widget.js`:

```javascript
// Before (Missing path)
this.instance = window.io(apiUrl, {
  transports: ['websocket', 'polling']
});

// After (With correct path and transport order)
this.instance = window.io(apiUrl, {
  path: '/api/socket',
  transports: ['polling', 'websocket'],  // Polling first, then upgrade
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

### 3. Updated API Route

Modified `pages/api/socket.ts` to delegate to the custom server instead of trying to initialize Socket.IO itself.

## How to Run

### Development
```bash
npm run dev
# or
node server.js
```

### Production
```bash
npm run build
npm start
# or
NODE_ENV=production node server.js
```

## Verification

After starting the server, you should see:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   🚀 Server ready                               │
│                                                 │
│   ➜ Local:    http://localhost:3000            │
│   ➜ Network:  Check your network settings      │
│                                                 │
│   📡 Socket.IO: Active on /api/socket           │
│                                                 │
└─────────────────────────────────────────────────┘
```

And in the browser console:
```
[AGChat] Socket connected
[Socket.IO] User authenticated: { userId: "...", userType: "customer", ... }
```

## Benefits

1. **Stable Connections**: Proper transport negotiation (polling → websocket upgrade)
2. **Better Error Handling**: Automatic reconnection with exponential backoff
3. **Room Management**: Proper socket room isolation for agents, customers, and conversations
4. **Production Ready**: Works with process managers (PM2, systemd) and Docker
5. **Graceful Shutdown**: Clean disconnection on server restart

## Testing

1. Open the chat widget on your website
2. Open browser DevTools → Network tab
3. Filter by "socket.io"
4. You should see:
   - Initial polling request (status 200)
   - Upgrade to websocket (status 101)
   - No repeated connection errors

## Troubleshooting

### Still seeing connection errors?

1. **Check server is running with custom server**:
   ```bash
   ps aux | grep "node server.js"
   ```

2. **Verify Socket.IO is initialized**:
   ```bash
   curl http://localhost:3000/api/socket
   ```
   Should return: `{"success":true,"message":"Socket.IO server is running","connected":true}`

3. **Check firewall/proxy settings**: Ensure WebSocket connections are allowed
4. **SSL/TLS**: For `wss://` (secure websocket), ensure valid SSL certificate
5. **Load Balancer**: If using a load balancer, ensure it supports WebSocket sticky sessions

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Socket.IO server not available" | Not using custom server | Run with `npm run dev` instead of `npm run dev:next` |
| ERR_CONNECTION_REFUSED | Server not running | Start server with `node server.js` |
| Timeout errors | Firewall blocking | Allow port 3000 (or your port) |
| 404 on /socket.io/ | Wrong path | Ensure widget uses `path: '/api/socket'` |

## Architecture

```
Client (Browser)
    ↓
Chat Widget (chat-widget.js)
    ↓ [Socket.IO Client with path: '/api/socket']
    ↓
Custom Server (server.js)
    ↓ [Socket.IO Server on HTTP server]
    ↓
Next.js App (API routes, pages)
    ↓ [Access via global.io]
    ↓
Prisma → Database
```

## Related Files

- `server.js` - Custom server with Socket.IO
- `public/chat-widget.js` - Chat widget client
- `pages/api/socket.ts` - API route (now just a status check)
- `hooks/useSocket.ts` - React hook for Socket.IO
- `lib/socket.ts` - Server-side socket utilities
- `types/socket.ts` - TypeScript types

## Environment Variables

Add to `.env` if needed:
```env
PORT=3000
HOSTNAME=localhost
NODE_ENV=production
```

## Docker

Update your `Dockerfile` CMD to use the custom server:
```dockerfile
CMD ["node", "server.js"]
```

## PM2

For production with PM2:
```bash
pm2 start server.js --name "ag-service"
```

---

**Last Updated**: October 12, 2025  
**Status**: ✅ Fixed and tested

