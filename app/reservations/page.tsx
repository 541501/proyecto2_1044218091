'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import type { ReservationWithDetails } from '@/lib/types';

const ReservationsPage: React.FC = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmada' | 'cancelada'>('confirmada');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUserRole(meData.role);
        setUserId(meData.id);

        // Check system mode
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

  // Fetch reservations when filters or refresh trigger change
  useEffect(() => {
    if (!userRole) return;

    const fetchReservations = async () => {
      try {
        const endpoint = userRole === 'profesor' ? '/api/reservations/my' : '/api/reservations';
        const params = new URLSearchParams();
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const res = await fetch(`${endpoint}?${params.toString()}`);
        if (!res.ok) {
          console.error('Error fetching reservations:', res.statusText);
          return;
        }

        const data = await res.json();
        setReservations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchReservations();
  }, [userRole, statusFilter, refreshTrigger]);

  if (isLoading) {
    return (
      <AppLayout userRole={userRole} isSeeding={isSeeding}>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={userRole} isSeeding={isSeeding}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userRole === 'profesor' ? 'Mis Reservas' : 'Reservas'}
            </h1>
            <p className="text-gray-600">
              {userRole === 'profesor'
                ? 'Visualiza y gestiona tus reservas de salones'
                : 'Visualiza todas las reservas del sistema'}
            </p>
          </div>

          {userRole === 'profesor' && (
            <Button onClick={() => router.push('/blocks')}>
              + Nueva Reserva
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStatusFilter('confirmada')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'confirmada'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmadas
              </button>
              <button
                onClick={() => setStatusFilter('cancelada')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'cancelada'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Canceladas
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
            </div>
          </div>
        </Card>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <EmptyState
            title={
              statusFilter === 'all'
                ? 'No hay reservas'
                : statusFilter === 'confirmada'
                  ? 'No hay reservas confirmadas'
                  : 'No hay reservas canceladas'
            }
            description={
              userRole === 'profesor'
                ? 'Crea tu primera reserva desde el catálogo de salones'
                : 'No hay reservas en el sistema'
            }
            icon="📋"
          />
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                userRole={userRole as any}
                userId={userId}
                onCancelled={() => setRefreshTrigger(t => t + 1)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ReservationsPage;

