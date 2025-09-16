/**
 * 📋 useMenu Hook - Menu Web Management
 *
 * 🎯 วัตถุประสงค์:
 * - จัดการสถานะข้อมูลเมนูเว็บ
 * - ดึงข้อมูลเมนูเว็บปัจจุบันและเก็บใน cache
 * - จัดการการ refresh และ update เมนู
 * - ป้องกันการเข้าถึงเมนูที่ไม่มีสิทธิ์
 *
 * 🔄 การทำงาน:
 * - เรียก API /api/auth/me เพื่อดึงข้อมูลเมนูเว็บ
 * - เก็บข้อมูลเมนูใน TanStack Query cache
 * - จัดการการ invalidate และ refetch เมนู
 * - จัดการการกรองเมนูตามสิทธิ์ผู้ใช้
 *
 * 📤 Return Values:
 * - menuWeb: ข้อมูลเมนูเว็บทั้งหมด (หรือ null หากไม่มีข้อมูล)
 * - menuLoading: สถานะการโหลดข้อมูลเมนู
 * - error: ข้อผิดพลาด (ถ้ามี)
 * - refreshMenu: ฟังก์ชันสำหรับรีเฟรชข้อมูลเมนู
 */

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'

/** 🔄 ประเภทข้อมูลที่ useMenu hook จะ return */
interface UseMenuReturn {
  menuWeb: any | null              // ข้อมูลเมนูเว็บทั้งหมด
  menuLoading: boolean             // สถานะการโหลด
  error: string | null             // ข้อผิดพลาด
  refreshMenu: () => Promise<void> // ฟังก์ชัน refresh เมนู
}

export function useMenuWeb(): UseMenuReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  // 🔍 ดึงข้อมูลเมนูเว็บปัจจุบันจาก API
  const {
    data: menuWebData,
    isFetching,
    isPending,
    error,
  } = useQuery({
    queryKey: qk.menus.all,        // Key แยกต่างหากสำหรับ menuWeb
    queryFn: async () => {
      const res = await axios.get('/api/auth/me')
      // console.log('📦 useMenuWeb: Full API Response:', res.data)
      // console.log('🎯 useMenuWeb: menuWeb data:', res.data?.menuWeb)
      return res.data?.menuWeb ?? null // ดึงเฉพาะข้อมูล menuWeb
    },
    staleTime: 5 * 60 * 1000,      // Cache เป็นเวลา 5 นาที
    retry: 1,                      // ลองใหม่ 1 ครั้งหากเกิดข้อผิดพลาด
    refetchOnWindowFocus: false,   // ไม่ต้อง refetch เมื่อกลับมาที่ window
  })

  // 🔄 จัดการการ refresh เมนู
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get('/api/auth/me') // เรียก API เพื่อดึงข้อมูลใหม่
      return res.data?.menuWeb ?? null
    },
    onSuccess: (data) => {
      // 🧹 อัพเดทข้อมูลที่เก็บไว้
      queryClient.setQueryData(qk.menus.all, data)
    },
  })

  /**
   * 🔄 ฟังก์ชัน refresh เมนู
   * - เรียก API /api/auth/me เพื่อดึงข้อมูลเมนูใหม่
   * - อัพเดทข้อมูลที่เก็บไว้ใน cache
   * - จัดการ error หากเกิดข้อผิดพลาด
   */
  const refreshMenu = async () => {
    try {
      await refreshMutation.mutateAsync()  // ลองเรียก API เพื่อดึงข้อมูลใหม่
    } catch (err) {
      // 🚨 จัดการ error แต่ไม่ต้อง throw เพื่อไม่ให้ app crash
      console.error('Failed to refresh menu:', err)
    }
  }

  // 📤 ส่งข้อมูลและฟังก์ชันกลับไปยัง component
  // console.log('🚀 useMenuWeb: Returning data:', {
  //   menuWeb: menuWebData,
  //   menuLoading: isPending || isFetching,
  //   isPending,
  //   isFetching,
  //   error: error?.message
  // })

  return {
    menuWeb: menuWebData ?? null,                                        // ข้อมูลเมนูเว็บทั้งหมด
    menuLoading: isPending || isFetching,                               // สถานะการโหลด
    error: error ? (error as any)?.message ?? 'การโหลดเมนูล้มเหลว' : null, // ข้อผิดพลาด
    refreshMenu,                                                        // ฟังก์ชัน refresh เมนู
  }
}

