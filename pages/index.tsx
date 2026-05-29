import React, { useEffect } from 'react'
import Link from 'next/link'
import { TheLayout } from '@/components/TheLayout'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import PageHeader from '@/components/PageHeader'

const getRoleBadgeColor = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    case 'agent':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
    default:
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
  }
}

export default function DashboardPage() {
  const { user, userLoading, logout } = useAuth()

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="mt-4 text-muted-foreground animate-pulse">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    {
      title: 'จัดการผู้ใช้',
      description: 'จัดการข้อมูลผู้ใช้ ระบบสิทธิ์ และการเข้าถึง',
      href: '/admin/users',
      icon: 'FaUsers',
      color: 'text-blue-500',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      show: true,
    },
    {
      title: 'ระบบ Admin',
      description: 'จัดการผู้ดูแลระบบ ตำแหน่ง และแผนก',
      href: '/admin/admins',
      icon: 'FaUserShield',
      color: 'text-purple-500',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-900/20',
      show: user.role === 'admin',
    },
    {
      title: 'ฐานข้อมูล AG',
      description: 'จัดการฐานข้อมูลเว็บและผู้ใช้ AG',
      href: '/admin/ag-database',
      icon: 'FaDatabase',
      color: 'text-amber-500',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-900/20',
      show: true,
    },
    {
      title: 'ระบบสิทธิ์',
      description: 'จัดการสิทธิ์การเข้าถึงและเมนู',
      href: '/admin/permissions',
      icon: 'FaKey',
      color: 'text-emerald-500',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-900/20',
      show: user.role === 'admin',
    },
    {
      title: 'ประวัติการใช้งาน',
      description: 'ดูประวัติการเข้าสู่ระบบและกิจกรรม',
      href: '/admin/activity-log',
      icon: 'FaHistory',
      color: 'text-rose-500',
      bgLight: 'bg-rose-50',
      bgDark: 'dark:bg-rose-900/20',
      show: user.role === 'admin',
    },
    {
      title: 'โปรไฟล์ของฉัน',
      description: 'จัดการข้อมูลส่วนตัวและรหัสผ่าน',
      href: '/profile',
      icon: 'FaUserCircle',
      color: 'text-cyan-500',
      bgLight: 'bg-cyan-50',
      bgDark: 'dark:bg-cyan-900/20',
      show: true,
    }
  ]

  return (
    <TheLayout>
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-primary shadow-elegant">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-black opacity-10 blur-3xl"></div>
        
        <div className="relative z-10 p-8 sm:p-10 lg:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
              ยินดีต้อนรับกลับ, {user.name || user.username}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getRoleBadgeColor(user.role)} backdrop-blur-md bg-white/20 text-white border-white/30`}>
                <ReactIconComponent icon="FaUserShield" setClass="inline-block mr-2 mb-0.5 align-middle" />
                <span className="align-middle">{user.role}</span>
              </span>
              <p className="text-white/80 text-sm sm:text-base">
                เริ่มจัดการระบบของคุณได้จากเมนูด้านล่าง
              </p>
            </div>
          </div>
          
          <Button
            onClick={logout}
            variant="destructive"
            className="flex-shrink-0 group relative overflow-hidden rounded-xl px-6 py-6 sm:py-3 font-semibold transition-all hover:scale-105 shadow-lg bg-white/10 hover:bg-red-500 text-white border border-white/20 hover:border-red-500 backdrop-blur-sm h-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-base">
              ออกจากระบบ
              <ReactIconComponent icon="FaSignOutAlt" setClass="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 px-2">
          <ReactIconComponent icon="FaCompass" setClass="text-primary w-6 h-6" />
          เมนูการจัดการ
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {menuItems.filter(item => item.show).map((item, index) => (
            <Link href={item.href} key={index} className="block group h-full">
              <div className="h-full p-6 sm:p-8 rounded-2xl glass transition-smooth hover:-translate-y-2 hover:shadow-elegant bg-card/80 border border-border/50 relative overflow-hidden flex flex-col">
                
                {/* Background Accent */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${item.bgLight} ${item.bgDark} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
                
                <div className="relative z-10 flex-grow">
                  <div className={`w-14 h-14 rounded-2xl ${item.bgLight} ${item.bgDark} flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-shadow`}>
                    <ReactIconComponent icon={item.icon} setClass={`w-7 h-7 ${item.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>
                
                <div className="relative z-10 mt-auto pt-5 border-t border-border/40 flex items-center justify-between text-sm font-semibold text-primary group-hover:text-primary-hover">
                  <span>เข้าสู่ระบบจัดการ</span>
                  <ReactIconComponent icon="FaArrowRight" setClass="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </TheLayout>
  )
}
