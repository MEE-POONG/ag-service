import { useState, useEffect } from 'react'
import axios from 'axios'

interface DashboardStats {
  totalUsers: number
  totalMenus: number
  activeMenus: number
  todayVisits: number
}

interface DashboardData {
  stats: DashboardStats
  recentActivities: any[]
  systemHealth: {
    status: 'healthy' | 'warning' | 'error'
    message: string
  }
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api')
      const result = response.data

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  }
} 
