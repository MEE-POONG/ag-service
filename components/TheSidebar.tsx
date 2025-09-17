import { menuDev } from "@/data"; // 👈 กันชื่อชน
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { MdDashboard as LayoutDashboard } from "react-icons/md";
import MenuPage from "./MenuPage";
import UserInfo from "@/components/UserInfo";
import { useAuth } from "@/hooks/useAuth";
import { useMenuWeb } from "@/hooks/useMenuWeb";
import ReactIconComponent from "./ReactIconComponent";

interface TheSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

// types ช่วยอ่านง่าย
type MenuNode = {
  id: string;
  title?: string;
  path?: string;
  canViews?: boolean;         // ไม่ได้ใช้ตัดสินใจ แต่จะ sync ให้เท่ากับสิทธิจริง
  children?: MenuNode[];
  subMenus?: MenuNode[];
  items?: MenuNode[];
  [k: string]: any;
};

export function TheSidebar({ collapsed, setCollapsed }: TheSidebarProps) {
  const { user } = useAuth();
  const { menuWeb, menuLoading } = useMenuWeb();
  // ✅ เปลี่ยนชื่อ state ไม่ให้ชนกับตัวที่ import
  const [filteredMenuWebs, setFilteredMenuWebs] = useState<any[]>([]);


  // กรองเมนูตามสิทธิ์ของ user
  const filterMenusByPermissions = useCallback(
    (menus: any[], currentUser: any): MenuNode[] => {
      const perms: Array<{ menuPageWebId: string; canViews: boolean }> =
        currentUser?.adminPosition?.AdminDefaultPermissionDB ?? [];

      if (!Array.isArray(perms) || perms.length === 0 || !Array.isArray(menus)) {
        return [];
      }

      // set ของ id ที่ "ดูได้" จากตารางสิทธิ์
      const allow = new Set(
        perms.filter(p => p?.canViews).map(p => String(p.menuPageWebId))
      );

      // ฟังก์ชันหา children ที่แท้จริง (รองรับหลายชื่อ children)
      const getChildren = (node: any): MenuNode[] =>
        (node?.children ?? node?.subMenus ?? node?.items ?? []) as MenuNode[];

      // หาชื่อพร็อพที่ต้องคืนลูกกลับ (children/subMenus/items)
      const childKeyOf = (node: any): 'children' | 'subMenus' | 'items' | null => {
        if (Array.isArray(node?.children)) return 'children';
        if (Array.isArray(node?.subMenus)) return 'subMenus';
        if (Array.isArray(node?.items)) return 'items';
        return null;
      };

      // กรองแบบ recursive: include ถ้า node เองมีสิทธิ หรือมีลูกที่มีสิทธิ
      const walk = (list: MenuNode[]): MenuNode[] => {
        return (list ?? []).reduce<MenuNode[]>((acc, node) => {
          const id = String(node?.id ?? '');
          const childKey = childKeyOf(node);
          const rawChildren = getChildren(node);
          const filteredChildren = walk(rawChildren);

          const selfAllowed = allow.has(id);
          const hasAllowedChild = filteredChildren.length > 0;

          if (selfAllowed || hasAllowedChild) {
            // sync canViews ให้สะท้อนสิทธิจริง (อิง AdminDefaultPermissionDB เท่านั้น)
            const next: MenuNode = {
              ...node,
              canViews: !!selfAllowed, // ตามโจทย์: ไม่ต้องสนค่าใน menu เดิม
            };

            if (childKey) {
              // คง key เดิมของ children เอาไว้ (รักษาโครงสร้าง UI)
              (next as any)[childKey] = filteredChildren;
            }

            acc.push(next);
          }

          return acc;
        }, []);
      };

      const result = walk(menus);

      // debug ช่วยตรวจสอบ
      console.log(
        '[filterMenusByPermissions] allowedIds:',
        Array.from(allow.values())
      );
      console.log('[filterMenusByPermissions] result:', result);

      return result;
    },
    []
  );

  // ✅ ถ้าเป็น admin/superadmin ให้เห็นทุกเมนู ไม่ต้องกรอง
  useEffect(() => {
    const isAdmin = ['admin', 'superadmin'].includes(
      (user?.username || '').toLowerCase()
    );

    if (!user || !menuWeb) {
      setFilteredMenuWebs([]);
      console.log('filter: no user or no menuWeb');
      return;
    }

    if (isAdmin) {
      console.log('filter: admin -> see all');
      setFilteredMenuWebs(menuWeb);
      return;
    }

    const filtered = filterMenusByPermissions(menuWeb, user);
    setFilteredMenuWebs(filtered);
  }, [user, menuWeb, filterMenusByPermissions]);

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
// ปุ่มสำหรับกดปิดหน้าต่าง
export const CloseButton = ({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (collapsed: boolean) => void }) => {
  return (
    <button onClick={() => setCollapsed(!collapsed)} className="top-2 right-2 text-white-500 hover:text-gray-700">
      <ReactIconComponent icon="FaBars" setClass="h-5 w-5" />
    </button>
  );
};