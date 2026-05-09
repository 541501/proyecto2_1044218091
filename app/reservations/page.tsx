'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

const ReservationsPage: React.FC = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('coordinador');
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

        // Redirect professors to /reservations/my
        if (meData.role === 'profesor') {
          router.push('/reservations/my');
          return;
        }

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
            <p className="text-slate-600">Cargando reservas...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={userRole} isSeeding={isSeeding}>
      <div className="mb-8">
        <h1 className="section-title">Todas las Reservas</h1>
        <p className="mt-2 text-slate-600">Vista general de todas las reservas del sistema</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon="📋"
            title="Sin reservas"
            description="No hay reservas registradas en el sistema. Las reservas aparecerán aquí cuando los profesores comiencen a hacer reservas."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ReservationsPage;
