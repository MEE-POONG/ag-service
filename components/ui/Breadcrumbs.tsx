
import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import ReactIconComponent from '../ReactIconComponent';

interface BreadcrumbItem {
    name: string;
    href?: string;
    icon?: string;
}

interface BreadcrumbsProps {
    breadcrumbs?: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs, }) => {
    return (
        <>
            {/* Breadcrumb */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex mb-2" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        {breadcrumbs.map((item, index) => (
                            <li key={item.name} className="inline-flex items-center">
                                {index > 0 && (
                                    <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1" />
                                )}
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
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
                                    <span className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-500">
                                        {item.icon && (
                                            <ReactIconComponent
                                                icon={item.icon}
                                                setClass="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                                            />
                                        )}
                                        {item.name}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}
        </>
    );
};

// Display name for debugging
Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs; 
