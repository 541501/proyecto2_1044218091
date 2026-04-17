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

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split('T')[0] || '';

  const { data: reservasHoy = [], isLoading } = useQuery({
    queryKey: ['reservas', 'today'],
    queryFn: async () => {
      const response = await fetch('/api/reservas');
      if (!response.ok) throw new Error('Failed to fetch reservas');
      const payload = (await response.json()) as ApiResponse<Reserva[]>;
      return payload.data.filter((reserva) => reserva.fecha.startsWith(today));
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [sedesRes, reservasRes] = await Promise.all([
        fetch('/api/sedes'),
        fetch('/api/reservas'),
      ]);

      const sedesPayload = (await sedesRes.json()) as ApiResponse<unknown[]>;
      const reservasPayload = (await reservasRes.json()) as ApiResponse<unknown[]>;

      return {
        totalSedes: sedesPayload.data.length,
        totalReservas: reservasPayload.data.length,
      };
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-8 px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bienvenido, {session?.user?.name}</h1>
        <p className="mt-2 text-slate-600">
          Hoy es {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de sedes</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalSedes}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de reservas</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalReservas}</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Mis reservas de hoy</p>
                <p className="text-3xl font-bold text-slate-900">{reservasHoy.length}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

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
                  className="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{reserva.nombreClase}</h3>
                      <p className="text-sm text-slate-600">
                        {reserva.salon.nombre} - {reserva.salon.bloque.nombre} - {reserva.salon.bloque.sede.nombre}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
                      {reserva.horaInicio} - {reserva.horaFin}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/reservas/nueva"
          className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
        >
          <Plus className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-900">Nueva reserva</span>
        </Link>

        <Link
          href="/dashboard/sedes"
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
        >
          <Building2 className="h-5 w-5 text-slate-600" />
          <span className="font-semibold text-slate-900">Ver sedes</span>
        </Link>
      </div>
    </div>
  );
}
