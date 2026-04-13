'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, DoorOpen } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Salon {
  id: string;
  nombre: string;
  capacidad: number;
}

interface Bloque {
  id: string;
  nombre: string;
  salones: Salon[];
}

interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  bloques: Bloque[];
}

export default function SedeDetailPage() {
  const params = useParams();
  const sedeId = params.sedeId as string;

  const { data: sede, isLoading } = useQuery({
    queryKey: ['sede', sedeId],
    queryFn: async () => {
      const response = await fetch(`/api/sedes/${sedeId}`);
      if (!response.ok) throw new Error('Failed to fetch sede');
      return response.json() as Promise<Sede>;
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Cargando sede..." />;
  }

  if (!sede) {
    return (
      <div className="py-8 px-6">
        <p className="text-red-600">Sede no encontrada</p>
      </div>
    );
  }

  const totalSalones = sede.bloques.reduce((sum, b) => sum + b.salones.length, 0);

  return (
    <div className="space-y-6 py-8 px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/sedes"
          className="p-2 hover:bg-slate-100 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{sede.nombre}</h1>
          <p className="text-slate-600">{sede.direccion}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm">
          <span className="font-semibold text-blue-900">{sede.bloques.length}</span>
          <span className="text-blue-700"> bloques</span>
        </div>
        <div className="rounded-lg bg-purple-50 px-4 py-2 text-sm">
          <span className="font-semibold text-purple-900">{totalSalones}</span>
          <span className="text-purple-700"> salones</span>
        </div>
      </div>

      {/* Bloques y salones */}
      <div className="space-y-8">
        {sede.bloques.map((bloque) => (
          <div key={bloque.id} className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">{bloque.nombre}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bloque.salones.map((salon) => (
                <Link
                  key={salon.id}
                  href={`/dashboard/reservas/nueva?salonId=${salon.id}`}
                  className="group rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
                    <DoorOpen className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1">{salon.nombre}</h3>
                  <p className="text-xs text-slate-600">
                    Capacidad: {salon.capacidad} personas
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
