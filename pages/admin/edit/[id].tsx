// pages/admin/edit.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { TheLayout } from '@/components/TheLayout'
import { qk } from '@/lib/queryKeys'
import { useAuth } from '@/hooks/useAuth'

interface AdminDetail {
  id: string
  username: string
  name: string
  email: string
  tel?: string | null
  isActive: boolean
  AdminPositionId?: string | null
  AdminPositionDB?: Position | null
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
  const { user } = useAuth()
  const id = typeof router.query.id === 'string' ? router.query.id : ''
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState('')

  const [form, setForm] = useState({
    username: '',
    password: '', // ไม่บังคับ (แก้เฉพาะตอนกรอก)
    name: '',
    email: '',
    tel: '',
    AdminPositionId: '',
  })
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  // const {
  //   data: adminRes,
  // } = useQuery<AdminResp>({
  //   queryKey: qk.admins.detail(id),
  //   enabled: !!id,
  //   queryFn: async () => {
  //     const res = await axios.get<AdminResp>('/api/admin', { params: { id } })
  //     if (!res.data?.success) throw new Error(res.data?.error || 'ไม่พบข้อมูลผู้ดูแล')
  //     return res.data
  //   },
  //   placeholderData: (prev) => prev,
  //   staleTime: 60_000,
  // })

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
  }, [posDep, selectedDeptId])

  useEffect(() => {
    if (!user) return

    setForm({
      username: user.username ?? '',
      password: '', // เว้นว่างไว้
      name: user.name ?? '',
      email: user.email ?? '',
      tel: user.tel ?? '',
      AdminPositionId: user.adminPositionId ?? '',
    })

    setSelectedDeptId(
      user.adminPosition?.adminDepartmentId ?? ''
    )
    console.log(`124 user: `, user);
  }, [user])

  const filteredPositions = useMemo(() => {
    if (!selectedDeptId) return []
    return positions.filter(p => (p.adminDepartmentId ?? p.adminDepartment?.id) === selectedDeptId)
  }, [positions, selectedDeptId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'AdminPositionId') {
      const pos = positions.find(p => p.id === value)
      const depId = pos?.adminDepartmentId ?? pos?.adminDepartment?.id ?? ''
      if (depId && depId !== selectedDeptId) setSelectedDeptId(depId)
    }
  }

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depId = e.target.value
    setSelectedDeptId(depId)
    setForm(prev => ({ ...prev, AdminPositionId: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !selectedDeptId || !form.AdminPositionId) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      setLoading(true)

      // ส่ง password เฉพาะตอนที่มีการกรอกจริง ๆ
      const body: any = {
        id,
        username: form.username,
        name: form.name,
        email: form.email,
        tel: form.tel,
        AdminPositionId: form.AdminPositionId,
        adminDepartmentId: selectedDeptId,
        createdBy: user?.id || '',
      }
      if (form.password && form.password.trim().length > 0) {
        body.password = form.password
      }

      const res = await axios.put('/api/admin', body)

      if (res.data?.success) {
        await queryClient.invalidateQueries({ queryKey: qk.admins.list, exact: false })
        alert('แก้ไข Admin สำเร็จ')
        router.push('/admin')
      } else {
        alert(res.data?.error || 'เกิดข้อผิดพลาดในการแก้ไข Admin')
      }
    } catch (e) {
      console.error('Edit admin failed:', e)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TheLayout>
      <div className="max-w-sm sm:max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-6 mt-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-4 text-gray-800 border-b pb-4">แก้ไขข้อมูลผู้ดูแลระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700">
              ชื่อผู้ใช้ <span className="text-red-500">*</span>
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              placeholder="กรอกชื่อผู้ใช้"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700">
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700">
              เบอร์โทร
            </label>
            <input
              name="tel"
              value={form.tel}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              placeholder="กรอกเบอร์โทร (ไม่บังคับ)"
            />
          </div>

          {/* เลือกแผนก */}
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700">
              แผนก <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDeptId}
              onChange={handleDeptChange}
              required
              disabled={departments.length === 0}
              className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${departments.length === 0
                ? 'bg-gray-100 cursor-not-allowed opacity-60'
                : 'bg-white hover:border-gray-400 cursor-pointer'
                }`}
            >
              <option value="" disabled>{departments.length === 0 ? 'ไม่มีข้อมูลแผนก' : '-- เลือกแผนก --'}</option>
              {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
            </select>
            {departments.length === 0 && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-start gap-1">
                <span className="mt-0.5">⚠️</span>
                <span>ไม่พบข้อมูลแผนกจาก API — ระบบจะดึงจากตำแหน่งให้อัตโนมัติเมื่อมีข้อมูล</span>
              </p>
            )}
          </div>

          {/* ตำแหน่ง */}
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-700">
              ตำแหน่ง <span className="text-red-500">*</span>
            </label>
            <select
              name="AdminPositionId"
              value={form.AdminPositionId}
              onChange={handleChange}
              required
              disabled={!selectedDeptId}
              className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${!selectedDeptId
                ? 'bg-gray-100 cursor-not-allowed opacity-60'
                : 'bg-white hover:border-gray-400 cursor-pointer'
                }`}
            >
              <option value="" disabled>{selectedDeptId ? '-- เลือกตำแหน่ง --' : 'เลือกแผนกก่อน'}</option>
              {filteredPositions.map(pos => (
                <option key={pos.id} value={pos.id}>
                  {pos.name} {pos.adminDepartment ? `(${pos.adminDepartment.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 text-sm sm:text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-md hover:shadow-lg"
            >
              {loading ? '⏳ กำลังบันทึก...' : '✅ บันทึกข้อมูล'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/admins')}
              className="flex-1 sm:flex-none px-6 py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 border border-gray-300"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </TheLayout>
  )
}
