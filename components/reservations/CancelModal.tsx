'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import type { Reservation } from '@/lib/types';

interface CancelModalProps {
  isOpen: boolean;
  reservation: Reservation | null;
  userRole: 'profesor' | 'coordinador' | 'admin';
  onConfirm: (cancellationReason?: string) => Promise<void>;
  onClose: () => void;
}

export function CancelModal({
  isOpen,
  reservation,
  userRole,
  onConfirm,
  onClose,
}: CancelModalProps) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const needsReason = userRole !== 'profesor';

  const handleConfirm = async () => {
    if (needsReason && !cancellationReason.trim()) {
      setToast({
        message: 'El motivo de cancelación es obligatorio',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(cancellationReason || undefined);
      setCancellationReason('');
      setToast({
        message: 'Reserva cancelada exitosamente',
        type: 'success',
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setToast({
        message: err.message || 'Error al cancelar la reserva',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reservation) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Cancelar Reserva">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas cancelar esta reserva?
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Materia:</strong> {reservation.subject}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Grupo:</strong> {reservation.group_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fecha:</strong>{' '}
                {new Date(reservation.reservation_date).toLocaleDateString(
                  'es-CO',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </p>
            </div>
          </div>

          {needsReason && (
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Motivo de Cancelación *
              </label>
              <textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Explica el motivo de la cancelación..."
                rows={4}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                El motivo es obligatorio para coordinadores y administradores
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              No, mantener
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              Sí, cancelar reserva
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          id="cancel-toast"
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
