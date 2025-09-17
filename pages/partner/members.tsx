import { TheLayout } from '@/components/TheLayout'
import MemberModalAdd from '@/container/partner/ModalAddMember'
import MemberModalEdit from '@/container/partner/ModalEditMember'
import { useState } from 'react'
import { ExtendedPartnerDB, usePartners } from '@/hooks/usePartners'
import PageHeader from '@/components/PageHeader'


export default function MembersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingPartner, setEditingPartner] = useState<ExtendedPartnerDB | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { partners, loading, error, stats, fetchPartners } = usePartners()

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    fetchPartners()
  }

  const handleEditPartner = (partner: ExtendedPartnerDB) => {
    setEditingPartner(partner)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingPartner(null)
  }

  // Filter partners based on search and status
  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      partner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner?.tel?.includes(searchTerm) ||
      partner?.bankNumber?.includes(searchTerm) ||
      partner?.agUserAccountDB?.username?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || partner?.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  return (
    <TheLayout>
      <PageHeader
        title="จัดการสมาชิก"
        icon='FaUsers'
        description="ระบบจัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน"
        gradient={true}
        actions={
          <MemberModalAdd onSuccess={handleRefresh} />
        }
      />
      <div className="max-w-6xl mx-auto lg:max-w-full">
        <div className="bg-white rounded-lg shadow-md pl-1 sm:p-2 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">รายการสมาชิก</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            ระบบจัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน
          </p>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {loading ? '...' : stats.total.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-green-700">สมาชิกทั้งหมด</div>
            </div>
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.active.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-blue-700">สมาชิกที่ใช้งาน</div>
            </div>
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                {loading ? '...' : stats.pending.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-yellow-700">รอการอนุมัติ</div>
            </div>
            <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-red-600">
                {loading ? '...' : stats.suspended.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-red-700">ถูกระงับ</div>
            </div>
          </div>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหาสมาชิก (ชื่อ, เบอร์โทร, เลขบัญชี)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>



          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-red-500">เกิดข้อผิดพลาด: {error}</div>
              </div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">ลำดับ</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">รหัสพันธมิตร</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">เลขบัญชี</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">ชื่อบัญชี</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">ธนาคาร</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">เบอร์โทร</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">Line@</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">วิธีคิด</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">วันที่เข้าระบบ</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-2 sm:px-4 py-8 text-center text-gray-500">
                        ไม่พบข้อมูลสมาชิก
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner, index) => (
                      <tr key={partner.id}>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {index + 1}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {partner?.agUserAccountDB?.username}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {partner?.bankNumber}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {partner?.name}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {partner?.bankName}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {partner?.tel || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {partner?.line || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${partner?.status === 'active' ? 'bg-green-100 text-green-800' :
                            partner?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              partner?.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {partner?.status === 'active' ? 'ใช้งาน' :
                              partner?.status === 'pending' ? 'รออนุมัติ' :
                                partner?.status === 'suspended' ? 'ระงับ' :
                                  partner?.status}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {partner?.method}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {formatDate(new Date(partner?.startDate || '').toISOString() || '')}
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            {/* <button className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                ดู
                              </button> */}
                            <button
                              onClick={() => handleEditPartner(partner)}
                              className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            >
                              แก้ไข
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
            <div className="text-xs sm:text-sm text-gray-500">
              {loading ? 'กำลังโหลด...' : `แสดง ${filteredPartners.length} จาก ${partners?.length} รายการ`}
            </div>
            {filteredPartners.length > 0 && (
              <div className="flex space-x-1 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
                  ก่อนหน้า
                </button>
                <button className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm">
                  1
                </button>
                <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPartner && (
        <MemberModalEdit
          partner={editingPartner}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleRefresh}
        />
      )}
    </TheLayout>
  )
} 
