import Link from 'next/link'
import { TheLayout } from '@/components/TheLayout'
import { FcAddImage } from 'react-icons/fc'
//import { sampleUser } from '@/data/sampleUser'

export default function AdminManagementPage() {
  return (
    <TheLayout>
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2">
            <FcAddImage size={32} />
            จัดการผู้ดูแล
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">ระบบจัดการผู้ดูแลระบบ</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              จัดการข้อมูลผู้ดูแลระบบ แผนกงาน และสิทธิ์การเข้าถึง
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Link 
                href="/admin-management/admins"
                className="block p-4 sm:p-6 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-white font-bold text-xs sm:text-sm">🔧</span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-purple-800">ผู้ดูแล</h3>
                </div>
                <p className="text-sm sm:text-base text-purple-600">จัดการข้อมูลผู้ดูแลระบบและสิทธิ์การเข้าถึง</p>
              </Link>
              
              <Link 
                href="/admin-management/departments"
                className="block p-4 sm:p-6 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-white font-bold text-xs sm:text-sm">🏢</span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-orange-800">แผนกงาน</h3>
                </div>
                <p className="text-sm sm:text-base text-orange-600">จัดการข้อมูลแผนกงานและโครงสร้างองค์กร</p>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">📊 สถิติผู้ดูแลระบบ</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">23</div>
                <div className="text-xs sm:text-sm text-gray-600">ผู้ดูแลทั้งหมด</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">18</div>
                <div className="text-xs sm:text-sm text-gray-600">ออนไลน์</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">5</div>
                <div className="text-xs sm:text-sm text-gray-600">แผนกงาน</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">15</div>
                <div className="text-xs sm:text-sm text-gray-600">ตำแหน่งงาน</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-800 mb-3 sm:mb-4">🔐 การจัดการสิทธิ์</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <h4 className="text-sm sm:text-base font-semibold mb-2">Super Admin</h4>
                <p className="text-xs sm:text-sm text-gray-600">สิทธิ์สูงสุด - จัดการทุกส่วนของระบบ</p>
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">3 คน</span>
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <h4 className="text-sm sm:text-base font-semibold mb-2">Admin</h4>
                <p className="text-xs sm:text-sm text-gray-600">จัดการส่วนใหญ่ของระบบ</p>
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">12 คน</span>
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <h4 className="text-sm sm:text-base font-semibold mb-2">Manager</h4>
                <p className="text-xs sm:text-sm text-gray-600">จัดการในขอบเขตที่กำหนด</p>
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">8 คน</span>
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <h4 className="text-sm sm:text-base font-semibold mb-2">Staff</h4>
                <p className="text-xs sm:text-sm text-gray-600">สิทธิ์พื้นฐานในการใช้งาน</p>
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">5 คน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TheLayout>
  )
} 
