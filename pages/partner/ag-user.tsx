import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalDescription } from '@/components/form/Modal'
import ReactIconComponent from '@/components/ReactIconComponent'
import PageHeader from '@/components/PageHeader'
import PartnerModalFuctionSetting from '@/container/partner/ModalFuctionSetting'
import PaginationSelect from '@/components/PaginationSelect'
import { Params } from '@/data/interfaceDefault'
import PartnerModalReset from '@/container/partner/ModalReset'
import { AgUserAccountDB } from '@prisma/client'
import { useHeadSupport } from '@/hooks/useHeadSupport'
import WebBaseModalView from '@/container/web-ag/ModalView'
import { ExtendedWebBaseDB } from '@/data/interface'
import CommandWorkModalCredit from '@/container/bot-ag/CommandWork/ModalCredit'
import CommandWorkModalLockUnLockC from '@/container/bot-ag/CommandWork/ModalLockUnLockC'
import ModalAdJustBet from '@/container/bot-ag/ModalAdJustBet'
import ModalReset from '@/container/partner/ModalReset'
import ModalResetPartner from '@/container/partner/ModalResetPartner'
import ModalCreateAgent from '@/container/partner/ModalCreateAgent'
import ModalCreateMaster from '@/container/partner/ModalCreateMaster'
import { useAuth } from '@/hooks/useAuth'

type AgUserAccountFormData = {
  username: string
  reserve: string
  userLogin: string | null
  origin: string
  position: string
  gaSecretEnc: string
  webname: string
  partnerAG: string | null
  partnerLogin: string | null
}

const WEBNAME_OPTIONS = ['psd99', 'ufa66'] as const

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

