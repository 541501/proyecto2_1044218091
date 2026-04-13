'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Calendar, BookOpen, Plus, Building2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Reserva {
  id: string;
  salonId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreClase: string;
  salon: {
    nombre: string;
    bloque: {
      nombre: string;
      sede: {
        nombre: string;
      };
    };
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split('T')[0];

  // Fetch las reservas de hoy del usuario actual
  const { data: reservasHoy = [], isLoading } = useQuery({
    queryKey: ['reservas', 'today'],
    queryFn: async () => {
      const response = await fetch('/api/reservas');
      if (!response.ok) throw new Error('Failed to fetch reservas');
      const reservas: Reserva[] = await response.json();

      // Filtrar solo las de hoy
      return reservas.filter(
        (r) => r.fecha === today && r.salon.bloque.sede // Verificar estructura
      );
    },
  });

  // Fetch estadísticas (opcional)
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [sedesRes, reservasRes] = await Promise.all([
        fetch('/api/sedes'),
        fetch('/api/reservas'),
      ]);

      const sedes = await sedesRes.json();
      const reservas = await reservasRes.json();

      return {
        totalSedes: sedes.length,
        totalReservas: reservas.length,
      };
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-8 py-8 px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Bienvenido, {session?.user?.name}
        </h1>
        <p className="mt-2 text-slate-600">
          Hoy es{' '}
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de sedes</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalSedes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de reservas</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalReservas}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Mis reservas de hoy</p>
                <p className="text-3xl font-bold text-slate-900">{reservasHoy.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mis reservas de hoy */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Mis reservas de hoy</h2>
        </div>

        <div className="p-6">
          {reservasHoy.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No tienes reservas para hoy"
              description="Crea una nueva reserva para comenzar"
              actionLabel="Nueva reserva"
              actionHref="/dashboard/reservas/nueva"
            />
          ) : (
            <div className="space-y-4">
              {reservasHoy.map((reserva) => (
                <Link
                  key={reserva.id}
                  href={`/dashboard/reservas/${reserva.id}`}
                  className="block rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {reserva.nombreClase}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {reserva.salon.nombre} • {reserva.salon.bloque.nombre} •{' '}
                        {reserva.salon.bloque.sede.nombre}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {reserva.horaInicio} - {reserva.horaFin}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/reservas/nueva"
          className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-900">Nueva reserva</span>
        </Link>

        <Link
          href="/dashboard/sedes"
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
        >
          <Building2 className="w-5 h-5 text-slate-600" />
          <span className="font-semibold text-slate-900">Ver sedes</span>
        </Link>
      </div>
    </div>
  );
}
