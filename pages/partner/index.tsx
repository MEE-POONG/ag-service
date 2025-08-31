import Link from 'next/link'
import { TheLayout } from '@/components/TheLayout'
//import { sampleUser } from '@/data/sampleUser'

export default function PartnerPage() {
  return (
    <TheLayout>
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
            🤝 พันธมิตร
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">จัดการข้อมูลพันธมิตร</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              ระบบจัดการข้อมูลพันธมิตรและสมาชิกทั้งหมด
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Link 
                href="/partner/ag-user"
                className="block p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-white font-bold text-xs sm:text-sm">AU</span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-800">AG User</h3>
                </div>
                <p className="text-sm sm:text-base text-blue-600">จัดการข้อมูล AG User และการเข้าถึงระบบ</p>
              </Link>
              
              <Link 
                href="/partner/members"
                className="block p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-white font-bold text-xs sm:text-sm">SM</span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-green-800">สมาชิก</h3>
                </div>
                <p className="text-sm sm:text-base text-green-600">จัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน</p>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">📊 สถิติรวม</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">124</div>
                <div className="text-xs sm:text-sm text-gray-600">AG Users ทั้งหมด</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">2,458</div>
                <div className="text-xs sm:text-sm text-gray-600">สมาชิกทั้งหมด</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">89.2%</div>
                <div className="text-xs sm:text-sm text-gray-600">อัตราการใช้งาน</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TheLayout>
  )
} 
