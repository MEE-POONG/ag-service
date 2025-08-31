import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
// //import { sampleUser } from '@/data/sampleUser'
import axios from 'axios'

interface AuthUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'user' | 'aguser'
  permissions?: string[]
}

export default function DocumentsPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me')
        const data = response.data
        
        if (data.isAuthenticated) {
          setAuthUser(data.user)
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return null
  }

  return (
    <TheLayout>
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">จัดการเอกสาร</h1>
          <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            อัปโหลดเอกสาร
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-gray-600">ยังไม่มีเอกสาร</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">คลิกเพื่ออัปโหลดเอกสารใหม่</p>
          </div>
        </div>
      </div>
    </TheLayout>
  )
} 

