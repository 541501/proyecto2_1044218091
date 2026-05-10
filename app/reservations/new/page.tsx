import { NewReservationForm } from '@/components/reservations/NewReservationForm';
import { getRoomById, getSlots, getBlockById } from '@/lib/dataService';

interface PageProps {
  searchParams: { roomId?: string; slotId?: string; date?: string };
}

export default async function NewReservationPage({
  searchParams,
}: PageProps) {
  const roomId = searchParams.roomId;
  const slotId = searchParams.slotId;
  const date = searchParams.date;

  let room: any = null;
  let slot: any = null;
  let block: any = null;

  // If all parameters are provided, fetch the details
  if (roomId && slotId && date) {
    room = await getRoomById(roomId);
    if (!room) {
      return (
        <div className="max-w-2xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              ❌ Sala no encontrada
            </h2>
            <p className="text-red-700 mb-4">
              La sala que intentas reservar no existe o ha sido desactivada.
            </p>
            <a
              href="/blocks"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver a seleccionar sala
            </a>
          </div>
        </div>
      );
    }

    block = await getBlockById(room.block_id);

    const slots = await getSlots();
    slot = slots.find((s) => s.id === slotId);
    if (!slot) {
      return (
        <div className="max-w-2xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              ❌ Franja no encontrada
            </h2>
            <p className="text-red-700 mb-4">
              La franja horaria que intentas reservar no existe.
            </p>
            <a
              href="/blocks"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver a seleccionar sala
            </a>
          </div>
        </div>
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return (
        <div className="max-w-2xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              ❌ Fecha inválida
            </h2>
            <p className="text-red-700 mb-4">
              El formato de fecha no es válido.
            </p>
            <a
              href="/blocks"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver a seleccionar sala
            </a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nueva Reserva
        </h1>
        <p className="text-gray-600">
          Completa los detalles de tu reserva de sala
        </p>
      </div>

      <NewReservationForm
        prefilledRoomId={roomId}
        prefilledSlotId={slotId}
        prefilledDate={date}
        room={room}
        slot={slot}
        block={block}
      />
    </div>
  );
}
