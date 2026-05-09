'use client';

import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', ...props }, ref) => (
    <table
      ref={ref}
      className={`w-full border-collapse text-sm ${className}`}
      {...props}
    />
  )
);

Table.displayName = 'Table';

export const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <thead
      ref={ref}
      className={`border-b border-slate-200 bg-slate-50 ${className}`}
      {...props}
    />
  )
);

TableHead.displayName = 'TableHead';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <tbody ref={ref} className={className} {...props} />
  )
);

TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b border-slate-200 hover:bg-slate-50 ${className}`}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

export const TableHeader = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => (
    <th
      ref={ref}
      className={`px-6 py-3 text-left font-semibold text-slate-900 ${className}`}
      {...props}
    />
  )
);

TableHeader.displayName = 'TableHeader';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => (
    <td ref={ref} className={`px-6 py-3 ${className}`} {...props} />
  )
);

TableCell.displayName = 'TableCell';
