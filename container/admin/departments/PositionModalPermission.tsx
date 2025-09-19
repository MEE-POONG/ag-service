import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Button, ButtonProps } from "@/components/ui/button"

import ReactIconComponent from '@/components/ReactIconComponent';
import { AdminPositionDB, MenuWebDB } from '@prisma/client';
import Modal from '@/components/form/Modal';
import buildMenuTree from '@/utils/buildMenuTree';
import { ExtendedAdminDepartment } from '@/data/interface';

// -------- Types --------
type MenuNode = MenuWebDB & { children: MenuNode[] }
type PermKey = "advance" | "view" | "create" | "update" | "delete"
type Perms = Record<string, { advance: boolean; view: boolean; create: boolean; update: boolean; delete: boolean }>

interface PositionModalPermissionProps {
  onSuccess: () => void
  list: ExtendedAdminDepartment
  position: AdminPositionDB
}

// note: buildMenuTree is reused from utils to follow DRY/SOLID

// -------- Permission row (renders only available fields) --------
const PermissionBadges: React.FC<{
  node: MenuNode
  isHead: boolean
  perms: Perms
  onToggle: (menuId: string, key: PermKey) => void
}> = ({ node, isHead, perms, onToggle }) => {
  // แสดงเฉพาะสิทธิ์ที่เมนูรองรับ (can* = true)
  const fields = isHead
    ? ([
      { key: "advance", label: "Advance", can: !!node.canAdvance },
      { key: "view", label: "View", can: !!node.canViews },
    ] as const)
    : ([
      { key: "view", label: "View", can: !!node.canViews },
      { key: "create", label: "Create", can: !!node.canCreate },
      { key: "update", label: "Update", can: !!node.canUpdate },
      { key: "delete", label: "Delete", can: !!node.canDelete },
    ] as const);

  const p = perms[node.id] || { advance: false, view: false, create: false, update: false, delete: false };


  return (
    <div className="grid grid-cols-4 gap-2 text-xs w-max">
      {(['advance', 'view', 'create', 'update', 'delete'] as PermKey[]).map((logicalKey) => {
        const meta = fields.find((f) => f.key === logicalKey)
        const isVisible = !!meta?.can
        const isActive = p[logicalKey]
        const activeColor = isHead && logicalKey === 'advance' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
        const inactiveColor = 'bg-white border-gray-200 text-gray-700'

        if (!isVisible) return null;

        return (
          <label key={logicalKey} className={`inline-flex items-center w-24 gap-2 px-2 py-1 rounded border shadow-sm transition-colors ${isActive ? activeColor : inactiveColor} hover:border-gray-300 cursor-pointer select-none`}
          >
            <input
              type="checkbox"
              className={isHead ? "accent-purple-600" : "accent-green-600"}
              checked={p[logicalKey]}
              onChange={() => onToggle(node.id, logicalKey)}
            />
            <span className="hidden sm:inline">{meta?.label}</span>
          </label>
        )
      })}
    </div>
  );
};

// -------- Tree viewer --------
const MenuTreeView: React.FC<{
  nodes: MenuNode[]
  perms: Perms
  onToggle: (menuId: string, key: PermKey) => void
  expandSignal: number
  expandOpen: boolean
  onSetAll: (node: MenuNode, checked: boolean) => void
  onSetAllRecursive: (node: MenuNode, checked: boolean) => void
}> = ({ nodes, perms, onToggle, expandSignal, expandOpen, onSetAll, onSetAllRecursive }) => {
  return (
    <div className="space-y-3">
      {nodes.map((n) => (
        <MenuTreeItem key={n.id} node={n} level={0} perms={perms} onToggle={onToggle} expandSignal={expandSignal} expandOpen={expandOpen} onSetAll={onSetAll} onSetAllRecursive={onSetAllRecursive} />
      ))}
    </div>
  );
};

