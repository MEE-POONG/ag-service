'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Breadcrumbs from "./ui/Breadcrumbs";
import Link from "next/link";
import { CloseButton } from "./TheSidebar";
import ReactIconComponent from "./ReactIconComponent";
import { NotificationCenter } from "./NotificationCenter";

interface TheHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export function TheHeader({
  collapsed,
  setCollapsed,
  darkMode,
  toggleTheme
}: TheHeaderProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header 
      className={`fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out ${
        collapsed ? 'left-0 md:left-16' : 'left-0 md:left-64'
      } ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button & Sidebar toggle */}
          <div className="flex items-center">
            <CloseButton collapsed={collapsed} setCollapsed={setCollapsed} />
          </div>

          {/* Search / Breadcrumbs */}
          <div className="flex-1 mx-4 max-w-lg hidden sm:block">
            <div className={`transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-90'}`}>
              <Breadcrumbs />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            {/* Agent Inbox */}
            <Link href="/chat/agent/inbox">
              <button className="relative p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 group">
                <ReactIconComponent icon="FaInbox" setClass="h-5 w-5" />
                <span className="block absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-background transition-transform group-hover:scale-110"></span>
              </button>
            </Link>

            {/* Notifications */}
            <div className="flex items-center justify-center">
              <NotificationCenter />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <ReactIconComponent icon="FaSun" setClass="h-5 w-5" />
              ) : (
                <ReactIconComponent icon="FaMoon" setClass="h-5 w-5" />
              )}
            </button>

            {/* Admin Menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none ring-2 ring-transparent hover:ring-primary/30 transition-all p-1"
              >
                <img
                  className="w-8 h-8 rounded-full object-cover border border-border"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User avatar"
                />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-elegant origin-top-right overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                      <p className="font-semibold text-foreground truncate">{user?.name || 'ผู้ดูแลระบบ'}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email || 'admin@test.com'}</p>
                    </div>
                    <div className="p-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ReactIconComponent icon="FaUserCircle" setClass="mr-3 h-4 w-4" />
                        โปรไฟล์ของฉัน
                      </Link>
                    </div>
                    <div className="px-3 py-1">
                      <div className="border-t border-border/50"></div>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-3 py-2 w-full text-left text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
                      >
                        <ReactIconComponent icon="FaSignOutAlt" setClass="mr-3 h-4 w-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 
