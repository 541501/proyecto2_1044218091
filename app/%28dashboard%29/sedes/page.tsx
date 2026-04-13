'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  descripcion?: string;
  bloques?: any[];
}

export default function SedesPage() {
  const { data: sedes = [], isLoading } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const response = await fetch('/api/sedes');
      if (!response.ok) throw new Error('Failed to fetch sedes');
      return response.json() as Promise<Sede[]>;
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Cargando sedes..." />;
  }

  return (
    <div className="space-y-6 py-8 px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sedes</h1>
        <p className="mt-2 text-slate-600">
          Explora los bloques y salones de cada sede
        </p>
      </div>

      {sedes.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay sedes disponibles"
          description="Por favor, contacta al administrador"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sedes.map((sede) => (
            <Link
              key={sede.id}
              href={`/dashboard/sedes/${sede.id}`}
              className="group rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">{sede.nombre}</h2>

              <p className="text-sm text-slate-600 mb-4">{sede.direccion}</p>

              {sede.descripcion && (
                <p className="text-xs text-slate-500 mb-4">{sede.descripcion}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {sede.bloques?.length || 0} bloques
                </span>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
