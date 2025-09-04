import axios from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import { TheLayout } from '@/components/TheLayout'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalDescription } from '@/components/form/Modal'
import ReactIconComponent from '@/components/ReactIconComponent'

type AgUserAccountItem = {
  id?: string
  username: string
  reserve: string
  userLogin: string
  origin: string
  position: string
  gaSecretEnc: string
}

function useAgUserAccounts() {
  const [items, setItems] = useState<AgUserAccountItem[]>([])
  const add = (item: AgUserAccountItem) => setItems(prev => [...prev, item])
  const update = (idx: number, item: AgUserAccountItem) =>
    setItems(prev => prev.map((v, i) => (i === idx ? item : v)))
  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  return { items, add, update, remove, setItems }
}

export default function AgUserAccountPage() {
  const { items, add, update, remove, setItems } = useAgUserAccounts()
  const [keyword, setKeyword] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Fetch list via react-query (server-side filter by keyword)
  const { data, isFetching } = useQuery({
    queryKey: ['aguseraccounts', 'list', { keyword }],
    queryFn: async () => {
      const res = await axios.get('/api/aguseraccounts', { params: { keyword } })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อมูลล้มเหลว')
      return (res.data.data || []) as AgUserAccountItem[]
    },
    staleTime: 30 * 1000,
    keepPreviousData: true,
  })

  useEffect(() => {
    if (data) setItems(data)
  }, [data, setItems])

  // Mutations will be added in a follow-up commit

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return items
    return items.filter(u =>
      [u.username, u.reserve, u.userLogin, u.origin, u.position, u.gaSecretEnc]
        .join(' ')
        .toLowerCase()
        .includes(kw)
    )
  }, [items, keyword])

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
      <div className={`p-4 sm:p-6`}>
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[1.5rem] p-5 sm:p-8 mb-6 sm:mb-8 bg-gradient-to-r from-[#A78BFA] via-[#A78BFA] to-[#34D399] shadow-lg shadow-gray-900/10">
            <div className="flex relative z-10 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm sm:text-3xl md:text-4xl">
                ระบบจัดการผู้ใช้ AG
              </h1>
              <Button
                size="sm"
                className="btn-theme hover:!brightness-95 rounded-full shadow-md shadow-gray-900/10 px-4"
                onClick={startAdd}
              >
                + เพิ่ม AG User
              </Button>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/15" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-gray-800/10" />
          </div>

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
                    <th className="px-3 py-2 font-semibold text-left">Reserve</th>
                    <th className="px-3 py-2 font-semibold text-left">origin</th>
                    <th className="px-3 py-2 font-semibold text-left">position</th>
                    <th className="px-3 py-2 font-semibold text-left">gaSecretEnc</th>
                    <th className="px-3 py-2 font-semibold text-left">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((u, idx) => (
                    <tr key={`${u.username}-${idx}`} className="hover:bg-[#A78BFA]/5 transition-colors">
                      <td className="px-3 py-2 font-semibold text-gray-900">{u.username}</td>
                      <td className="px-3 py-2">{u.userLogin}</td>
                      <td className="px-3 py-2">{u.reserve}</td>
                      <td className="px-3 py-2">{u.origin || '-'}</td>
                      <td className="px-3 py-2 capitalize">{u.position}</td>
                      <td className="px-3 py-2 truncate max-w-[12rem]" title={u.gaSecretEnc}>{u.gaSecretEnc}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            className="btn-theme hover:!brightness-95 rounded-full px-3 !font-medium"
                            onClick={() => startEdit(idx)}
                          >
                            แก้ไข
                          </Button>
                          <Button size="xs" className="!bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6] rounded-full px-3" onClick={() => startDelete(idx)}>
                            ลบ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add */}
      <AgUserAccountFormModal
        title="เพิ่ม AG User"
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSubmit={(val, helpers) => {
          // unique AgUserAccount
          if (items.some((i) => i.username === val.username)) {
            helpers.setError('Username นี้ถูกใช้แล้ว')
            return
          }
          add(val)
          setOpenAdd(false)
        }}
      />

      {/* Modal: Edit */}
      {openEdit && selectedIndex != null && (
        <AgUserAccountFormModal
          title="แก้ไข AG User"
          open={openEdit}
          onOpenChange={setOpenEdit}
          initialValue={items[selectedIndex]}
          onSubmit={(val, helpers) => {
            // unique AgUserAccount (ignore current index)
            const duplicate = items.some((i, idx) => idx !== selectedIndex && i.username === val.username)
            if (duplicate) {
              helpers.setError('Username นี้ถูกใช้แล้ว')
              return
            }
            const cur = items[selectedIndex]
            update(selectedIndex, val)
            setOpenEdit(false)
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
              className="rounded-full px-4 shadow flex items-center gap-1.5"
              onClick={() => {
                remove(selectedIndex)
                setOpenDelete(false)
              }}
            >
              <ReactIconComponent icon="FaTrashAlt" setClass="h-4 w-4" />
              ลบ
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </TheLayout>
  )
}

type FormHelpers = { setError: (msg: string) => void }

function AgUserAccountFormModal({
  title,
  open,
  onOpenChange,
  onSubmit,
  initialValue,
}: {
  title: string
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (val: AgUserAccountItem, helpers: FormHelpers) => void
  initialValue?: AgUserAccountItem
}) {
  const [form, setForm] = useState<AgUserAccountItem>(
    initialValue ?? {
      username: '',
      reserve: '',
      userLogin: '',
      origin: '',
      position: 'agent',
      gaSecretEnc: '',
    }
  )
  const [error, setError] = useState('')

  const updateField = (k: keyof AgUserAccountItem, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const handleSubmit = () => {
    // basic validation
    if (!form.username || !form.userLogin || !form.position) {
      setError('กรอกข้อมูลให้ครบถ้วน (AgUserAccount, userLogin, position)')
      return
    }
    setError('')
    onSubmit(form, { setError })
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
        <Button className="btn-theme hover:!brightness-95 rounded-full px-4 flex items-center gap-1.5" onClick={handleSubmit}>
          <ReactIconComponent icon="FaSave" setClass="h-4 w-4" />
          บันทึก
        </Button>
      </ModalFooter>
    </Modal>
  )
}
