import { TheLayout } from '@/components/TheLayout'
import { FcAddImage } from 'react-icons/fc'
//import { sampleUser } from '@/data/sampleUser'

export default function AGUserPage() {
  return (
    <TheLayout>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2">
            <FcAddImage size={32} />
            AG User Management
          </h1>
          <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            + เพิ่ม AG User
          </button>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          ระบบจัดการข้อมูล AG User และการเข้าถึงระบบ
        </p>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="ค้นหา AG User..."
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>ทั้งหมด</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">รหัส AG</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">ชื่อผู้ใช้</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">เว็บเบส</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">วันที่สร้าง</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                  <div>AG001</div>
                  <div className="text-xs text-gray-500 sm:hidden">testuser01</div>
                </td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">testuser01</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">MainSite</td>
                <td className="px-2 sm:px-4 py-3">
                  <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">2024-01-15</td>
                <td className="px-2 sm:px-4 py-3">
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <button className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      แก้ไข
                    </button>
                    <button className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
              {/* More sample rows */}
              <tr>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                  <div>AG002</div>
                  <div className="text-xs text-gray-500 sm:hidden">partner123</div>
                </td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">partner123</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">SecondSite</td>
                <td className="px-2 sm:px-4 py-3">
                  <span className="px-1 sm:px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">2024-01-20</td>
                <td className="px-2 sm:px-4 py-3">
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <button className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      แก้ไข
                    </button>
                    <button className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      ลบ
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
            แสดง 1-10 จาก 24 รายการ
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
              ก่อนหน้า
            </button>
            <button className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded text-xs sm:text-sm">
              1
            </button>
            <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
              2
            </button>
            <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </TheLayout>
  )
} 
