/**
 * Reservation business logic and validation service
 * Handles conflict detection, rule validation, and reservation constraints
 * 
 * Key responsibilities:
 * - Validate RN-02: Only weekdays (Monday-Friday)
 * - Validate RN-03: Maximum 60 days in advance
 * - Detect conflicts: Check for existing active reservations
 * - Provide detailed conflict information for frontend display
 */

import { supabase } from './supabase';
import { getSystemMode } from './dataService';
import { isWeekday, isWithin60Days } from './dateUtils';

export interface ReservationConflict {
  professorName: string;
  subject: string;
  groupName: string;
  roomCode: string;
  slotName: string;
  reservationDate: string;
}

/**
 * Validates reservation date against business rules:
 * - RN-02: Must be a weekday (Monday-Friday)
 * - RN-03: Must be within 60 days from today
 * 
 * Returns array of error messages (empty if all rules pass)
 */
export function validateReservationRules(date: string): string[] {
  const errors: string[] = [];

  // RN-02: Must be a weekday
  if (!isWeekday(date)) {
    errors.push(
      'Las reservas solo pueden realizarse de lunes a viernes. Por favor selecciona una fecha entre semana.'
    );
  }

  // RN-03: Must be within 60 days from today
  if (!isWithin60Days(date)) {
    errors.push(
      'No puedes hacer una reserva con más de 60 días de anticipación. Por favor selecciona una fecha más próxima.'
    );
  }

  return errors;
}

/**
 * Checks if there's an active (confirmada) reservation for the given room, slot, and date.
 * 
 * This function queries before INSERT as the first line of defense against conflicts.
 * Postgres UNIQUE partial index is the second line of defense for race conditions.
 * 
 * Returns:
 * - null if the slot is free
 * - ReservationConflict object with details if there's an active reservation
 */
export async function checkConflict(
  roomId: string,
  slotId: string,
  date: string
): Promise<ReservationConflict | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, no reservations exist, so no conflicts
    return null;
  }

  // Query for active reservations on this room/slot/date combination
  const { data, error } = await supabase!
    .from('reservations')
    .select(
      `
      id,
      subject,
      group_name,
      professor_id,
      professor:professor_id (name),
      room:room_id (code),
      slot:slot_id (name)
    `
    )
    .eq('room_id', roomId)
    .eq('slot_id', slotId)
    .eq('reservation_date', date)
    .eq('status', 'confirmada')
    .limit(1)
    .single();

  // No error means a row was found
  if (!error && data) {
    return {
      professorName: (data.professor as any)?.name || 'Desconocido',
      subject: data.subject,
      groupName: data.group_name,
      roomCode: (data.room as any)?.code || 'N/A',
      slotName: (data.slot as any)?.name || 'N/A',
      reservationDate: date,
    };
  }

  // PGRST116 means "no rows found" - this is not an error, it means the slot is free
  if (error && error.code === 'PGRST116') {
    return null;
  }

  // Any other error should be re-thrown
  if (error) {
    throw error;
  }

  return null;
}
