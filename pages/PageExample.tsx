import { TheLayout } from '@/components/TheLayout'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'
//import { sampleUser } from '@/data/sampleUser'

export default function PageExample() {
  return (
    <TheLayout>
      <div className=" mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            🪟 ตัวอย่างหน้าเว็บ
          </h1>
          <Link
            href="/setting/image-list/add"
            className="text-md font-medium text-white-300 text-white px-4 rounded-full bg-blue-500 hover:bg-blue-700 w-max h-8 flex items-center justify-center"
          >
            <FaPlus className="mr-2" />  เพิ่มรูปภาพ
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">รายการตัวอย่าง</h2>
          {/* รายละเอียดถ้าจำเป็นค่อยใส่ */}
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            จัดการข้อมูลผู้ดูแลระบบและสิทธิ์การเข้าถึง
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหาผู้ดูแล (ชื่อผู้ใช้, ชื่อ, อีเมล)..."
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <select className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option>ตำแหน่งทั้งหมด</option>
                <option>Super Admin</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>Staff</option>
              </select>
              <select className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option>สถานะทั้งหมด</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">23</div>
              <div className="text-xs sm:text-sm text-purple-700">ผู้ดูแลทั้งหมด</div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-green-600">18</div>
              <div className="text-xs sm:text-sm text-green-700">ออนไลน์</div>
            </div>
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs sm:text-sm text-blue-700">Admin Level</div>
            </div>
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">5</div>
              <div className="text-xs sm:text-sm text-orange-700">แผนกงาน</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">Username</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">ชื่อ</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">อีเมล</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">ตำแหน่ง</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">แผนก</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">ล็อกอินล่าสุด</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">superadmin</div>
                    <div className="text-xs text-gray-500 sm:hidden">ผู้ดูแลหลัก</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">admin@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">ผู้ดูแลหลัก</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">admin@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">IT</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 14:30</td>
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
                    <div className="font-medium">manager01</div>
                    <div className="text-xs text-gray-500 sm:hidden">สมชาย ผู้จัดการ</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">manager@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">สมชาย ผู้จัดการ</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">manager@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Admin
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">การตลาด</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">2024-01-22 09:15</td>
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                      <button className="px-1 sm:px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        ดู
                      </button>
                      <button className="px-1 sm:px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                        แก้ไข
                      </button>
                      <button className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                        ระงับ
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                    <div className="font-medium">staff01</div>
                    <div className="text-xs text-gray-500 sm:hidden">สมหญิง พนักงาน</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">staff@company.com</div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">สมหญิง พนักงาน</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">staff@company.com</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      Staff
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">บัญชี</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="px-1 sm:px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">-</td>
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
              แสดง 1-10 จาก 23 รายการ
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-50">
                ก่อนหน้า
              </button>
              <button className="px-2 sm:px-3 py-1 bg-purple-500 text-white rounded text-xs sm:text-sm">
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
    </TheLayout>
  )
} 
