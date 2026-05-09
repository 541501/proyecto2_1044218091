'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

interface DashboardData {
  mode: 'seed' | 'live';
  todayReservations?: any[];
  upcomingReservations?: any[];
  blockStats?: Array<{
    blockId: string;
    blockName: string;
    activeReservations: number;
    totalSlots: number;
  }>;
  message?: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userRole, setUserRole] = useState<string>('profesor');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUserRole(meData.role);

        // Get system mode
        const modeRes = await fetch('/api/system/mode');
        if (modeRes.ok) {
          const modeData = await modeRes.json();
          setIsSeeding(modeData.mode === 'seed');
        }

        // Get dashboard data
        const dashRes = await fetch('/api/dashboard');
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setDashboardData(dashData);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
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
            <p className="text-slate-600">Cargando dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Profesor dashboard
  if (userRole === 'profesor') {
    return (
      <AppLayout userRole={userRole} isSeeding={isSeeding}>
        <div className="mb-8">
          <h1 className="section-title">Mi Panel</h1>
          <p className="mt-2 text-slate-600">Bienvenido de vuelta</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Reservations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reservas de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              {(!dashboardData?.todayReservations || dashboardData.todayReservations.length === 0) ? (
                <EmptyState
                  icon="📭"
                  title="Sin reservas hoy"
                  description="No tienes reservas programadas para hoy"
                  action={{
                    label: 'Hacer una reserva',
                    onClick: () => router.push('/blocks'),
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {dashboardData.todayReservations.map((res: any) => (
                    <div key={res.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{res.roomCode}</p>
                      <p className="text-sm text-slate-600">{res.slotName}</p>
                      <Badge variant="success" className="mt-2">
                        Confirmada
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Reservations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Reservas (7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              {(!dashboardData?.upcomingReservations || dashboardData.upcomingReservations.length === 0) ? (
                <EmptyState
                  icon="🗓️"
                  title="Sin reservas próximas"
                  description="No tienes reservas en los próximos 7 días"
                  action={{
                    label: 'Explorar bloques',
                    onClick: () => router.push('/blocks'),
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {dashboardData.upcomingReservations.map((res: any) => (
                    <div key={res.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{res.roomCode}</p>
                      <p className="text-sm text-slate-600">{res.reservationDate}</p>
                      <Badge variant="primary" className="mt-2">
                        {res.slotName}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Coordinator/Admin dashboard
  return (
    <AppLayout userRole={userRole} isSeeding={isSeeding}>
      <div className="mb-8">
        <h1 className="section-title">Panel de Control</h1>
        <p className="mt-2 text-slate-600">Estado de ocupación de salones hoy</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {dashboardData?.blockStats?.map((block) => (
          <Card key={block.blockId} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{block.blockName}</CardTitle>
                <Badge variant="primary">{block.blockId}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Franjas ocupadas</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {block.activeReservations}
                    </span>
                    <span className="text-slate-500">/ {block.totalSlots}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(block.activeReservations / block.totalSlots) * 100}%`,
                    }}
                  ></div>
                </div>
                <button
                  onClick={() => router.push(`/blocks/${block.blockId}`)}
                  className="w-full rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  Ver detalles →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
