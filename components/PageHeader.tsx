import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ReactIconComponent from './ReactIconComponent';

interface BreadcrumbItem {
  name: string;
  href?: string;
  icon?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: string;
  gradient?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  icon,
  gradient = false
}) => {
  return (
    <div className={`bg-white shadow-sm rounded-lg px-4 sm:px-6 sm:py-3 mb-6 border border-purple-500 ${gradient ? 'bg-gradient-to-r from-purple-50 to-white' : ''}`}>
      {/* Header Content */}
      <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 text-purple-500">
          {icon && (
            <div className={`rounded-lg flex-shrink-0 `}>
              <ReactIconComponent
                icon={icon}
                setClass="w-8 h-8"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 
