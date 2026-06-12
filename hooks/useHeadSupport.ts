// /hooks/useHeadSupport.ts
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./useAuth";
import type { MenuWebDB } from "@prisma/client";
import { menuDev } from "@/data";

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
    canAdvance: boolean;
    canViews: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    isDeleted: boolean;
  } | null;
  reason?: string;
}

/* ------------------------ helpers ------------------------ */

/** พาธที่อนุญาตเสมอ (ไม่ต้องอยู่ใน menuWeb) */
const PUBLIC_ACCESS = new Set<string>([
  "/profile",
  // เพิ่มได้ตามต้องการ เช่น "/settings", "/wallet" ...
]);

/** เงื่อนไข user ที่เข้าถึง menuDev ได้ */
const isDevUser = (user: any) =>
  user?.username === "superadmin" ||
  user?.username === "admin" ||
  user?.adminPosition?.adminDepartment?.name === "IT Department";

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

/** ดึง pathname + ตัด / ท้าย (ยกเว้น root) */
const normPath = (input: string) => {
  const raw = (input ?? "").split(/[?#]/)[0].trim();
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return normalizeSlash(u.pathname);
    }
  } catch { /* ignore */ }
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

/** แปลง MenuWebDB ให้เป็น head/support output */
const toHeadOut = (mw: Partial<MenuWebDB>, userCanAdvance: boolean) => ({
  id: String(mw.id),
  name: String(mw.name ?? ""),
  link: String(mw.link ?? ""),
  head: true as const,
  userCanAdvance,
});
const toSupportOut = (
  mw: Partial<MenuWebDB>,
  perm: any,
  isDeleted = false
) => ({
  menuId: String(mw.id),
  name: String(mw.name ?? ""),
  canAdvance: !!perm?.canAdvance,
  canViews: !!perm?.canViews,
  canCreate: !!perm?.canCreate,
  canUpdate: !!perm?.canUpdate,
  canDelete: !!perm?.canDelete,
  isDeleted: !!isDeleted,
});

/* ------------------ PURE FUNCTION (no React, no window) ------------------ */
/** ใช้ได้ทั้ง client/SSR: ส่ง user + path เข้ามา คืนข้อมูลพร้อมใช้ */
export function resolveHeadSupport(user: any, pathOrUrl: string): HeadSupportResult {
  const permById = buildPermissionMap(user);
  const adminDefaults: any[] = user?.adminPosition?.AdminDefaultPermissionDB ?? [];

  const path = normPath(pathOrUrl);
  const [, firstSeg = "", secondSeg = ""] = path.split("/"); // ["", "foo", "bar", ...]

  if (isFullAccessUser(user)) {
    return {
      ok: true,
      path,
      head: {
        id: "__full_access__",
        name: "Full Access",
        link: `/${firstSeg}`,
        head: true,
        userCanAdvance: true,
      },
      support: {
        menuId: "__full_access__",
        name: "Full Access",
        canAdvance: true,
        canViews: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        isDeleted: false,
      },
    };
  }

  /** 0) Public allowlist */
  if (PUBLIC_ACCESS.has(path)) {
    return {
      ok: true,
      path,
      head: null,
      support: {
        menuId: "__public__",
        name: "Public Access",
        canAdvance: false,
        canViews: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        isDeleted: false,
      },
    };
  }

  /** 1) มาตรฐาน: หา head จาก adminDefaults (menuWeb) */
  const headRow = adminDefaults.find((row) => {
    const m = row?.menuWebDB;
    if (!m?.head) return false;
    const link = typeof m.link === "string" ? normalizeSlash(m.link) : m.link;
    return link === `/${firstSeg}`;
  });

  if (headRow?.menuWebDB) {
    const headMW = headRow.menuWebDB;
    const headPerm = permById.get(String(headMW.id)) ?? {};
    const headOut = toHeadOut(headMW, !!headPerm.canAdvance);

    // 2) child ใต้ head โดย parentId === head.id + จับคู่ secondSeg
    const childRow = adminDefaults.find((row) => {
      const m = row?.menuWebDB;
      if (!m) return false;
      if (String(m.parentId ?? "") !== String(headMW.id)) return false;
      return linkMatchesSegment(m.link, secondSeg);
    });

    if (!childRow?.menuWebDB) {
      if (!secondSeg) {
        return {
          ok: true,
          path,
          head: headOut,
          support: toSupportOut(headMW, headPerm, !!headRow.isDeleted),
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

    const childMW = childRow.menuWebDB;
    const childPerm = permById.get(String(childMW.id)) ?? {};
    return {
      ok: true,
      path,
      head: headOut,
      support: toSupportOut(childMW, childPerm, !!childRow.isDeleted),
    };
  }

  /** 3) Dev fallback: ลองเช็คใน menuDev ถ้าเป็น dev user */
  if (isDevUser(user)) {
    // หา head ใน menuDev
    const devHead = (menuDev as MenuWebDB[]).find(
      (m) => m.head && normalizeSlash(String(m.link ?? "")) === `/${firstSeg}`
    );

    if (devHead) {
      const headOut = toHeadOut(devHead, true); // dev ให้ advance ได้บน head

      // หา child ใน menuDev ด้วย parentId
      const devChild = (menuDev as MenuWebDB[]).find(
        (m) =>
          String(m.parentId ?? "") === String(devHead.id) &&
          linkMatchesSegment(m.link as string, secondSeg)
      );

      if (!devChild) {
        if (!secondSeg) {
          // ไม่มี child และอยู่ที่ head → ใช้สิทธิ์ head
          return {
            ok: true,
            path,
            head: headOut,
            support: {
              menuId: String(devHead.id),
              name: String(devHead.name ?? ""),
              canAdvance: true,
              canViews: true,
              canCreate: !!devHead.canCreate,
              canUpdate: !!devHead.canUpdate,
              canDelete: !!devHead.canDelete,
              isDeleted: !!devHead.isDeleted,
            },
          };
        }
        return {
          ok: false,
          path,
          head: headOut,
          support: null,
          reason: "DEV: ไม่พบเมนูย่อยที่ link ตรงกับ segment ที่สอง",
        };
      }

      // เจอ child ใน dev
      return {
        ok: true,
        path,
        head: headOut,
        support: {
          menuId: String(devChild.id),
          name: String(devChild.name ?? ""),
          canAdvance: true,
          canViews: true,
          canCreate: !!devChild.canCreate,
          canUpdate: !!devChild.canUpdate,
          canDelete: !!devChild.canDelete,
          isDeleted: !!devChild.isDeleted,
        },
      };
    }
  }

  /** 4) ไม่เจออะไรเลย */
  return {
    ok: false,
    path,
    head: null,
    support: null,
    reason: "ไม่พบเมนูหัวที่ลิงก์ตรงกับ segment แรก (รวมถึง dev fallback)",
  };
}

/* --------------------------- React Hook wrapper --------------------------- */
/** Hook ที่ "คืนข้อมูล" พร้อมใช้ทันที */
export function useHeadSupport(pathOverride?: string): HeadSupportResult {
  const { user } = useAuth();
  const pathname = usePathname();
  const path = pathOverride ?? pathname ?? "/";

  // 🔁 กุญแจผู้ใช้สำหรับ trigger re-compute ให้แน่ใจว่าไม่ต้อง F5
  const userKey = useMemo(() => {
    const base = {
      id: user?.id ?? null,
      username: user?.username ?? null,
      adminPosId: user?.adminPosition?.id ?? null,
      adminDeptName: user?.adminPosition?.adminDepartment?.name ?? null,
    };
    const perms = Array.isArray(user?.permissions)
      ? user.permissions.map((p: any) => ({
        id: String(p?.menuWebDBId ?? ""),
        va: !!p?.canAdvance,
        vv: !!p?.canViews,
        vc: !!p?.canCreate,
        vu: !!p?.canUpdate,
        vd: !!p?.canDelete,
      }))
      : [];
    return JSON.stringify({ base, perms });
  }, [user]);

  // 🔄 ใช้ useMemo เพื่อ cache ผลลัพธ์และ re-compute เมื่อ user หรือ path เปลี่ยน
  return useMemo(() => {
    return resolveHeadSupport(user, path);
  }, [user, path, userKey]);
}
