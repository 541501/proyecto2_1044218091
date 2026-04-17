'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import CalendarioSalon from './CalendarioSalon';
import { CrearReservaSchemaRefinado } from '@/lib/validations/reserva.schema';
import { cn } from '@/lib/utils/cn';

type ReservaFormData = z.infer<typeof CrearReservaSchemaRefinado>;

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

interface Sede {
  id: string;
  nombre: string;
}

interface Bloque {
  id: string;
  nombre: string;
  sedeId: string;
}

interface Salon {
  id: string;
  nombre: string;
  capacidad: number;
  bloqueId: string;
}

interface SedeDetalle {
  id: string;
  nombre: string;
  ubicacion: string;
  bloques: Bloque[];
}

function getHoraFin(slots: string[]) {
  const ultimaHora = slots.at(-1);

  if (!ultimaHora) {
    return '';
  }

  const [hora = 0] = ultimaHora.split(':').map(Number);
  return `${String(hora + 1).padStart(2, '0')}:00`;
}

export default function FormularioReserva() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedBloque, setSelectedBloque] = useState('');
  const [selectedSalon, setSelectedSalon] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(CrearReservaSchemaRefinado),
    defaultValues: {
      salonId: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      horaInicio: '07:00',
      horaFin: '08:00',
      nombreClase: '',
      descripcion: '',
    },
  });

  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const response = await fetch('/api/sedes');
      if (!response.ok) throw new Error('Failed to fetch sedes');
      const payload = (await response.json()) as ApiResponse<Sede[]>;
      return payload.data;
    },
  });

  const { data: bloques = [] } = useQuery({
    queryKey: ['bloques', selectedSede],
    queryFn: async () => {
      if (!selectedSede) return [];
      const response = await fetch(`/api/sedes/${selectedSede}`);
      if (!response.ok) throw new Error('Failed to fetch bloques');
      const payload = (await response.json()) as ApiResponse<SedeDetalle>;
      return payload.data.bloques || [];
    },
    enabled: !!selectedSede,
  });

  const { data: salones = [] } = useQuery({
    queryKey: ['salones', selectedBloque],
    queryFn: async () => {
      if (!selectedBloque) return [];
      const response = await fetch(`/api/salones?bloqueId=${selectedBloque}`);
      if (!response.ok) throw new Error('Failed to fetch salones');
      const payload = (await response.json()) as ApiResponse<Salon[]>;
      return payload.data;
    },
    enabled: !!selectedBloque,
  });

  const createReservaMutation = useMutation({
    mutationFn: async (data: ReservaFormData) => {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const errorData = (await response.json()) as {
        error?: string;
        data?: unknown;
      };

      if (response.status === 409) {
        throw new Error(errorData.error || 'El horario ya fue reservado');
      }

      if (!response.ok) {
        throw new Error(errorData.error || 'Error al crear reserva');
      }

      return errorData;
    },
    onSuccess: () => {
      setSuccessMessage('Reserva creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });

      setTimeout(() => {
        router.push('/dashboard/reservas');
      }, 2000);
    },
    onError: (error: Error) => {
      if (error.message.includes('reservado')) {
        setConflictError(`${error.message} Intenta otra fecha u horario.`);
        queryClient.invalidateQueries({
          queryKey: ['disponibilidad', selectedSalon, format(selectedDate, 'yyyy-MM-dd')],
        });
        setSelectedSlots([]);
      } else {
        setConflictError(error.message);
      }
    },
  });

  const handleSlotSelect = (hora: string) => {
    setSelectedSlots((prev) => [...prev, hora].sort());
    setConflictError(null);
  };

  const handleSlotDeselect = (hora: string) => {
    setSelectedSlots((prev) => prev.filter((item) => item !== hora));
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedSalon) {
      setConflictError('Selecciona un salon para continuar');
      return;
    }

    if (step === 2 && selectedSlots.length === 0) {
      setConflictError('Selecciona al menos un horario');
      return;
    }

    setConflictError(null);
    setStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3);
    setConflictError(null);
  };

  const onSubmit = async (data: ReservaFormData) => {
    if (selectedSlots.length === 0) {
      setConflictError('Selecciona al menos un horario');
      return;
    }

    const horaInicio = selectedSlots[0];
    const horaFin = getHoraFin(selectedSlots);

    if (!horaInicio || !horaFin) {
      setConflictError('No se pudo calcular el horario seleccionado');
      return;
    }

    const payload: ReservaFormData = {
      ...data,
      salonId: selectedSalon,
      fecha: format(selectedDate, 'yyyy-MM-dd'),
      horaInicio,
      horaFin,
    };

    createReservaMutation.mutate(payload);
  };

  if (successMessage) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">{successMessage}</h3>
        <p className="mt-2 text-sm text-green-700">Redirigiendo a mis reservas...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              step >= s ? 'bg-blue-600' : 'bg-slate-200'
            )}
          />
        ))}
      </div>

      {conflictError && (
        <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{conflictError}</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Paso 1: Selecciona un salon</h2>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Sede</label>
            <select
              value={selectedSede}
              onChange={(e) => {
                setSelectedSede(e.target.value);
                setSelectedBloque('');
                setSelectedSalon('');
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Selecciona una sede...</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          {selectedSede && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Bloque</label>
              <select
                value={selectedBloque}
                onChange={(e) => {
                  setSelectedBloque(e.target.value);
                  setSelectedSalon('');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Selecciona un bloque...</option>
                {bloques.map((bloque) => (
                  <option key={bloque.id} value={bloque.id}>
                    {bloque.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedBloque && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Salon</label>
              <select
                value={selectedSalon}
                onChange={(e) => setSelectedSalon(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Selecciona un salon...</option>
                {salones.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.nombre} (Capacidad: {salon.capacidad})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400"
              disabled={!selectedSalon}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Paso 2: Selecciona un horario</h2>

          <CalendarioSalon
            salonId={selectedSalon}
            fecha={selectedDate}
            onFechaChange={setSelectedDate}
            selectedSlots={selectedSlots}
            onSlotSelect={handleSlotSelect}
            onSlotDeselect={handleSlotDeselect}
          />

          <div className="flex justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400"
              disabled={selectedSlots.length === 0}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Paso 3: Detalles de la reserva</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre de la clase <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Matematicas 101"
                {...register('nombreClase')}
                disabled={createReservaMutation.isPending}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
              />
              {errors.nombreClase && (
                <p className="mt-1 text-xs text-red-600">{errors.nombreClase.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Descripcion (opcional)
              </label>
              <textarea
                placeholder="Ej: Sesion teorica de ecuaciones diferenciales"
                {...register('descripcion')}
                disabled={createReservaMutation.isPending}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm">
              <p className="mb-3 font-semibold text-blue-900">Resumen de tu reserva:</p>
              <ul className="space-y-2 text-blue-700">
                <li>
                  <span className="font-medium">Salon:</span>{' '}
                  {salones.find((salon) => salon.id === selectedSalon)?.nombre}
                </li>
                <li>
                  <span className="font-medium">Fecha:</span> {format(selectedDate, 'dd/MM/yyyy')}
                </li>
                <li>
                  <span className="font-medium">Horario:</span> {selectedSlots[0]} - {getHoraFin(selectedSlots)}
                </li>
              </ul>
            </div>

            <div className="flex justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                disabled={createReservaMutation.isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="submit"
                disabled={createReservaMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-green-400"
              >
                {createReservaMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar reserva
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
