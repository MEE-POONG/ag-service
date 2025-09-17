import { TheLayout } from '@/components/TheLayout'
//import { sampleUser } from '@/data/sampleUser'

export default function DepartmentsPage() {
  return (
    <TheLayout>
      <div className="p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              🏢 จัดการแผนกงาน
            </h1>
            <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              + เพิ่มแผนก
            </button>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">รายการแผนกงาน</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            จัดการข้อมูลแผนกงานและโครงสร้างองค์กร
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหาแผนก..."
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option>สถานะทั้งหมด</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">5</div>
              <div className="text-xs sm:text-sm text-orange-700">แผนกทั้งหมด</div>
            </div>
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">23</div>
              <div className="text-xs sm:text-sm text-blue-700">พนักงานทั้งหมด</div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-green-600">15</div>
              <div className="text-xs sm:text-sm text-green-700">ตำแหน่งงาน</div>
            </div>
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">4.6</div>
              <div className="text-xs sm:text-sm text-purple-700">พนักงาน/แผนก</div>
            </div>
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 pl-1 sm:p-2 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-blue-800">IT</h3>
                <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-blue-600 text-xs sm:text-sm mb-3 sm:mb-4">
                แผนกเทคโนโลยีสารสนเทศและการพัฒนาระบบ
              </p>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-blue-700">พนักงาน:</span>
                  <span className="font-semibold">8 คน</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-blue-700">หัวหน้าแผนก:</span>
                  <span className="font-semibold">สมชาย IT</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-blue-700">ตำแหน่ง:</span>
                  <span className="font-semibold">4 ตำแหน่ง</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <button className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  ดูรายละเอียด
                </button>
                <button className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                  แก้ไข
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 pl-1 sm:p-2 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-green-800">การตลาด</h3>
                <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-green-600 text-xs sm:text-sm mb-3 sm:mb-4">
                แผนกการตลาดและประชาสัมพันธ์
              </p>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-green-700">พนักงาน:</span>
                  <span className="font-semibold">6 คน</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-green-700">หัวหน้าแผนก:</span>
                  <span className="font-semibold">สมหญิง การตลาด</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-green-700">ตำแหน่ง:</span>
                  <span className="font-semibold">3 ตำแหน่ง</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <button className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  ดูรายละเอียด
                </button>
                <button className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                  แก้ไข
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 pl-1 sm:p-2 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-purple-800">บัญชี</h3>
                <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-purple-600 text-xs sm:text-sm mb-3 sm:mb-4">
                แผนกบัญชีและการเงิน
              </p>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-purple-700">พนักงาน:</span>
                  <span className="font-semibold">4 คน</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-purple-700">หัวหน้าแผนก:</span>
                  <span className="font-semibold">สมศรี บัญชี</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-purple-700">ตำแหน่ง:</span>
                  <span className="font-semibold">3 ตำแหน่ง</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                  ดูรายละเอียด
                </button>
                <button className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                  แก้ไข
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 pl-1 sm:p-2 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-red-800">ทรัพยากรบุคคล</h3>
                <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-red-600 text-xs sm:text-sm mb-3 sm:mb-4">
                แผนกทรัพยากรบุคคลและบริหารงานบุคคล
              </p>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-red-700">พนักงาน:</span>
                  <span className="font-semibold">3 คน</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-red-700">หัวหน้าแผนก:</span>
                  <span className="font-semibold">สมปอง HR</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-red-700">ตำแหน่ง:</span>
                  <span className="font-semibold">2 ตำแหน่ง</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <button className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  ดูรายละเอียด
                </button>
                <button className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                  แก้ไข
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 pl-1 sm:p-2 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800">ขาย</h3>
                <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-yellow-600 text-xs sm:text-sm mb-3 sm:mb-4">
                แผนกขายและพัฒนาธุรกิจ
              </p>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-yellow-700">พนักงาน:</span>
                  <span className="font-semibold">2 คน</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-yellow-700">หัวหน้าแผนก:</span>
                  <span className="font-semibold">สมรัก ขาย</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-yellow-700">ตำแหน่ง:</span>
                  <span className="font-semibold">3 ตำแหน่ง</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                  ดูรายละเอียด
                </button>
                <button className="px-2 sm:px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">
                  แก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TheLayout>
  )
} 
