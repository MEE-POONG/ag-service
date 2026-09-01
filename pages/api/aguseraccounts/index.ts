import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'

type Resp<T = any> = {
  success?: boolean
  source?: 'AgUserDB'
  data?: T
  error?: string
  message?: string
  pagination?: { totalItems: number; totalPages: number; currentPage: number; pageSize: number }
}

function unwrapMongoValue(value: any): any {
  if (Array.isArray(value)) return value.map(unwrapMongoValue)
  if (!value || typeof value !== 'object') return value
  if (typeof value.$oid === 'string') return value.$oid
  if (typeof value.$date === 'string') return value.$date

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, unwrapMongoValue(nestedValue)])
  )
}

function normalizeAgUser(row: any) {
  const normalized = unwrapMongoValue(row)
  const { _id, __v, ...data } = normalized
  return { id: _id, v: __v, ...data }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return
  res.setHeader('X-Data-Source', 'AgUserDB')

  const { id, page = '1', pageSize = '10', keyword = '', statusServe } = req.query as any
  if (id) {
    const rawRows = await prisma.agUserDB.findRaw({ filter: { _id: { $oid: String(id) } } })
    const rows = rawRows as unknown as any[]
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'Not found' })
    }
    return res.status(200).json({
      success: true,
      source: 'AgUserDB',
      data: normalizeAgUser(rows[0]),
    })
  }

  const pageNum = Math.max(parseInt(String(page), 10) || 1, 1)
  const sizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100)
  const skip = (pageNum - 1) * sizeNum
  const kw = String(keyword || '').trim()

  const escapedKeyword = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const filter = {
    ...(kw
      ? {
        $or: [
          'username',
          'userLogin',
          'webname',
          'origin',
          'position',
          'reserve',
          'partnerAG',
          'partnerLogin',
        ].map((field) => ({ [field]: { $regex: escapedKeyword, $options: 'i' } })),
      }
      : {}),
    ...(statusServe ? { statusServe: String(statusServe).toUpperCase() } : {}),
  }

  // Raw reads keep this endpoint compatible while an already-running Windows
  // process still has the previous Prisma query engine loaded. It also returns
  // every field stored in the canonical AgUserDB collection.
  const [rawItems, countRows] = await Promise.all([
    prisma.agUserDB.findRaw({
      filter,
      options: { skip, limit: sizeNum, sort: { createdAt: -1 } },
    }),
    prisma.agUserDB.aggregateRaw({
      pipeline: [{ $match: filter }, { $count: 'total' }],
    }),
  ])
  const items = (rawItems as unknown as any[]).map(normalizeAgUser)
  const total = Number((countRows as unknown as any[])?.[0]?.total || 0)

  return res.status(200).json({
    success: true,
    source: 'AgUserDB',
    data: items,
    pagination: { totalItems: total, totalPages: Math.ceil(total / sizeNum), currentPage: pageNum, pageSize: sizeNum },
  })
}

async function postHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  const { username, reserve, userLogin, origin, position, gaSecretEnc, statusServe = 'PENDING', note, meta, webname, partnerAG, partnerLogin } = req.body
  if (!username) return res.status(400).json({ success: false, error: 'username are required' })

  const dup = await prisma.agUserDB.findFirst({ where: { username } })
  if (dup) return res.status(400).json({ success: false, error: `username already exists ${username} dup :  ${dup.username}` })

  // Check userLogin uniqueness only if it's not empty
  if (userLogin && userLogin !== '') {
    const dupLogin = await prisma.agUserDB.findFirst({ where: { userLogin } })
    if (dupLogin) return res.status(400).json({ success: false, error: `userLogin already exists ${userLogin}` })
  }

  const created = await prisma.$transaction(async (tx) => {
    const webBase = await tx.webBaseDB.findUnique({ where: { name: webname } })
    if (!webBase) throw new Error(`WebBaseDB not found for webname: ${webname}`)

    const row = await tx.agUserDB.create({
      data: {
        username,
        v: 0,
        reserve,
        userLogin: userLogin || '',
        webname,
        webBaseId: webBase.id,
        origin,
        position,
        gaSecretEnc,
        statusServe: String(statusServe).toUpperCase() || 'PENDING',
        note,
        meta,
        partnerAG: partnerAG || null,
        partnerLogin: partnerLogin || null,
        isActive: true,
        createdAt: new Date(),
        createdBy: admin.username,
        updatedAt: new Date(),
        updatedBy: admin.username,
      },
    })
    const ui = extractUserInfo(req)
    await recordWorkHistory(tx as any, 'AgUserDB', row.id, 'CREATE', null, row, admin.username, 'admin', true, null, ui.ipAddress, ui.userAgent)
    return row
  })

  return res.status(201).json({ success: true, data: created, message: 'created' })
}

