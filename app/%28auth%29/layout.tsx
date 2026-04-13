'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // Si ya está autenticado, redirecciona a dashboard
  if (status === 'authenticated' && session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
