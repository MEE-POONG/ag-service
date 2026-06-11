import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ReactIconComponent from '@/components/ReactIconComponent';

interface UserInfoProps {
    collapsed?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ collapsed = false }) => {
    const { user, userLoading, error, logout } = useAuth();

    if (userLoading) {
        return (
            <div className="px-3 py-2 bg-gray-100 rounded-lg">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                    {!collapsed && (
                        <div className="ml-3">
                            <div className="w-20 h-3 bg-gray-300 rounded animate-pulse mb-1"></div>
                            <div className="w-16 h-2 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (error || !user) {
        return null;
    }

    return (
        <div
            className={`rounded-xl bg-white/80 backdrop-blur ring-1 ring-gray-200 shadow-sm ${collapsed ? 'px-2 py-2' : 'px-3 py-2'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-[#A78BFA] to-[#34D399] rounded-full flex items-center justify-center text-white text-sm font-semibold shadow">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>

                {!collapsed && (
                    <>
                        <div className="flex-1 min-w-0">
                            <div
                                className="text-sm font-semibold text-gray-800 truncate"
                                title={user.name || user.username || 'ผู้ใช้งาน'}
                            >
                                {user.name || user.username || 'ผู้ใช้งาน'}
                            </div>

                            {user.email && (
                                <div
                                    className="text-xs text-gray-500 truncate"
                                    title={user.email}
                                >
                                    {user.email}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={logout}
                            className="flex-shrink-0 ml-2 px-1 py-1 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                            title="ออกจากระบบ"
                        >
                            <ReactIconComponent icon="FaSignOutAlt" setClass="h-4 w-4" />
                            <span className="sr-only">ออกจากระบบ</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
