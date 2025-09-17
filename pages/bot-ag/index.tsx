import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import CommandWorkModalCredit from '@/container/bot-ag/CommandWork/ModalCredit'
import { AgUserAccountDB } from '@prisma/client'
import CommandWorkModalCreateC from '@/container/bot-ag/CommandWork/ModalCreateC'
import CommandWorkModalLockUnLockC from '@/container/bot-ag/CommandWork/ModalLockUnLockC'
import PageHeader from '@/components/PageHeader'

function useAgUserAccounts() {
  const [items, setItems] = useState<AgUserAccountDB[]>([])
  const add = (item: AgUserAccountDB) => setItems(prev => [...prev, item])
  const update = (idx: number, item: AgUserAccountDB) =>
    setItems(prev => prev.map((v, i) => (i === idx ? item : v)))
  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  return { items, add, update, remove, setItems }
}

export default function CommandWorkPage() {
  const queryClient = useQueryClient()
  const { items, add, update, remove, setItems } = useAgUserAccounts()
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebouncedValue(keyword, 300)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Fetch list via react-query (server-side filter by keyword)
  const { data, isFetching } = useQuery<{ items: AgUserAccountDB[]; pagination?: { totalItems: number; totalPages: number; currentPage: number; pageSize: number } }>({
    queryKey: qk.agUsers.listPaged(debouncedKeyword, page, pageSize),
    queryFn: async () => {
      const res = await axios.get('/api/aguseraccounts', { params: { keyword: debouncedKeyword, page, pageSize } })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อมูลล้มเหลว')
      return {
        items: (res.data.data || []) as AgUserAccountDB[],
        pagination: res.data.pagination as { totalItems: number; totalPages: number; currentPage: number; pageSize: number } | undefined,
      }
    },
    staleTime: 30 * 1000,
  })

  useEffect(() => {
    if (data) {
      const mapped = (data.items || []).map((it: any) => {
        if (it?.webname) return it
        try {
          const m = it?.meta ? JSON.parse(it.meta) : null
          return { ...it, webname: m?.webname }
        } catch {
          return it
        }
      })
      setItems(mapped)
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1)
        setTotalItems(data.pagination.totalItems || 0)
      }
    }
  }, [data, setItems])

  // Reset to first page when keyword changes
  useEffect(() => {
    setPage(1)
  }, [debouncedKeyword])

  const listKey = qk.agUsers.listPaged(debouncedKeyword, page, pageSize)

  // Mutations: create, update, delete (with optimistic updates on current page)
  const createMutation = useMutation({
    onMutate: async (val: AgUserAccountDB) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const prev = queryClient.getQueryData<any>(listKey)
      const tempId = `temp-${Date.now()}`
      queryClient.setQueryData(listKey, (old: any) => {
        const items = old?.items ?? []
        const pagination = old?.pagination
        return {
          items: [{ ...val, id: tempId }, ...items].slice(0, pageSize),
          pagination,
        }
      })
      return { prev }
    },
    mutationFn: async (val: AgUserAccountDB) => {
      const res = await axios.post('/api/aguseraccounts', val)
      if (!res.data?.success) throw new Error(res.data?.error || 'บันทึกไม่สำเร็จ')
      return res.data.data as AgUserAccountDB
    },
    onError: (e: any, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(listKey, ctx.prev)
      toast.error(e?.message || 'เกิดข้อผิดพลาด')
    },
    onSuccess: async (created) => {
      // Replace temp with real if present
      queryClient.setQueryData(listKey, (old: any) => {
        const items = old?.items ?? []
        const withWeb = {
          ...created, webname: (created as any).webname ?? (() => {
            try {
              const m = (created as any)?.meta ? JSON.parse((created as any).meta) : null
              return m?.webname
            } catch {
              return undefined
            }
          })()
        }
        const idx = items.findIndex((x: any) => String(x.id || '').startsWith('temp-'))
        if (idx >= 0) {
          items[idx] = withWeb
        } else {
          items.unshift(withWeb)
        }
        return { ...old, items }
      })
      await queryClient.invalidateQueries({ queryKey: qk.agUsers.base })
      toast.success('เพิ่ม AG User สำเร็จ')
    },
  })

  const updateMutation = useMutation({
    onMutate: async (payload: AgUserAccountDB & { id: string }) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const prev = queryClient.getQueryData<any>(listKey)
      queryClient.setQueryData(listKey, (old: any) => {
        const items = (old?.items ?? []).map((x: any) => (x.id === payload.id ? { ...x, ...payload } : x))
        return { ...old, items }
      })
      return { prev }
    },
    mutationFn: async (payload: AgUserAccountDB & { id: string }) => {
      const res = await axios.put('/api/aguseraccounts', payload)
      if (!res.data?.success) throw new Error(res.data?.error || 'อัปเดตไม่สำเร็จ')
      return res.data.data as AgUserAccountDB
    },
    onError: (e: any, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(listKey, ctx.prev)
      toast.error(e?.message || 'เกิดข้อผิดพลาด')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.agUsers.base })
      toast.success('แก้ไข AG User สำเร็จ')
    },
  })

  const deleteMutation = useMutation({
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const prev = queryClient.getQueryData<any>(listKey)
      queryClient.setQueryData(listKey, (old: any) => {
        const items = (old?.items ?? []).filter((x: any) => x.id !== id)
        return { ...old, items }
      })
      return { prev }
    },
    mutationFn: async (id: string) => {
      const res = await axios.delete('/api/aguseraccounts', { data: { id } })
      if (!res.data?.success) throw new Error(res.data?.error || 'ลบไม่สำเร็จ')
      return true
    },
    onError: (e: any, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(listKey, ctx.prev)
      toast.error(e?.message || 'เกิดข้อผิดพลาด')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.agUsers.base })
      toast.success('ลบ AG User สำเร็จ')
    },
  })

  const list = items

  const startAdd = () => {
    setSelectedIndex(null)
    setOpenAdd(true)
  }

  const startEdit = (idx: number) => {
    setSelectedIndex(idx)
    setOpenEdit(true)
  }

  const startDelete = (idx: number) => {
    setSelectedIndex(idx)
    setOpenDelete(true)
  }

  return (
    <TheLayout>
      <PageHeader
        title="คำสั่งหน้างาน AG"
        icon='FaRobot'
        description="ระบบจัดการตั้งค่าเว็บไซต์ของระบบ"
        gradient={true}
      />
      <div className={`p1-1 sm:p-2`}>
        <div className="mx-auto ">
          <div className="p-4 mb-6 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 sm:mb-8 bg-white/90">
            {isFetching && (
              <div className="mb-3 text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
            )}
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:gap-4 sm:mb-6">
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="ค้นหา (รหัส/ล็อกอิน/ตำแหน่ง/ต้นทาง/สำรอง/Secret)"
                className="px-4 py-2 w-full text-sm sm:text-base rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm"
              />
            </div>

            <div className="overflow-hidden overflow-x-auto rounded-xl ring-1 ring-gray-200">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-white bg-gradient-to-r from-[#A78BFA] to-[#34D399]">
                    <th className="px-3 py-2 font-semibold text-left">Username</th>
                    <th className="px-3 py-2 font-semibold text-left">userLogin</th>
                    <th className="px-3 py-2 font-semibold text-left">position</th>
                    <th className="px-3 py-2 font-semibold text-left">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {list.map((u, idx) => (
                    <tr key={u.id ?? `${u.username}-${idx}`} className="hover:bg-[#A78BFA]/5 transition-colors">
                      <td className="px-3 py-2 font-semibold text-gray-900">{u.username}</td>
                      <td className="px-3 py-2">{u.userLogin}</td>
                      <td className="px-3 py-2 capitalize">{u.position}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          {/* ทุกอันจะเป็น modal */}
                          <CommandWorkModalCredit data={u} />
                          {u.position === 'agent' && <>
                            {/* <CommandWorkModalCreateC data={u} /> */}
                            <CommandWorkModalLockUnLockC data={u} />
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                ทั้งหมด {totalItems} รายการ
                <span className="text-sm text-gray-600">แสดง</span>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(parseInt(e.target.value, 10) || 10)}
                  className="px-3 py-1 text-end rounded-md border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  disabled={isFetching}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">ต่อหน้า</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-3"
                  disabled={isFetching || page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  ก่อนหน้า
                </Button>
                <span className="text-sm text-gray-700">หน้า {page} / {Math.max(1, totalPages)}</span>
                <Button
                  size="sm"
                  className="btn-theme hover:!brightness-95 rounded-full px-3"
                  disabled={isFetching || page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TheLayout>
  )
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
