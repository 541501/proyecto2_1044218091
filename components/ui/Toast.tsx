'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ⓘ',
  }[type];

  return (
    <div
      className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${bgColor}`}
    >
      <span className="text-lg font-bold">{icon}</span>
      <p className="flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="hover:opacity-70"
        aria-label="Close"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
