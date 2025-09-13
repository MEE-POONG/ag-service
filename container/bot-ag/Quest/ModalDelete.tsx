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

interface ModalDeleteProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  quest?: Quest | null
}

export default function QuestModalDelete({ open, onClose, onConfirm, quest }: ModalDeleteProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal open={open} onOpenChange={onClose} size="md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">ลบ Quest</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex-shrink-0">
            <ReactIconComponent icon="FaExclamationTriangle" setClass="w-8 h-8 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-800">ยืนยันการลบ Quest</h3>
            <p className="text-sm text-red-600 mt-1">
              คุณต้องการลบ Quest นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
          </div>
        </div>

        {quest && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">รายละเอียด Quest ที่จะลบ:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ชื่อ:</span>
                <span className="font-medium">{quest.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ประเภท:</span>
                <span className="font-medium">
                  {quest.type === 'daily' ? 'ประจำวัน' : 
                   quest.type === 'weekly' ? 'ประจำสัปดาห์' : 
                   quest.type === 'monthly' ? 'ประจำเดือน' : 'พิเศษ'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สถานะ:</span>
                <span className="font-medium">
                  {quest.status === 'active' ? 'ใช้งาน' : 
                   quest.status === 'inactive' ? 'ไม่ใช้งาน' : 'เสร็จสิ้น'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">รางวัล:</span>
                <span className="font-medium">
                  {quest.reward.coins} coins, {quest.reward.points} points
                  {quest.reward.items && quest.reward.items.length > 0 && 
                    `, ${quest.reward.items.join(', ')}`
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            className="flex-1 !bg-gray-500 hover:!bg-gray-600 text-white rounded-lg"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 !bg-red-500 hover:!bg-red-600 text-white rounded-lg"
          >
            <ReactIconComponent icon="FaTrash" setClass="w-4 h-4 mr-2" />
            ลบ Quest
          </Button>
        </div>
        </div>
      </div>
    </Modal>
  )
}
