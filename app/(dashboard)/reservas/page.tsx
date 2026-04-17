'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Reserva {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreClase: string;
  estado: 'CONFIRMADA' | 'CANCELADA';
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

export default function ReservasPage() {
  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['reservas'],
    queryFn: async () => {
      const response = await fetch('/api/reservas');
      if (!response.ok) throw new Error('Failed to fetch reservas');
      const payload = (await response.json()) as ApiResponse<Reserva[]>;
      return payload.data;
    },
  });

  const activasRecientes = reservas
    .filter((reserva) => reserva.estado === 'CONFIRMADA' && new Date(reserva.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 10);

  const pasadas = reservas.filter((reserva) => new Date(reserva.fecha) < new Date());

  if (isLoading) {
    return <LoadingSpinner message="Cargando mis reservas..." />;
  }

  return (
    <div className="space-y-8 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis reservas</h1>
          <p className="mt-2 text-slate-600">{activasRecientes.length} reservas activas</p>
        </div>
        <Link
          href="/dashboard/reservas/nueva"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Nueva
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Proximas</h2>

        {activasRecientes.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No tienes reservas proximas"
            description="Crea una nueva reserva"
            actionLabel="Nueva reserva"
            actionHref="/dashboard/reservas/nueva"
          />
        ) : (
          <div className="space-y-3">
            {activasRecientes.map((reserva) => (
              <Link
                key={reserva.id}
                href={`/dashboard/reservas/${reserva.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{reserva.nombreClase}</h3>
                    <p className="space-y-1 text-sm text-slate-600">
                      <span className="block">
                        {reserva.salon.nombre} - {reserva.salon.bloque.nombre} - {reserva.salon.bloque.sede.nombre}
                      </span>
                      <span className="block">
                        {format(parseISO(reserva.fecha), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </p>
                  </div>

                  <span className="whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
                    {reserva.horaInicio} - {reserva.horaFin}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {pasadas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Historial</h2>

          <div className="space-y-3">
            {pasadas.slice(0, 5).map((reserva) => (
              <div
                key={reserva.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-700">{reserva.nombreClase}</h3>
                    <p className="text-sm text-slate-500">
                      {reserva.salon.nombre} - {format(parseISO(reserva.fecha), 'dd MMM yyyy')}
                    </p>
                  </div>

                  <span className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-500">
                    Pasada
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
