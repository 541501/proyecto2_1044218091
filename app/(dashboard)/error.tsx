'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Puedes enviar el error a un servicio de logging aquí
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">¡Algo salió mal!</h1>
          <p className="mt-2 text-slate-600">
            {error.message || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-slate-500">
              ID del error: {error.digest}
            </p>
          )}
        </div>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
