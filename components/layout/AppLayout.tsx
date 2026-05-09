'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SeedModeBanner from './SeedModeBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: string;
  isSeeding?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, userRole = 'profesor', isSeeding = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Define navigation based on role
  const getNavigation = () => {
    const commonNav = [
      { label: 'Inicio', href: '/dashboard', icon: '🏠' },
      { label: 'Bloques', href: '/blocks', icon: '🏢' },
    ];

    const profesorNav = [
      ...commonNav,
      { label: 'Mis Reservas', href: '/reservations/my', icon: '📋' },
      { label: 'Perfil', href: '/profile', icon: '👤' },
    ];

    const coordinadorNav = [
      ...commonNav,
      { label: 'Todas las Reservas', href: '/reservations', icon: '📋' },
      { label: 'Reportes', href: '/reports', icon: '📊' },
      { label: 'Perfil', href: '/profile', icon: '👤' },
    ];

    const adminNav = [
      ...commonNav,
      { label: 'Todas las Reservas', href: '/reservations', icon: '📋' },
      { label: 'Reportes', href: '/reports', icon: '📊' },
      { label: 'Administración', href: '/admin/db-setup', icon: '⚙️' },
      { label: 'Perfil', href: '/profile', icon: '👤' },
    ];

    if (userRole === 'admin') return adminNav;
    if (userRole === 'coordinador') return coordinadorNav;
    return profesorNav;
  };

  const navigation = getNavigation();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 md:flex-row">
      {/* Seed Mode Banner - Full width at top on mobile, in sidebar on desktop */}
      {isSeeding && <SeedModeBanner />}

      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <div className="text-2xl font-bold text-blue-600">CS</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">ClassSport</h1>
            <p className="text-xs text-slate-500">Gestión de Salones</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-500">
            Rol: <span className="font-semibold capitalize">{userRole}</span>
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-blue-600">CS</div>
            <span className="text-sm font-semibold text-slate-900">ClassSport</span>
          </div>
          <div className="w-6"></div>
        </header>

        {/* Mobile sidebar (overlay) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <nav className="w-64 bg-white p-6 shadow-lg">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-main py-8">{children}</div>
        </main>

        {/* Mobile bottom navigation */}
        <nav className="flex border-t border-slate-200 bg-white md:hidden">
          {navigation.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
                isActive(item.href)
                  ? 'text-blue-600'
                  : 'text-slate-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
