'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';
import {
  Calendar,
  BookOpen,
  Building2,
  Settings,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['PROFESOR', 'ADMIN'],
  },
  {
    label: 'Mis Reservas',
    href: '/dashboard/reservas',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['PROFESOR', 'ADMIN'],
  },
  {
    label: 'Sedes',
    href: '/dashboard/sedes',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['PROFESSOR', 'ADMIN'],
  },
  {
    label: 'Administración',
    href: '/dashboard/admin',
    icon: <Settings className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const userRole = session?.user?.role || 'PROFESOR';
  const isAdmin = userRole === 'ADMIN';

  // Filtrar items según rol
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(userRole));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out',
        'lg:static lg:translate-x-0',
        !isOpen && '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-blue-600">
          <BookOpen className="w-6 h-6" />
          <span>ClassSport</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-slate-100 rounded"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navegación */}
      <nav className="space-y-2 p-6">
        {visibleItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.children && (
                <ChevronRight
                  className={cn(
                    'w-4 h-4 transition-transform',
                    openSections.includes(item.label) && 'rotate-90'
                  )}
                />
              )}
            </Link>

            {/* Subitems (si existen) */}
            {item.children && openSections.includes(item.label) && (
              <div className="ml-2 space-y-1 border-l-2 border-slate-200 pl-2">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      'block rounded px-3 py-2 text-xs font-medium transition-colors',
                      isActive(child.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-600">
          Rol: <span className="font-semibold">{isAdmin ? 'Administrador' : 'Profesor'}</span>
        </p>
      </div>
    </aside>
  );
}
