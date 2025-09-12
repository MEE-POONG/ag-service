import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const partners = await prisma.partnerDB.findMany({
                include: {
                    agent: {
                        select: { id: true, username: true, userLogin: true, webname: true, position: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            })
            return res.status(200).json({ success: true, data: partners })
        }

        if (req.method === 'POST') {
            const {
                agentId,
                bankName,
                bankNumber,
                name,
                tel,
                line,
                status,
                method,
                startDate,
                createdBy,
            } = JSON.parse(req.body ?? '{}')

            if (!agentId) return res.status(400).json({ success: false, error: 'agentId จำเป็น' })
            if (!bankName || !bankNumber || !name)
                return res.status(400).json({ success: false, error: 'กรอกธนาคาร/เลขบัญชี/ชื่อบัญชีให้ครบ' })

            const created = await prisma.partnerDB.create({
                data: {
                    agentId,
                    bankName,
                    bankNumber,
                    name,
                    tel: tel ?? '',
                    line: line ?? '',
                    status: status ?? 'active',
                    method: method ?? 'normal',
                    startDate: startDate ? new Date(startDate) : new Date(),
                    createdBy: createdBy ?? 'system',
                    updatedBy: createdBy ?? 'system',
                },
                include: {
                    agent: { select: { id: true, username: true, userLogin: true, webname: true, position: true } },
                },
            })

            return res.status(201).json({ success: true, data: created, message: 'สร้างสำเร็จ' })
        }

        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    } catch (err: any) {
        console.error(err)
        return res.status(500).json({ success: false, error: err?.message ?? 'Server error' })
    }
}
