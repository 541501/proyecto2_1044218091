'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CancelModal } from './CancelModal';
import { formatDateSpanish, isTodayOrPastDate } from '@/lib/dateUtils';
import type { ReservationWithDetails } from '@/lib/types';

interface ReservationCardProps {
  reservation: ReservationWithDetails;
  userRole: 'profesor' | 'coordinador' | 'admin';
  userId: string;
  onCancelled?: () => void;
}

export function ReservationCard({
  reservation,
  userRole,
  userId,
  onCancelled,
}: ReservationCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel =
    userRole !== 'profesor'
      ? true
      : reservation.professor_id === userId &&
        !isTodayOrPastDate(reservation.reservation_date);

  const isPastOrToday = isTodayOrPastDate(reservation.reservation_date);

  const handleCancelConfirm = async (cancellationReason?: string) => {
    setIsCancelling(true);
    try {
      const response = await fetch(
        `/api/reservations/${reservation.id}/cancel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cancellation_reason: cancellationReason || '',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel reservation');
      }

      setShowCancelModal(false);
      setIsCancelling(false);
      onCancelled?.();
    } catch (error: any) {
      setIsCancelling(false);
      throw error;
    }
  };

  const room = reservation.room as any;
  const slot = reservation.slot as any;

  return (
    <>
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {room?.code || 'N/A'}
                </h3>
                <Badge
                  variant={
                    reservation.status === 'confirmada' ? 'success' : 'secondary'
                  }
                >
                  {reservation.status === 'confirmada'
                    ? '✓ Confirmada'
                    : '✕ Cancelada'}
                </Badge>
                {isPastOrToday && reservation.status === 'confirmada' && (
                  <Badge variant="warning">Pasada</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Materia</p>
                  <p className="font-medium text-gray-900">
                    {reservation.subject}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Grupo</p>
                  <p className="font-medium text-gray-900">
                    {reservation.group_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Franja</p>
                  <p className="font-medium text-gray-900">
                    {slot?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Fecha</p>
                  <p className="font-medium text-gray-900">
                    {formatDateSpanish(reservation.reservation_date)}
                  </p>
                </div>
                {userRole !== 'profesor' && (
                  <div>
                    <p className="text-gray-600">Profesor</p>
                    <p className="font-medium text-gray-900">
                      {(reservation.professor as any)?.name || 'N/A'}
                    </p>
                  </div>
                )}
                {reservation.status === 'cancelada' && (
                  <div>
                    <p className="text-gray-600">Cancelada por</p>
                    <p className="font-medium text-gray-900">
                      {(reservation.cancelled_by_user as any)?.name || 'Sistema'}
                    </p>
                  </div>
                )}
              </div>

              {reservation.cancellation_reason && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">
                    Motivo de cancelación:
                  </p>
                  <p className="text-sm text-gray-800">
                    {reservation.cancellation_reason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {canCancel && reservation.status === 'confirmada' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isCancelling}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <CancelModal
        isOpen={showCancelModal}
        reservation={reservation}
        userRole={userRole}
        onConfirm={handleCancelConfirm}
        onClose={() => setShowCancelModal(false)}

      />
    </>
  );
}
