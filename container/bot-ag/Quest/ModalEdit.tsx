import { useState, useEffect } from 'react'
import { Modal } from '@/components/form/Modal'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'

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

interface ModalEditProps {
  open: boolean
  onClose: () => void
  onSubmit: (quest: Quest) => void
  quest?: Quest | null
}

export default function QuestModalEdit({ open, onClose, onSubmit, quest }: ModalEditProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'special',
    status: 'active' as 'active' | 'inactive' | 'completed',
    rewardCoins: 0,
    rewardPoints: 0,
    rewardItems: '',
    target: 1,
    current: 0,
    unit: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    if (quest) {
      setFormData({
        title: quest.title,
        description: quest.description,
        type: quest.type,
        status: quest.status,
        rewardCoins: quest.reward.coins,
        rewardPoints: quest.reward.points,
        rewardItems: quest.reward.items?.join(', ') || '',
        target: quest.requirements.target,
        current: quest.requirements.current,
        unit: quest.requirements.unit,
        startDate: quest.startDate,
        endDate: quest.endDate
      })
    }
  }, [quest])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quest) return

    const questData: Quest = {
      ...quest,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      reward: {
        coins: formData.rewardCoins,
        points: formData.rewardPoints,
        items: formData.rewardItems ? formData.rewardItems.split(',').map(item => item.trim()) : []
      },
      requirements: {
        target: formData.target,
        current: formData.current,
        unit: formData.unit
      },
      startDate: formData.startDate,
      endDate: formData.endDate
    }

    onSubmit(questData)
    onClose()
  }

  return (
    <Modal open={open} onOpenChange={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">แก้ไข Quest</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ Quest</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            placeholder="กรอกชื่อ Quest"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            placeholder="กรอกคำอธิบาย Quest"
            rows={3}
            required
          />
        </div>

        {/* Type and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            >
              <option value="daily">ประจำวัน</option>
              <option value="weekly">ประจำสัปดาห์</option>
              <option value="monthly">ประจำเดือน</option>
              <option value="special">พิเศษ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            >
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
          </div>
        </div>

        {/* Rewards */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">รางวัล</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Coins</label>
              <input
                type="number"
                value={formData.rewardCoins}
                onChange={(e) => setFormData(prev => ({ ...prev, rewardCoins: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Points</label>
              <input
                type="number"
                value={formData.rewardPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, rewardPoints: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                min="0"
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-xs text-gray-600 mb-1">Items (คั่นด้วยจุลภาค)</label>
            <input
              type="text"
              value={formData.rewardItems}
              onChange={(e) => setFormData(prev => ({ ...prev, rewardItems: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="VIP Badge, Special Item"
            />
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">เงื่อนไข</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">เป้าหมาย</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ปัจจุบัน</label>
              <input
                type="number"
                value={formData.current}
                onChange={(e) => setFormData(prev => ({ ...prev, current: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">หน่วย</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                placeholder="ครั้ง, บาท, คน"
                required
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 !bg-gray-500 hover:!bg-gray-600 text-white rounded-lg"
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            className="flex-1 btn-theme hover:!brightness-95 rounded-lg"
          >
            <ReactIconComponent icon="FaEdit" setClass="w-4 h-4 mr-2" />
            บันทึกการแก้ไข
          </Button>
        </div>
        </form>
      </div>
    </Modal>
  )
}
