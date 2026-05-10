import { getSystemMode } from './dataService';
import { readSeed } from './seedReader';
import { supabase } from './supabase';

export type SlotCellStatus = 'libre' | 'ocupada' | 'pasada';

export interface SlotCell {
  slotId: string;
  slotName: string;
  status: SlotCellStatus;
  professorName?: string;
  subject?: string;
  groupName?: string;
}

export interface WeeklyCalendarDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  dayName: string; // "Lunes", "Martes", etc.
  slots: SlotCell[];
}

export interface WeeklyCalendar {
  roomId: string;
  roomCode: string;
  roomName: string;
  blockName: string;
  weekStart: string; // YYYY-MM-DD (Monday of the week)
  weekEnd: string; // YYYY-MM-DD (Friday of the week)
  days: WeeklyCalendarDay[];
}

export interface BlockAvailability {
  blockId: string;
  blockName: string;
  date: string;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
}

/**
 * Get all dates from Monday to Friday of the week.
 */
function getWeekDates(weekStart: string): string[] {
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Check if a date is in the past (before today).
 */
function isPastDate(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date < today;
}

/**
 * Build the complete weekly calendar for a room.
 * Returns status for each slot: libre, ocupada (with professor + subject), or pasada.
 */
export async function buildWeeklyCalendar(roomId: string, weekStart: string): Promise<WeeklyCalendar> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, no reservations exist, all slots are libre (except past dates)
    const seed = await readSeed();
    const room = seed.rooms?.find((r: any) => r.id === roomId);
    const block = seed.blocks?.find((b: any) => b.id === room?.block_id);
    const slots = seed.slots || [];

    const weekDates = getWeekDates(weekStart);
    const days = weekDates.map((date, i) => {
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const daySlots = slots.map((slot: any) => ({
        slotId: slot.id,
        slotName: slot.name,
        status: isPastDate(date) ? 'pasada' : 'libre',
      } as SlotCell));

      return {
        date,
        dayOfWeek: i + 1,
        dayName: dayNames[i],
        slots: daySlots,
      };
    });

    return {
      roomId,
      roomCode: room?.code || 'N/A',
      roomName: room?.code || 'N/A',
      blockName: block?.name || 'N/A',
      weekStart,
      weekEnd: weekDates[4],
      days,
    };
  }

  // In live mode, query from Supabase
  if (!supabase) {
    throw new Error('Supabase not configured for live mode');
  }

  // Get room, block, and slots
  const { data: roomData } = await supabase
    .from('rooms')
    .select('id, code, block_id')
    .eq('id', roomId)
    .single();

  if (!roomData) {
    throw new Error('Room not found');
  }

  const { data: blockData } = await supabase
    .from('blocks')
    .select('name')
    .eq('id', roomData.block_id)
    .single();

  const { data: slotsData } = await supabase
    .from('slots')
    .select('*')
    .order('order_index', { ascending: true });

  // Get all reservations for this room in the week
  const weekDates = getWeekDates(weekStart);
  const { data: reservations } = await supabase
    .from('reservations')
    .select('slot_id, reservation_date, professor_id, subject, group_name')
    .eq('room_id', roomId)
    .eq('status', 'confirmada')
    .in('reservation_date', weekDates);

  // Fetch professor names for each reservation
  let professorsMap: Record<string, string> = {};
  if (reservations && reservations.length > 0) {
    const professorIds = [...new Set(reservations.map((r: any) => r.professor_id))];
    const { data: professors } = await supabase
      .from('users')
      .select('id, name')
      .in('id', professorIds);

    if (professors) {
      professorsMap = Object.fromEntries(professors.map((p: any) => [p.id, p.name]));
    }
  }

  // Build calendar
  const days = weekDates.map((date, i) => {
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const dayReservations = reservations?.filter((r: any) => r.reservation_date === date) || [];

    const daySlots = slotsData?.map((slot: any) => {
      const isPast = isPastDate(date);
      const reservation = dayReservations.find((r: any) => r.slot_id === slot.id);

      if (isPast) {
        return {
          slotId: slot.id,
          slotName: slot.name,
          status: 'pasada',
        } as SlotCell;
      }

      if (reservation) {
        return {
          slotId: slot.id,
          slotName: slot.name,
          status: 'ocupada' as const,
          professorName: professorsMap[reservation.professor_id] || 'Profesor desconocido',
          subject: reservation.subject,
          groupName: reservation.group_name,
        } as SlotCell;
      }

      return {
        slotId: slot.id,
        slotName: slot.name,
        status: 'libre' as const,
      } as SlotCell;
    }) || [];

    return {
      date,
      dayOfWeek: i + 1,
      dayName: dayNames[i],
      slots: daySlots,
    };
  });

  return {
    roomId,
    roomCode: roomData.code,
    roomName: roomData.code,
    blockName: blockData?.name || 'N/A',
    weekStart,
    weekEnd: weekDates[4],
    days,
  };
}

/**
 * Get availability summary for a block on a given date.
 * Returns counts of available vs occupied rooms.
 */
export async function getBlockAvailability(blockId: string, date: string): Promise<BlockAvailability> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, all active rooms are available
    const seed = await readSeed();
    const activeRooms = seed.rooms?.filter((r: any) => r.block_id === blockId && r.is_active) || [];

    return {
      blockId,
      blockName: seed.blocks?.find((b: any) => b.id === blockId)?.name || 'N/A',
      date,
      totalRooms: activeRooms.length,
      availableRooms: activeRooms.length,
      occupiedRooms: 0,
    };
  }

  // In live mode, query from Supabase
  if (!supabase) {
    throw new Error('Supabase not configured for live mode');
  }

  // Get all active rooms in the block
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id')
    .eq('block_id', blockId)
    .eq('is_active', true);

  if (!rooms) {
    return {
      blockId,
      blockName: '',
      date,
      totalRooms: 0,
      availableRooms: 0,
      occupiedRooms: 0,
    };
  }

  // Count occupied slots for this date and block
  const roomIds = rooms.map((r: any) => r.id);
  const { data: occupiedData } = await supabase
    .from('reservations')
    .select('room_id', { count: 'exact' })
    .in('room_id', roomIds)
    .eq('reservation_date', date)
    .eq('status', 'confirmada');

  const occupiedRooms = occupiedData?.length || 0;

  const { data: blockData } = await supabase
    .from('blocks')
    .select('name')
    .eq('id', blockId)
    .single();

  return {
    blockId,
    blockName: blockData?.name || 'N/A',
    date,
    totalRooms: rooms.length,
    availableRooms: rooms.length - occupiedRooms,
    occupiedRooms,
  };
}
