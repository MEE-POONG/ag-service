import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Socket.IO API Route
 * 
 * NOTE: Socket.IO is now handled by the custom server (server.js)
 * This route exists for compatibility but delegates to the custom server
 * 
 * The custom server initializes Socket.IO on app start and makes it
 * available globally via global.io
 */

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Socket.IO is handled by custom server.js
  // This route just returns OK for compatibility
  
  if (global.io) {
    res.status(200).json({ 
      success: true, 
      message: 'Socket.IO server is running',
      connected: true 
    })
  } else {
    res.status(503).json({ 
      success: false, 
      message: 'Socket.IO server not available. Make sure to run with custom server (npm run dev or npm start)',
      connected: false 
    })
  }
}
