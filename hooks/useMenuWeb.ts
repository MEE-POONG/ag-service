// /hooks/useMenuWeb.ts
"use client";

/**
 * ✅ แนวคิดของเวอร์ชันนี้
 * - ใช้กฎ "allow แบบ prefix" (Longest Prefix Match) แทนการสร้าง blacklist ของ path
 * - สร้าง Access Rules จากเมนูจริง + สิทธิ์จริงของผู้ใช้
 *   - ถ้า node เป็น head และมี canAdvance → allow ทั้ง subtree
 *   - ถ้าไม่ใช่ head-advance → ตรวจ action suffix (/create, /update, /delete, /edit, /view)
 *     - มี action → ต้องมี perm ตรง action
 *     - ไม่มี action → ใช้ canViews
 * - Rendering เมนูยังใช้ filterMenusByPermissions (เดิม) ได้
 * - แต่ "การบล็อกเส้นทาง" จะใช้ rulesRef (allow-prefix rules) แทน disallowedRef เดิม
 */

import { useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { menuDev, menuPublic } from "@/data/menuItems";
import { MenuWebDB } from "@prisma/client";

const isFullAccessUser = (user: any) => {
  const username = String(user?.username || "").toLowerCase();
  return (
    user?.isSuperAdmin === true ||
    user?.role === "superadmin" ||
    username === "superadmin" ||
    username === "admin" ||
    user?.adminPosition?.adminDepartment?.name === "IT Department"
  );
};

/* ----------------------------- Return type ----------------------------- */

interface UseMenuReturn {
  menuWeb: any[] | null;
  menuLoading: boolean;
  error: string | null;
  refreshMenu: () => Promise<void>;
}

/* ----------------------------- Path helpers ---------------------------- */

/**
 * ดึง path ที่เมนูชี้อยู่จาก key ต่าง ๆ ที่คุณใช้ปะปนกัน (path, href, link, url, to)
 */
const getPathFromMenuItem = (item: any): string | null => {
  return (
    item?.path ??
    item?.href ??
    item?.link ??
    item?.url ??
    (typeof item?.to === "string" ? item.to : null) ??
    null
  );
};

/**
 * ตรวจว่าเป็น internal path (/xxx) ไม่ใช่ http(s)
 */
const isInternalPath = (p?: string | null) =>
  !!p && !/^https?:\/\//i.test(p) && p.startsWith("/");

/**
 * รวม path ของทั้ง node และลูก ๆ ทั้งหมด (ใช้ตอนคำนวณ disallowed ในโค้ด render menu)
 */
const collectAllPaths = (node: any): string[] => {
  const self = getPathFromMenuItem(node);
  const children: any[] = Array.isArray(node?.children) ? node.children : [];
  const childPaths = children.flatMap(collectAllPaths);
  return [...(self ? [self] : []), ...childPaths];
};

/**
 * รวม id ทั้ง subtree (ใช้ตอนคำนวณ disallowed ในโค้ด render menu)
 */
const collectAllIds = (node: any): string[] => {
  const self = (node?.id ?? node?._id ?? node?.menuWebDBId) as string | undefined;
  const children: any[] = Array.isArray(node?.children) ? node.children : [];
  const childIds = children.flatMap(collectAllIds);
  return [...(self ? [self] : []), ...childIds];
};

/**
 * ทำความสะอาด path: ตัด query/fragment และตัด trailing slash (เว้น root "/")
 * - ใช้เพื่อ normalize ทั้ง base และ pathname ให้รูปแบบสม่ำเสมอ
 */
const norm = (p?: string | null) => {
  if (!p) return null;
  const u = p.split(/[?#]/)[0]; // ตัด ?query และ #hash
  if (u === "/") return "/";
  return u.endsWith("/") ? u.slice(0, -1) : u;
};

/* -------------------------- Permission structures ---------------------- */

/**
 * สิทธิ์ที่ใช้ตรวจในกฎ (ขยายจากของเดิมที่มีแค่ canViews/canAdvance)
 * - ให้รองรับ create/update/delete ด้วย (สอดคล้องข้อมูลที่ save ใน backend)
 */
type PermRec = {
  canViews?: boolean;
  canAdvance?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};

/**
 * แปลง permissions ของผู้ใช้ใน res.user.permissions → Map<menuId, PermRec>
 * - รองรับ key หลายชื่อของ menuId (menuWebDBId/menuId/id)
 */
const makePermissionMap = (user: any) => {
  const map = new Map<string, PermRec>();
  const list: any[] = Array.isArray(user?.permissions) ? user.permissions : [];
  for (const p of list) {
    const id = p?.menuWebDBId || p?.menuId || p?.id;
    if (!id) continue;
    map.set(String(id), {
      canViews: Boolean(p?.canViews),
      canAdvance: Boolean(p?.canAdvance),
      canCreate: Boolean(p?.canCreate),
      canUpdate: Boolean(p?.canUpdate),
      canDelete: Boolean(p?.canDelete),
    });
  }
  return map;
};

/* -------------------- Action mapping (/create,/update,...) ------------- */

/**
 * map action suffix → permission key ที่ต้องมี
 */
const ACTION_PERM_MAP: Record<string, keyof PermRec> = {
  "/view": "canViews",
  "/create": "canCreate",
  "/update": "canUpdate",
  "/edit": "canUpdate", // alias ของ update
  "/delete": "canDelete",
};

/* -------------------- Render-menu filter (เหมือนเดิม) ------------------ */

/**
 * ฟังก์ชันเดิมของคุณ: สร้างเมนูที่ "แสดงได้" ตามกติกา
 * 1) แสดง node ที่ canViews === true
 * 2) ถ้า "เมนูแม่" head && canAdvance === true → แสดงลูกทั้งหมดใต้เมนูนั้น (force allow)
 * 3) เก็บ path ที่ไม่มีสิทธิ์ไว้ (disallowed) เพื่อใช้ในวิธีบล็อกแบบเดิม (แต่เราจะเลิกใช้)
 *
 * ❗หมายเหตุ: เรายังคงใช้ผลลัพธ์ filtered เพื่อ "เรนเดอร์เมนู" บน UI
 * ส่วนการบล็อกจะย้ายไปใช้ rulesRef (allow-prefix) แทน
 */
const filterMenusByPermissions = (menus: any[], permMap: Map<string, PermRec>) => {
  const disallowedPaths = new Set<string>();
  const allowedIds = new Set<string>();

  const dfsForceAllow = (node: any): any | null => {
    const kids: any[] = Array.isArray(node?.children) ? node.children : [];
    const nodeId: string | undefined = (node?.id ?? node?._id ?? node?.menuWebDBId) as
      | string
      | undefined;
    if (nodeId) allowedIds.add(nodeId);
    return { ...node, children: kids.map(dfsForceAllow).filter(Boolean) };
  };

  const dfs = (node: any): any | null => {
    const nodeId: string | undefined = (node?.id ?? node?._id ?? node?.menuWebDBId) as
      | string
      | undefined;
    const nodePath = getPathFromMenuItem(node);
    const kids: any[] = Array.isArray(node?.children) ? node.children : [];
    const perm = nodeId ? permMap.get(String(nodeId)) : undefined;

    // head + canAdvance → allow ทั้ง subtree
    if (perm?.canViews && perm?.canAdvance) {
      if (nodeId) allowedIds.add(nodeId);
      for (const cid of kids.flatMap(collectAllIds)) allowedIds.add(cid);
      return { ...node, children: kids.map(dfsForceAllow).filter(Boolean) };
    }

    const canSeeThis = Boolean(perm?.canViews);
    const keptChildren = kids.map(dfs).filter(Boolean) as any[];

    if (canSeeThis) {
      if (nodeId) allowedIds.add(nodeId);
      return { ...node, children: keptChildren };
    }

    // เก็บเป็น disallowed (ถ้าเป็น internal path)
    if (isInternalPath(nodePath)) disallowedPaths.add(nodePath!);

    // ถ้าตัวเองดูไม่ได้ แต่ลูก ๆ มีบางอันดูได้ → bubble ลูกขึ้นมาแทน (และซ่อนไตเติลของตัวเอง)
    if (keptChildren.length > 0) {
      return keptChildren.length === 1
        ? keptChildren[0]
        : { ...node, children: keptChildren, __noHeader: true };
    }
    return null;
  };

  const filtered = (Array.isArray(menus) ? menus : []).map(dfs).filter(Boolean);

  // เก็บ path ทั้ง subtree ที่ "ไม่ถูก allow" เป็น disallowed (เพื่อการตรวจแบบเดิม)
  for (const node of menus) {
    const allIds = collectAllIds(node);
    const allPaths = collectAllPaths(node);
    const blocked = allIds.filter((id) => !allowedIds.has(id));
    if (blocked.length > 0) {
      for (const p of allPaths) {
        if (isInternalPath(p)) disallowedPaths.add(p);
      }
    }
  }

  return { filtered, disallowed: Array.from(disallowedPaths) };
};

/* --------------------- Allow-prefix rules (ใหม่สำหรับ block) ----------- */

/**
 * โครงสร้างกฎการเข้าถึง
 * - base: ลิงก์ฐานของเมนู (normalized) เช่น "/admin", "/partner", "/work-queue"
 * - isHeadAdvance: True ถ้า node เป็น head และ perm มี canAdvance → allow ทั้ง subtree
 * - perm: สิทธิ์บน node นั้น (ใช้ตอนที่ไม่ใช่ head-advance)
 * - managers: action suffix ที่เมนูนี้ประกาศไว้ เช่น ["/create","/update","/view"]
 */
type AccessRule = {
  id: string;
  base: string;
  isHeadAdvance: boolean;
  perm: PermRec;
  managers: string[];
};

/**
 * สร้าง rules จาก raw menu + permMap ของผู้ใช้
 * - เก็บเฉพาะ node ที่ (has base internal) และ (canViews หรือเป็น head-advance)
 * - เรียงผลลัพธ์จาก base ยาว → สั้น เพื่อทำ Longest Prefix Match ได้ง่าย
 */
const buildAccessRules = (menus: any[], permMap: Map<string, PermRec>) => {
  const rules: AccessRule[] = [];

  const walk = (node: any) => {
    const nodeId: string | undefined = (node?.id ?? node?._id ?? node?.menuWebDBId);
    const perm = nodeId ? permMap.get(String(nodeId)) : undefined;

    // base path
    const linkRaw = getPathFromMenuItem(node);
    const base = isInternalPath(linkRaw) ? norm(linkRaw)! : null;

    // action suffix ที่ประกาศไว้ในเมนู เช่น /create /update ...
    const managers: string[] = Array.isArray(node?.manager) ? node.manager : [];

    // กฎ head+advance = allow ทั้ง subtree
    const isHeadAdvance = Boolean(node?.head) && Boolean(perm?.canAdvance);

    // rule นี้จะถูกบันทึกต่อเมื่อ:
    // - มี base เป็น internal path
    // - และ (perm.canViews === true) หรือ (isHeadAdvance === true)
    if (base && (perm?.canViews || isHeadAdvance)) {
      rules.push({
        id: String(nodeId),
        base,
        isHeadAdvance,
        perm: {
          canViews: !!perm?.canViews,
          canAdvance: !!perm?.canAdvance,
          canCreate: !!perm?.canCreate,
          canUpdate: !!perm?.canUpdate,
          canDelete: !!perm?.canDelete,
        },
        // เก็บเฉพาะ suffix ที่เป็น "/xxx"
        managers: managers.filter((m) => typeof m === "string" && m.startsWith("/")),
      });
    }

    // เดินลูกต่อ
    const kids: any[] = Array.isArray(node?.children) ? node.children : [];
    kids.forEach(walk);
  };

  (menus ?? []).forEach(walk);
  // เรียงจาก base ยาว → สั้น (Longest Prefix Match)
  rules.sort((a, b) => b.base.length - a.base.length);
  return rules;
};

/* --------------------------------- Hook -------------------------------- */

export function useMenuWeb(): UseMenuReturn {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, userLoading } = useAuth();

  // ⛔️ กฎใหม่สำหรับควบคุมการบล็อกเส้นทาง (แทน disallowedRef เดิม)
  const rulesRef = useRef<AccessRule[]>([]);

  /**
   * โหลดข้อมูลเมนูแบบมีสิทธิ์
   * - ยังใช้ filterMenusByPermissions เพื่อ “เรนเดอร์เมนู” ให้สวยงาม
   * - สร้าง rulesRef จาก raw menu + permMap เพื่อใช้ “บล็อกเส้นทาง” แบบ allow-prefix
   */
  const queryResult = useQuery({
    queryKey: qk.menus.all,
    queryFn: async () => {
      const res = await axios.get("/api/auth/me");
      const rawMenu: any[] = res.data?.menuWeb ?? [];
      const currentUser = res.data?.user ?? null;

      if (!currentUser || !Array.isArray(rawMenu)) {
        rulesRef.current = [];
        return [];
      }

      const permMap = makePermissionMap(currentUser);

      // สำหรับการบล็อกเส้นทาง
      rulesRef.current = buildAccessRules(rawMenu, permMap);

      return rawMenu;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // ✅ รองรับทั้ง v4/v5 ของ react-query (สถานะ loading)
  const menuWebData = (queryResult.data as any[]) ?? [];
  const menuLoading =
    // v5
    (queryResult as any).isPending ??
    // v4 fallback
    (queryResult as any).isLoading ??
    // extra safety
    (queryResult as any).isFetching;

  const errorMsg =
    (queryResult as any).error?.message ?? (queryResult as any).error ?? null;

  /**
   * refreshMenu: รีเฟรชเมนู + rebuild rules
   * - ใช้บนหน้า UI ที่มีปุ่ม refresh/หลังจาก assign permission สำเร็จ
   */
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get("/api/auth/me");
      const rawMenu: any[] = res.data?.menuWeb ?? [];
      const currentUser = res.data?.user ?? null;

      if (!currentUser || !Array.isArray(rawMenu)) {
        rulesRef.current = [];
        return [];
      }

      const permMap = makePermissionMap(currentUser);

      // rebuild rules
      rulesRef.current = buildAccessRules(rawMenu, permMap);
      return rawMenu;
    },
    onSuccess: (filtered) => {
      queryClient.setQueryData(qk.menus.all, filtered);
      console.log("♻️ Menu cache updated (with permission filter).");
    },
  });

  const refreshMenu = async () => {
    try {
      await (refreshMutation as any).mutateAsync();
    } catch (err) {
      console.error("🚫 Failed to refresh menu:", err);
    }
  };

  /**
   * 🔒 Core: บังคับบล็อกหน้า (shouldBlock) ด้วย allow-prefix rules
   * วิธีทำงาน:
   * 1) normalize pathname
   * 2) เลือก rule ที่ base เป็น longest prefix ของ path ปัจจุบัน
   *    - ไม่มี rule → บล็อก
   * 3) ถ้า rule.isHeadAdvance → allow ทั้ง subtree
   * 4) หา action suffix จาก tail หลัง base:
   *    - ถ้าเจอ action และถูกประกาศใน managers (ถ้าประกาศ) หรือเป็น action มาตรฐาน → ตรวจ perm ตาม ACTION_PERM_MAP
   *    - ถ้าไม่เจอ action → ใช้ canViews
   */
  useEffect(() => {
    if (userLoading) return; // รอ user โหลดก่อน เพื่อป้องกัน race condition ที่จะ redirect superadmin ไป 404 ผิดๆ
    if (isFullAccessUser(user)) return;
    if (!pathname || rulesRef.current.length === 0) return;

    const path = norm(pathname);
    if (!path) return;

    // เลือกกฎที่ base แมตช์แบบ longest prefix
    const rule = rulesRef.current.find(
      (r) => path === r.base || path.startsWith(r.base + "/")
    );

    // ไม่เจอ base ที่อนุญาต → บล็อก
    if (!rule) {
      // สร้างตัวเช็คเมนูสาธารณะ และเมนู dev
      const isPublic = menuPublic.some((m: MenuWebDB) => m.link === path);

      // เช็ค menuDev แบบ exact match และ suffix match (เพราะ menuDev อาจเป็น child ที่มี parentId)
      const isDev = menuDev.some((m: MenuWebDB) => {
        if (!m.link) return false;
        // exact match
        if (m.link === path) return true;
        // suffix match: /setting/menuweb ตรงกับ /menuweb
        if (path.endsWith(m.link) && m.parentId) return true;
        return false;
      });

      if (isPublic || isDev) {
        return;
      }
      if (pathname !== "/404") {
        router.replace("/404");
      }
      return;
    }

    // ถ้าเป็น head+advance → allow ทั้ง subtree
    if (rule.isHeadAdvance) return;

    // หา tail หลัง base เพื่อตรวจ action suffix
    const tail = path.slice(rule.base.length);      // eg: "/123/edit" หรือ "" หรือ "/create"
    const segs = tail.split("/").filter(Boolean);   // eg: ["123","edit"] | ["create"] | []

    // candidate actions:
    // - ถ้าเมนูนี้ระบุ managers → ใช้ชุดนั้นเป็นตัวตั้ง
    // - ไม่งั้น → ใช้ action มาตรฐานใน ACTION_PERM_MAP
    const candidateActions = rule.managers.length > 0
      ? rule.managers
      : Object.keys(ACTION_PERM_MAP);

    // สร้างรายการ suffix ที่เป็น "/xxx" ทั้งหมด
    const managerSuffixes = candidateActions.map((m) =>
      m.startsWith("/") ? m : `/${m}`
    );

    // พยายาม match action โดยไล่ดู suffix จากท้ายสุดไปต้น
    // ตัวอย่าง path: "/admin/users/123/edit" → จะตรวจ "/edit" ก่อน
    let requiredPermKey: keyof PermRec | null = null;
    for (let i = segs.length; i >= 1; i--) {
      const suffix = "/" + segs.slice(i - 1).join("/"); // "/edit" หรือ "/123/edit" (เฉพาะกรณีมีการกำหนด manager เฉพาะ)
      // ปกติเราจะ match เฉพาะ "/create|/update|/delete|/edit|/view"
      const hit = managerSuffixes.find((m) => m === suffix || (m.split("/").length === 2 && m === `/${segs[i - 1]}`));
      if (hit) {
        requiredPermKey = ACTION_PERM_MAP[hit] || "canViews";
        break;
      }
    }

    // ถ้าไม่มี action → ใช้ canViews (เช่น list/detail ที่ไม่ได้ลงท้ายด้วย /create ฯลฯ)
    if (!requiredPermKey) {
      requiredPermKey = "canViews";
    }

    // ตรวจสิทธิ์
    const hasPerm = Boolean((rule.perm as any)[requiredPermKey]);
    if (!hasPerm) {
      if (pathname !== "/404") {
        console.log(
          "[RBAC] Missing permission",
          requiredPermKey,
          "for",
          pathname,
          "under base",
          rule.base
        );
        router.replace("/404");
      }
    }
  }, [pathname, menuWebData, router, user, userLoading]);

  // แปลงข้อมูล query เป็น menuWeb
  const menuWeb = useMemo(
    () => (Array.isArray(menuWebData) ? menuWebData : []),
    [menuWebData]
  );

  return {
    menuWeb,
    menuLoading: Boolean(menuLoading),
    error: errorMsg ? String(errorMsg) : null,
    refreshMenu,
  };
}
