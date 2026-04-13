'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface Slot {
  hora: string; // "HH:MM"
  estado: 'libre' | 'ocupado' | 'propio';
  reservaId?: string;
}

interface CalendarioSalonProps {
  salonId: string;
  fecha: Date;
  onFechaChange: (date: Date) => void;
  selectedSlots: string[]; // Array de horas seleccionadas "HH:MM"
  onSlotSelect: (hora: string) => void;
  onSlotDeselect: (hora: string) => void;
}

const HORAS_DISPONIBLES = Array.from({ length: 16 }, (_, i) => {
  const hour = 7 + i;
  return `${String(hour).padStart(2, '0')}:00`;
});

export default function CalendarioSalon({
  salonId,
  fecha,
  onFechaChange,
  selectedSlots,
  onSlotSelect,
  onSlotDeselect,
}: CalendarioSalonProps) {
  const { data: session } = useSession();
  const [horaInicio, setHoraInicio] = useState<string | null>(null);
  const [horaFin, setHoraFin] = useState<string | null>(null);

  // Fetch disponibilidad del salón para la fecha seleccionada
  const { data: slots, isLoading, refetch } = useQuery({
    queryKey: ['disponibilidad', salonId, format(fecha, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(
        `/api/salones/${salonId}/disponibilidad?fecha=${format(fecha, 'yyyy-MM-dd')}`
      );
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json() as Promise<Slot[]>;
    },
    refetchInterval: 60000, // Revalidar cada 60 segundos
    staleTime: 30000, // Considerar fresco por 30s
  });

  // Revalidar cuando cambia la fecha
  useEffect(() => {
    refetch();
  }, [fecha, refetch]);

  const handleSlotClick = (hora: string) => {
    const slot = slots?.find((s) => s.hora === hora);
    if (!slot || slot.estado === 'ocupado') return;

    if (selectedSlots.includes(hora)) {
      onSlotDeselect(hora);
    } else {
      onSlotSelect(hora);
    }
  };

  const handlePrevDay = () => {
    onFechaChange(addDays(fecha, -1));
  };

  const handleNextDay = () => {
    onFechaChange(addDays(fecha, 1));
  };

  const handleSelectRange = (start: string, end: string) => {
    const startIndex = HORAS_DISPONIBLES.indexOf(start);
    const endIndex = HORAS_DISPONIBLES.indexOf(end);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      return;
    }

    const range = HORAS_DISPONIBLES.slice(startIndex, endIndex + 1);
    const allSelectable = range.every(
      (h) => !slots?.find((s) => s.hora === h)?.estado?.includes('ocupado')
    );

    if (allSelectable) {
      range.forEach((h) => {
        if (!selectedSlots.includes(h)) {
          onSlotSelect(h);
        }
      });
      setHoraInicio(start);
      setHoraFin(end);
    }
  };

  // Loading skeleton
  if (isLoading || !slots) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {Array(16)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con navegación de días */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          aria-label="Día anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600">
            {format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          aria-label="Día siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Información de rango seleccionado */}
      {horaInicio && horaFin && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 border border-blue-200">
          Rango seleccionado: <span className="font-semibold">{horaInicio} - {horaFin}</span>
          <button
            onClick={() => {
              setHoraInicio(null);
              setHoraFin(null);
              selectedSlots.forEach(onSlotDeselect);
            }}
            className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Grid de slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {HORAS_DISPONIBLES.map((hora) => {
          const slot = slots.find((s) => s.hora === hora);
          const isSelected = selectedSlots.includes(hora);
          const isOccupied = slot?.estado === 'ocupado';
          const isOwn = slot?.estado === 'propio';

          return (
            <button
              key={hora}
              onClick={() => handleSlotClick(hora)}
              disabled={isOccupied}
              className={cn(
                'py-3 px-2 rounded-lg text-sm font-semibold transition-all duration-150 border-2',
                isSelected && !isOccupied
                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                  : isOccupied
                    ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                    : isOwn
                      ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 hover:shadow-md'
                      : 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:shadow-md cursor-pointer'
              )}
              title={
                isOccupied
                  ? `Ocupado ${slot?.reservaId ? `(ID: ${slot.reservaId})` : ''}`
                  : isOwn
                    ? 'Tu reserva'
                    : 'Disponible - Haz clic para seleccionar'
              }
            >
              {hora}
            </button>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
          <span>Tu reserva existente</span>
        </div>
      </div>
    </div>
  );
}
