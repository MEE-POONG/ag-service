// pages/admin/add.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { TheLayout } from '@/components/TheLayout'
import { qk } from '@/lib/queryKeys'

interface AdminDetail {
  id: string
  username: string
  name: string
  email: string
  tel?: string | null
  isActive: boolean
  adminPositionId?: string | null
  adminPosition?: Position | null
}
type AdminResp = { success: boolean; data: AdminDetail; error?: string }
interface Position {
  id: string
  name: string
  priority?: number
  adminDepartmentId?: string
  adminDepartment?: { id: string; name: string } | null
}
interface Department {
  id: string
  name: string
}
type PosDepResp = { positions: Position[]; departments: Department[] }

export default function AdminEditPage() {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : ''
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState('')

  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    tel: '',
    adminPositionId: '',
  })
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  const {
    data: adminRes,
    isPending: adminPending,  // ✅ v5
    isError: adminError,
  } = useQuery<AdminResp>({
    queryKey: qk.admins.detail(id),
    enabled: !!id,
    queryFn: async () => {
      const res = await axios.get<AdminResp>('/api/admin', { params: { id } })
      if (!res.data?.success) throw new Error(res.data?.error || 'ไม่พบข้อมูลผู้ดูแล')
      return res.data
    },
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })

  const { data: posDep } = useQuery<PosDepResp>({
    queryKey: qk.positions.list,
    queryFn: async () => {
      const res = await axios.get('/api/admin-positions', { params: { pageSize: 999 } })
      const positions = (res.data?.data?.positions ?? res.data?.data ?? []) as Position[]
      const apiDeps = (res.data?.data?.departments ?? []) as Department[]

      const derivedDepsMap = new Map<string, Department>()
      for (const p of positions) {
        const depId = p.adminDepartment?.id ?? p.adminDepartmentId ?? ''
        const depName = p.adminDepartment?.name ?? ''
        if (depId) derivedDepsMap.set(depId, { id: depId, name: depName || '(ไม่ระบุชื่อแผนก)' })
      }
      const derivedDeps = Array.from(derivedDepsMap.values())
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'))

      return { positions, departments: apiDeps.length ? apiDeps : derivedDeps }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })

  useEffect(() => {
    if (!posDep) return
    setPositions(posDep.positions)
    setDepartments(posDep.departments)

    if (!selectedDeptId && posDep.departments.length === 1) {
      setSelectedDeptId(posDep.departments[0].id)
    } else if (selectedDeptId) {
      const stillExists = posDep.departments.some(d => d.id === selectedDeptId)
      if (!stillExists) setSelectedDeptId('')
    }
  }, [posDep])

  useEffect(() => {
    if (!adminRes?.data) return
    const a = adminRes.data

    // เซ็ตค่าที่ช่อง input ต้องใช้
    setForm({
      username: a.username ?? '',
      password: '',                 // เว้นว่างไว้ (หน้าแก้ไขจะไม่เปลี่ยนถ้าไม่กรอก)
      name: a.name ?? '',
      email: a.email ?? '',
      tel: a.tel ?? '',
      adminPositionId: a.adminPositionId || a.adminPosition?.id || '',
    })

    // ถ้าคุณมี select แผนก ให้เติมค่าไว้ด้วย (ถ้าไม่ได้ใช้ก็ลบทิ้งได้)
    setSelectedDeptId(
      a.adminPosition?.adminDepartment?.id ||
      a.adminPosition?.adminDepartmentId ||
      ''
    )
  }, [adminRes])

  const filteredPositions = useMemo(() => {
    if (!selectedDeptId) return []
    return positions.filter(p => (p.adminDepartmentId ?? p.adminDepartment?.id) === selectedDeptId)
  }, [positions, selectedDeptId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'adminPositionId') {
      const pos = positions.find(p => p.id === value)
      const depId = pos?.adminDepartmentId ?? pos?.adminDepartment?.id ?? ''
      if (depId && depId !== selectedDeptId) setSelectedDeptId(depId)
    }
  }

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depId = e.target.value
    setSelectedDeptId(depId)
    setForm(prev => ({ ...prev, adminPositionId: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !selectedDeptId || !form.adminPositionId) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    try {
      setLoading(true)
      const res = await axios.post('/api/admin', {
        ...form,
        adminDepartmentId: selectedDeptId,
        createdBy: 'admin',
      })
      if (res.data?.success) {
        await queryClient.invalidateQueries({ queryKey: qk.admins.list, exact: false })
        alert('สร้าง Admin สำเร็จ')
        router.push('/admin/admins')
      } else {
        alert(res.data?.error || 'เกิดข้อผิดพลาดในการสร้าง Admin')
      }
    } catch (e) {
      console.error('Create admin failed:', e)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TheLayout>
      <div className="max-w-sm sm:max-w-xl mx-auto bg-white shadow rounded-lg p-4 sm:p-8 mt-4 sm:mt-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">แก้ไขผู้ดูแลระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">ชื่อผู้ใช้ *</label>
            <input name="username" value={form.username} onChange={handleChange} required className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">ชื่อ-นามสกุล *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">อีเมล *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">เบอร์โทร</label>
            <input name="tel" value={form.tel} onChange={handleChange} className="input-field text-sm" />
          </div>

          {/* เลือกแผนก */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">แผนก *</label>
            <select
              value={selectedDeptId}
              onChange={handleDeptChange}
              required
              disabled={departments.length === 0}
              className={`input-field text-sm ${departments.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>{departments.length === 0 ? 'ไม่มีข้อมูลแผนก' : '-- เลือกแผนก --'}</option>
              {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
            </select>
            {departments.length === 0 && (
              <p className="mt-1 text-xs text-red-500">ไม่พบข้อมูลแผนกจาก API — ระบบจะดึงจากตำแหน่งให้อัตโนมัติเมื่อมีข้อมูล</p>
            )}
          </div>

          {/* ตำแหน่ง */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">ตำแหน่ง *</label>
            <select
              name="adminPositionId"
              value={form.adminPositionId}
              onChange={handleChange}
              required
              disabled={!selectedDeptId}
              className={`input-field text-sm ${!selectedDeptId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>{selectedDeptId ? '-- เลือกตำแหน่ง --' : 'เลือกแผนกก่อน'}</option>
              {filteredPositions.map(pos => (
                <option key={pos.id} value={pos.id}>
                  {pos.name} {pos.adminDepartment ? `(${pos.adminDepartment.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn-primary text-sm" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'เพิ่มผู้ดูแลระบบ'}</button>
            <button type="button" className="btn-secondary text-sm" onClick={() => router.push('/admin/admins')}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </TheLayout>
  )
}
