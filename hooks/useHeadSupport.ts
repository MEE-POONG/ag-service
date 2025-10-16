// /hooks/useHeadSupport.ts
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./useAuth";

/** ผลลัพธ์ที่ต้องการ */
export interface HeadSupportResult {
  ok: boolean;
  path: string;
  head: {
    id: string;
    name: string;
    link: string;     // เช่น "/bot-ag"
    head: true;       // ยืนยันว่าเป็นหัวข้อหลัก
    userCanAdvance: boolean; // สิทธิ์ advance ของผู้ใช้บน head
  } | null;
  support: {
    menuId: string;
    name: string;
    // สิทธิ์ของ "ผู้ใช้" บนเมนูที่แมตช์ (child)
    canAdvance: boolean;
    canViews: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    isDeleted: boolean;
  } | null;
  reason?: string;    // อธิบายถ้าไม่ ok
}

/* ------------------------ helpers ------------------------ */

/** ดึง pathname + ตัด / ท้าย (ยกเว้น root) */
const normPath = (input: string) => {
  const raw = (input ?? "").split(/[?#]/)[0].trim();
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return normalizeSlash(u.pathname);
    }
  } catch {/* ignore */}
  return normalizeSlash(raw || "/");
};
const normalizeSlash = (p: string) => {
  if (!p.startsWith("/")) p = "/" + p;
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  return p;
};

/** เทียบ link ของลูก: ยอมรับ "", "/foo", "foo" */
const linkMatchesSegment = (link: string | null | undefined, seg: string) => {
  if (link == null) return false;
  if (link === "") return seg === "" || seg === undefined; // container (กรณีไม่มี seg)
  if (link === seg) return true;
  if (link === `/${seg}`) return true;
  return false;
};

/** สร้าง map สิทธิ์ของผู้ใช้: menuWebDBId → row permission */
const buildPermissionMap = (user: any) => {
  const map = new Map<string, any>();
  const list: any[] = Array.isArray(user?.permissions) ? user.permissions : [];
  for (const r of list) {
    if (r?.menuWebDBId) map.set(String(r.menuWebDBId), r);
  }
  return map;
};

/* ------------------ PURE FUNCTION (no React, no window) ------------------ */
/** ใช้ได้ทั้ง client/SSR: ส่ง user + path เข้ามา คืนข้อมูลพร้อมใช้ */
export function resolveHeadSupport(user: any, pathOrUrl: string): HeadSupportResult {
  const permById = buildPermissionMap(user);
  const adminDefaults: any[] = user?.adminPosition?.AdminDefaultPermissionDB ?? [];

  const path = normPath(pathOrUrl);
  const [, firstSeg = "", secondSeg = ""] = path.split("/"); // ["", "bot-ag", "command-dev", ...]

  // 1) หา head: head=true และ link === `/${firstSeg}`
  const headRow = adminDefaults.find((row) => {
    const m = row?.menuWebDB;
    if (!m?.head) return false;
    const link = typeof m.link === "string" ? normalizeSlash(m.link) : m.link;
    return link === `/${firstSeg}`;
  });

  if (!headRow?.menuWebDB) {
    return {
      ok: false,
      path,
      head: null,
      support: null,
      reason: "ไม่พบเมนูหัวที่ลิงก์ตรงกับ segment แรก",
    };
  }

  const headMW = headRow.menuWebDB;
  const headPerm = permById.get(String(headMW.id)) ?? {};
  const headOut = {
    id: String(headMW.id),
    name: String(headMW.name ?? ""),
    link: String(headMW.link ?? ""),
    head: true as const,
    userCanAdvance: !!headPerm.canAdvance, // สิทธิ์ advance ของผู้ใช้บน head
  };

  // 2) หา child ใต้ head โดย parentId === head.id + จับคู่ secondSeg
  const childRow = adminDefaults.find((row) => {
    const m = row?.menuWebDB;
    if (!m) return false;
    if (String(m.parentId ?? "") !== String(headMW.id)) return false;
    return linkMatchesSegment(m.link, secondSeg);
  });

  if (!childRow?.menuWebDB) {
    // ถ้าไม่มี child ที่ตรง secondSeg แต่ path คือแค่ head → support = สิทธิ์ของ head
    if (!secondSeg) {
      return {
        ok: true,
        path,
        head: headOut,
        support: {
          menuId: String(headMW.id),
          name: String(headMW.name ?? ""),
          canAdvance: !!headPerm.canAdvance,
          canViews: !!headPerm.canViews,
          canCreate: !!headPerm.canCreate,
          canUpdate: !!headPerm.canUpdate,
          canDelete: !!headPerm.canDelete,
          isDeleted: !!headRow.isDeleted,
        },
      };
    }
    return {
      ok: false,
      path,
      head: headOut,
      support: null,
      reason: "ไม่พบเมนูย่อยที่ link ตรงกับ segment ที่สอง",
    };
  }

  // 3) support = สิทธิ์ของ "ผู้ใช้" บนเมนู child
  const childMW = childRow.menuWebDB;
  const childPerm = permById.get(String(childMW.id)) ?? {};

  const supportOut = {
    menuId: String(childMW.id),
    name: String(childMW.name ?? ""),
    canAdvance: !!childPerm.canAdvance,
    canViews: !!childPerm.canViews,
    canCreate: !!childPerm.canCreate,
    canUpdate: !!childPerm.canUpdate,
    canDelete: !!childPerm.canDelete,
    isDeleted: !!childRow.isDeleted,
  };

  return {
    ok: true,
    path,
    head: headOut,
    support: supportOut,
  };
}

/* --------------------------- React Hook wrapper --------------------------- */
/** Hook ที่ "คืนข้อมูล" พร้อมใช้ทันที (ไม่ต้องเรียกฟังก์ชันซ้ำ) */
export function useHeadSupport(pathOverride?: string): HeadSupportResult {
  const { user } = useAuth();
  const pathname = usePathname(); // ทำงานกับ App Router

  // ใช้ path จากพารามิเตอร์ก่อน ถ้าไม่ส่งมา ใช้ path ปัจจุบัน
  const path = pathOverride ?? pathname ?? "/";

  return useMemo(
    () => resolveHeadSupport(user, path),
    [user, path]
  );
}
