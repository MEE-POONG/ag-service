"use strict"

const { MongoClient } = require('mongodb')

const WATCH_PIPELINE = [
  {
    $match: {
      operationType: { $in: ['insert', 'update', 'replace'] },
      $or: [
        { 'fullDocument.status': 'SUCCESS' },
        { 'updateDescription.updatedFields.status': 'SUCCESS' }
      ]
    }
  }
]

const DEFAULT_ACTION_URL = '/bot-ag/work-queue'
const AGENT_ROOM_PREFIX = 'agent:'
const ALL_AGENTS_ROOM = 'agents:all'
const RESTART_DELAY_MS = 5000

let clientPromise
let changeStream
let restartTimer
let isStarting = false

function resolveDbName(uri) {
  const envDb =
    process.env.MONGODB_DB ||
    process.env.MONGODB_DATABASE ||
    process.env.DATABASE_NAME
  if (envDb) return envDb

  try {
    const parsed = new URL(uri)
    if (parsed.pathname && parsed.pathname !== '/') {
      return decodeURIComponent(parsed.pathname.replace(/^\//, ''))
    }
  } catch (_) {
    // Ignore parsing errors and fall back to regex extraction
  }

  const match = uri.match(/\/([^/?]+)(?:\?|$)/)
  return match ? match[1] : 'ag-db'
}

async function getMongoClient(uri) {
  if (!clientPromise) {
    const client = new MongoClient(uri, {
      ignoreUndefined: true,
      maxPoolSize: 5
    })

    clientPromise = client.connect().catch((error) => {
      clientPromise = undefined
      throw error
    })
  }

  return clientPromise
}

function buildActionUrl(queueId) {
  if (!queueId) return DEFAULT_ACTION_URL
  return `${DEFAULT_ACTION_URL}?highlight=${queueId}`
}

function toStringId(value) {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value.toHexString === 'function') return value.toHexString()
  if (typeof value.toString === 'function') return value.toString()
  return undefined
}

async function handleSuccessChange(doc, db, io) {
  if (!doc || doc.status !== 'SUCCESS') return

  const queueId = toStringId(doc._id)
  const metadata = {
    queueId,
    jobId: doc.jobId ?? null,
    type: doc.type ?? null,
    status: doc.status,
    username: doc.username ?? null,
    adviser: doc.adviser ?? null,
    eventDocId: doc.eventDocId ?? null,
    priority: doc.priority ?? null,
    queueSize: doc.queueSize ?? null,
    updatedAt: doc.updatedAt ?? null
  }

  const title = doc.type
    ? `งาน ${doc.type} สำเร็จ`
    : 'งานในคิวสำเร็จแล้ว'
  const message = doc.jobId
    ? `งาน ${doc.jobId} สถานะ SUCCESS`
    : 'งานในคิวเปลี่ยนสถานะเป็น SUCCESS'

  const payload = {
    type: 'success',
    title,
    message,
    data: {
      jobId: doc.jobId ?? null,
      queueId,
      type: doc.type ?? null,
      status: doc.status,
      eventDocId: doc.eventDocId ?? null,
      actionUrl: buildActionUrl(queueId)
    }
  }

  const targets = await resolveTargetAdmins(db, doc)

  if (!targets.length) {
    console.warn(
      '[AgQueueWatcher] No specific admin found for job. Broadcasting notification.'
    )
    emitNotification(io, [], payload)
    return
  }

  for (const admin of targets) {
    try {
      await persistNotification(db, admin, metadata, payload)
    } catch (error) {
      console.error(
        `[AgQueueWatcher] Failed to create notification for user ${admin.username}:`,
        error
      )
    }
  }

  emitNotification(io, [], payload)
}

async function resolveTargetAdmins(db, doc) {
  const usernames = new Set()
  if (doc.username) usernames.add(doc.username)
  if (doc.adviser) usernames.add(doc.adviser)

  if (!usernames.size) return []

  const admins = await db
    .collection('AdminDB')
    .find(
      { username: { $in: Array.from(usernames) } },
      { projection: { username: 1 } }
    )
    .toArray()

  if (!admins.length) {
    console.warn(
      '[AgQueueWatcher] Could not match username(s) to AdminDB records:',
      Array.from(usernames)
    )
  }

  return admins
}

async function persistNotification(db, admin, metadata, payload) {
  const notifications = db.collection('NotificationDB')
  const existing = await notifications.findOne({
    userId: admin._id,
    'metadata.jobId': metadata.jobId,
    'metadata.status': 'SUCCESS'
  })

  if (existing) {
    return toStringId(existing._id)
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const doc = {
    userId: admin._id,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    icon: '✅',
    actionUrl: metadata.queueId ? buildActionUrl(metadata.queueId) : DEFAULT_ACTION_URL,
    actionLabel: 'เปิดรายการ',
    metadata,
    isRead: false,
    createdAt: now,
    expiresAt
  }

  const result = await notifications.insertOne(doc)
  return toStringId(result.insertedId)
}

function emitNotification(io, userIds, payload) {
  if (!io) return

  const enrichedPayload = { ...payload, timestamp: new Date() }

  if (Array.isArray(userIds) && userIds.length) {
    userIds
      .filter(Boolean)
      .forEach((userId) => {
        io.to(`${AGENT_ROOM_PREFIX}${userId}`).emit('notification', enrichedPayload)
      })
    return
  }

  io.to(ALL_AGENTS_ROOM).emit('notification', enrichedPayload)
}

function cleanupChangeStream() {
  if (changeStream) {
    try {
      changeStream.removeAllListeners()
      changeStream.close()
    } catch (_) {
      // Ignore cleanup errors
    }
    changeStream = undefined
  }
}

function scheduleRestart(io) {
  cleanupChangeStream()

  if (restartTimer) return
  restartTimer = setTimeout(() => {
    restartTimer = undefined
    startAgQueueJobWatcher(io).catch((error) => {
      console.error('[AgQueueWatcher] Restart attempt failed:', error)
    })
  }, RESTART_DELAY_MS)
}

async function startAgQueueJobWatcher(io) {
  if (changeStream || isStarting) return changeStream

  const uri = process.env.DATABASE_URL
  const isDisabled = process.env.DISABLE_AG_QUEUE_WATCHER === 'true'

  if (isDisabled) {
    console.log('[AgQueueWatcher] Watcher disabled via DISABLE_AG_QUEUE_WATCHER flag.')
    return
  }

  if (!uri) {
    console.warn('[AgQueueWatcher] DATABASE_URL not configured. Skipping watcher.')
    return
  }

  isStarting = true

  try {
    const client = await getMongoClient(uri)
    const dbName = resolveDbName(uri)
    const db = client.db(dbName)

    changeStream = db.collection('AgQueueJobDB').watch(WATCH_PIPELINE, {
      fullDocument: 'updateLookup'
    })

    changeStream.on('change', (change) => {
      if (!change.fullDocument) return
      handleSuccessChange(change.fullDocument, db, io).catch((error) => {
        console.error('[AgQueueWatcher] Failed to process change event:', error)
      })
    })

    changeStream.on('error', (error) => {
      console.error('[AgQueueWatcher] Change stream error:', error)
      scheduleRestart(io)
    })

    changeStream.on('close', () => {
      console.warn('[AgQueueWatcher] Change stream closed. Attempting restart...')
      scheduleRestart(io)
    })

    console.log(
      `[AgQueueWatcher] Listening for SUCCESS status on AgQueueJobDB (database: ${dbName}).`
    )
  } catch (error) {
    console.error('[AgQueueWatcher] Failed to start watcher:', error)
    scheduleRestart(io)
  } finally {
    isStarting = false
  }

  return changeStream
}

module.exports = {
  startAgQueueJobWatcher
}
