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
  estado: 'ACTIVA' | 'CANCELADA';
}

interface Sede {
  id: string;
  nombre: string;
}

interface Salon {
  id: string;
}

export default function AdminPage() {
  const { data: session } = useSession();

  // Verificar si es admin
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

      const sedes: Sede[] = await sedesRes.json();
      const salones: Salon[] = await salonesRes.json();
      const reservas: Reserva[] = await reservasRes.json();

      const hoy = new Date().toISOString().split('T')[0];
      const reservasHoy = reservas.filter((r) => r.fecha === hoy && r.estado === 'ACTIVA');
      const canceladas = reservas.filter((r) => r.estado === 'CANCELADA');

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
    return <LoadingSpinner message="Cargando estadísticas..." />;
  }

  return (
    <div className="space-y-8 py-8 px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="mt-2 text-slate-600">Métricas y gestión del sistema</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sedes registradas</p>
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
                <p className="text-sm text-slate-600">Salones totales</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalSalones}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DoorOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Reservas totales</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalReservas}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Reservas hoy</p>
                <p className="text-3xl font-bold text-slate-900">{stats.reservasHoy}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Canceladas</p>
                <p className="text-3xl font-bold text-slate-900">{stats.canceladas}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones de gestión */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Gestión</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="#"
            className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Building2 className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Gestionar sedes</h3>
            <p className="text-sm text-slate-600">Crear, editar o eliminar sedes</p>
          </Link>

          <Link
            href="#"
            className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <DoorOpen className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Gestionar salones</h3>
            <p className="text-sm text-slate-600">Crear, editar o eliminar salones</p>
          </Link>

          <Link
            href="#"
            className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Usuarios</h3>
            <p className="text-sm text-slate-600">Ver y gestionar usuarios del sistema</p>
          </Link>

          <Link
            href="#"
            className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Calendar className="w-6 h-6 text-amber-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Todas las reservas</h3>
            <p className="text-sm text-slate-600">Ver y gestionar todas las reservas</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
