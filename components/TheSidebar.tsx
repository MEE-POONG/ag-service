import { menuDev } from "@/data"; // 👈 กันชื่อชน
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { MdDashboard as LayoutDashboard } from "react-icons/md";
import MenuPage from "./MenuPage";
import UserInfo from "@/components/UserInfo";
import { useAuth } from "@/hooks/useAuth";
import { useMenuWeb } from "@/hooks/useMenuWeb";

interface TheSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function TheSidebar({ collapsed }: TheSidebarProps) {
  const { user } = useAuth();
  const { menuWeb, menuLoading } = useMenuWeb();
  // ✅ เปลี่ยนชื่อ state ไม่ให้ชนกับตัวที่ import
  const [filteredMenuWebs, setFilteredMenuWebs] = useState<any[]>([]);


  // กรองเมนูตามสิทธิ์ของ user
  const filterMenusByPermissions = useCallback((menus: any[], currentUser: any) => {
    if (!currentUser?.adminPosition?.AdminDefaultPermissionDB?.length) return [];
    console.log(24, ` currentUser?.adminPosition?.AdminDefaultPermissionDB : `, currentUser?.adminPosition?.AdminDefaultPermissionDB);
    console.log(25, ` menus : `, menus);


  }, []);

  // ✅ ถ้าเป็น admin/superadmin ให้เห็นทุกเมนู ไม่ต้องกรอง
  useEffect(() => {
    const isAdmin = ['admin', 'superadmin'].includes((user?.username || '').toLowerCase());

    if (!user || !menuWeb) {
      console.log(42, ` filterMenusByPermissions : `, setFilteredMenuWebs([]));
      // setFilteredMenuWebs(filterMenusByPermissions(menuWeb, user) || []);

      return;
    } else if (isAdmin) {
      console.log(40, ` isAdmin : `, isAdmin);

      setFilteredMenuWebs(menuWeb);
    } else {
      console.log(44, ` user : `, user);
      console.log(45, ` menuWeb : `, menuWeb);
      // setFilteredMenuWebs([]);
    }

    // setFilteredMenuWebs(isAdmin ? menuWeb : filterMenusByPermissions(menuWeb, user));
    // setFilteredMenuWebs(menuWeb);
  }, [user, menuWeb, filterMenusByPermissions]);

  // useEffect(() => {
  //   console.log(48, ` filteredMenuWebs : `, filteredMenuWebs);
  // }, [filteredMenuWebs]);

  return (
    <div className={`h-screen bg-white/70 backdrop-blur-xl border-r border-gray-200/60 shadow-sm transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
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
                filteredMenuWebs && (
                  <MenuPage dataList={filteredMenuWebs} collapsed={collapsed} />
                )
              )}

              {/* เมนูสำหรับผู้พัฒนา */}
              {user?.username === 'superadmin' || user?.username === 'admin' && (
                <MenuPage dataList={menuDev} collapsed={collapsed} />
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
  );
}
