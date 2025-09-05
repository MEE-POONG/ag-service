'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import ReactIconComponent from './ReactIconComponent'

import { MenuWebDB } from '@prisma/client'
import { MenuWebDBWithChildren } from '@/data'
import Link from 'next/link'

interface EnhancedMenuProps {
    dataList?: MenuWebDB[]; // รับ flat array ธรรมดา
    collapsed?: boolean;
}

export default function MenuPage({ dataList, collapsed, }: EnhancedMenuProps) {
    const router = useRouter();
    const [hierarchicalMenus, setHierarchicalMenus] = useState<MenuWebDBWithChildren[]>([]);
    const [openGroups, setOpenGroups] = useState<string[]>([]);

    const currentPath = useCallback(() => {
        const path = router.asPath.split("?")[0];
        const segments = path.split("/").filter(Boolean);

        // ถ้าไม่มี segments หรือเป็น root, return "/"
        if (segments.length === 0) return "/";

        // สำหรับ dynamic routes เช่น /admin/edit/[id], /admin/view/[id]
        // ตรวจสอบ segment สุดท้ายว่าเป็น ObjectId หรือไม่
        const last = segments[segments.length - 1];
        const isProbablyId = /^[a-f\d]{24}$/i.test(last);

        if (isProbablyId && segments.length >= 2) {
            // ถ้าเป็น ID และมี segments มากกว่า 1, ตัด ID ออก
            return `/${segments.slice(0, -1).join("/")}`;
        }

        return `/${segments.join("/")}`;
    }, [router.asPath]);

    const isActive = useCallback((itemLink: string, item?: MenuWebDBWithChildren) => {
        const path = currentPath();

        // Exact match กับ link หลัก
        if (path === itemLink) return true;

        // ตรวจสอบ manager array ถ้ามี
        if (item?.manager && Array.isArray(item.manager)) {
            // เช็คว่า path ปัจจุบันตรงกับ manager routes หรือไม่
            return item.manager.some(managerRoute => {
                const fullManagerPath = `${itemLink}${managerRoute}`;
                return path === fullManagerPath;
            });
        }

        return false;
    }, [currentPath]);

    const isParentActive = useCallback((item: MenuWebDBWithChildren) => {
        // เช็คว่าตัวเองหรือลูกๆ active หรือไม่
        if (isActive(item.link, item)) return true;

        // เช็คลูกๆ
        return item.children?.some(sub => isActive(item.link + sub.link, sub)) || false;
    }, [isActive]);

    useEffect(() => {
        // แปลงข้อมูลจาก flat array เป็น hierarchical structure
        const convertToHierarchy = (menus: MenuWebDB[]): MenuWebDBWithChildren[] => {
            const menuMap = new Map<string, MenuWebDBWithChildren>();
            const rootMenus: MenuWebDBWithChildren[] = [];

            // สร้าง map ของเมนูพร้อม children array
            menus.forEach(menu => {
                menuMap.set(menu.id, {
                    ...menu,
                    children: []
                });
            });

            // สร้าง hierarchy โดยใส่ children เข้าไปใน parent
            menus.forEach(menu => {
                const menuWithChildren = menuMap.get(menu.id);

                if (menuWithChildren) {
                    if (menu.parentId && menu.parentId.trim() !== '') {
                        // มี parent - เพิ่มเข้าไปใน children ของ parent
                        const parent = menuMap.get(menu.parentId);
                        if (parent && parent.children) {
                            parent.children.push(menuWithChildren);
                        } else {
                            // ถ้าหา parent ไม่เจอ ให้เป็น root menu
                            rootMenus.push(menuWithChildren);
                        }
                    } else {
                        // ไม่มี parent - เป็น root menu
                        rootMenus.push(menuWithChildren);
                    }
                }
            });

            // เรียงลำดับตาม showOrder
            const sortByShowOrder = (items: MenuWebDBWithChildren[]) => {
                items.sort((a, b) => (a.showOrder || 0) - (b.showOrder || 0));
                items.forEach(item => {
                    if (item.children && item.children.length > 0) {
                        sortByShowOrder(item.children);
                    }
                });
            };

            sortByShowOrder(rootMenus);
            return rootMenus;
        };



        // รวมเมนูจาก database และเมนู dev
        const combineMenus = () => {
            let finalMenus: MenuWebDBWithChildren[] = [];

            // 1. แปลงเมนูจาก database
            if (dataList && dataList.length > 0) {
                finalMenus = convertToHierarchy(dataList);
            }

            // 2. เช็คและรวม dataList ถ้ามี
            if (finalMenus && finalMenus.length > 0) {
                finalMenus = [...finalMenus];
                // เรียงใหม่ตาม showOrder
                finalMenus.sort((a, b) => (a.showOrder || 999) - (b.showOrder || 999));
            }

            return finalMenus;
        };

        const combinedMenus = combineMenus();
        setHierarchicalMenus(combinedMenus);
    }, [dataList])

    useEffect(() => {
        if (!hierarchicalMenus) return;

        // เปิด group ที่มีลูก active
        const autoOpen = hierarchicalMenus
            .filter((item) => isParentActive(item))
            .map((item) => item.name);

        setOpenGroups(autoOpen);
    }, [hierarchicalMenus, isParentActive]);

    const toggleGroup = (itemTitle: string) => {
        setOpenGroups(prev =>
            prev.includes(itemTitle)
                ? prev.filter(g => g !== itemTitle)
                : [...prev, itemTitle]
        );
    };

    // Component สำหรับแสดงข้อมูลผู้ใช้ที่ login


    const MenuItem = ({ item }: { item: MenuWebDBWithChildren }) => {
        const hasSubItems = item.children && item.children.length > 0;
        const isOpen = openGroups.includes(item.name);
        const parentActive = isParentActive(item);

        if (!hasSubItems) {
            return (
                <li className="mb-2">
                    <Link
                        href={item.link}
                        className={`flex items-center rounded-md ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0 py-0' : 'w-full p-2'} transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg bg-gradient-to-r ${isActive(item.link, item)
                            ? "scale-105 from-[#A78BFA] to-[#34D399] text-white shadow-lg"
                            : "from-[#F3E8FF] to-[#ECFDF5] hover:from-[#EDE4FF] hover:to-[#E6FBF3] text-gray-700 shadow-md"
                            }`}
                    >
                        <ReactIconComponent icon={item.icon} setClass="h-4 w-4 flex-shrink-0 transition-transform duration-300 hover:rotate-12" />
                        {!collapsed && <span className="ml-3 transition-all duration-300 font-bold">{item.name}</span>}
                    </Link>
                </li>
            );
        }

        return (
            <li className="mb-2">
                <button
                    onClick={() => toggleGroup(item.name)}
                    className={`flex items-center rounded-md ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0 py-0' : 'w-full p-2'} transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg bg-gradient-to-r ${parentActive
                        ? "scale-105 from-[#A78BFA] to-[#34D399] text-white shadow-lg"
                        : " from-[#F3E8FF] to-[#ECFDF5] hover:from-[#EDE4FF] hover:to-[#E6FBF3] text-gray-700 shadow-md hover:bg-gradient-to-r"
                        }`}
                >
                    <ReactIconComponent icon={item.icon} setClass="h-4 w-4 flex-shrink-0 transition-transform duration-300 hover:rotate-12" />
                    {!collapsed && (
                        <>
                            <span className="ml-3 flex-1 text-left transition-all duration-300 font-bold">{item.name}</span>
                            <div className="transition-transform duration-300 ease-in-out">
                                {isOpen ? (
                                    <ReactIconComponent icon="FaChevronDown" setClass="h-4 w-4 transform rotate-0 transition-transform duration-300" />
                                ) : (
                                    <ReactIconComponent icon="FaChevronUp" setClass="h-4 w-4 transform rotate-0 transition-transform duration-300" />
                                )}
                            </div>
                        </>
                    )}
                </button>
                {!collapsed && (
                    <div className={`ml-4 mt-1 space-y-1  transition-all duration-300 ease-in-out transform ${isOpen ? 'opacity-100 scale-100 max-h-96' : 'opacity-0 scale-95 max-h-0 overflow-hidden'}`}>
                        <ul className="space-y-1">
                            {item.children?.map((subItem, index) => (
                                <li key={subItem.link} className={`transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`} style={{ transitionDelay: `${index * 50}ms` }}>
                                    <Link
                                        href={item.link + subItem.link}
                                        className={`flex items-center w-full p-2 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md bg-gradient-to-r ${isActive(item.link + subItem.link, subItem)
                                            ? "scale-105 from-[#A78BFA] to-[#34D399] text-white"
                                            : "from-[#F3E8FF] to-[#ECFDF5] hover:from-[#EDE4FF] hover:to-[#E6FBF3] text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        {subItem.icon && <ReactIconComponent icon={subItem.icon} setClass="h-3 w-3 flex-shrink-0 transition-transform duration-300 hover:rotate-12 font-bold" />}
                                        <span className={`transition-all duration-300 font-bold ${subItem.icon ? "ml-2" : ""}`}>
                                            {subItem.name}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </li>
        );
    };

    return (
        <>
            {hierarchicalMenus.map((item) => (
                <div key={item.id} className="">
                    <MenuItem key={item.name} item={item} />
                </div>
            ))}
        </>
    );
}
