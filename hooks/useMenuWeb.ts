// /hooks/useMenuWeb.ts
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation"; // ✅ App Router
import axios from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";

interface UseMenuReturn {
  menuWeb: any[] | null;
  menuLoading: boolean;
  error: string | null;
  refreshMenu: () => Promise<void>;
}

/* ---------------- path helpers ---------------- */
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
const isInternalPath = (p?: string | null) =>
  !!p && !/^https?:\/\//i.test(p) && p.startsWith("/");
const collectAllPaths = (node: any): string[] => {
  const self = getPathFromMenuItem(node);
  const children: any[] = Array.isArray(node?.children) ? node.children : [];
  const childPaths = children.flatMap(collectAllPaths);
  return [...(self ? [self] : []), ...childPaths];
};
const collectAllIds = (node: any): string[] => {
  const self = (node?.id ?? node?._id ?? node?.menuWebDBId) as string | undefined;
  const children: any[] = Array.isArray(node?.children) ? node.children : [];
  const childIds = children.flatMap(collectAllIds);
  return [...(self ? [self] : []), ...childIds];
};

/* ---------------- permission helpers ---------------- */
type PermRec = { canViews?: boolean; canAdvance?: boolean };
const makePermissionMap = (user: any) => {
  const map = new Map<string, PermRec>();
  const list: any[] = Array.isArray(user?.permissions) ? user.permissions : [];
  for (const p of list) {
    const id = p?.menuWebDBId || p?.menuId || p?.id;
    if (!id) continue;
    map.set(String(id), {
      canViews: Boolean(p?.canViews),
      canAdvance: Boolean(p?.canAdvance),
    });
  }
  return map;
};

/* ---------------- core filter: rule per your spec ----------------
   1) แสดงเมนูที่ canViews === true
   2) ถ้า "เมนูแม่" canAdvance && canViews → แสดงลูกทั้งหมดใต้เมนูนั้น (ไม่ต้องเช็คสิทธิ์ลูก)
   3) เก็บ path ที่ไม่มีสิทธิ์ไว้ สำหรับ redirect ไป /404
------------------------------------------------------------------ */
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

    if (isInternalPath(nodePath)) disallowedPaths.add(nodePath!);
    if (keptChildren.length > 0) {
      return keptChildren.length === 1
        ? keptChildren[0]
        : { ...node, children: keptChildren, __noHeader: true };
    }
    return null;
  };

  const filtered = (Array.isArray(menus) ? menus : []).map(dfs).filter(Boolean);

  // เพิ่มเติม: path ทั้ง subtree ที่ไม่ได้อนุญาต → disallowed
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

export function useMenuWeb(): UseMenuReturn {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const disallowedRef = useRef<Set<string>>(new Set());

  const queryResult = useQuery({
    queryKey: qk.menus.all,
    queryFn: async () => {
      const res = await axios.get("/api/auth/me");
      const rawMenu: any[] = res.data?.menuWeb ?? [];
      const currentUser = res.data?.user ?? null;

      if (!currentUser || !Array.isArray(rawMenu)) return [];

      const permMap = makePermissionMap(currentUser);
      const { filtered, disallowed } = filterMenusByPermissions(rawMenu, permMap);
      disallowedRef.current = new Set(disallowed);
      return filtered;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // ✅ รองรับทั้ง v4/v5 ของ react-query
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

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get("/api/auth/me");
      const rawMenu: any[] = res.data?.menuWeb ?? [];
      const currentUser = res.data?.user ?? null;
      if (!currentUser || !Array.isArray(rawMenu)) return [];

      const permMap = makePermissionMap(currentUser);
      const { filtered, disallowed } = filterMenusByPermissions(rawMenu, permMap);
      disallowedRef.current = new Set(disallowed);
      return filtered;
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

  /* 🔒 บังคับ 404 เมื่อผู้ใช้เข้าหน้าที่ยังไม่มีสิทธิ์
     - App Router: ไม่มี router.events → เฝ้าด้วย pathname
     - match แบบ prefix: /users → block /users และ /users/123
  */
  useEffect(() => {
    if (!pathname || disallowedRef.current.size === 0) return;

    const shouldBlock = Array.from(disallowedRef.current).some((p) => {
      if (!isInternalPath(p)) return false;
      return pathname === p || pathname.startsWith(`${p}/`);
    });

    if (shouldBlock && pathname !== "/404") {
      // console.log('205 shouldBlock : ', shouldBlock, ' Ok ');
      // console.log('206 pathname : ', pathname, ' Ok ');
      // console.log('207 disallowedRef.current : ', disallowedRef.current, ' Ok ');
      // console.log('208 Array.from(disallowedRef.current) : ', Array.from(disallowedRef.current), ' Ok ');
      router.replace("/404");
    }
  }, [pathname, menuWebData, router]);

  const menuWeb = useMemo(() => (Array.isArray(menuWebData) ? menuWebData : []), [menuWebData]);

  return {
    menuWeb,
    menuLoading: Boolean(menuLoading),
    error: errorMsg ? String(errorMsg) : null,
    refreshMenu,
  };
}
