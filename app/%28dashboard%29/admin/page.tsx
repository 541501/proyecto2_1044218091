'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  DoorOpen,
  Calendar,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Reserva {
  id: string;
  fecha: string;
  estado: 'CONFIRMADA' | 'CANCELADA';
}

interface Sede {
  id: string;
  nombre: string;
}

interface Salon {
  id: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function AdminPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [sedesRes, salonesRes, reservasRes] = await Promise.all([
        fetch('/api/sedes'),
        fetch('/api/salones'),
        fetch('/api/reservas'),
      ]);

      const sedes = ((await sedesRes.json()) as ApiResponse<Sede[]>).data;
      const salones = ((await salonesRes.json()) as ApiResponse<Salon[]>).data;
      const reservas = ((await reservasRes.json()) as ApiResponse<Reserva[]>).data;

      const hoy = new Date().toISOString().split('T')[0] || '';
      const reservasHoy = reservas.filter((reserva) => reserva.fecha.startsWith(hoy) && reserva.estado === 'CONFIRMADA');
      const canceladas = reservas.filter((reserva) => reserva.estado === 'CANCELADA');

      return {
        totalSedes: sedes.length,
        totalSalones: salones.length,
        totalReservas: reservas.length,
        reservasHoy: reservasHoy.length,
        canceladas: canceladas.length,
      };
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Cargando estadisticas..." />;
  }

  return (
    <div className="space-y-8 px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administracion</h1>
        <p className="mt-2 text-slate-600">Metricas y gestion del sistema</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sedes registradas</p>
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
                <p className="text-sm text-slate-600">Salones totales</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalSalones}</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <DoorOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Reservas totales</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalReservas}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Reservas hoy</p>
                <p className="text-3xl font-bold text-slate-900">{stats.reservasHoy}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Canceladas</p>
                <p className="text-3xl font-bold text-slate-900">{stats.canceladas}</p>
              </div>
              <div className="rounded-lg bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Gestion</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/sedes"
            className="rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <Building2 className="mb-2 h-6 w-6 text-blue-600" />
            <h3 className="mb-1 font-semibold text-slate-900">Gestionar sedes</h3>
            <p className="text-sm text-slate-600">Crear, editar o eliminar sedes</p>
          </Link>

          <Link
            href="/dashboard/reservas"
            className="rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <Calendar className="mb-2 h-6 w-6 text-amber-600" />
            <h3 className="mb-1 font-semibold text-slate-900">Todas las reservas</h3>
            <p className="text-sm text-slate-600">Ver y gestionar todas las reservas</p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <Users className="mb-2 h-6 w-6 text-green-600" />
            <h3 className="mb-1 font-semibold text-slate-900">Usuarios</h3>
            <p className="text-sm text-slate-600">Vista general de usuarios autenticados</p>
          </Link>

          <Link
            href="/dashboard/sedes"
            className="rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <DoorOpen className="mb-2 h-6 w-6 text-purple-600" />
            <h3 className="mb-1 font-semibold text-slate-900">Gestionar salones</h3>
            <p className="text-sm text-slate-600">Explorar salones por sede y bloque</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
