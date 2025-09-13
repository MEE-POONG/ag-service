import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { qk } from '@/lib/queryKeys';
import { 
  MenuWebData, 
  getClientMenuWebData, 
  setClientMenuWebCookie 
} from '@/lib/cookieUtils';

export interface UseMenuWebReturn {
  menuData: MenuWebData[] | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  findMenuByPath: (path: string) => MenuWebData | null;
  getPageConfigFromPath: (path: string) => {
    title: string;
    description?: string;
    icon?: string;
    gradient?: boolean;
  };
}

/**
 * Hook สำหรับจัดการข้อมูล MenuWeb
 * - ดึงข้อมูลจาก API และเก็บไว้ใน cookie
 * - ใช้ข้อมูลจาก cookie เป็น fallback เมื่อ API ล่าช้า
 * - มี helper functions สำหรับค้นหาเมนูและสร้าง page config
 */
export function useMenuWeb(): UseMenuWebReturn {
  const [menuData, setMenuData] = useState<MenuWebData[] | null>(null);

  // ดึงข้อมูลจาก API
  const { 
    data: apiMenuData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: qk.menus.showOrder,
    queryFn: async (): Promise<MenuWebData[]> => {
      const res = await axios.get('/api/menu-web/showorder');
      return res?.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 นาที
    refetchOnWindowFocus: false,
    retry: 3,
  });

  // ฟังก์ชันค้นหาเมนูตาม path
  const findMenuByPath = useCallback((path: string): MenuWebData | null => {
    if (!menuData) return null;

    const searchInMenus = (menus: MenuWebData[]): MenuWebData | null => {
      for (const menu of menus) {
        // ตรวจสอบ path ตรงกัน
        if (menu.link === path) {
          return menu;
        }

        // ตรวจสอบ children
        if (menu.children && menu.children.length > 0) {
          const found = searchInMenus(menu.children);
          if (found) return found;
        }

        // ตรวจสอบ partial match (สำหรับ dynamic routes)
        if (path.startsWith(menu.link) && menu.link !== '/') {
          return menu;
        }
      }
      return null;
    };

    return searchInMenus(menuData);
  }, [menuData]);

  // ฟังก์ชันสร้าง page config จาก path
  const getPageConfigFromPath = useCallback((path: string) => {
    const menu = findMenuByPath(path);
    
    if (menu) {
      return {
        title: menu.name,
        description: menu.description,
        icon: menu.icon,
        gradient: false, // สามารถปรับแต่งได้ตามต้องการ
      };
    }

    // Fallback สำหรับ dynamic routes หรือ path ที่ไม่พบ
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length >= 2) {
      const basePath = '/' + segments.slice(0, -1).join('/');
      const baseMenu = findMenuByPath(basePath);
      
      if (baseMenu) {
        const lastSegment = segments[segments.length - 1];
        
        // กำหนด title สำหรับ action ต่างๆ
        const actionTitles: Record<string, string> = {
          'add': `เพิ่ม${baseMenu.name}`,
          'edit': `แก้ไข${baseMenu.name}`,
          'view': `ดู${baseMenu.name}`,
          'delete': `ลบ${baseMenu.name}`,
        };
        
        const actionIcons: Record<string, string> = {
          'add': 'FaPlus',
          'edit': 'FaEdit',
          'view': 'FaEye',
          'delete': 'FaTrash',
        };
        
        return {
          title: actionTitles[lastSegment] || `${baseMenu.name} - ${lastSegment}`,
          description: baseMenu.description,
          icon: actionIcons[lastSegment] || baseMenu.icon,
          gradient: false,
        };
      }
    }

    // Fallback สำหรับ path หลัก
    if (segments[0]) {
      const firstSegmentMenu = findMenuByPath('/' + segments[0]);
      if (firstSegmentMenu) {
        return {
          title: firstSegmentMenu.name,
          description: firstSegmentMenu.description,
          icon: firstSegmentMenu.icon,
          gradient: false,
        };
      }
    }

    // Default fallback
    return {
      title: 'ระบบจัดการ',
      description: 'ระบบจัดการทั่วไป',
      icon: 'FaHome',
      gradient: false,
    };
  }, [findMenuByPath]);

  // Load data from cookie on mount
  useEffect(() => {
    const cachedData = getClientMenuWebData();
    if (cachedData && cachedData.length > 0) {
      setMenuData(cachedData);
    }
  }, []);

  // Update state and cookie when API data changes
  useEffect(() => {
    if (apiMenuData && Array.isArray(apiMenuData)) {
      setMenuData(apiMenuData);
      
      // บันทึกลง cookie
      try {
        setClientMenuWebCookie(apiMenuData);
        console.log('✅ MenuWeb data saved to cookie');
      } catch (error) {
        console.error('❌ Failed to save MenuWeb data to cookie:', error);
      }
    }
  }, [apiMenuData]);

  return {
    menuData,
    isLoading,
    isError,
    error,
    refetch,
    findMenuByPath,
    getPageConfigFromPath,
  };
}