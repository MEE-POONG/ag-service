import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

interface TooltipAlertMessageProps {
  content: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  show: boolean;
  onClose?: () => void;
  classValue?: string; // ใส่เฉพาะ container หลัก
  position?: 'top' | 'bottom' | 'left' | 'right';
  autoClose?: boolean;
  duration?: number;
}

const typeStyle = {
  success: {
    bg: 'bg-green-600',
    text: 'text-white',
    border: 'border-green-700',
  },
  error: {
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-700',
  },
  warning: {
    bg: 'bg-yellow-400',
    text: 'text-black',
    border: 'border-yellow-600',
  },
  info: {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-700',
  },
};

const positionStyle = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
};

const TooltipAlertMessage: React.FC<TooltipAlertMessageProps> = ({
  content,
  children,
  type = 'info',
  show,
  onClose,
  classValue = '',
  position = 'bottom',
  autoClose = true,
  duration = 3000,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show && onClose && autoClose) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [show, onClose, autoClose, duration]);

  // Pause auto-close when mouse is over tooltip
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const handleMouseLeave = () => {
    if (show && onClose && autoClose) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${classValue}`}>
      <div>{children}</div>
      {show && (
        <div
          className={`absolute z-50 px-3 py-2 rounded shadow-lg text-sm flex items-center gap-2
            ${typeStyle[type].bg} ${typeStyle[type].text} border ${typeStyle[type].border}
            ${positionStyle[position]} min-w-max opacity-100 transition-all animate-fade-in`}
          role="tooltip"
          aria-live="polite"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span>{content}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1 rounded hover:bg-white/20 focus:outline-none"
              aria-label="Close tooltip"
              tabIndex={0}
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      )}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95);}
          to { opacity: 1; transform: scale(1);}
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease;
        }
      `}</style>
    </div>
  );
};

export default TooltipAlertMessage; 
