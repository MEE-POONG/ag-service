import { menuDev, menuItems, user_dev } from "@/data";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { MdDashboard as LayoutDashboard } from "react-icons/md";
import MenuPage from "./MenuPage";
import UserInfo from "@/components/UserInfo";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

interface TheSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function TheSidebar({ collapsed, setCollapsed }: TheSidebarProps) {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/menu-web/showorder`);
      if (res.data.success) {
        setMenuItems(res.data.data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading menus:', err);
      setLoading(false);
    }
  }, []);

  // กรองเมนูตามสิทธิ์ของ user
  const filterMenusByPermissions = useCallback((menus: any[], user: any) => {
    // ถ้าเป็น superadmin ให้เห็นเมนูทั้งหมด
    if (user?.username === 'superadmin') {
      return menus;
    }

    if (!user || !user.permissions || user.permissions.length === 0) {
      return [];
    }

    // สร้าง map ของสิทธิ์ user จาก AdminDefaultPermissionDB
    const userPermissionsMap = new Map();
    if (user.adminPosition?.AdminDefaultPermissionDB) {
      user.adminPosition.AdminDefaultPermissionDB.forEach((permission: any) => {
        userPermissionsMap.set(permission.menuPage.name, permission);
      });
    }

    const filterMenu = (menu: any): any | null => {
      // ตรวจสอบว่า user มีสิทธิ์เข้าถึงเมนูนี้หรือไม่
      const userPermission = userPermissionsMap.get(menu.name);

      // ถ้าไม่มีในระบบสิทธิ์เลย ให้ตรวจจาก permissions array (backward compatibility)
      const hasBasicPermission = user.permissions.includes(menu.name);

      if (!userPermission && !hasBasicPermission) {
        // ตรวจสอบเมนูย่อยว่ามีสิทธิ์หรือไม่
        if (menu.children?.length > 0) {
          const filteredChildren = menu.children
            .map(filterMenu)
            .filter(Boolean);

          if (filteredChildren.length > 0) {
            return {
              ...menu,
              children: filteredChildren
            };
          }
        }
        return null;
      }

      // ตรวจสอบสิทธิ์การดู (canViews)
      if (userPermission && !userPermission.canViews) {
        return null;
      }

      // ถ้าผ่านการตรวจสอบ ให้กรองเมนูย่อยด้วย
      if (menu.children?.length > 0) {
        const filteredChildren = menu.children
          .map(filterMenu)
          .filter(Boolean);

        return {
          ...menu,
          children: filteredChildren,
          // เพิ่มข้อมูลสิทธิ์เพื่อใช้งานต่อ
          userPermission: userPermission
        };
      }

      return {
        ...menu,
        userPermission: userPermission
      };
    };

    return menus.map(filterMenu).filter(Boolean);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (user && menuItems.length > 0) {
      const filtered = filterMenusByPermissions(menuItems, user);
      setFilteredMenus(filtered);
    } else {
      setFilteredMenus([]);
    }
  }, [user, menuItems, filterMenusByPermissions]);

  return (
    <div className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-16" : "w-56"
      }`}>
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
            {/* ปุ่มย่อเมนูขวามือ */}
            {/* <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {collapsed ? (
                <ReactIconComponent icon="FaChevronRight" setClass="h-4 w-4" />
              ) : (
                <ReactIconComponent icon="FaChevronDown" setClass="h-4 w-4" />
              )}
            </button> */}
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
                  <MenuPage
                    dataList={filteredMenus}
                    collapsed={collapsed}
                    currentUser={user?.username}
                  />
                )
              )}

              {/* ส่วนของเมนูสำหรับผู้พัฒนา */}
              {user_dev.includes(user?.username || "") && (
                <MenuPage
                  dataList={menuDev}
                  collapsed={collapsed}
                  currentUser={user?.username}
                />
              )}

            </ul>
          </nav>
        </div>

        {/* ส่วนล่างของเมนูที่จะมีการกำหนดสิทธิ์การเข้าถึงตามสิทธิ์ของ user ปัจจุบัน */}
        <div className="border-t border-gray-200">
          <UserInfo />
        </div>
      </div>
    </div>
  );
} 
