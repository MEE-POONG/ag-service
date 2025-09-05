'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ExtendedAdminDB } from '@/data/interface'
import { TheSidebar } from './TheSidebar'
import { TheHeader } from './TheHeader'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

interface LayoutProps {
  children: ReactNode
  admin?: ExtendedAdminDB
  user?: any  // Accept user prop for backward compatibility
}

export function TheLayout({ children }: LayoutProps) {
  const { user, userLoading, logout } = useAuth()
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // useEffect(() => {
  //   console.log('user in dashboard : ', user);
  //   console.log(`router : `, router);
  //   if (user?.username === 'admin' || user?.username === 'superadmin') {
  //     console.log('yes');
  //   } else {
  //     console.log('no');
  //   }
  // }, [user])

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
        {/* Sidebar - Fixed Position */}
        <div className="fixed inset-y-0 left-0 z-50">
          <TheSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content - Adjusted for fixed sidebar */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
          {/* Header - Fixed Position */}
          <TheHeader
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />

          {/* Main Content Area - Adjusted for fixed header */}
          <main className="md:pt-20 bg-transparent p-2 md:p-4 w-full overflow-y-auto min-h-full">
            <div className="animate-fade-in max-w-full">
              {children}
            </div>
          </main>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          </div>
        )}

        {/* User Menu Overlay */}
        {userMenuOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setUserMenuOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
} 
