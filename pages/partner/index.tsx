import Link from 'next/link'
import { TheLayout } from '@/components/TheLayout'
//import { sampleUser } from '@/data/sampleUser'

export default function PartnerPage() {
  return (
    <TheLayout>
      <div className="pl-1 sm:p-2">
        <div className="max-w-6xl mx-auto">
          {/* Themed header */}
          <div className="relative overflow-hidden rounded-[1.5rem] p-5 sm:p-8 mb-6 sm:mb-8 bg-gradient-to-r from-[#A78BFA] via-[#A78BFA] to-[#34D399] shadow-lg shadow-gray-900/10">
            <div className="flex relative z-10 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm sm:text-3xl md:text-4xl">
                🤝 พันธมิตร
              </h1>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/15" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-gray-800/10" />
          </div>

          <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 sm:mb-8 bg-white/90">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">จัดการข้อมูลพันธมิตร</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              ระบบจัดการข้อมูลพันธมิตรและสมาชิกทั้งหมด
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Link 
                href="/partner/ag-user"
                className="block pl-1 sm:p-2 rounded-2xl ring-1 ring-gray-200 bg-white/90 hover:bg-white transition-colors shadow-sm"
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#A78BFA] to-[#34D399] rounded-lg flex items-center justify-center mr-2 sm:mr-3 text-white font-bold text-xs sm:text-sm">
                    AU
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">AG User</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">จัดการข้อมูล AG User และการเข้าถึงระบบ</p>
              </Link>
              
              <Link 
                href="/partner/members"
                className="block pl-1 sm:p-2 rounded-2xl ring-1 ring-gray-200 bg-white/90 hover:bg-white transition-colors shadow-sm"
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#A78BFA] to-[#34D399] rounded-lg flex items-center justify-center mr-2 sm:mr-3 text-white font-bold text-xs sm:text-sm">
                    SM
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">สมาชิก</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">จัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน</p>
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">📊 สถิติรวม</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl ring-1 ring-gray-200 bg-white/90">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">124</div>
                <div className="text-xs sm:text-sm text-gray-600">AG Users ทั้งหมด</div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl ring-1 ring-gray-200 bg-white/90">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">2,458</div>
                <div className="text-xs sm:text-sm text-gray-600">สมาชิกทั้งหมด</div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl ring-1 ring-gray-200 bg-white/90">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">89.2%</div>
                <div className="text-xs sm:text-sm text-gray-600">อัตราการใช้งาน</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TheLayout>
  )
}
