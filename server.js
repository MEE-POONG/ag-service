/**
 * Custom Next.js Server with Socket.io
 * Enables real-time WebSocket communication for chat features
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

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

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://${hostname}:${port}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
  })

  // Make io accessible globally for API routes
  global.io = io

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`)

    // Handle authentication
    socket.on('authenticate', (data) => {
      const { userId, userType, username } = data
      socket.data.userId = userId
      socket.data.userType = userType
      socket.data.username = username

      console.log(`[Socket] Authenticated: ${username} (${userType}) - ${socket.id}`)

      // Join user-specific room
      if (userType === 'agent') {
        socket.join(`agent:${userId}`)
        socket.join('agents:all')
      } else if (userType === 'customer') {
        socket.join(`customer:${userId}`)
      }

      // Broadcast user online status
      socket.broadcast.emit('user:online', {
        userId,
        userType,
        timestamp: new Date(),
      })
    })

    // Handle joining conversation rooms
    socket.on('agent:join_room', (roomName) => {
      socket.join(roomName)
      console.log(`[Socket] ${socket.data.username} joined room: ${roomName}`)
    })

    // Handle leaving conversation rooms
    socket.on('agent:leave_room', (roomName) => {
      socket.leave(roomName)
      console.log(`[Socket] ${socket.data.username} left room: ${roomName}`)
    })

    // Handle typing indicators
    socket.on('user:typing', (payload) => {
      const roomName = `conversation:${payload.conversationId}`
      socket.to(roomName).emit('user:typing', {
        ...payload,
        timestamp: new Date(),
      })
    })

    socket.on('user:stop_typing', (payload) => {
      const roomName = `conversation:${payload.conversationId}`
      socket.to(roomName).emit('user:stop_typing', {
        ...payload,
        timestamp: new Date(),
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`)

      if (socket.data.userId && socket.data.userType) {
        // Broadcast user offline status
        socket.broadcast.emit('user:offline', {
          userId: socket.data.userId,
          userType: socket.data.userType,
          timestamp: new Date(),
        })
      }
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket] Error from ${socket.id}:`, error)
    })
  })

  // Start the server
  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.io server initialized`)
    })
})

