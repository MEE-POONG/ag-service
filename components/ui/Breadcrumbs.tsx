/**
 * Breadcrumbs Component
 * 
 * A comprehensive breadcrumb navigation component that supports:
 * - Multiple separator styles (chevron, slash, dot)
 * - Optional home link
 * - Icon support for each breadcrumb item
 * - Accessibility features
 * - Current page highlighting
 * - Responsive design
 * 
 * @example
 * ```tsx
 * const breadcrumbs = [
 *   { name: 'แดชบอร์ด', href: '/dashboard', icon: 'FaHome' },
 *   { name: 'จัดการระบบ', href: '/admin', icon: 'FaCogs' },
 *   { name: 'ผู้ใช้งาน', current: true }
 * ];
 * 
 * <Breadcrumbs 
 *   breadcrumbs={breadcrumbs}
 *   separator="chevron"
 *   showHome={true}
 * />
 * ```
 */
import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import ReactIconComponent from '../ReactIconComponent';

/**
 * Individual breadcrumb item configuration
 */
export interface BreadcrumbItem {
    /** Display name for the breadcrumb item */
    name: string;
    /** Optional URL/path to navigate to. If not provided, item will be rendered as text only */
    href?: string;
    /** Optional icon name to display before the text (uses ReactIconComponent) */
    icon?: string;
    /** Whether this item represents the current page (will be highlighted) */
    current?: boolean;
}

/**
 * Props for the Breadcrumbs component
 */
export interface BreadcrumbsProps {
    /** Array of breadcrumb items to display */
    breadcrumbs?: BreadcrumbItem[];
    /** Style of separator between breadcrumb items */
    separator?: 'chevron' | 'slash' | 'dot';
    /** Whether to automatically prepend a home link */
    showHome?: boolean;
    /** URL for the home link (only used when showHome is true) */
    homeHref?: string;
    /** Additional CSS classes to apply to the breadcrumb container */
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    breadcrumbs,
    separator = 'chevron',
    showHome = false,
    homeHref = '/',
    className = '',
}) => {
    const renderSeparator = () => {
        switch (separator) {
            case 'slash':
                return <span className="mx-2 text-gray-400">/</span>;
            case 'dot':
                return <span className="mx-2 text-gray-400">•</span>;
            default:
                return <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1" />;
        }
    };

    const allBreadcrumbs = showHome 
        ? [{ name: 'หน้าแรก', href: homeHref, icon: 'FaHome' }, ...(breadcrumbs || [])]
        : breadcrumbs || [];

    if (allBreadcrumbs.length === 0) {
        return null;
    }

    return (
        <nav className={`flex mb-4 ${className}`} aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {allBreadcrumbs.map((item, index) => {
                    const isLast = index === allBreadcrumbs.length - 1;
                    const isCurrent = item.current || isLast;
                    
                    return (
                        <li key={`${item.name}-${index}`} className="inline-flex items-center">
                            {index > 0 && renderSeparator()}
                            {item.href && !isCurrent ? (
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200 rounded px-1 py-1 hover:bg-gray-50"
                                    aria-current={isCurrent ? 'page' : undefined}
                                >
                                    {item.icon && (
                                        <ReactIconComponent
                                            icon={item.icon}
                                            setClass="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                                        />
                                    )}
                                    {item.name}
                                </Link>
                            ) : (
                                <span 
                                    className={`inline-flex items-center text-xs sm:text-sm font-medium ${
                                        isCurrent 
                                            ? 'text-primary-600 font-semibold' 
                                            : 'text-gray-500'
                                    }`}
                                    aria-current={isCurrent ? 'page' : undefined}
                                >
                                    {item.icon && (
                                        <ReactIconComponent
                                            icon={item.icon}
                                            setClass={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                                                isCurrent ? 'text-primary-600' : ''
                                            }`}
                                        />
                                    )}
                                    {item.name}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

// Display name for debugging
Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs; 
