'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SlotApi {
  horaInicio: string;
  horaFin: string;
}

interface DisponibilidadResponse {
  success: boolean;
  data: {
    salonId: string;
    fecha: string;
    slotsDisponibles: SlotApi[];
    count: number;
  };
}

interface Slot {
  hora: string;
  estado: 'libre' | 'ocupado';
}

interface CalendarioSalonProps {
  salonId: string;
  fecha: Date;
  onFechaChange: (date: Date) => void;
  selectedSlots: string[];
  onSlotSelect: (hora: string) => void;
  onSlotDeselect: (hora: string) => void;
}

const HORAS_DISPONIBLES = Array.from({ length: 16 }, (_, index) => {
  const hour = 7 + index;
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
  const [horaInicio, setHoraInicio] = useState<string | null>(null);
  const [horaFin, setHoraFin] = useState<string | null>(null);

  const { data: slots, isLoading, refetch } = useQuery({
    queryKey: ['disponibilidad', salonId, format(fecha, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(
        `/api/salones/${salonId}/disponibilidad?fecha=${format(fecha, 'yyyy-MM-dd')}`
      );
      if (!response.ok) throw new Error('Failed to fetch availability');

      const payload = (await response.json()) as DisponibilidadResponse;
      const libres = new Set(payload.data.slotsDisponibles.map((slot) => slot.horaInicio));

      return HORAS_DISPONIBLES.map((hora) => ({
        hora,
        estado: libres.has(hora) ? 'libre' : 'ocupado',
      })) as Slot[];
    },
    enabled: !!salonId,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  useEffect(() => {
    refetch();
  }, [fecha, refetch]);

  const handleSlotClick = (hora: string) => {
    const slot = slots?.find((item) => item.hora === hora);
    if (!slot || slot.estado === 'ocupado') {
      return;
    }

    if (selectedSlots.includes(hora)) {
      onSlotDeselect(hora);
      return;
    }

    onSlotSelect(hora);
  };

  const handlePrevDay = () => {
    onFechaChange(addDays(fecha, -1));
  };

  const handleNextDay = () => {
    onFechaChange(addDays(fecha, 1));
  };

  if (isLoading || !slots) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-4 gap-2">
          {Array(16)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded bg-slate-200" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="rounded p-2 transition-colors hover:bg-slate-100"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600">
            {format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        <button
          onClick={handleNextDay}
          className="rounded p-2 transition-colors hover:bg-slate-100"
          aria-label="Dia siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {horaInicio && horaFin && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Rango seleccionado: <span className="font-semibold">{horaInicio} - {horaFin}</span>
          <button
            onClick={() => {
              setHoraInicio(null);
              setHoraFin(null);
              selectedSlots.forEach(onSlotDeselect);
            }}
            className="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
          >
            Limpiar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {HORAS_DISPONIBLES.map((hora) => {
          const slot = slots.find((item) => item.hora === hora);
          const isSelected = selectedSlots.includes(hora);
          const isOccupied = slot?.estado === 'ocupado';

          return (
            <button
              key={hora}
              onClick={() => {
                handleSlotClick(hora);
                if (!isSelected && !isOccupied) {
                  setHoraInicio(selectedSlots[0] || hora);
                  setHoraFin(hora);
                }
              }}
              disabled={isOccupied}
              className={cn(
                'rounded-lg border-2 px-2 py-3 text-sm font-semibold transition-all duration-150',
                isSelected && !isOccupied
                  ? 'border-blue-700 bg-blue-600 text-white shadow-lg'
                  : isOccupied
                    ? 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400 opacity-60'
                    : 'cursor-pointer border-green-300 bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
              )}
              title={isOccupied ? 'Ocupado' : 'Disponible - Haz clic para seleccionar'}
            >
              {hora}
            </button>
          );
        })}
      </div>

      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-green-300 bg-green-100" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-slate-300 bg-slate-100" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}
