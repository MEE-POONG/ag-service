'use client'

import { ReactNode, useState, useMemo } from 'react'
import { ExtendedAdminDB } from '@/data/interface'
import { TheSidebar } from './TheSidebar'
import { TheHeader } from './TheHeader'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { useMenuWeb } from '@/hooks/useMenuWeb'
import PageHeader from './PageHeader'

interface PageConfig {
  title: string;
  description?: string;
  icon?: string;
  gradient?: boolean;
  hidePageHeader?: boolean;
}

interface LayoutProps {
  children: ReactNode
  admin?: ExtendedAdminDB
  user?: any  // Accept user prop for backward compatibility
  pageConfig?: PageConfig
}

export function TheLayout({ children, pageConfig }: LayoutProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { getPageConfigFromPath } = useMenuWeb()

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Auto-generate page header based on route using MenuWeb data
  const defaultPageConfig = useMemo((): PageConfig => {
    const path = router.pathname;
    return getPageConfigFromPath(path);
  }, [router.pathname, getPageConfigFromPath]);

  const finalPageConfig: PageConfig = pageConfig || defaultPageConfig;

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
              {/* Auto PageHeader - can be hidden by setting hidePageHeader: true */}
              {!finalPageConfig.hidePageHeader && (
                <PageHeader
                  title={finalPageConfig.title}
                  description={finalPageConfig.description}
                  icon={finalPageConfig.icon}
                  gradient={finalPageConfig.gradient}
                />
              )}
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
