import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'ID จำเป็น' })
    }

    try {
        if (req.method === 'GET') {
            const partner = await prisma.partnerDB.findUnique({
                where: { id },
                include: {
                    agent: {
                        select: { id: true, username: true, userLogin: true, webname: true, position: true },
                    },
                },
            })

            if (!partner) {
                return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลพันธมิตร' })
            }

            return res.status(200).json({ success: true, data: partner })
        }

        if (req.method === 'PUT') {
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
                updatedBy,
            } = JSON.parse(req.body ?? '{}')

            // ตรวจสอบว่า partner มีอยู่จริงหรือไม่
            const existingPartner = await prisma.partnerDB.findUnique({
                where: { id },
            })

            if (!existingPartner) {
                return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลพันธมิตร' })
            }

            // เตรียมข้อมูลสำหรับอัปเดต
            const updateFields: any = {}
            if (agentId) updateFields.agentId = agentId
            if (bankName) updateFields.bankName = bankName
            if (bankNumber) updateFields.bankNumber = bankNumber
            if (name) updateFields.name = name
            if (tel !== undefined) updateFields.tel = tel
            if (line !== undefined) updateFields.line = line
            if (status) updateFields.status = status
            if (method) updateFields.method = method
            if (startDate) updateFields.startDate = new Date(startDate)
            if (updatedBy) updateFields.updatedBy = updatedBy

            const updated = await prisma.partnerDB.update({
                where: { id },
                data: updateFields,
                include: {
                    agent: { select: { id: true, username: true, userLogin: true, webname: true, position: true } },
                },
            })

            return res.status(200).json({ success: true, data: updated, message: 'อัปเดตสำเร็จ' })
        }

        if (req.method === 'DELETE') {
            // ตรวจสอบว่า partner มีอยู่จริงหรือไม่
            const existingPartner = await prisma.partnerDB.findUnique({
                where: { id },
            })

            if (!existingPartner) {
                return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลพันธมิตร' })
            }

            await prisma.partnerDB.delete({
                where: { id },
            })

            return res.status(200).json({ success: true, message: 'ลบข้อมูลสำเร็จ' })
        }

        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    } catch (err: any) {
        console.error(err)
        return res.status(500).json({ success: false, error: err?.message ?? 'Server error' })
    }
}
