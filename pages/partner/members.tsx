import { TheLayout } from '@/components/TheLayout'
//import { sampleUser } from '@/data/sampleUser'

export default function MembersPage() {
  return (
    <TheLayout>
      <div className="p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              👥 จัดการสมาชิก
            </h1>
            <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              + เพิ่มสมาชิก
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">รายการสมาชิก</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              ระบบจัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ค้นหาสมาชิก (ชื่อ, อีเมล, เบอร์โทร)..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option>สถานะทั้งหมด</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-green-600">2,458</div>
                <div className="text-xs sm:text-sm text-green-700">สมาชิกทั้งหมด</div>
              </div>
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">2,234</div>
                <div className="text-xs sm:text-sm text-blue-700">สมาชิกที่ใช้งาน</div>
              </div>
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">156</div>
                <div className="text-xs sm:text-sm text-yellow-700">รอการอนุมัติ</div>
              </div>
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-red-600">68</div>
                <div className="text-xs sm:text-sm text-red-700">ถูกระงับ</div>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">รหัสสมาชิก</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">ชื่อ-นามสกุล</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">อีเมล</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">เบอร์โทร</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">วันที่สมัคร</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <div>MEM001</div>
                      <div className="text-xs text-gray-500 sm:hidden">สมชาย ใจดี</div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">สมชาย ใจดี</td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">somchai@email.com</td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">08X-XXX-XXXX</td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">2024-01-10</td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <button className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
                          ดู
                        </button>
                        <button className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                          แก้ไข
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <div>MEM002</div>
                      <div className="text-xs text-gray-500 sm:hidden">สมหญิง รักดี</div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">สมหญิง รักดี</td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">somying@email.com</td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">09X-XXX-XXXX</td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className="px-1 sm:px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Pending
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">2024-01-18</td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <button className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                          อนุมัติ
                        </button>
                        <button className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed">
                          ปฏิเสธ
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
              <div className="text-xs sm:text-sm text-gray-500">
                แสดง 1-20 จาก 2,458 รายการ
              </div>
              <div className="flex space-x-1 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
                  ก่อนหน้า
                </button>
                <button className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm">
                  1
                </button>
                <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
                  2
                </button>
                <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
                  3
                </button>
                <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
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
