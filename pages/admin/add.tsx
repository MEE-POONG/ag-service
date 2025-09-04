import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { TheLayout } from '@/components/TheLayout'
import axios from '@/lib/axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'

interface Position {
  id: string
  name: string
  adminDepartmentId?: string
  adminDepartment?: { id: string; name: string } | null
}
interface Department {
  id: string
  name: string
}

export default function AddAdminPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState('') // แผนกที่เลือก
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    tel: '',
    adminPositionId: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const queryClient = useQueryClient()
  const { data: posDep } = useQuery({
    queryKey: qk.positions.list,
    queryFn: async () => {
      const res = await axios.get('/api/admin-positions')
      return {
        positions: (res.data?.positions ?? res.data?.data ?? []) as Position[],
        departments: (res.data?.departments ?? []) as Department[],
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    console.log(posDep);
    
    if (posDep) {
      setPositions(posDep.positions)
      setDepartments(posDep.departments)
      if (posDep.departments.length === 1) setSelectedDeptId(posDep.departments[0].id)
    }
  }, [posDep])

  // กรองตำแหน่งตามแผนกที่เลือก
  const filteredPositions = useMemo(() => {
    if (!selectedDeptId) return []
    return positions.filter(p =>
      (p.adminDepartmentId ?? p.adminDepartment?.id) === selectedDeptId
    )
  }, [positions, selectedDeptId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // ถ้าเปลี่ยนตำแหน่ง ให้ sync แผนกอัตโนมัติ (กันเลือกข้ามแผนก)
    if (name === 'adminPositionId') {
      const pos = positions.find(p => p.id === value)
      const deptId = pos?.adminDepartmentId ?? pos?.adminDepartment?.id ?? ''
      if (deptId && deptId !== selectedDeptId) {
        setSelectedDeptId(deptId)
      }
    }
  }

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depId = e.target.value
    setSelectedDeptId(depId)
    // รีเซ็ตตำแหน่งเมื่อเปลี่ยนแผนก
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
      const response = await axios.post('/api/admin', {
        ...form,
        adminDepartmentId: selectedDeptId,
        createdBy: 'admin',
      })
      const result = response.data
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: qk.admins.list })
        alert('สร้าง Admin สำเร็จ')
        router.push('/admin')
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการสร้าง Admin')
      }
    } catch (error) {
      console.error('Create admin failed:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TheLayout>
      <div className="max-w-sm sm:max-w-xl mx-auto bg-white shadow rounded-lg p-4 sm:p-8 mt-4 sm:mt-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">เพิ่มผู้ดูแลระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">ชื่อผู้ใช้ *</label>
            <input name="username" value={form.username} onChange={handleChange} required className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">รหัสผ่าน *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="input-field text-sm" />
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

          {/* เลือกแผนกก่อน */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">แผนก *</label>
            <select
              value={selectedDeptId}
              onChange={handleDeptChange}
              required
              className="input-field text-sm"
            >
              <option value="" disabled>-- เลือกแผนก --</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>

          {/* ตำแหน่ง: แสดงเฉพาะของแผนกที่เลือก */}
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

          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mt-4 sm:mt-6">
            <button type="submit" className="btn-primary text-sm sm:text-base" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'เพิ่มผู้ดูแลระบบ'}
            </button>
            <button type="button" className="btn-secondary text-sm sm:text-base" onClick={() => router.push('/admin/admins')}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </TheLayout>
  )
}
