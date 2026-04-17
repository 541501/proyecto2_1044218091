'use client';

import { FormEvent, useState } from 'react';
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
  Shield,
  Trash2,
  UserPlus,
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

interface CuentaAutorizada {
  id: string;
  email: string;
  nombre: string | null;
  rol: 'ADMIN' | 'ESCUELA' | 'PROFESOR';
  escuela: string | null;
  activa: boolean;
  registrada: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'ADMIN' | 'ESCUELA' | 'PROFESOR'>('PROFESOR');
  const [escuela, setEscuela] = useState('');
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
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

  const {
    data: cuentas = [],
    isLoading: isLoadingCuentas,
    refetch: refetchCuentas,
  } = useQuery({
    queryKey: ['cuentas-autorizadas'],
    queryFn: async () => {
      const response = await fetch('/api/cuentas-autorizadas');
      const payload = (await response.json()) as ApiResponse<CuentaAutorizada[]> & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'No se pudieron cargar las cuentas autorizadas');
      }

      return payload.data;
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);
    setFormMessage(null);

    try {
      const response = await fetch('/api/cuentas-autorizadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nombre: nombre || undefined,
          rol,
          escuela: rol === 'ESCUELA' ? escuela || undefined : undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFormError(payload.error || 'No se pudo guardar la cuenta autorizada');
        return;
      }

      setFormMessage('Cuenta autorizada guardada correctamente');
      setEmail('');
      setNombre('');
      setRol('PROFESOR');
      setEscuela('');
      await Promise.all([refetchCuentas(), refetchStats()]);
    } catch (error) {
      setFormError('No se pudo guardar la cuenta autorizada');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cuentaId: string) => {
    setDeletingId(cuentaId);
    setFormError(null);
    setFormMessage(null);

    try {
      const response = await fetch(`/api/cuentas-autorizadas/${cuentaId}`, {
        method: 'DELETE',
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFormError(payload.error || 'No se pudo eliminar la cuenta autorizada');
        return;
      }

      setFormMessage('Cuenta autorizada eliminada');
      await refetchCuentas();
    } catch (error) {
      setFormError('No se pudo eliminar la cuenta autorizada');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoadingStats || isLoadingCuentas) {
    return <LoadingSpinner message="Cargando administracion..." />;
  }

  return (
    <div className="space-y-8 px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administracion</h1>
        <p className="mt-2 text-slate-600">Metricas del sistema y control de acceso por cuentas autorizadas</p>
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

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Cuentas autorizadas</p>
                <p className="text-3xl font-bold text-slate-900">{cuentas.length}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <Shield className="h-6 w-6 text-slate-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <UserPlus className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Autorizar cuentas</h2>
              <p className="text-sm text-slate-600">Solo estos correos podran registrarse e iniciar sesion</p>
            </div>
          </div>

          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {formMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {formMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Correo institucional</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre.apellido@usa.edu.co"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nombre de referencia</label>
              <input
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Nombre opcional para identificar la cuenta"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Rol permitido</label>
              <select
                value={rol}
                onChange={(event) => setRol(event.target.value as 'ADMIN' | 'ESCUELA' | 'PROFESOR')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="PROFESOR">Profesor</option>
                <option value="ESCUELA">Escuela</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {rol === 'ESCUELA' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Escuela</label>
                <input
                  type="text"
                  value={escuela}
                  onChange={(event) => setEscuela(event.target.value)}
                  placeholder="Ej: Escuela de Ingenieria"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSaving ? 'Guardando...' : 'Guardar cuenta autorizada'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Lista autorizada</h2>
              <p className="text-sm text-slate-600">Controla quien puede entrar al sistema</p>
            </div>
            <Shield className="h-5 w-5 text-slate-500" />
          </div>

          <div className="space-y-3">
            {cuentas.map((cuenta) => (
              <div key={cuenta.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{cuenta.email}</p>
                    <p className="text-sm text-slate-600">
                      {cuenta.nombre || 'Sin nombre'} | {cuenta.rol}
                      {cuenta.escuela ? ` | ${cuenta.escuela}` : ''}
                      {cuenta.registrada ? ' | Registrada' : ' | Pendiente'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(cuenta.id)}
                    disabled={deletingId === cuenta.id || cuenta.email === 'juan.gutierrez20@usa.edu.co'}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Eliminar ${cuenta.email}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

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
