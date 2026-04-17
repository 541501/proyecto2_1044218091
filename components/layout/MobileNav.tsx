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
    label: 'Reservas',
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
    label: 'Admin',
    href: '/dashboard/admin',
    icon: <Settings className="h-5 w-5" />,
    roles: ['ADMIN'],
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role || 'PROFESOR';
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(userRole));

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white lg:hidden">
      <div className="flex items-center justify-around">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
