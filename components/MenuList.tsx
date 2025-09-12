'use client'

import { useState, useEffect } from 'react'
import ReactIconComponent from './ReactIconComponent'

import { MenuWebDB } from '@prisma/client'
import { MenuWebDBWithChildren } from '@/data'
import Link from 'next/link'

interface EnhancedMenuProps {
    dataList?: MenuWebDB[]; // รับ flat array ธรรมดา
    collapsed?: boolean;
    currentUser?: string; // username ปัจจุบัน
}

export default function MenuList({ dataList, collapsed, currentUser = "" }: EnhancedMenuProps) {
    const [hierarchicalMenus, setHierarchicalMenus] = useState<MenuWebDBWithChildren[]>([]);

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
                items.sort((a, b) => Number(a.showOrder || 0) - Number(b.showOrder || 0));
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
                finalMenus.sort((a, b) => Number(a.showOrder || 999) - Number(b.showOrder || 999));
            }

            return finalMenus;
        };

        const combinedMenus = combineMenus();
        setHierarchicalMenus(combinedMenus);
    }, [dataList, currentUser])


    const [openGroups, setOpenGroups] = useState<string[]>([]);

    const isActive = (path: string) => activeUrl === path;
    const isParentActive = (item: MenuWebDBWithChildren) => {
        if (isActive(item.link)) return true;
        return item.children?.some(sub => isActive(sub.link)) || false;
    };

    const [activeUrl, setActiveUrl] = useState("/");



    const handleNavClick = (url: string) => {
        setActiveUrl(url);
    };


    const toggleGroup = (itemTitle: string) => {
        setOpenGroups(prev =>
            prev.includes(itemTitle)
                ? prev.filter(g => g !== itemTitle)
                : [...prev, itemTitle]
        );
    };

    const MenuItem = ({ item }: { item: MenuWebDBWithChildren }) => {
        const hasSubItems = item.children && item.children.length > 0;
        const isOpen = openGroups.includes(item.name);
        const parentActive = isParentActive(item);

        if (!hasSubItems) {
            return (
                <li className="mb-3">
                    <Link
                        href={item.link}
                        className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 ${isActive(item.link)
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "hover:from-blue-200 hover:to-purple-200 bg-gray-100 text-gray-700 hover:shadow-md"
                            }`}
                    >
                        <ReactIconComponent icon={item.icon} setClass="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="ml-3">{item.name}</span>}
                    </Link>
                </li>
            );
        }

        return (
            <li className="mb-3">
                <button
                    onClick={() => toggleGroup(item.name)}
                    className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r ${parentActive
                        ? " from-blue-500 to-purple-600 text-white shadow-lg"
                        : " hover:from-blue-200 hover:to-purple-200 bg-gray-100 text-gray-700 hover:shadow-md"
                        }`}
                >
                    <ReactIconComponent icon={item.icon} setClass="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="ml-3 flex-1 text-left">{item.name}</span>
                            {isOpen ? (
                                <ReactIconComponent icon="FaChevronDown" setClass="h-4 w-4" />
                            ) : (
                                <ReactIconComponent icon="FaChevronRight" setClass="h-4 w-4" />
                            )}
                        </>
                    )}
                </button>
                {!collapsed && isOpen && (
                    <div className="ml-4 mt-1 space-y-1 bg-gray-100">
                        <ul className="space-y-1">
                            {item.children?.map((subItem) => (
                                <li key={subItem.link}>
                                    <a
                                        href={item.link + subItem.link}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(subItem.link);
                                        }}
                                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 bg-gradient-to-r ${isActive(subItem.link)
                                            ? "from-blue-500 to-purple-600 text-white border-l-2 border-blue-500"
                                            : "hover:from-blue-200 hover:to-purple-200 text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        {subItem.icon && <ReactIconComponent icon={subItem.icon} setClass="h-3 w-3 flex-shrink-0" />}
                                        <span className={`text-sm ${subItem.icon ? "ml-2" : ""}`}>
                                            {subItem.name}
                                        </span>
                                    </a>
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
