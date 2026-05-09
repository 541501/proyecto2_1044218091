'use client';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-900',
  primary: 'bg-blue-100 text-blue-900',
  success: 'bg-green-100 text-green-900',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-900',
  secondary: 'bg-slate-200 text-slate-800',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

export default Badge;
