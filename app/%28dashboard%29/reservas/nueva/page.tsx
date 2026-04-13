'use client';

import FormularioReserva from '@/components/reservas/FormularioReserva';

export default function NuevaReservaPage() {
  return (
    <div className="space-y-6 py-8 px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nueva Reserva</h1>
        <p className="mt-2 text-slate-600">
          Sigue los 3 pasos para crear una reserva en el salón que necesites
        </p>
      </div>

      <FormularioReserva />
    </div>
  );
}
