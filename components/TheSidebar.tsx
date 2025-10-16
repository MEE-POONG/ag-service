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
  const { menuWeb, menuLoading } = useMenuWeb(); // <- ได้ "เมนูกรองแล้ว"

  // useEffect(() => {
  //   // ถ้ามีข้อมูล ทั้งคุ๋ ให้แสดง
  //   if (user && menuWeb) {
  //     console.log('User:', user);
  //     console.log('MenuWeb:', menuWeb);
  //   }
  // }, [user, menuWeb])
  const isDev =
    (user?.username || '').toLowerCase() === 'superadmin' ||
    (user?.username || '').toLowerCase() === 'admin';

  return (
    <div className="fixed top-0 left-0 right-0 w-max">
      <div
        className={`h-screen bg-white/70 backdrop-blur-xl border-r border-gray-200/60 shadow-sm transition-all duration-300 ${collapsed ? "w-16 ml-[-4rem]" : "w-56"
          } relative z-50 shrink-0`}  // ⬅️ เพิ่มตรงนี้
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!collapsed ? (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-white" />
                  </div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
                  <LayoutDashboard className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto p-2">
            <nav>
              <ul className="space-y-1">
                {menuLoading ? (
                  <li className="text-center text-gray-500 py-4">
                    <div className="animate-pulse">กำลังโหลดเมนู...</div>
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
                    <MenuPageWebDB dataList={menuDev} collapsed={collapsed} />
                  )}

              </ul>
            </nav>
          </div>

          {/* Bottom */}
          <div className="mt-auto p-3 border-t border-gray-200/70">
            <UserInfo collapsed={collapsed} />
          </div>
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
      className="top-2 right-2 text-white-500 hover:text-gray-700"
    >
      <ReactIconComponent icon="FaBars" setClass="h-5 w-5" />
    </button>
  );
};
