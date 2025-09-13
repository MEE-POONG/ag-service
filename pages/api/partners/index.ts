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

        if (req.method === 'PUT') {
            const { id, ...updateData } = JSON.parse(req.body ?? '{}')

            if (!id) return res.status(400).json({ success: false, error: 'ID จำเป็นสำหรับการอัปเดต' })

            // ตรวจสอบว่า partner มีอยู่จริงหรือไม่
            const existingPartner = await prisma.partnerDB.findUnique({
                where: { id },
            })

            if (!existingPartner) {
                return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลพันธมิตร' })
            }

            // เตรียมข้อมูลสำหรับอัปเดต
            const updateFields: any = {}
            if (updateData.agentId) updateFields.agentId = updateData.agentId
            if (updateData.bankName) updateFields.bankName = updateData.bankName
            if (updateData.bankNumber) updateFields.bankNumber = updateData.bankNumber
            if (updateData.name) updateFields.name = updateData.name
            if (updateData.tel !== undefined) updateFields.tel = updateData.tel
            if (updateData.line !== undefined) updateFields.line = updateData.line
            if (updateData.status) updateFields.status = updateData.status
            if (updateData.method) updateFields.method = updateData.method
            if (updateData.startDate) updateFields.startDate = new Date(updateData.startDate)
            if (updateData.updatedBy) updateFields.updatedBy = updateData.updatedBy

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
            const { id } = JSON.parse(req.body ?? '{}')

            if (!id) return res.status(400).json({ success: false, error: 'ID จำเป็นสำหรับการลบ' })

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

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    } catch (err: any) {
        console.error(err)
        return res.status(500).json({ success: false, error: err?.message ?? 'Server error' })
    }
}
