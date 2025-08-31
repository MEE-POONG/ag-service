import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { TheLayout } from '@/components/TheLayout'
import axios from 'axios'
import { ExtendedAdminDB } from '@/data/interface'

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

export default function EditAdminPage() {
  const router = useRouter()
  const { id } = router.query
  
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState('') // แผนกที่เลือก
  const [admin, setAdmin] = useState<ExtendedAdminDB | null>(null)
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    tel: '',
    adminPositionId: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // โหลดข้อมูล Admin ที่ต้องการแก้ไข
  const fetchAdmin = async (adminId: string) => {
    try {
      const response = await axios.get(`/api/admin?id=${adminId}`)
      if (response.data.success && response.data.data) {
        const adminData = response.data.data
        setAdmin(adminData)
        setForm({
          username: adminData.username || '',
          name: adminData.name || '',
          email: adminData.email || '',
          tel: adminData.tel || '',
          adminPositionId: adminData.adminPositionId || '',
          isActive: adminData.isActive ?? true,
        })
        // ตั้งแผนกจากตำแหน่งปัจจุบัน
        const deptId = adminData.adminPosition?.adminDepartmentId || adminData.adminPosition?.adminDepartment?.id
        if (deptId) {
          setSelectedDeptId(deptId)
        }
      } else {
        console.error('API response error:', response.data)
        alert('ไม่พบข้อมูล Admin ที่ต้องการแก้ไข')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching admin:', error)
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      router.push('/admin')
    }
  }

  // โหลดข้อมูลตำแหน่งและแผนก
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูล positions และ departments จาก API
        const response = await axios.get('/api/admin-positions')
        if (response.data.success) {
          const positions: Position[] = response.data.data || []
          const departments: Department[] = response.data.departments || []
          setPositions(positions)
          setDepartments(departments)
        } else {
          console.error('Failed to fetch positions/departments:', response.data.error)
        }
      } catch (error) {
        console.error('Error fetching admin positions:', error)
      }
    }
    
    fetchData()
  }, [])

  // โหลดข้อมูล Admin เมื่อมี ID
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchAdmin(id)
    }
  }, [id])

  useEffect(() => {
    if (admin && positions.length > 0 && departments.length > 0) {
      setLoading(false)
    }
  }, [admin, positions, departments])

  // กรองตำแหน่งตามแผนกที่เลือก
  const filteredPositions = useMemo(() => {
    if (!selectedDeptId) return []
    return positions.filter(p =>
      (p.adminDepartmentId ?? p.adminDepartment?.id) === selectedDeptId
    )
  }, [positions, selectedDeptId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))

    // ถ้าเปลี่ยนตำแหน่ง ให้ sync แผนกอัตโนมัติ
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

    if (!form.username || !form.email || !selectedDeptId || !form.adminPositionId) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      setSaving(true)
      
      const updateData = {
        id,
        username: form.username,
        name: form.name,
        email: form.email,
        tel: form.tel,
        adminPositionId: form.adminPositionId,
        isActive: form.isActive,
        updatedBy: 'admin' // TODO: get from auth context
      }
      

      
      const response = await axios.put('/api/admin', updateData)

      const result = response.data
      if (result.success) {
        alert('แก้ไขข้อมูล Admin สำเร็จ')
        // รีเฟรชข้อมูลก่อนไปหน้าหลัก
        if (result.data) {
          setAdmin(result.data)
        }
        // เลื่อนเวลาเล็กน้อยก่อนไปหน้าหลักเพื่อให้เห็นการเปลี่ยนแปลง
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการแก้ไข')
      }
    } catch (error: any) {
      console.error('Update admin failed:', error)
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TheLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">กำลังโหลดข้อมูล...</div>
        </div>
      </TheLayout>
    )
  }

  if (!admin) {
    return (
      <TheLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">ไม่พบข้อมูล Admin</div>
        </div>
      </TheLayout>
    )
  }

  return (
    <TheLayout>
      <div className="max-w-sm sm:max-w-xl mx-auto bg-white shadow rounded-lg p-4 sm:p-8 mt-4 sm:mt-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">แก้ไขผู้ดูแลระบบ</h1>
          <div className="text-sm text-gray-500">
            ID: {admin.id}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">ชื่อผู้ใช้ *</label>
            <input 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              required 
              className="input-field text-sm"
              disabled={saving}
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">ชื่อ-นามสกุล *</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              className="input-field text-sm"
              disabled={saving}
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">อีเมล *</label>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="input-field text-sm"
              disabled={saving}
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">เบอร์โทร</label>
            <input 
              name="tel" 
              value={form.tel} 
              onChange={handleChange} 
              className="input-field text-sm"
              disabled={saving}
            />
          </div>

          {/* เลือกแผนกก่อน */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">แผนก *</label>
            <select
              value={selectedDeptId}
              onChange={handleDeptChange}
              required
              className="input-field text-sm"
              disabled={saving}
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
              disabled={!selectedDeptId || saving}
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

          {/* สถานะการใช้งาน */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={saving}
                className="rounded"
              />
              <span className="text-xs sm:text-sm font-medium">เปิดใช้งาน</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mt-4 sm:mt-6">
            <button 
              type="submit" 
              className="btn-primary text-sm sm:text-base" 
              disabled={saving}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <button 
              type="button" 
              className="btn-secondary text-sm sm:text-base" 
              onClick={() => router.push('/admin')}
              disabled={saving}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </TheLayout>
  )
}
