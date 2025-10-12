import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: NetServer & {
      io?: ServerIO
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...')
    
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['polling', 'websocket']
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('authenticate', (data) => {
        console.log('User authenticated:', data)
        socket.data = data
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}
