import React from 'react';
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
  actions,
  icon,
  gradient = false
}) => {
  return (
    <div className={`bg-white shadow-sm rounded-lg px-2 sm:px-3 sm:py-3 mb-6 mt-20 md:mt-0 border border-purple-500 ${gradient ? 'bg-gradient-to-r from-purple-50 to-white' : ''}`}>
      {/* Header Content */}
      <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
        <div className="flex items-center space-x-3 text-purple-500 sm:space-x-4">
          {icon && (
            <div className={`flex-shrink-0 rounded-lg`}>
              <ReactIconComponent
                icon={icon}
                setClass="w-8 h-8"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl sm:mb-2">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-sm text-gray-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-col items-stretch space-y-2 w-full sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 
