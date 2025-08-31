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
        <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
                {!collapsed && (
                    <div className="ml-3 flex-1">
                        <div className="text-sm font-semibold text-gray-800">
                            {user.name || user.username || 'ผู้ใช้งาน'}
                        </div>
                        {user.email && (
                            <div className="text-xs text-gray-500 truncate">
                                {user.email}
                            </div>
                        )}
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={logout}
                        className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                        title="ออกจากระบบ"
                    >
                        <ReactIconComponent icon="FaSignOutAlt" setClass="h-4 w-4 text-red-500" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
