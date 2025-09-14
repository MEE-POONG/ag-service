import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import QuestModalAdd from '@/container/bot-ag/Quest/ModalAdd'
import QuestModalEdit from '@/container/bot-ag/Quest/ModalEdit'
import QuestModalDelete from '@/container/bot-ag/Quest/ModalDelete'

// Quest interface
interface Quest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  status: 'active' | 'inactive' | 'completed'
  reward: {
    coins: number
    points: number
    items?: string[]
  }
  requirements: {
    target: number
    current: number
    unit: string
  }
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

function useQuests() {
  const [items, setItems] = useState<Quest[]>([])
  const add = (item: Quest) => setItems(prev => [...prev, item])
  const update = (idx: number, item: Quest) =>
    setItems(prev => prev.map((v, i) => (i === idx ? item : v)))
  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  return { items, add, update, remove, setItems }
}

export default function QuestPage() {
  const queryClient = useQueryClient()
  const { items, add, update, remove, setItems } = useQuests()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const debouncedKeyword = useDebouncedValue(keyword, 300)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Mock data for demonstration
  const mockQuests: Quest[] = useMemo(() => [
    {
      id: '1',
      title: 'เข้าสู่ระบบประจำวัน',
      description: 'เข้าสู่ระบบทุกวันเพื่อรับรางวัลประจำวัน',
      type: 'daily',
      status: 'active',
      reward: { coins: 100, points: 10 },
      requirements: { target: 1, current: 1, unit: 'ครั้ง' },
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'เดิมพันครบ 10,000 บาท',
      description: 'เดิมพันครบ 10,000 บาทในสัปดาห์นี้',
      type: 'weekly',
      status: 'active',
      reward: { coins: 500, points: 50 },
      requirements: { target: 10000, current: 7500, unit: 'บาท' },
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'เชิญเพื่อนใหม่ 5 คน',
      description: 'เชิญเพื่อนใหม่มาลงทะเบียน 5 คนในเดือนนี้',
      type: 'monthly',
      status: 'inactive',
      reward: { coins: 1000, points: 100, items: ['VIP Badge'] },
      requirements: { target: 5, current: 3, unit: 'คน' },
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ], [])

  // Simulate API call with mock data
  useEffect(() => {
    setItems(mockQuests)
    setTotalItems(mockQuests.length)
    setTotalPages(Math.ceil(mockQuests.length / pageSize))
  }, [mockQuests, pageSize])

  // Filter quests based on search and filters
  const filteredQuests = items.filter(quest => {
    const matchesKeyword = quest.title.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
                          quest.description.toLowerCase().includes(debouncedKeyword.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quest.status === statusFilter
    const matchesType = typeFilter === 'all' || quest.type === typeFilter
    return matchesKeyword && matchesStatus && matchesType
  })

  const paginatedQuests = filteredQuests.slice((page - 1) * pageSize, page * pageSize)

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedKeyword, statusFilter, typeFilter])

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      daily: 'bg-yellow-100 text-yellow-800',
      weekly: 'bg-purple-100 text-purple-800',
      monthly: 'bg-indigo-100 text-indigo-800',
      special: 'bg-red-100 text-red-800'
    }
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

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

  const handleAddQuest = (questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuest: Quest = {
      ...questData,
      id: `quest-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    add(newQuest)
    toast.success('เพิ่ม Quest สำเร็จ')
  }

  const handleEditQuest = (questData: Quest) => {
    const idx = selectedIndex
    if (idx !== null) {
      const updatedQuest = {
        ...questData,
        updatedAt: new Date().toISOString()
      }
      update(idx, updatedQuest)
      toast.success('แก้ไข Quest สำเร็จ')
    }
  }

  const handleDeleteQuest = () => {
    const idx = selectedIndex
    if (idx !== null) {
      remove(idx)
      toast.success('ลบ Quest สำเร็จ')
    }
  }

  const selectedQuest = selectedIndex !== null ? items[selectedIndex] : null

  return (
    <TheLayout>
      <div className={`p-4 sm:p-6`}>
        <div className="mx-auto">
          <div className="relative overflow-hidden rounded-[1.5rem] p-5 sm:p-8 mb-6 sm:mb-8 bg-gradient-to-r from-[#A78BFA] via-[#A78BFA] to-[#34D399] shadow-lg shadow-gray-900/10">
            <div className="flex relative z-10 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ReactIconComponent icon="FaFlag" setClass="w-8 h-8 text-white" />
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl">
                  จัดการ Quest
                </h1>
              </div>
              <Button
                size="sm"
                className="btn-theme hover:!brightness-95 rounded-full shadow-md shadow-gray-900/10 px-4"
                onClick={startAdd}
              >
                <ReactIconComponent icon="FaPlus" setClass="w-4 h-4 mr-2" />
                เพิ่ม Quest
              </Button>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/15" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-gray-800/10" />
          </div>

          <div className="p-4 mb-6 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 sm:mb-8 bg-white/90">
            {/* Search and Filters */}
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:gap-4">
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="ค้นหา Quest (ชื่อ, คำอธิบาย)"
                className="px-4 py-2 w-full text-sm sm:text-base rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 text-sm sm:text-base rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="completed">เสร็จสิ้น</option>
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-4 py-2 text-sm sm:text-base rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm"
              >
                <option value="all">ประเภททั้งหมด</option>
                <option value="daily">ประจำวัน</option>
                <option value="weekly">ประจำสัปดาห์</option>
                <option value="monthly">ประจำเดือน</option>
                <option value="special">พิเศษ</option>
              </select>
            </div>

            {/* Quest Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedQuests.map((quest, idx) => (
                <div key={quest.id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{quest.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{quest.description}</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(quest.status)}`}>
                          {quest.status === 'active' ? 'ใช้งาน' : quest.status === 'inactive' ? 'ไม่ใช้งาน' : 'เสร็จสิ้น'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(quest.type)}`}>
                          {quest.type === 'daily' ? 'ประจำวัน' : quest.type === 'weekly' ? 'ประจำสัปดาห์' : quest.type === 'monthly' ? 'ประจำเดือน' : 'พิเศษ'}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">ความคืบหน้า</span>
                        <span className="font-medium">{quest.requirements.current}/{quest.requirements.target} {quest.requirements.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#A78BFA] to-[#34D399] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(quest.requirements.current, quest.requirements.target)}%` }}
                        />
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">รางวัล</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          🪙 {quest.reward.coins} coins
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          ⭐ {quest.reward.points} points
                        </span>
                        {quest.reward.items?.map((item, itemIdx) => (
                          <span key={itemIdx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            🎁 {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 !bg-blue-500 hover:!bg-blue-600 text-white rounded-lg"
                        onClick={() => startEdit(idx)}
                      >
                        <ReactIconComponent icon="FaEdit" setClass="w-3 h-3 mr-1" />
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        className="!bg-red-500 hover:!bg-red-600 text-white rounded-lg"
                        onClick={() => startDelete(idx)}
                      >
                        <ReactIconComponent icon="FaTrash" setClass="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {paginatedQuests.length === 0 && (
              <div className="text-center py-12">
                <ReactIconComponent icon="FaFlag" setClass="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบ Quest</h3>
                <p className="text-gray-500 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
                <Button
                  size="sm"
                  className="btn-theme hover:!brightness-95 rounded-full"
                  onClick={startAdd}
                >
                  <ReactIconComponent icon="FaPlus" setClass="w-4 h-4 mr-2" />
                  เพิ่ม Quest แรก
                </Button>
              </div>
            )}

            {/* Pagination */}
            {paginatedQuests.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">ทั้งหมด {filteredQuests.length} รายการ</span>
                  <span className="text-sm text-gray-600">แสดง</span>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(parseInt(e.target.value, 10) || 10)}
                    className="px-3 py-1 text-end rounded-md border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                  </select>
                  <span className="text-sm text-gray-600">ต่อหน้า</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-3"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    ก่อนหน้า
                  </Button>
                  <span className="text-sm text-gray-700">หน้า {page} / {Math.max(1, Math.ceil(filteredQuests.length / pageSize))}</span>
                  <Button
                    size="sm"
                    className="btn-theme hover:!brightness-95 rounded-full px-3"
                    disabled={page >= Math.ceil(filteredQuests.length / pageSize)}
                    onClick={() => setPage(p => Math.min(Math.ceil(filteredQuests.length / pageSize), p + 1))}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuestModalAdd
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddQuest}
      />
      
      <QuestModalEdit
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditQuest}
        quest={selectedQuest}
      />
      
      <QuestModalDelete
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteQuest}
        quest={selectedQuest}
      />
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
