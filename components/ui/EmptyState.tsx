'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-6 py-12">
      {icon && <div className="mb-4 text-4xl text-slate-400">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mb-6 text-center text-slate-600">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
