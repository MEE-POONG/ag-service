import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma, StatusServe } from '@prisma/client'
import { requireAuth } from '@/lib/permissions'
import { recordWorkHistory, extractUserInfo } from '@/utils/workHistoryUtils'

type Resp<T = any> = {
  success?: boolean
  data?: T
  error?: string
  message?: string
  pagination?: { totalItems: number; totalPages: number; currentPage: number; pageSize: number }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  const { id, page = '1', pageSize = '10', keyword = '', statusServe } = req.query as any
  if (id) {
    const row = await prisma.agUserAccountDB.findFirst({ where: { id } })
    if (!row) return res.status(404).json({ success: false, error: 'Not found' })
    return res.status(200).json({ success: true, data: row })
  }

  const pageNum = Math.max(parseInt(String(page), 10) || 1, 1)
  const sizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100)
  const skip = (pageNum - 1) * sizeNum
  const kw = String(keyword || '').trim()

  const where: Prisma.AgUserAccountDBWhereInput = {
    ...(kw
      ? {
          OR: [
            { username: { contains: kw, mode: 'insensitive' } },
            { userLogin: { contains: kw, mode: 'insensitive' } },
            { webname: { contains: kw, mode: 'insensitive' } },
            { origin: { contains: kw, mode: 'insensitive' } },
            { position: { contains: kw, mode: 'insensitive' } },
            { reserve: { contains: kw, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(statusServe ? { statusServe: (String(statusServe).toUpperCase() as StatusServe) } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.agUserAccountDB.findMany({ where, skip, take: sizeNum, orderBy: { createdAt: 'desc' } }),
    prisma.agUserAccountDB.count({ where }),
  ])

  return res.status(200).json({
    success: true,
    data: items,
    pagination: { totalItems: total, totalPages: Math.ceil(total / sizeNum), currentPage: pageNum, pageSize: sizeNum },
  })
}

async function postHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  const { username, reserve, userLogin, origin, position, gaSecretEnc, statusServe = 'PENDING', note, meta, webname } = req.body
  if (!username || !userLogin) return res.status(400).json({ success: false, error: 'username and userLogin are required' })

  const dup = await prisma.agUserAccountDB.findFirst({ where: { OR: [{ username }, { userLogin }] } })
  if (dup) return res.status(400).json({ success: false, error: 'username or userLogin already exists' })

  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.agUserAccountDB.create({
      data: {
        username,
        reserve,
        userLogin,
        webname,
        origin,
        position,
        gaSecretEnc,
        statusServe: (String(statusServe).toUpperCase() as StatusServe) || StatusServe.PENDING,
        note,
        meta,
        createdBy: admin.username,
        updatedBy: admin.username,
      },
    })
    const ui = extractUserInfo(req)
    await recordWorkHistory(tx as any, 'AgUserAccountDB', row.id, 'CREATE', null, row, admin.username, 'admin', true, null, ui.ipAddress, ui.userAgent)
    return row
  })

  return res.status(201).json({ success: true, data: created, message: 'created' })
}

async function putHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  const { id, username, reserve, userLogin, origin, position, gaSecretEnc, statusServe, note, meta, webname, isActive } = req.body
  if (!id) return res.status(400).json({ success: false, error: 'id is required' })

  const existing = await prisma.agUserAccountDB.findFirst({ where: { id } })
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' })

  if (username && username !== existing.username) {
    const du = await prisma.agUserAccountDB.findFirst({ where: { username } })
    if (du) return res.status(400).json({ success: false, error: 'username already exists' })
  }
  if (userLogin && userLogin !== existing.userLogin) {
    const du2 = await prisma.agUserAccountDB.findFirst({ where: { userLogin } })
    if (du2) return res.status(400).json({ success: false, error: 'userLogin already exists' })
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.agUserAccountDB.update({
      where: { id },
      data: {
        ...(username !== undefined && { username }),
        ...(reserve !== undefined && { reserve }),
        ...(userLogin !== undefined && { userLogin }),
        ...(webname !== undefined && { webname }),
        ...(origin !== undefined && { origin }),
        ...(position !== undefined && { position }),
        ...(gaSecretEnc !== undefined && { gaSecretEnc }),
        ...(statusServe !== undefined && { statusServe: (String(statusServe).toUpperCase() as StatusServe) }),
        ...(note !== undefined && { note }),
        ...(meta !== undefined && { meta }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: admin.username,
        updatedAt: new Date(),
      },
    })
    const ui = extractUserInfo(req)
    await recordWorkHistory(tx as any, 'AgUserAccountDB', id, 'UPDATE', existing, row, admin.username, 'admin', true, null, ui.ipAddress, ui.userAgent)
    return row
  })

  return res.status(200).json({ success: true, data: updated, message: 'updated' })
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const admin = await requireAuth(req, res)
  if (!admin) return

  const { id } = req.body
  if (!id) return res.status(400).json({ success: false, error: 'id is required' })

  const existing = await prisma.agUserAccountDB.findFirst({ where: { id } })
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' })

  await prisma.$transaction(async (tx) => {
    const ui = extractUserInfo(req)
    await recordWorkHistory(tx as any, 'AgUserAccountDB', id, 'DELETE', existing, null, admin.username, 'admin', true, null, ui.ipAddress, ui.userAgent)
    await tx.agUserAccountDB.delete({ where: { id } })
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
