/**
 * Custom Next.js Server with Socket.IO Support
 * This server enables real-time WebSocket communication alongside Next.js
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server: SocketIOServer } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Room name helpers
const getRoomName = {
  agent: (agentId) => `agent:${agentId}`,
  customer: (customerId) => `customer:${customerId}`,
  conversation: (conversationId) => `conversation:${conversationId}`,
  allAgents: () => 'agents:all'
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Store socket.io instance globally for API routes to access
  global.io = io

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`)

    // Authenticate user and join appropriate rooms
    socket.on('authenticate', (data) => {
      console.log(`[Socket.IO] User authenticated:`, data)
      
      const { userId, userType, username } = data
      
      if (!userId || !userType) {
        console.error('[Socket.IO] Invalid authentication data')
        return
      }

      // Store user data in socket
      socket.data = { userId, userType, username }

      // Join user-specific room
      if (userType === 'agent') {
        socket.join(getRoomName.agent(userId))
        socket.join(getRoomName.allAgents())
        console.log(`[Socket.IO] Agent ${username} (${userId}) joined rooms`)
      } else if (userType === 'customer') {
        socket.join(getRoomName.customer(userId))
        console.log(`[Socket.IO] Customer ${username} (${userId}) joined room`)
      }

      // Emit user online event
      io.to(getRoomName.allAgents()).emit('user:online', {
        userId,
        userType,
        userName: username,
        timestamp: new Date()
      })

      // Send confirmation to client
      socket.emit('authenticated', {
        success: true,
        userId,
        userType,
        timestamp: new Date()
      })
    })

    // Join conversation room (for agents viewing specific conversations)
    socket.on('agent:join_room', (roomName) => {
      socket.join(roomName)
      console.log(`[Socket.IO] ${socket.id} joined room: ${roomName}`)
    })

    // Leave conversation room
    socket.on('agent:leave_room', (roomName) => {
      socket.leave(roomName)
      console.log(`[Socket.IO] ${socket.id} left room: ${roomName}`)
    })

    // Typing indicators
    socket.on('user:typing', (payload) => {
      const { conversationId } = payload
      socket.to(getRoomName.conversation(conversationId)).emit('user:typing', payload)
      socket.to(getRoomName.allAgents()).emit('user:typing', payload)
    })

    socket.on('user:stop_typing', (payload) => {
      const { conversationId } = payload
      socket.to(getRoomName.conversation(conversationId)).emit('user:stop_typing', payload)
      socket.to(getRoomName.allAgents()).emit('user:stop_typing', payload)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
      
      // Emit user offline event if user was authenticated
      if (socket.data?.userId && socket.data?.userType) {
        io.to(getRoomName.allAgents()).emit('user:offline', {
          userId: socket.data.userId,
          userType: socket.data.userType,
          userName: socket.data.username,
          timestamp: new Date()
        })
      }
    })

    // Error handling
    socket.on('error', (error) => {
      console.error(`[Socket.IO] Socket error for ${socket.id}:`, error)
    })
  })

  // Error handling for Socket.IO
  io.engine.on('connection_error', (err) => {
    console.error('[Socket.IO] Connection error:', {
      code: err.code,
      message: err.message,
      context: err.context
    })
  })

  // Start server
  httpServer
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   🚀 Server ready                               │
│                                                 │
│   ➜ Local:    http://${hostname}:${port}${' '.repeat(Math.max(0, 20 - hostname.length - port.toString().length))}│
│   ➜ Network:  Check your network settings      │
│                                                 │
│   📡 Socket.IO: Active on /api/socket           │
│                                                 │
└─────────────────────────────────────────────────┘
      `)
    })

  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log('\n[Server] Shutting down gracefully...')
    
    // Close Socket.IO connections
    io.close(() => {
      console.log('[Socket.IO] All connections closed')
    })
    
    // Close HTTP server
    httpServer.close(() => {
      console.log('[Server] HTTP server closed')
      process.exit(0)
    })

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
})

