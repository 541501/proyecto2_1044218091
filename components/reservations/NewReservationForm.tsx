'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Toast from '@/components/ui/Toast';
import {
  formatDateSpanish,
  isTodayOrPastDate,
} from '@/lib/dateUtils';
import type { Room, Slot, Block } from '@/lib/types';

interface NewReservationFormProps {
  prefilledRoomId?: string;
  prefilledSlotId?: string;
  prefilledDate?: string;
  room?: Room & { block?: Block };
  slot?: Slot;
  block?: Block;
}

export function NewReservationForm({
  prefilledRoomId,
  prefilledSlotId,
  prefilledDate,
  room,
  slot,
  block,
}: NewReservationFormProps) {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [conflictError, setConflictError] = useState<{
    professorName: string;
    subject: string;
    groupName: string;
    roomCode: string;
    slotName: string;
  } | null>(null);

  const isPreFilled = !!(prefilledRoomId && prefilledSlotId && prefilledDate);
  const isPastDate = prefilledDate ? isTodayOrPastDate(prefilledDate) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);
    setConflictError(null);

    if (!prefilledRoomId || !prefilledSlotId || !prefilledDate) {
      setToast({
        message: 'Error: Datos de sala, franja o fecha faltantes',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    if (!subject.trim() || !groupName.trim()) {
      setToast({
        message: 'Por favor completa todos los campos',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: prefilledRoomId,
          slot_id: prefilledSlotId,
          reservation_date: prefilledDate,
          subject: subject.trim(),
          group_name: groupName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        if (response.status === 409 && error.conflict) {
          // Handle conflict
          setConflictError(error.conflict);
          setToast({
            message: 'La franja ya está reservada',
            type: 'error',
          });
        } else if (response.status === 400) {
          // Handle validation errors
          setToast({
            message:
              error.validationErrors?.[0] ||
              error.error ||
              'Error de validación',
            type: 'error',
          });
        } else {
          setToast({
            message: error.error || 'Error al crear la reserva',
            type: 'error',
          });
        }
        setIsLoading(false);
        return;
      }

      await response.json();
      setToast({
        message: '¡Reserva creada exitosamente!',
        type: 'success',
      });

      // Redirect to reservations list after a short delay
      setTimeout(() => {
        router.push('/reservations');
      }, 1500);
    } catch (err) {
      setToast({
        message: 'Error al crear la reserva. Intenta de nuevo.',
        type: 'error',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {isPreFilled && (
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resumen de Reserva
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Salón</p>
                <p className="text-lg font-semibold text-gray-800">
                  {room?.code}
                </p>
                {block && (
                  <p className="text-sm text-gray-600">Bloque {block.code}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Franja Horaria</p>
                <p className="text-lg font-semibold text-gray-800">
                  {slot?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="text-lg font-semibold text-gray-800">
                  {prefilledDate ? formatDateSpanish(prefilledDate) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo de Sala</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {room?.type || 'N/A'}
                </p>
              </div>
            </div>

            {room && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600">Capacidad</p>
                <p className="text-gray-800">{room.capacity} personas</p>
                {room.equipment && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">Equipamiento</p>
                    <p className="text-gray-800">{room.equipment}</p>
                  </>
                )}
              </div>
            )}

            {isPastDate && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-700 font-semibold">
                  ⚠️ No puedes reservar fechas pasadas o de hoy
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {conflictError && (
        <Card className="mb-6 border-2 border-red-200 bg-red-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              ❌ Conflicto de Reserva
            </h3>
            <p className="text-red-700 mb-3">
              El salón <strong>{conflictError.roomCode}</strong> ya está
              reservado en esa franja por:
            </p>
            <div className="bg-red-100 p-4 rounded-lg space-y-2">
              <p className="text-red-800">
                <strong>Profesor:</strong> {conflictError.professorName}
              </p>
              <p className="text-red-800">
                <strong>Materia:</strong> {conflictError.subject}
              </p>
              <p className="text-red-800">
                <strong>Grupo:</strong> {conflictError.groupName}
              </p>
              <p className="text-red-800">
                <strong>Franja:</strong> {conflictError.slotName}
              </p>
            </div>
            <p className="text-sm text-red-700 mt-4">
              Por favor, elige otra sala, franja o fecha.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Materia / Asignatura *
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ejemplo: Matemáticas I"
              maxLength={150}
              disabled={isPastDate || isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Grupo *
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ejemplo: 2024-1 Grupo A"
              maxLength={50}
              disabled={isPastDate || isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isPreFilled || isPastDate || isLoading}
              isLoading={isLoading}
            >
              {isLoading ? 'Confirmando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </form>
      </Card>

      {toast && (
        <Toast
          id="form-toast"
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
