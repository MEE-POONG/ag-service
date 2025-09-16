/**
 * 🔐 useAuth Hook - Authentication Management
 *
 * 🎯 วัตถุประสงค์:
 * - จัดการสถานะการเข้าสู่ระบบของผู้ใช้
 * - ดึงข้อมูลผู้ใช้ปัจจุบันและเก็บใน cache
 * - จัดการการ logout และ redirect
 * - ป้องกันการเข้าถึงหน้าที่ต้องมีการยืนยันตัวตน
 *
 * 🔄 การทำงาน:
 * - เรียก API /api/auth/me เพื่อตรวจสอบสถานะ login
 * - เก็บข้อมูลผู้ใช้ใน TanStack Query cache
 * - Redirect ไป login page เมื่อไม่มีการ authenticate
 * - จัดการ logout และล้าง cache
 *
 * 📤 Return Values:
 * - user: ข้อมูลผู้ใช้ปัจจุบัน (หรือ null หากไม่ได้ login)
 * - userLoading: สถานะการโหลดข้อมูลผู้ใช้
 * - error: ข้อผิดพลาด (ถ้ามี)
 * - logout: ฟังก์ชันสำหรับออกจากระบบ
 */

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { ExtendedAdminDB } from '@/data/interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'

/** 🔄 ประเภทข้อมูลที่ useAuth hook จะ return */
interface UseAuthReturn {
  user: ExtendedAdminDB | null    // ข้อมูลผู้ใช้ปัจจุบัน
  userLoading: boolean            // สถานะการโหลด
  error: string | null            // ข้อผิดพลาด
  logout: () => Promise<void>     // ฟังก์ชัน logout
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  // 🔍 ดึงข้อมูลผู้ใช้ปัจจุบันจาก API
  const {
    data: meData,
    isFetching,
    isPending,
    error,
  } = useQuery({
    queryKey: qk.auth.me,          // Key สำหรับ cache
    queryFn: async () => {
      const res = await axios.get('/api/auth/me')
      return res.data?.user ?? null // ดึงเฉพาะข้อมูล user
    },
    staleTime: 5 * 60 * 1000,      // Cache เป็นเวลา 5 นาที
    retry: 1,                      // ลองใหม่ 1 ครั้งหากเกิดข้อผิดพลาด
    refetchOnWindowFocus: false,   // ไม่ต้อง refetch เมื่อกลับมาที่ window
  })

  // 🛡️ Auto-redirect ไป login page เมื่อไม่ได้ authenticate (client-side safeguard)
  useEffect(() => {
    if (!router.isReady) return                      // รอให้ router พร้อม
    if (router.pathname === '/auth/login') return    // ถ้าอยู่ที่หน้า login แล้วไม่ต้องทำอะไร
    if (meData === null) {                          // หากไม่มีข้อมูลผู้ใช้
      router.push('/auth/login')                     // redirect ไป login page
    }
  }, [router.isReady, router.pathname, meData, router])

  // 🚪 จัดการการ logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/logout') // เรียก API logout เพื่อล้าง cookie
    },
    onSuccess: () => {
      // 🧹 ล้างข้อมูลที่เก็บไว้
      try { localStorage.removeItem('auth-token') } catch {} // ล้าง legacy token (ถ้ามี)
      queryClient.setQueryData(qk.auth.me, null)            // ล้างข้อมูลผู้ใช้ใน cache
    },
  })

  /**
   * 🚪 ฟังก์ชัน logout
   * - เรียก API logout เพื่อล้าง authentication cookie
   * - ล้างข้อมูลที่เก็บไว้ใน localStorage และ cache
   * - Redirect ไปหน้า login
   */
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()  // ลองเรียก API logout
      router.push('/auth/login')          // redirect ไป login page
    } catch (err) {
      // 🚨 แม้ว่า API logout จะล้มเหลว ก็ยังต้องล้างข้อมูลและ redirect
      queryClient.setQueryData(qk.auth.me, null)
      try { localStorage.removeItem('auth-token') } catch {}
      router.push('/auth/login')
    }
  }

  // 📤 ส่งข้อมูลและฟังก์ชันกลับไปยัง component
  return {
    user: meData ?? null,                                            // ข้อมูลผู้ใช้ปัจจุบัน
    userLoading: isPending || isFetching,                           // สถานะการโหลด
    error: error ? (error as any)?.message ?? 'การตรวจสอบสิทธิ์ล้มเหลว' : null, // ข้อผิดพลาด
    logout,                                                         // ฟังก์ชัน logout
  }
}
