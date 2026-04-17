'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';
import {
  Calendar,
  BookOpen,
  Building2,
  Settings,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Calendar className="h-5 w-5" />,
    roles: ['PROFESOR', 'ADMIN'],
  },
  {
    label: 'Mis Reservas',
    href: '/dashboard/reservas',
    icon: <BookOpen className="h-5 w-5" />,
    roles: ['PROFESOR', 'ADMIN'],
  },
  {
    label: 'Sedes',
    href: '/dashboard/sedes',
    icon: <Building2 className="h-5 w-5" />,
    roles: ['PROFESOR', 'ADMIN'],
  },
  {
    label: 'Administracion',
    href: '/dashboard/admin',
    icon: <Settings className="h-5 w-5" />,
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

  const userRole = session?.user?.role || 'PROFESOR';
  const isAdmin = userRole === 'ADMIN';
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(userRole));

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out',
        'lg:static lg:translate-x-0',
        !isOpen && '-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-blue-600">
          <BookOpen className="h-6 w-6" />
          <span>ClassSport</span>
        </Link>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-slate-100 lg:hidden"
          aria-label="Cerrar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-2 p-6">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
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
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-600">
          Rol: <span className="font-semibold">{isAdmin ? 'Administrador' : 'Profesor'}</span>
        </p>
      </div>
    </aside>
  );
}
