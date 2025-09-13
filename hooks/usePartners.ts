import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '@/data/apiEndpoints'

export interface Partner {
  id: string
  agentId: string
  bankName: string
  bankNumber: string
  name: string
  tel: string
  line: string
  status: string
  method: string
  startDate: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  agent: {
    id: string
    username: string
    userLogin: string
    webname: string
    position: string
  }
}

export interface PartnersResponse {
  success: boolean
  data: Partner[]
  message?: string
  error?: string
}

export interface PartnersStats {
  total: number
  active: number
  pending: number
  suspended: number
}

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PartnersStats>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0
  })

  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(API_ENDPOINTS.PARTNERS.LIST)
      const result: PartnersResponse = await response.json()
      
      if (result.success && result.data) {
        setPartners(result.data)
        
        // Calculate stats
        const total = result.data.length
        const active = result.data.filter(p => p.status === 'active').length
        const pending = result.data.filter(p => p.status === 'pending').length
        const suspended = result.data.filter(p => p.status === 'suspended').length
        
        setStats({ total, active, pending, suspended })
      } else {
        setError(result.error || 'ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API')
      console.error('Error fetching partners:', err)
    } finally {
      setLoading(false)
    }
  }

  const createPartner = async (partnerData: Partial<Partner>) => {
    try {
      const response = await fetch(API_ENDPOINTS.PARTNERS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchPartners() // Refresh the list
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { success: false, error: 'เกิดข้อผิดพลาดในการสร้างข้อมูล' }
    }
  }

  const updatePartner = async (id: string, partnerData: Partial<Partner>) => {
    try {
      const response = await fetch(API_ENDPOINTS.PARTNERS.UPDATE(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchPartners() // Refresh the list
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }
    }
  }

  const deletePartner = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.PARTNERS.DELETE(id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchPartners() // Refresh the list
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { success: false, error: 'เกิดข้อผิดพลาดในการลบข้อมูล' }
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  return {
    partners,
    loading,
    error,
    stats,
    fetchPartners,
    createPartner,
    updatePartner,
    deletePartner,
  }
}
