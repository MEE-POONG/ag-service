'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ExtendedAdminDB } from '@/data/interface'
import { TheSidebar } from './TheSidebar'
import { TheHeader } from './TheHeader'
import { AutoPushSubscriber } from './AutoPushSubscriber'

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

  // Restore dark mode preference if needed (optional implementation)
  useEffect(() => {
    // Check local storage or system preference if desired
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // document.documentElement.classList.toggle('dark') should also be handled globally if using tailwind dark mode
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary ${darkMode ? 'dark' : ''}`}>
      <AutoPushSubscriber />
      <div className="min-h-screen flex relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

        {/* Sidebar - Fixed Position */}
        <TheSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main Content - Adjusted for fixed sidebar */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out`}>
          {/* Header - Fixed Position */}
          <TheHeader
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />

          {/* Main Content Area - Adjusted for fixed header and sidebar */}
          <main 
            className={`flex-1 overflow-x-hidden overflow-y-auto pt-20 p-4 md:p-6 transition-all duration-300 ease-in-out ${
              collapsed ? 'md:pl-20' : 'md:pl-68 lg:pl-72'
            }`}
          >
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {!collapsed && (
          <div
            className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setCollapsed(true)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
