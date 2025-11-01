import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import { TheLayout } from '@/components/TheLayout'
import { useEffect, useState } from 'react'
import CommandWorkModalCredit from '@/container/bot-ag/CommandWork/ModalCredit'
import { AgUserAccountDB } from '@prisma/client'
import CommandWorkModalLockUnLockC from '@/container/bot-ag/CommandWork/ModalLockUnLockC'
import PageHeader from '@/components/PageHeader'
import PaginationSelect from '@/components/PaginationSelect'
import { Params } from '@/data/interfaceDefault'
import ModalAdJustBet from '@/container/bot-ag/ModalAdJustBet'
import ModalReset from '@/container/partner/ModalReset'
import ModalCreateAgent from '@/container/partner/ModalCreateAgent'
import ModalResetAgUserPassword from '@/container/partner/ModalResetAgUserPassword'
import ModalResetPartner from '@/container/partner/ModalResetPartner'
import ModalCreateMaster from '@/container/partner/ModalCreateMaster'
import { useAuth } from '@/hooks/useAuth'
import { HeadSupportResult, useHeadSupport } from "@/hooks/useHeadSupport";
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function useAgUserAccounts() {
  const [items, setItems] = useState<AgUserAccountDB[]>([])
  const add = (item: AgUserAccountDB) => setItems(prev => [...prev, item])
  const update = (idx: number, item: AgUserAccountDB) =>
    setItems(prev => prev.map((v, i) => (i === idx ? item : v)))
  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  return { items, add, update, remove, setItems }
}
function useTotpRemaining(stepSec = 30) {
  const calc = () => stepSec - (Math.floor(Date.now() / 1000) % stepSec)
  const [remaining, setRemaining] = useState<number>(calc)
  useEffect(() => {
    const id = setInterval(() => setRemaining(calc()), 1000)
    return () => clearInterval(id)
  }, [stepSec, calc])
  return remaining
}

export default function CommandWorkPage() {
  const { items, add, update, remove, setItems } = useAgUserAccounts()
  const totpRemaining = useTotpRemaining(30)

  const { user } = useAuth()
  const hs = useHeadSupport() // ใช้ path ปัจจุบัน
  const [params, setParams] = useState<Params>({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
    totalItems: 0,
  })
  const debouncedKeyword = useDebouncedValue(params.keyword, 300)

  useEffect(() => {
    console.log('user : ', user);
  }, [user])
  useEffect(() => {
    console.log('hs : ', hs);
  }, [hs])

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
                  <th className="px-3 py-2 font-semibold text-left">UserCheck</th>
                  <th className="px-3 py-2 font-semibold text-left">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {list.map((u, idx) => (
                  <tr key={u.id ?? `${u.username}-${idx}`} className="hover:bg-[#A78BFA]/5 transition-colors">
                    <td className="px-3 py-2 font-semibold text-gray-900">{u.username}</td>
                    <td className="px-3 py-2">{u.userLogin}</td>
                    <td className="px-3 py-2 capitalize">{u.position}</td>
                    <td className="px-3 py-2 capitalize">
                      <div>
                        {/* ถ้า position คือ senior และ origin มีค่า*/}
                        {u.position === 'senior' && u.origin && <>
                          {u.reserve}
                          <br />
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 select-none">
                            เหลือ {totpRemaining}s
                          </span>
                          <br />
                          <Button
                            size="xs"
                            className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-3 mb-2"
                            onClick={async () => {
                              try {
                                if (!u.gaSecretEnc) throw new Error('ไม่พบรหัสลับ 2FA')
                                const res = await axios.post('/api/totp/generate', { secret: u.gaSecretEnc })
                                if (!res.data?.success) throw new Error(res.data?.error || 'สร้าง TOTP ไม่สำเร็จ')
                                await navigator.clipboard.writeText(res.data.code)
                                toast.success('คัดลอก TOTP แล้ว')
                              } catch (e: any) {
                                toast.error(e?.message || 'สร้าง TOTP ไม่สำเร็จ')
                              }
                            }}
                          >
                            คัดลอก TOTP
                          </Button>
                          <br />
                          <Button
                            size="xs"
                            className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-3"
                            onClick={async () => {
                              try {
                                if (!u.gaSecretEnc) throw new Error('ไม่พบรหัสลับ 2FA')
                                const res = await axios.post('/api/totp/generate', { secret: u.gaSecretEnc })
                                if (!res.data?.success) throw new Error(res.data?.error || 'สร้าง TOTP ไม่สำเร็จ')
                                await navigator.clipboard.writeText(res.data.code)
                                toast.success('คัดลอก TOTP (ลาว) แล้ว')
                              } catch (e: any) {
                                toast.error(e?.message || 'สร้าง TOTP (ลาว) ไม่สำเร็จ')
                              }
                            }}
                          >
                            คัดลอก TOTP (ลาว)
                          </Button>
                        </>}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {/* {hs.support?.canCreate || hs.head?.userCanAdvance ? 'block' : 'hidden'} */}
                      <div className={`flex gap-2 bg-blue-500/10 p-1 border border-blue-500/20 rounded-md ${hs.support?.canCreate || hs.head?.userCanAdvance || (user?.username === 'superadmin' || user?.username === 'admin' || user?.adminPosition?.adminDepartment?.name === "IT Department") ? 'block' : 'hidden'}`}>
                        {/* ทุกอันจะเป็น modal */}
                        <CommandWorkModalCredit data={u} />
                        {u.position === 'agent' && <>
                          {/* <CommandWorkModalCreateC data={u} /> */}
                          <CommandWorkModalLockUnLockC data={u} />
                          <ModalAdJustBet agUser={{ ...u, userLogin: u.userLogin ?? '' }} mode="create" />

                        </>}
                        {/* ปลดล็อคMaster Agent*/}
                      </div>
                      {/* เฉพาะสิทธิ advance */}
                      <div className={`flex gap-2 mt-2 bg-red-500/10 p-1 border border-red-500/20 rounded-md ${hs.head?.userCanAdvance || (user?.username === 'superadmin' || user?.username === 'admin' || user?.adminPosition?.adminDepartment?.name === "IT Department") ? 'block' : 'hidden'}`}>
                        <ModalReset data={u} />
                        <ModalResetPartner data={u} onSuccess={() => console.log('Success!')} />
                        {u.position === 'master' && <>
                          <ModalCreateAgent data={u} onSuccess={() => console.log('Success!')} />
                        </>}
                        {u.position === 'senior' && <>
                          <ModalCreateMaster data={u} onSuccess={() => console.log('Success!')} />
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
