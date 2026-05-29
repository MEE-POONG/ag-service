import { menuDev } from "@/data";
import { Dispatch, SetStateAction, useEffect } from "react";
import { MdDashboard as LayoutDashboard } from "react-icons/md";
import UserInfo from "@/components/UserInfo";
import { useAuth } from "@/hooks/useAuth";
import ReactIconComponent from "./ReactIconComponent";
import MenuPageWebDB from "./MenuPageWeb";
import { useMenuWeb } from "@/hooks/useMenuWeb";

interface TheSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function TheSidebar({ collapsed, setCollapsed }: TheSidebarProps) {
  const { user } = useAuth();
  const { menuWeb, menuLoading } = useMenuWeb();

  const isDev =
    (user?.username || '').toLowerCase() === 'superadmin' ||
    (user?.username || '').toLowerCase() === 'admin';

  return (
    <div className="fixed top-0 left-0 right-0 w-max z-50">
      <div
        className={`h-screen glass border-r border-border/50 shadow-soft transition-all duration-300 ease-in-out ${
          collapsed ? "w-16 -translate-x-full md:translate-x-0" : "w-64"
        } relative flex flex-col shrink-0`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b border-border/50 px-4">
          <div className="flex items-center justify-center w-full gap-3 overflow-hidden">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap transition-all duration-300">
                AG Service
              </h1>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
          <nav>
            <ul className="space-y-1.5">
              {menuLoading ? (
                <li className="text-center text-muted-foreground py-8">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    {!collapsed && <span className="text-sm">กำลังโหลดเมนู...</span>}
                  </div>
                </li>
              ) : (
                menuWeb && <MenuPageWebDB dataList={menuWeb} collapsed={collapsed} />
              )}
              
              {/* เมนูสำหรับผู้พัฒนา */}
              {(
                user?.username === 'superadmin' ||
                user?.username === 'admin' ||
                isDev ||
                user?.adminPosition?.adminDepartment?.name === 'IT Department'
              ) && (
                <>
                  {!collapsed && (
                    <li className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ระบบผู้พัฒนา
                    </li>
                  )}
                  {collapsed && <div className="my-4 border-t border-border/50"></div>}
                  <MenuPageWebDB dataList={menuDev} collapsed={collapsed} />
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Bottom User Info */}
        <div className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-md">
          <UserInfo collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}

// ปุ่มสำหรับกดปิดหน้าต่าง
export const CloseButton = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) => {
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 mr-2 md:mr-0 lg:hidden"
    >
      <ReactIconComponent icon={collapsed ? "FaBars" : "FaTimes"} setClass="h-5 w-5" />
    </button>
  );
};

