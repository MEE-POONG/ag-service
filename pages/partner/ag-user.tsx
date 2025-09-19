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

type AgUserAccountDB = {
  id?: string
  username: string
  reserve: string
  userLogin: string
  origin: string
  position: string
  gaSecretEnc: string
  meta?: string
  webname?: string
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
  }, [stepSec])
  return remaining
}

export default function AgUserAccountPage() {
  const queryClient = useQueryClient()
  const { items, add, update, remove, setItems } = useAgUserAccounts()
  const totpRemaining = useTotpRemaining(30)
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
            <Button
              size="xs"
              className="!bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6] rounded-full px-3 disabled:opacity-60"
              onClick={() => startAdd()}
              type="button"
            >
              + เพิ่ม AG User
            </Button>
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
                    <th className="px-3 py-2 font-semibold text-left">Reserve</th>
                    <th className="px-3 py-2 font-semibold text-left">webname</th>
                    <th className="px-3 py-2 font-semibold text-left">origin</th>
                    <th className="px-3 py-2 font-semibold text-left">position</th>
                    <th className="px-3 py-2 font-semibold text-left">gaSecretEnc</th>
                    <th className="px-3 py-2 font-semibold text-left">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {list.map((u, idx) => (
                    <tr key={u.id ?? `${u.username}-${idx}`} className="hover:bg-[#A78BFA]/5 transition-colors">
                      <td className="px-3 py-2 font-semibold text-gray-900">{u.username}</td>
                      <td className="px-3 py-2">{u.userLogin}</td>
                      <td className="px-3 py-2">{u.reserve}</td>
                      <td className="px-3 py-2">{u.webname || '-'}</td>
                      <td className="px-3 py-2">{u.origin || '-'}</td>
                      <td className="px-3 py-2 capitalize">{u.position}</td>
                      <td className="px-3 py-2 truncate max-w-[12rem]" title={u.gaSecretEnc}>
                        {u.gaSecretEnc && (
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
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 items-center">
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
                            className="btn-theme hover:!brightness-95 rounded-full px-3 !font-medium"
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
                          {u.position === 'senior' && (
                            <PartnerModalFuctionSetting data={u} />
                          )}
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
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2 items-center">
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
              <div className="flex gap-2 items-center">
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
    </TheLayout>
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
  onSubmit: (val: AgUserAccountDB, helpers: FormHelpers) => void
  initialValue?: AgUserAccountDB
  loading?: boolean
}) {
  const [form, setForm] = useState<AgUserAccountDB>(
    initialValue ?? {
      username: '',
      reserve: '',
      userLogin: '',
      origin: '',
      position: 'agent',
      gaSecretEnc: '',
      webname: '',
    }
  )
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm({
      username: '',
      reserve: '',
      userLogin: '',
      origin: '',
      position: 'agent',
      gaSecretEnc: '',
      webname: '',
    })
    setError('')
  }

  const updateField = (k: keyof AgUserAccountDB, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const handleSubmit = () => {
    // basic validation
    if (!form.username || !form.userLogin || !form.position) {
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
              value={form.userLogin}
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
              <option value="agent">agent</option>
              <option value="senior">senior</option>
              <option value="master">master</option>
            </select>
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
          className="btn-theme hover:!brightness-95 rounded-full px-4 flex items-center gap-1.5 disabled:opacity-60"
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
