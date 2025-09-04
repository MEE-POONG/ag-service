import { menuDev, menuItems as seedMenuItems, user_dev } from "@/data"; // 👈 กันชื่อชน
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { MdDashboard as LayoutDashboard } from "react-icons/md";
import MenuPage from "./MenuPage";
import UserInfo from "@/components/UserInfo";
import { useAuth } from "@/hooks/useAuth";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";

interface TheSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function TheSidebar({ collapsed, setCollapsed }: TheSidebarProps) {
  const { user } = useAuth();

  // ✅ เปลี่ยนชื่อ state ไม่ให้ชนกับตัวที่ import
  const [menus, setMenus] = useState<any[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<any[]>([]);

  const { data: menusData, isLoading: loading } = useQuery({
    queryKey: qk.menus.showOrder,
    queryFn: async () => {
      const res = await axios.get(`/api/menu-web/showorder`);
      return res?.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // กรองเมนูตามสิทธิ์ของ user
  const filterMenusByPermissions = useCallback((menus: any[], currentUser: any) => {
    if (!currentUser || !currentUser.permissions || currentUser.permissions.length === 0) {
      return [];
    }

    // map ของสิทธิ์ user จาก AdminDefaultPermissionDB
    const userPermissionsMap = new Map();
    if (currentUser.adminPosition?.AdminDefaultPermissionDB) {
      currentUser.adminPosition.AdminDefaultPermissionDB.forEach((permission: any) => {
        userPermissionsMap.set(permission.menuPage.name, permission);
      });
    }

    const filterMenu = (menu: any): any | null => {
      const userPermission = userPermissionsMap.get(menu.name);
      const hasBasicPermission = currentUser.permissions.includes(menu.name);

      if (!userPermission && !hasBasicPermission) {
        if (menu.children?.length > 0) {
          const filteredChildren = menu.children.map(filterMenu).filter(Boolean);
          if (filteredChildren.length > 0) {
            return { ...menu, children: filteredChildren };
          }
        }
        return null;
      }

      if (userPermission && !userPermission.canViews) {
        return null;
      }

      if (menu.children?.length > 0) {
        const filteredChildren = menu.children.map(filterMenu).filter(Boolean);
        return { ...menu, children: filteredChildren, userPermission };
      }

      return { ...menu, userPermission };
    };

    return menus.map(filterMenu).filter(Boolean);
  }, []);

  // โหลดเมนูจาก API -> เก็บใน state
  useEffect(() => {
    if (menusData && Array.isArray(menusData)) {
      setMenus(menusData);
    } else {
      setMenus([]);
    }
  }, [menusData]);

  // ✅ ถ้าเป็น admin/superadmin ให้เห็นทุกเมนู ไม่ต้องกรอง
  useEffect(() => {
    const isAdmin =
      typeof user?.username === "string" &&
      ["admin", "superadmin"].includes(user.username.toLowerCase());

    if (user && menus.length > 0) {
      if (isAdmin) {
        setFilteredMenus(menus);
      } else {
        const filtered = filterMenusByPermissions(menus, user);
        setFilteredMenus(filtered);
      }
    } else {
      setFilteredMenus([]);
    }
  }, [user, menus, filterMenusByPermissions]); // ✅ เพิ่ม deps ให้ครบ

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
        <div className="flex-1 overflow-y-auto p-4">
          <nav>
            <ul className="space-y-1">
              {loading ? (
                <li className="text-center text-gray-500 py-4">
                  <div className="animate-pulse">กำลังโหลดเมนู...</div>
                </li>
              ) : (
                filteredMenus.length > 0 && (
                  <MenuPage dataList={filteredMenus} collapsed={collapsed} />
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
