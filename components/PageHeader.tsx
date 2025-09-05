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
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  icon?: string;
  gradient?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  gradient = false
}) => {
  return (
    <div className={`bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-6 border border-gray-200 ${
      gradient ? 'bg-gradient-to-r from-primary-50 to-blue-50' : ''
    }`}>
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
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

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-start space-x-3 sm:space-x-4">
          {icon && (
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
              gradient 
                ? 'bg-white shadow-sm border border-primary-200' 
                : 'bg-primary-100'
            }`}>
              <ReactIconComponent
                icon={icon}
                setClass="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
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
