import React, { useEffect, useMemo, useRef, useState } from 'react'
import { TheLayout } from '@/components/TheLayout'

type AgUser = {
  id: string
  username: string
  userLogin: string
  webname?: string
  position?: string
}

/* ======================= AddMemberModal ======================= */
function AddMemberModal({
  open,
  onClose,
  onSave,
  agUsers = [],
}: {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  agUsers?: AgUser[]
}) {
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const firstInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open && firstInputRef.current) firstInputRef.current.focus()
  }, [open])

  const [form, setForm] = useState({
    partnerCode: '',
    freeRate: '',
    accountNo: '',
    accountName: '',
    bank: '',
    tel: '',
    line: '',
    isPlus: 'Y',
    isPaid: 'Y',
    method: 'normal',
    joinedAt: new Date().toISOString().slice(0, 10),
  })

  // ====== ช่องรหัสพันธมิตร: ค้นหา/เลือก AG User ======
  const [autoSelectedAgent, setAutoSelectedAgent] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedAgUser, setSelectedAgUser] = useState<AgUser | null>(null)

  const filteredAgUsers = useMemo(() => {
    const t = searchTerm.trim().toLowerCase()
    if (!t) return agUsers.slice(0, 20)
    return agUsers.filter((u) =>
      [u.username, u.userLogin, u.webname, u.position]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(t)),
    )
  }, [agUsers, searchTerm])

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setForm((p) => ({ ...p, partnerCode: val })) // พิมพ์เองก็ผูกเข้าฟอร์ม
    setShowDropdown(true)
  }

  const handleSelectAgUser = (agUser: AgUser) => {
    setSelectedAgUser(agUser)
    setSearchTerm(agUser.username)
    setForm((p) => ({ ...p, partnerCode: agUser.username }))
    setAutoSelectedAgent(false)
    setShowDropdown(false)
  }

  useEffect(() => {
    if (searchTerm && filteredAgUsers.length === 1) {
      const u = filteredAgUsers[0]
      setAutoSelectedAgent(true)
      setSelectedAgUser(u)
      setForm((p) => ({ ...p, partnerCode: u.username }))
    } else {
      setAutoSelectedAgent(false)
    }
  }, [searchTerm, filteredAgUsers])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.partnerCode.trim()) return alert('กรุณากรอกรหัสพันธมิตร')
    if (!form.accountName.trim()) return alert('กรุณากรอกชื่อบัญชี')
    onSave(form)
  }

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-member-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 id="add-member-title" className="text-lg font-semibold">
            ➕ เพิ่มสมาชิกใหม่
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          {/* รหัสพันธมิตร + ค้นหา AG User */}
          <div className="relative flex flex-col">
            <label className="mb-1 flex items-center text-sm text-gray-600">
              รหัสพันธมิตร
              {autoSelectedAgent && (
                <span className="ml-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  เลือกอัตโนมัติ
                </span>
              )}
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${autoSelectedAgent
                  ? 'border-green-300 bg-green-50 focus:ring-green-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              placeholder="ค้นหา AG User..."
            />
            {showDropdown && filteredAgUsers.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                {filteredAgUsers.map((agUser) => (
                  <div
                    key={agUser.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectAgUser(agUser)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    <div className="font-medium">{agUser.username}</div>
                    <div className="text-xs text-gray-500">
                      User Login: {agUser.userLogin}
                      {agUser.webname && ` | Web: ${agUser.webname}`}
                      {agUser.position && ` | Position: ${agUser.position}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* สู้ฟรี */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">สู้ฟรี</label>
            <input
              name="freeRate"
              value={form.freeRate}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
              placeholder="เช่น 0.40"
            />
          </div>

          {/* เลขบัญชี */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">เลขบัญชี</label>
            <input
              name="accountNo"
              value={form.accountNo}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
              placeholder="เช่น 1668972833"
            />
          </div>

          {/* ชื่อบัญชี */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">ชื่อบัญชี</label>
            <input
              name="accountName"
              value={form.accountName}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
              placeholder="เช่น สาโรจน์"
            />
          </div>

          {/* ธนาคาร */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">ธนาคาร</label>
            <input
              name="bank"
              value={form.bank}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
              placeholder="เช่น กสิกรไทย"
            />
          </div>

          {/* เบอร์โทร */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">เบอร์โทร</label>
            <input
              name="tel"
              value={form.tel}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
              placeholder="เช่น 0915239792"
            />
          </div>

          {/* Line@ */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">Line@</label>
            <input
              name="line"
              value={form.line}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
              placeholder="- หรือ @myline"
            />
          </div>

          {/* ค้างบวก / จ่าย */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">ค้างบวก</label>
            <select
              name="isPlus"
              value={form.isPlus}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">จ่าย</label>
            <select
              name="isPaid"
              value={form.isPaid}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>

          {/* วิธีคิด */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">วิธีคิด</label>
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="normal">normal</option>
              <option value="custom">custom</option>
            </select>
          </div>

          {/* วันที่เข้าระบบ */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">วันที่เข้าระบบ</label>
            <input
              type="date"
              name="joinedAt"
              value={form.joinedAt}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* ปุ่ม */}
          <div className="col-span-1 mt-2 flex items-center justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ======================= Page ======================= */
export default function MembersPage() {
  const [openAdd, setOpenAdd] = useState(false)

  // ตัวอย่างข้อมูล AG Users (เปลี่ยนเป็นดึงจาก API ได้)
  const agUsersSample: AgUser[] = [
    { id: '1', username: 'ufrceaa1', userLogin: 'ufrcea', webname: 'siteA', position: 'Agent' },
    { id: '2', username: 'ufrceaa2', userLogin: 'ufrcea', webname: 'siteB', position: 'Agent' },
    { id: '3', username: 'ufh27oa1', userLogin: 'ufh27', webname: 'siteX', position: 'Agent' },
  ]

  const handleSave = (data: any) => {
    console.log('📦 บันทึกสมาชิกใหม่:', data)
    // TODO: fetch('/api/members', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
    setOpenAdd(false)
  }

  return (
    <TheLayout>
      <div className="p-3 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="m-2 flex flex-col gap-4 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl lg:text-4xl">
              👥 จัดการสมาชิก
            </h1>
            <button
              onClick={() => setOpenAdd(true)}
              className="rounded-lg bg-green-500 px-3 py-2 text-sm text-white transition-colors hover:bg-green-600 sm:px-4 sm:py-2 sm:text-base"
            >
              + เพิ่มสมาชิก
            </button>
          </div>

          {/* Modal */}
          <AddMemberModal
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            onSave={handleSave}
            agUsers={agUsersSample}
          />

          <div className="mb-6 rounded-lg bg-white p-4 shadow-md sm:mb-8 sm:p-6">
            <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl md:text-2xl">รายการสมาชิก</h2>
            <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
              ระบบจัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน
            </p>

            {/* Search & Filter */}
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ค้นหาสมาชิก (ชื่อ, อีเมล, เบอร์โทร)..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 sm:px-4 sm:py-2 sm:text-base"
                />
              </div>
              <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 sm:px-4 sm:py-2 sm:text-base">
                <option>สถานะทั้งหมด</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-4">
              <div className="rounded-lg bg-green-50 p-3 sm:p-4">
                <div className="text-lg font-bold text-green-600 sm:text-2xl">2,458</div>
                <div className="text-xs text-green-700 sm:text-sm">สมาชิกทั้งหมด</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                <div className="text-lg font-bold text-blue-600 sm:text-2xl">2,234</div>
                <div className="text-xs text-blue-700 sm:text-sm">สมาชิกที่ใช้งาน</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 sm:p-4">
                <div className="text-lg font-bold text-yellow-600 sm:text-2xl">156</div>
                <div className="text-xs text-yellow-700 sm:text-sm">รอการอนุมัติ</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 sm:p-4">
                <div className="text-lg font-bold text-red-600 sm:text-2xl">68</div>
                <div className="text-xs text-red-700 sm:text-sm">ถูกระงับ</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">ลำดับ</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">รหัสพันธมิตร</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">สู้ฟรี</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">เลขบัญชี</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">ชื่อบัญชี</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">ธนาคาร</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">เบอร์โทร</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">Line@</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">ค้างบวก</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">จ่าย</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">วิธีคิด</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3">วันที่เข้าระบบ</th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 sm:px-4 sm:py-3">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">1</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">ufh27oa1</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">0.40</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">1668972833</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">สาโรจน์</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">กสิกรไทย</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">0915239792</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">-</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">Y</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">Y</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">normal</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">2021-05-21</td>
                    <td className="px-2 py-3 sm:px-4">
                      <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <button className="rounded border border-blue-700 bg-blue-100 px-2 py-1 text-base text-blue-700 hover:bg-blue-200">
                          ดู
                        </button>
                        <button className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-200">
                          แก้ไข
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:mt-6 sm:flex-row">
              <div className="text-xs text-gray-500 sm:text-sm">แสดง 1-20 จาก 2,458 รายการ</div>
              <div className="flex space-x-1 sm:space-x-2">
                <button className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 sm:px-3 sm:text-sm">
                  ก่อนหน้า
                </button>
                <button className="rounded bg-green-500 px-2 py-1 text-xs text-white sm:px-3 sm:text-sm">
                  1
                </button>
                <button className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 sm:px-3 sm:text-sm">
                  2
                </button>
                <button className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 sm:px-3 sm:text-sm">
                  3
                </button>
                <button className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 sm:px-3 sm:text-sm">
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TheLayout>
  )
}
