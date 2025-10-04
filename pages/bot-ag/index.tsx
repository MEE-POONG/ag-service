import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import { TheLayout } from '@/components/TheLayout'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import CommandWorkModalCredit from '@/container/bot-ag/CommandWork/ModalCredit'
import { AgUserAccountDB } from '@prisma/client'
import CommandWorkModalCreateC from '@/container/bot-ag/CommandWork/ModalCreateC'
import CommandWorkModalLockUnLockC from '@/container/bot-ag/CommandWork/ModalLockUnLockC'
import PageHeader from '@/components/PageHeader'
import PaginationSelect from '@/components/PaginationSelect'
import { Params } from '@/data/interfaceDefault'
import ModalAdJustBet from '@/container/bot-ag/ModalAdJustBet'

function useAgUserAccounts() {
  const [items, setItems] = useState<AgUserAccountDB[]>([])
  const add = (item: AgUserAccountDB) => setItems(prev => [...prev, item])
  const update = (idx: number, item: AgUserAccountDB) =>
    setItems(prev => prev.map((v, i) => (i === idx ? item : v)))
  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  return { items, add, update, remove, setItems }
}

export default function CommandWorkPage() {
  const { items, add, update, remove, setItems } = useAgUserAccounts()
  const [params, setParams] = useState<Params>({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
    totalItems: 0,
  })
  const debouncedKeyword = useDebouncedValue(params.keyword, 300)

  // Fetch list via react-query (server-side filter by keyword)
  const { data, isFetching } = useQuery<{ items: AgUserAccountDB[]; pagination?: Params }>({
    queryKey: qk.agUsers.listPaged(debouncedKeyword, params.page, params.pageSize),
    queryFn: async () => {
      const res = await axios.get('/api/aguseraccounts', {
        params: {
          keyword: debouncedKeyword,
          page: params.page,
          pageSize: params.pageSize
        }
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อมูลล้มเหลว')
      return {
        items: (res.data.data || []) as AgUserAccountDB[],
        pagination: res.data.pagination as Params | undefined,
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
        setParams((prev) => ({
          ...prev,
          totalPages: data.pagination!.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0
        }))
      }
    }
  }, [data, setItems])


  // Mutations: create, update, delete (with optimistic updates on current page)


  const list = items

  return (
    <TheLayout>
      <PageHeader
        title="คำสั่งหน้างาน AG"
        icon='FaRobot'
        description="ระบบจัดการตั้งค่าเว็บไซต์ของระบบ"
        gradient={true}
      />
      <div className="mx-auto ">
        <div className="p-4 mb-6 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 sm:mb-8 bg-white/90">
          {isFetching && (
            <div className="mb-3 text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
          )}
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:gap-4 sm:mb-6">
            <input
              value={params.keyword}
              onChange={e => setParams(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
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
                          <ModalAdJustBet agUser={{ ...u, userLogin: u.userLogin ?? '' }} mode="create" />
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
          <div className="my-2 sm:mt-3">
            <PaginationSelect
              params={params}
              setParams={setParams}
            />
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
