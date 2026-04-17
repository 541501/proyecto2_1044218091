'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

interface Sede {
  id: string;
  nombre: string;
  ubicacion: string;
  bloques?: Array<{ id: string; nombre: string }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function SedesPage() {
  const { data: sedes = [], isLoading } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const response = await fetch('/api/sedes');
      if (!response.ok) throw new Error('Failed to fetch sedes');
      const payload = (await response.json()) as ApiResponse<Sede[]>;
      return payload.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Cargando sedes..." />;
  }

  return (
    <div className="space-y-6 px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sedes</h1>
        <p className="mt-2 text-slate-600">Explora los bloques y salones de cada sede</p>
      </div>

      {sedes.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay sedes disponibles"
          description="Por favor, contacta al administrador"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sedes.map((sede) => (
            <Link
              key={sede.id}
              href={`/dashboard/sedes/${sede.id}`}
              className="group rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>

              <h2 className="mb-2 text-lg font-bold text-slate-900">{sede.nombre}</h2>
              <p className="mb-4 text-sm text-slate-600">{sede.ubicacion}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {sede.bloques?.length || 0} bloques
                </span>
                <span className="text-blue-600 transition-transform group-hover:translate-x-1">-&gt;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
