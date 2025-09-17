'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ExtendedAdminDB } from '@/data/interface'
import { TheSidebar } from './TheSidebar'
import { TheHeader } from './TheHeader'

interface LayoutProps {
  children: ReactNode
  admin?: ExtendedAdminDB
  user?: any  // Accept user prop for backward compatibility
}

export function TheLayout({ children }: LayoutProps) {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };


  return (
    <div className="min-h-screen bg-background antialiased">
      <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
        {/* Sidebar - Fixed Position */}
        <div className="flex">
          <TheSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content - Adjusted for fixed sidebar */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}>
          {/* Header - Fixed Position */}
          <TheHeader
            collapsed={collapsed}
            setCollapsed={setCollapsed}
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