export default function AgUserAccountPage() {
  const hs = useHeadSupport(); // ใช้ path ปัจจุบัน

  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    console.log('user : ', user);
  }, [user])
  useEffect(() => {
    console.log('hs : ', hs);
  }, [hs])

  const { items, add, update, remove, setItems } = useAgUserAccounts()
  const totpRemaining = useTotpRemaining(30)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
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

  const listKey = qk.agUsers.listPaged(debouncedKeyword, params.page, params.pageSize)

  // Mutations: create, update, delete (with optimistic updates on current page)
  const createMutation = useMutation({
    onMutate: async (val: AgUserAccountFormData) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const prev = queryClient.getQueryData<any>(listKey)
      const tempId = `temp-${Date.now()}`
      queryClient.setQueryData(listKey, (old: any) => {
        const items = old?.items ?? []
        const pagination = old?.pagination
        return {
          items: [{ ...val, id: tempId }, ...items].slice(0, params.pageSize),
          pagination,
        }
      })
      return { prev }
    },
    mutationFn: async (val: AgUserAccountFormData) => {
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
    onMutate: async (payload: AgUserAccountFormData & { id: string }) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const prev = queryClient.getQueryData<any>(listKey)
      queryClient.setQueryData(listKey, (old: any) => {
        const items = (old?.items ?? []).map((x: any) => (x.id === payload.id ? { ...x, ...payload } : x))
        return { ...old, items }
      })
      return { prev }
    },
    mutationFn: async (payload: AgUserAccountFormData & { id: string }) => {
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
        title="จัดการ AG User"
        icon='FaList'
        description="ระบบจัดการจัดการ AG User"
        gradient={true}
        actions={
          <Button
            size="xs"
            className="!bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6] rounded-full px-3 disabled:opacity-60"
            onClick={() => startAdd()}
            type="button"
          >
            + เพิ่ม AG User
          </Button>
        }
      />
      <div className={`py-2`}>
        <div className="mx-auto">
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

            <div className="overflow-hidden md:overflow-x-auto rounded-xl ring-1 ring-gray-200">
              <table className="w-full text-sm block md:table">
                <thead className="hidden md:table-header-group">
                  <tr className="text-white bg-gradient-to-r from-[#A78BFA] to-[#34D399]">
                    <th className="px-3 py-2 font-semibold text-left">Username</th>
                    <th className="px-3 py-2 font-semibold text-left">userLogin</th>
                    <th className="px-3 py-2 font-semibold text-left">Reserve</th>
                    <th className="px-3 py-2 font-semibold text-left">webname</th>
                    <th className="px-3 py-2 font-semibold text-left">origin</th>
                    <th className="px-3 py-2 font-semibold text-left">position</th>
                    <th className="px-3 py-2 font-semibold text-left">gaSecretEnc</th>
                    <th className="px-3 py-2 font-semibold text-left">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 block md:table-row-group">
                  {list.map((u, idx) => (
                    <tr key={u.id ?? `${u.username}-${idx}`} className="hover:bg-[#A78BFA]/5 transition-colors block md:table-row border-b border-gray-200 md:border-none py-3 md:py-0">
                      <td className="px-3 py-2 font-semibold text-gray-900 flex md:table-cell justify-between items-center border-b border-gray-100 md:border-b-0">
                        <span className="font-semibold text-gray-500 md:hidden">Username</span>
                        <span>{u.username}</span>
                      </td>
                      <td className="px-3 py-2 flex md:table-cell justify-between items-center border-b border-gray-100 md:border-b-0">
                        <span className="font-semibold text-gray-500 md:hidden">userLogin</span>
                        <span>{u.userLogin || '-'}</span>
                      </td>
                      <td className="px-3 py-2 flex md:table-cell justify-between items-center border-b border-gray-100 md:border-b-0">
                        <span className="font-semibold text-gray-500 md:hidden">Reserve</span>
                        <span>{u.reserve || '-'}</span>
                      </td>
                      <td className="px-3 py-2 flex md:table-cell justify-between items-center border-b border-gray-100 md:border-b-0">
                        <span className="font-semibold text-gray-500 md:hidden">webname</span>
                        <span>{u.webname || '-'}</span>
                      </td>
                      <td className="px-3 py-2 flex md:table-cell justify-between items-center border-b border-gray-100 md:border-b-0">
                        <span className="font-semibold text-gray-500 md:hidden">origin</span>
                        <span>{u.origin || '-'}</span>
                      </td>
                      <td className="px-3 py-2 flex md:table-cell justify-between items-center border-b border-gray-100 md:border-b-0">
                        <span className="font-semibold text-gray-500 md:hidden">position</span>
                        <span className="capitalize">{u.position}</span>
                      </td>
                      <td className="px-3 py-2 flex md:table-cell justify-between items-center border-b border-gray-100 md:border-b-0" title={u.gaSecretEnc}>
                        <span className="font-semibold text-gray-500 md:hidden">gaSecretEnc</span>
                        <div className="truncate max-w-[12rem] md:max-w-none">
                          {u.gaSecretEnc ? (
                            <Button
                              size="xs"
                              className="bg-blue-200 !text-gray-700 !border border-blue-500 hover:!bg-blue-100 rounded-full px-3"
                              onClick={async () => {
                                try {
                                  if (!u.gaSecretEnc) throw new Error('ไม่พบรหัสลับ 2FA')
                                  // Generate TOTP using otplib (Google Auth compatible)
                                  await navigator.clipboard.writeText(u.gaSecretEnc)
                                  toast.success('คัดลอก SecretEnc แล้ว')
                                } catch (e: any) {
                                  toast.error(e?.message || 'สร้าง SecretEnc ไม่สำเร็จ')
                                }
                              }}
                            >
                              คัดลอก SecretEnc
                            </Button>
                          ) : '-'}
                        </div>
                      </td>
                      <td className="px-3 py-2 flex flex-col md:table-cell gap-2">
                        <span className="font-semibold text-gray-500 md:hidden mb-1">การจัดการ</span>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Button
                            size="xs"
                            className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-3"
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
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 select-none">
                            เหลือ {totpRemaining}s
                          </span>
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
                          <Button
                            size="xs"
                            className="!bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6] rounded-full px-3 disabled:opacity-60"
                            onClick={() => startEdit(idx)}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="xs"
                            disabled={deleteMutation.isPending}
                            className="!bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6] rounded-full px-3 disabled:opacity-60"
                            onClick={() => startDelete(idx)}
                          >
                            {deleteMutation.isPending ? (
                              <span className="inline-flex gap-1 items-center">
                                <ReactIconComponent icon="FaSpinner" setClass="h-3.5 w-3.5 animate-spin" />
                                ลบ
                              </span>
                            ) : 'ลบ'}
                          </Button>
                          {['senior'].includes(u.position) && (
                            <PartnerModalFuctionSetting data={u} />
                          )}
                          {['agent', 'master'].includes(u.position) && (
                            <PartnerModalReset data={u} />
                          )}
                        </div>
                        <div className={`gap-2 bg-blue-500/10 p-1 border border-blue-500/20 rounded-md ${hs.support?.canCreate || hs.head?.userCanAdvance || (user?.username === 'superadmin' || user?.username === 'admin' || user?.adminPosition?.adminDepartment?.name === "IT Department") ? 'flex flex-wrap' : 'hidden'}`}>
                          {/* ทุกอันจะเป็น modal */}
                          <CommandWorkModalCredit data={u} />
                          {u.position === 'agent' && <>
                            {/* <CommandWorkModalCreateC data={u} /> */}
                            <CommandWorkModalLockUnLockC data={u} />
                            <ModalAdJustBet agUser={{ ...u, userLogin: u.userLogin ?? '' }} mode="create" />

                          </>}
                          {/* ปลดล็อคMaster Agent*/}
                        </div>
                        <div className={`gap-2 mt-2 bg-red-500/10 p-1 border border-red-500/20 rounded-md ${hs.head?.userCanAdvance || (user?.username === 'superadmin' || user?.username === 'admin' || user?.adminPosition?.adminDepartment?.name === "IT Department") ? 'block' : 'hidden'}`}>
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
                    <tr className="block md:table-row">
                      <td className="px-3 py-6 text-center text-gray-500 block md:table-cell" colSpan={8}>
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
      </div>

      {/* Modal: Add */}
      <AgUserAccountFormModal
        key={`add-${openAdd}`}
        title="เพิ่ม AG User"
        open={openAdd}
        onOpenChange={setOpenAdd}
        loading={createMutation.isPending}
        onSubmit={(val, helpers) => {
          // unique AgUserAccount
          if (items.some((i) => i.username === val.username)) {
            helpers.setError('Username นี้ถูกใช้แล้ว')
            return
          }
          createMutation.mutate(val, {
            onSuccess: () => {
              helpers.reset()
              setOpenAdd(false)
            },
            onError: (e: any) => helpers.setError(e?.message || 'เกิดข้อผิดพลาด')
          })
        }}
      />

      {/* Modal: Edit */}
      {openEdit && selectedIndex != null && (
        <AgUserAccountFormModal
          title="แก้ไข AG User"
          open={openEdit}
          onOpenChange={setOpenEdit}
          loading={updateMutation.isPending}
          initialValue={items[selectedIndex]}
          onSubmit={(val, helpers) => {
            // unique AgUserAccount (ignore current index)
            const duplicate = items.some((i, idx) => idx !== selectedIndex && i.username === val.username)
            if (duplicate) {
              helpers.setError('Username นี้ถูกใช้แล้ว')
              return
            }
            const cur = items[selectedIndex]
            if (!cur?.id) {
              helpers.setError('ไม่พบรหัสรายการ')
              return
            }
            updateMutation.mutate({ ...val, id: cur.id }, {
              onSuccess: () => setOpenEdit(false),
              onError: (e: any) => helpers.setError(e?.message || 'เกิดข้อผิดพลาด')
            })
          }}
        />
      )}

      {/* Modal: Delete */}
      {openDelete && selectedIndex != null && (
        <Modal open={openDelete} onOpenChange={setOpenDelete} size="sm">
          <ModalHeader>
            <div className="flex flex-col">
              <ModalTitle>
                <span className="bg-gradient-to-r from-[#A78BFA] to-[#34D399] bg-clip-text text-transparent">ลบ AG User</span>
              </ModalTitle>
              <ModalDescription className="mt-1 text-gray-500">การลบไม่สามารถย้อนกลับได้ โปรดยืนยันอีกครั้ง</ModalDescription>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-700">
              ยืนยันการลบผู้ใช้
              <span className="mx-1 font-semibold">{items[selectedIndex].username}</span>
              หรือไม่?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-4"
              onClick={() => setOpenDelete(false)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              className="rounded-full px-4 shadow flex items-center gap-1.5 disabled:opacity-60"
              disabled={deleteMutation.isPending}
              onClick={() => {
                const cur = items[selectedIndex]
                if (cur?.id) {
                  deleteMutation.mutate(cur.id)
                } else {
                  toast.error('ไม่พบรหัสรายการ')
                }
                setOpenDelete(false)
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="h-4 w-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaTrashAlt" setClass="h-4 w-4" />
                  ลบ
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}
      {/* Floating Password Viewer Button (Bottom Right) */}
      <FloatingWebBaseViewer />
    </TheLayout>
  )
}

function FloatingWebBaseViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: webBasesData } = useQuery<{ success: boolean; data: ExtendedWebBaseDB[] }>({
    queryKey: qk.webBase.list('', '', 1, 100),
    queryFn: async () => {
      const res = await axios.get('/api/web-base')
      return res.data
    },
    staleTime: 60 * 1000,
  })

  const webBases = webBasesData?.data || []

  const filteredWebBases = useMemo(() => {
    if (!searchQuery) return webBases
    return webBases.filter(wb =>
      wb.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [webBases, searchQuery])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#A78BFA] to-[#34D399] text-white flex justify-between items-center">
            <span className="font-semibold text-sm flex items-center gap-1.5">
              <ReactIconComponent icon="FaKey" setClass="h-4 w-4" />
              ดูรหัส Web Base
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <ReactIconComponent icon="FaTimes" setClass="h-4 w-4" />
            </button>
          </div>
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหา Web Base..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                <ReactIconComponent icon="FaSearch" setClass="h-3 w-3" />
              </div>
            </div>
          </div>
          {/* List of Web Bases */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {filteredWebBases.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-400">
                ไม่พบข้อมูล Web Base
              </div>
            ) : (
              filteredWebBases.map((wb) => (
                <div key={wb.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-semibold text-gray-700 truncate max-w-[12rem]">
                    {wb.name}
                  </span>
                  <WebBaseModalView data={wb} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#A78BFA] to-[#34D399] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none border border-white/20"
        title="ดูรหัส Web Base"
      >
        {isOpen ? (
          <ReactIconComponent icon="FaTimes" setClass="h-6 w-6" />
        ) : (
          <ReactIconComponent icon="FaKey" setClass="h-6 w-6 animate-pulse" />
        )}
      </button>
    </div>
  )
}

type FormHelpers = { setError: (msg: string) => void; reset: () => void }

function AgUserAccountFormModal({
  title,
  open,
  onOpenChange,
  onSubmit,
  initialValue,
  loading,
}: {
  title: string
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (val: AgUserAccountFormData, helpers: FormHelpers) => void
  initialValue?: AgUserAccountDB
  loading?: boolean
}) {
  const [form, setForm] = useState<AgUserAccountFormData>(
    initialValue ? {
      username: initialValue.username,
      reserve: initialValue.reserve,
      userLogin: initialValue.userLogin,
      origin: initialValue.origin,
      position: initialValue.position,
      gaSecretEnc: initialValue.gaSecretEnc,
      webname: initialValue.webname,
      partnerAG: initialValue.partnerAG,
      partnerLogin: initialValue.partnerLogin,
    } : {
      username: '',
      reserve: '',
      userLogin: null,
      origin: '',
      position: 'agent',
      gaSecretEnc: '',
      webname: '',
      partnerAG: null,
      partnerLogin: null,
    }
  )
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm({
      username: '',
      reserve: '',
      userLogin: null,
      origin: '',
      position: 'agent',
      gaSecretEnc: '',
      webname: '',
      partnerAG: null,
      partnerLogin: null,
    })
    setError('')
  }

  const updateField = (k: keyof AgUserAccountFormData, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const handleSubmit = () => {
    // basic validation
    if (!form.username || !form.position) {
      setError('กรอกข้อมูลให้ครบถ้วน (AgUserAccount, userLogin, position)')
      return
    }
    setError('')
    onSubmit(form, { setError, reset: resetForm })
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg">
      <ModalHeader>
        <div className="flex flex-col">
          <ModalTitle>
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#34D399] bg-clip-text text-transparent">{title}</span>
          </ModalTitle>
          <ModalDescription className="mt-1 text-gray-500">
            {initialValue ? 'แก้ไขข้อมูลผู้ใช้ แล้วกดบันทึก' : 'กรอกข้อมูลผู้ใช้ แล้วกดบันทึก'}
          </ModalDescription>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Username</label>
            <input
              value={form.username}
              onChange={e => updateField('username', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="รหัสผู้ใช้ AG"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">userLogin</label>
            <input
              value={form.userLogin ?? ''}
              onChange={e => updateField('userLogin', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="ล็อกอินสำหรับเข้าระบบ AG"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">reserve</label>
            <input
              value={form.reserve}
              onChange={e => updateField('reserve', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="reserve"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">webname</label>
            <select
              value={form.webname || ''}
              onChange={e => updateField('webname', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            >
              <option value="">เลือกเว็บ</option>
              {WEBNAME_OPTIONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">origin</label>
            <input
              value={form.origin}
              onChange={e => updateField('origin', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="origin"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">position</label>
            <select
              value={form.position}
              onChange={e => updateField('position', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#34D399]"
            >
              <option value="" disabled>-เลือกตำแหน่ง-</option>
              <option value="senior">senior</option>
              <option value="master">master</option>
              <option value="agent">agent</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">partnerAG</label>
            <input
              value={form.partnerAG || ''}
              onChange={e => updateField('partnerAG', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="partnerAG"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">partnerLogin</label>
            <input
              value={form.partnerLogin || ''}
              onChange={e => updateField('partnerLogin', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="partnerLogin"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm font-medium">gaSecretEnc</label>
            <input
              value={form.gaSecretEnc}
              onChange={e => updateField('gaSecretEnc', e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="รหัส 2FA ของ AG"
            />
          </div>

        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-4"
          onClick={() => onOpenChange(false)}
        >
          ยกเลิก
        </Button>
        <Button
          disabled={!!loading}
          className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <ReactIconComponent icon="FaSpinner" setClass="h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <ReactIconComponent icon="FaSave" setClass="h-4 w-4" />
              บันทึก
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
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
