'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

const BlocksPage: React.FC = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('profesor');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUserRole(meData.role);

        const modeRes = await fetch('/api/system/mode');
        if (modeRes.ok) {
          const modeData = await modeRes.json();
          setIsSeeding(modeData.mode === 'seed');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <AppLayout userRole={userRole} isSeeding={isSeeding}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 h-8 w-8 mb-4"></div>
            <p className="text-slate-600">Cargando bloques...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={userRole} isSeeding={isSeeding}>
      <div className="mb-8">
        <h1 className="section-title">Bloques y Salones</h1>
        <p className="mt-2 text-slate-600">Explora la disponibilidad de salones por bloque</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon="🏢"
            title="Sin bloques disponibles"
            description="Los bloques se cargarán después de completar el bootstrap del sistema."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default BlocksPage;