const MenuTreeItem: React.FC<{
  node: MenuNode
  level: number
  perms: Perms
  onToggle: (menuId: string, key: PermKey) => void
  expandSignal: number
  expandOpen: boolean
  onSetAll: (node: MenuNode, checked: boolean) => void
  onSetAllRecursive: (node: MenuNode, checked: boolean) => void
  isLast?: boolean
  parentPrefix?: string
}> = ({ node, level, perms, onToggle, expandSignal, expandOpen, onSetAll, onSetAllRecursive, isLast = false, parentPrefix = "" }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isHead = !!node.head;

  useEffect(() => {
    setOpen(expandOpen);
  }, [expandSignal, expandOpen]);

  // สร้าง prefix สำหรับแสดงโครงสร้างต้นไม้
  const getTreePrefix = () => {
    if (level === 0) return "";

    const connector = isLast ? "└──" : "├──";
    return parentPrefix + connector;
  };

  // สร้าง prefix สำหรับลูก
  const getChildPrefix = () => {
    if (level === 0) return "";

    const childPrefix = isLast ? "   " : "│  ";
    return parentPrefix + childPrefix;
  };

  return (
    <div className={isHead ? `rounded-md border border-slate-200 bg-white shadow-sm` : 'rounded-b-md border border-slate-200 bg-white shadow-sm'}>
      <div className="flex px-4 py-1 border-b border-slate-200">
        <div className="flex items-center gap-1">
          {level > 0 && (
            <span className="text-slate-400 font-mono text-sm whitespace-pre">
              {getTreePrefix()}
            </span>
          )}

          {hasChildren ? (
            <Button
              onClick={() => setOpen(v => !v)}
              className="w-5 h-5 grid place-items-center rounded hover:bg-gray-100"
              aria-label={open ? "Collapse" : "Expand"}
              title={open ? "ยุบ" : "ขยาย"}
            >
              <span className={`transition-transform ${open ? "rotate-90" : "rotate-0"} text-slate-400`}>
                ▶
              </span>
            </Button>
          ) : (
            <span className="w-5" />
          )}
        </div>

        <div className="min-w-0 flex items-center gap-2 text-base font-semibold">
          <span className="text-slate-800 truncate block">{node.name}</span>
          {isHead && (
            <span className="text-blue-700">{"<"}HEAD{">"}</span>
          )}
          {!node.isVisible && (
            <span className="bg-gray-100 text-gray-600">{"<"}ปิดใช้งาน{">"}</span>
          )}
        </div>

        {/* <div className="ml-auto flex items-center gap-1">

        </div> */}

        <div className="ml-auto mr-2 flex gap-2 mb-1">
          {hasChildren && (
            <>
              <Button
                className="text-xs px-2 py-1 rounded border border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                title="ให้สิทธิ์ทั้งหมดรวมลูกทั้งหมด"
                onClick={() => onSetAllRecursive(node, true)}
              >All↓</Button>
              <Button
                className="text-xs px-2 py-1 rounded border border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                title="ล้างสิทธิ์ทั้งหมดรวมลูกทั้งหมด"
                onClick={() => onSetAllRecursive(node, false)}
              >None↓</Button>
            </>
          )}
          <Button
            className="text-xs px-2 py-1 rounded border border-blue-500 bg-blue-100 text-blue-700 hover:bg-blue-200"
            title="ให้สิทธิ์ทั้งหมดของแถวนี้"
            onClick={() => onSetAll(node, true)}
          >All</Button>
          <Button
            className="text-xs px-2 py-1 rounded border border-blue-500 bg-blue-100 text-blue-700 hover:bg-blue-200"
            title="ล้างสิทธิ์ทั้งหมดของแถวนี้"
            onClick={() => onSetAll(node, false)}
          >None</Button>
        </div>
        <div className="w-max ">
          <PermissionBadges node={node} isHead={isHead} perms={perms} onToggle={onToggle} />
        </div>
      </div>

      {hasChildren && open && (
        <div className="">
          {node.children.map((child, index) => (
            <MenuTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              perms={perms}
              onToggle={onToggle}
              expandSignal={expandSignal}
              expandOpen={expandOpen}
              onSetAll={onSetAll}
              onSetAllRecursive={onSetAllRecursive}
              isLast={index === node.children.length - 1}
              parentPrefix={getChildPrefix()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// -------- Main modal --------
const PositionModalPermission: React.FC<PositionModalPermissionProps> = ({ onSuccess, position }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);
  const [perms, setPerms] = useState<Perms>({}); // <-- ค่าที่ใช้ติ๊กจริง
  const [expandSignal, setExpandSignal] = useState(0);
  const [expandOpen, setExpandOpen] = useState(true);

  const setNodePermissions = (node: MenuNode, value: boolean, next: Perms) => {
    const keys: PermKey[] = node.head ? ["advance", "view"] : ["view", "create", "update", "delete"]
    const base = next[node.id] || { advance: false, view: false, create: false, update: false, delete: false }
    const updated = { ...base }
    keys.forEach((k) => { updated[k] = value })
    next[node.id] = updated
  }

  const handleSetAll = (node: MenuNode, value: boolean) => {
    setPerms((prev) => {
      const next: Perms = { ...prev }
      setNodePermissions(node, value, next)
      return next
    })
  }

  const handleSetAllRecursive = (node: MenuNode, value: boolean) => {
    setPerms((prev) => {
      const next: Perms = { ...prev }
      const walk = (n: MenuNode) => {
        setNodePermissions(n, value, next)
        n.children.forEach(walk)
      }
      walk(node)
      return next
    })
  }

  const nodeSupportsKey = (n: MenuNode, key: PermKey) => {
    if (n.head) return key === 'advance' || key === 'view'
    if (key === 'view') return !!n.canViews
    if (key === 'create') return !!n.canCreate
    if (key === 'update') return !!n.canUpdate
    if (key === 'delete') return !!n.canDelete
    return false
  }


  //โหลดเมนู
  const fetchMenus = async () => {
    const res = await axios.get('/api/menu-web/showorder');
    const list: MenuWebDB[] = res.data?.data || res.data?.menuWebs || [];
    setMenuTree(buildMenuTree(list));
    return list;
  };

  //โหลดสิทธิ์เริ่มต้นของตำแหน่งนี้
  const fetchPositionPerms = async () => {
    const res = await axios.get('/api/admin-permissions', { params: { adminPositionDBId: position.id } });
    const filtered: any[] = res.data?.data || [];

    const mapped: Perms = {};
    for (const r of filtered) {
      mapped[r.menuPageWebId] = {
        advance: !!r.canAdvance,
        view: !!r.canViews,
        create: !!r.canCreate,
        update: !!r.canUpdate,
        delete: !!r.canDelete,
      };
    }
    return mapped;
  };

  // รวมทั้งสองอย่าง: เมนู + perms (ถ้าเมนูไหนไม่มี record → false)
  const hydratePerms = (menus: MenuWebDB[], base: Perms): Perms => {
    const result: Perms = { ...base };
    for (const m of menus) {
      if (!result[m.id]) {
        result[m.id] = { advance: false, view: false, create: false, update: false, delete: false };
      }
    }
    return result;
  };

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setError('');
        const menus = await fetchMenus();
        const base = await fetchPositionPerms();
        setPerms(hydratePerms(menus, base)); // <-- ใส่ค่า false ให้เมนูที่ไม่มี record
      } catch (e) {
        setError('ไม่สามารถดึงข้อมูลได้');
      }
    })();
  }, [isOpen, position.id]);

  const handleClose = () => setIsOpen(false);

  const handleToggle = (menuId: string, key: PermKey) => {
    setPerms(prev => {
      const current = prev[menuId] || { advance: false, view: false, create: false, update: false, delete: false };
      return {
        ...prev,
        [menuId]: { ...current, [key]: !current[key] },
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const items = Object.entries(perms).map(([menuId, p]) => ({
        adminPositionDBId: position.id,
        menuPageWebId: menuId,
        canAdvance: p.advance,
        canViews: p.view,
        canCreate: p.create,
        canUpdate: p.update,
        canDelete: p.delete,
      }))

      await axios.put('/api/admin-permissions', { items });
      onSuccess?.();
      setIsOpen(false);
    } catch (e) {
      setError('บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        size="xs"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 border border-solid border-yellow-700 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="กำหนดสิทธิ์ตำแหน่ง"
        disabled={isSaving}
      >
        <ReactIconComponent icon="FaShieldAlt" setClass="w-3 h-3" />
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="full" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              <span className="inline-flex items-center gap-2">
                <span>กำหนดสิทธิ์ให้ตำแหน่ง</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200">{position.name}</span>
              </span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={handleClose} disabled={isSaving} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body className='bg-slate-50/70 border-b border-slate-200'>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="font-medium text-gray-500">เลือกสิทธิ์ที่เมนูรองรับ</div>
            <div className="flex items-center gap-2">
              <Button
                className="px-2 py-1 font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => { setExpandOpen(true); setExpandSignal(s => s + 1) }}
              >ขยายทั้งหมด</Button>
              <Button
                className="px-2 py-1 font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => { setExpandOpen(false); setExpandSignal(s => s + 1) }}
              >ยุบทั้งหมด</Button>
              <Button
                className="px-2 py-1 font-medium bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => {
                  setPerms((prev) => {
                    const next: Perms = { ...prev }
                    const applyAll = (n: MenuNode) => { setNodePermissions(n, true, next); n.children.forEach(applyAll) }
                    menuTree.forEach(applyAll)
                    return next
                  })
                }}
              >ให้สิทธิ์ทั้งหมด</Button>
              <Button
                className="px-2 py-1 font-medium bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  setPerms((prev) => {
                    const next: Perms = { ...prev }
                    const clearAll = (n: MenuNode) => { setNodePermissions(n, false, next); n.children.forEach(clearAll) }
                    menuTree.forEach(clearAll)
                    return next
                  })
                }}
              >ล้างทั้งหมด
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Body>
          <div className="space-y-3">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {/* ตำแหน่งของสิทธิ์การใช้งาน */}
            <div className="overflow-auto pr-1">
              <MenuTreeView nodes={menuTree} perms={perms} onToggle={handleToggle} expandSignal={expandSignal} expandOpen={expandOpen} onSetAll={handleSetAll} onSetAllRecursive={handleSetAllRecursive} />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={handleSave}
            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isSaving && <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button
            onClick={handleClose}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PositionModalPermission;

