'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { AlertCircle, CheckCircle2, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import CalendarioSalon from './CalendarioSalon';
import { CrearReservaSchemaRefinado } from '@/lib/validations/reserva.schema';
import { cn } from '@/lib/utils/cn';

type ReservaFormData = z.infer<typeof CrearReservaSchemaRefinado>;

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

export default function FormularioReserva() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSede, setSelectedSede] = useState<string>('');
  const [selectedBloque, setSelectedBloque] = useState<string>('');
  const [selectedSalon, setSelectedSalon] = useState<string>('');
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
  });

  // Fetch sedes
  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const response = await fetch('/api/sedes');
      if (!response.ok) throw new Error('Failed to fetch sedes');
      return response.json() as Promise<Sede[]>;
    },
  });

  // Fetch bloques del sede seleccionada
  const { data: bloques = [] } = useQuery({
    queryKey: ['bloques', selectedSede],
    queryFn: async () => {
      if (!selectedSede) return [];
      // Asumiendo que el endpoint retorna bloques con sus salones
      // O fetch sedes/[id] que incluya bloques
      const response = await fetch(`/api/sedes/${selectedSede}`);
      if (!response.ok) throw new Error('Failed to fetch bloques');
      const data = await response.json();
      return data.bloques || [];
    },
    enabled: !!selectedSede,
  });

  // Fetch salones del bloque seleccionado
  const { data: salones = [] } = useQuery({
    queryKey: ['salones', selectedBloque],
    queryFn: async () => {
      if (!selectedBloque) return [];
      const response = await fetch(`/api/salones?bloqueId=${selectedBloque}`);
      if (!response.ok) throw new Error('Failed to fetch salones');
      return response.json() as Promise<Salon[]>;
    },
    enabled: !!selectedBloque,
  });

  // Mutation para crear reserva
  const createReservaMutation = useMutation({
    mutationFn: async (data: ReservaFormData) => {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        // Conflict: el horario fue reservado por otra persona
        const errorData = await response.json();
        throw new Error(errorData.error || 'El horario ya fue reservado');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear reserva');
      }

      return response.json();
    },
    onSuccess: () => {
      setSuccessMessage('¡Reserva creada exitosamente!');
      // Invalida queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });

      setTimeout(() => {
        router.push('/dashboard/reservas');
      }, 2000);
    },
    onError: (error: Error) => {
      if (error.message.includes('reservado')) {
        setConflictError(
          `${error.message} Intenta otra fecha u horario.`
        );
        // Refresca disponibilidad automáticamente
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
    setSelectedSlots((prev) => [...prev, hora]);
    setConflictError(null);
  };

  const handleSlotDeselect = (hora: string) => {
    setSelectedSlots((prev) => prev.filter((h) => h !== hora));
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedSalon) {
      setConflictError('Selecciona un salón para continuar');
      return;
    }
    if (step === 2 && selectedSlots.length === 0) {
      setConflictError('Selecciona al menos un horario');
      return;
    }
    setConflictError(null);
    setStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1) as 1 | 2 | 3);
    setConflictError(null);
  };

  const onSubmit = async (data: ReservaFormData) => {
    if (selectedSlots.length === 0) {
      setConflictError('Selecciona al menos un horario');
      return;
    }

    const horaInicio = selectedSlots[0];
    const horaFin = `${(parseInt(selectedSlots[selectedSlots.length - 1]) + 1).toString().padStart(2, '0')}:00`;

    const payload: ReservaFormData = {
      ...data,
      salonId: selectedSalon,
      fecha: selectedDate,
      horaInicio,
      horaFin,
    };

    createReservaMutation.mutate(payload);
  };

  if (successMessage) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900">{successMessage}</h3>
        <p className="text-sm text-green-700 mt-2">Redirigiendo a mis reservas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'flex-1 h-2 rounded-full transition-colors',
              step >= s ? 'bg-blue-600' : 'bg-slate-200'
            )}
          />
        ))}
      </div>

      {/* Error message */}
      {conflictError && (
        <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{conflictError}</span>
        </div>
      )}

      {/* Step 1: Seleccionar salón */}
      {step === 1 && (
        <div className="space-y-6 rounded-lg bg-white p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Paso 1: Selecciona un salón</h2>

          {/* Sede */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sede
            </label>
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

          {/* Bloque */}
          {selectedSede && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bloque
              </label>
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

          {/* Salón */}
          {selectedBloque && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Salón
              </label>
              <select
                value={selectedSalon}
                onChange={(e) => setSelectedSalon(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Selecciona un salón...</option>
                {salones.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.nombre} (Capacidad: {salon.capacidad})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-slate-400"
              disabled={!selectedSalon}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Seleccionar horario */}
      {step === 2 && (
        <div className="space-y-6 rounded-lg bg-white p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Paso 2: Selecciona un horario</h2>

          <CalendarioSalon
            salonId={selectedSalon}
            fecha={selectedDate}
            onFechaChange={setSelectedDate}
            selectedSlots={selectedSlots}
            onSlotSelect={handleSlotSelect}
            onSlotDeselect={handleSlotDeselect}
          />

          {/* Footer */}
          <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-slate-400"
              disabled={selectedSlots.length === 0}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Detalles y confirmar */}
      {step === 3 && (
        <div className="space-y-6 rounded-lg bg-white p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Paso 3: Detalles de la reserva</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre de clase */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de la clase <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Matemáticas 101"
                {...register('nombreClase')}
                disabled={createReservaMutation.isPending}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
              />
              {errors.nombreClase && (
                <p className="mt-1 text-xs text-red-600">{errors.nombreClase.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                placeholder="Ej: Sesión teórica de ecuaciones diferenciales"
                {...register('descripcion')}
                disabled={createReservaMutation.isPending}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
              />
            </div>

            {/* Resumen */}
            <div className="rounded-lg bg-blue-50 p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-3">Resumen de tu reserva:</p>
              <ul className="space-y-2 text-blue-700">
                <li>
                  <span className="font-medium">Salón:</span> {salones.find((s) => s.id === selectedSalon)?.nombre}
                </li>
                <li>
                  <span className="font-medium">Fecha:</span> {format(selectedDate, 'dd/MM/yyyy')}
                </li>
                <li>
                  <span className="font-medium">Horario:</span> {selectedSlots[0]} -{' '}
                  {`${(parseInt(selectedSlots[selectedSlots.length - 1]) + 1).toString().padStart(2, '0')}:00`}
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                disabled={createReservaMutation.isPending}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                type="submit"
                disabled={createReservaMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700 transition-colors disabled:bg-green-400"
              >
                {createReservaMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
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