async function putHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  const { id, username, reserve, userLogin, origin, position, gaSecretEnc, statusServe, note, meta, webname, isActive, partnerAG, partnerLogin } = req.body
  if (!id) return res.status(400).json({ success: false, error: 'id is required' })

  const existing = await prisma.agUserDB.findFirst({ where: { id } })
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' })

  if (username && username !== existing.username) {
    const du = await prisma.agUserDB.findFirst({ where: { username } })
    if (du) return res.status(400).json({ success: false, error: `username already exists ${username} du :  ${du.username}` })
  }

  // Check userLogin uniqueness only if it's not empty and being changed
  if (userLogin && userLogin !== '' && userLogin !== existing.userLogin) {
    const duLogin = await prisma.agUserDB.findFirst({ where: { userLogin } })
    if (duLogin) return res.status(400).json({ success: false, error: `userLogin already exists ${userLogin}` })
  }

  const updated = await prisma.$transaction(async (tx) => {
    const webBase =
      webname !== undefined
        ? await tx.webBaseDB.findUnique({ where: { name: webname } })
        : null
    if (webname !== undefined && !webBase) {
      throw new Error(`WebBaseDB not found for webname: ${webname}`)
    }

    const row = await tx.agUserDB.update({
      where: { id },
      data: {
        ...(username !== undefined && { username }),
        ...(reserve !== undefined && { reserve }),
        ...(userLogin !== undefined && { userLogin }),
        ...(webname !== undefined && { webname }),
        ...(webBase && { webBaseId: webBase.id }),
        ...(origin !== undefined && { origin }),
        ...(position !== undefined && { position }),
        ...(gaSecretEnc !== undefined && { gaSecretEnc }),
        ...(statusServe !== undefined && { statusServe: String(statusServe).toUpperCase() }),
        ...(note !== undefined && { note }),
        ...(meta !== undefined && { meta }),
        ...(isActive !== undefined && { isActive }),
        ...(partnerAG !== undefined && { partnerAG }),
        ...(partnerLogin !== undefined && { partnerLogin }),
        updatedBy: admin.username,
        updatedAt: new Date(),
      },
    })
    const ui = extractUserInfo(req)
    await recordWorkHistory(tx as any, 'AgUserDB', id, 'UPDATE', existing, row, admin.username, 'admin', true, null, ui.ipAddress, ui.userAgent)
    return row
  })

  return res.status(200).json({ success: true, data: updated, message: 'updated' })
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  const { id } = req.body
  if (!id) return res.status(400).json({ success: false, error: 'id is required' })

  const existing = await prisma.agUserDB.findFirst({ where: { id } })
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' })

  await prisma.$transaction(async (tx) => {
    const ui = extractUserInfo(req)
    await recordWorkHistory(tx as any, 'AgUserDB', id, 'DELETE', existing, null, admin.username, 'admin', true, null, ui.ipAddress, ui.userAgent)
    await tx.agUserDB.delete({ where: { id } })
  })

  return res.status(200).json({ success: true, message: 'deleted' })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  try {
    switch (req.method) {
      case 'GET':
        return await getHandler(req, res)
      case 'POST':
        return await postHandler(req, res)
      case 'PUT':
        return await putHandler(req, res)
      case 'DELETE':
        return await deleteHandler(req, res)
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
  } catch (e) {
    console.error('aguseraccounts API error', e)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
