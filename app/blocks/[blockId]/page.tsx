'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import RoomCard from '@/components/blocks/RoomCard';
import { Room } from '@/lib/types';

interface RoomWithAvailability extends Room {
  availableSlots: number;
  totalSlots: number;
}

export default function BlockDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const blockId = params.blockId as string;
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [blockName, setBlockName] = useState<string>('');
  const [rooms, setRooms] = useState<RoomWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch block info
        const blockRes = await fetch(`/api/blocks/${blockId}`);
        if (blockRes.ok) {
          const blockData = await blockRes.json();
          setBlockName(blockData.name);
        }

        // Fetch rooms in block
        const roomsRes = await fetch(`/api/rooms?block=${blockId}`);
        if (!roomsRes.ok) throw new Error('Error fetching rooms');
        const roomsData = await roomsRes.json();

        // Fetch calendar for each room to get slot availability
        const roomsWithAvail = await Promise.all(
          roomsData.map(async (room: Room) => {
            const calRes = await fetch(
              `/api/rooms/${room.id}/calendar?weekStart=${date}`
            );
            let availableSlots = 0;
            let totalSlots = 6; // Fixed number of slots

            if (calRes.ok) {
              const calendar = await calRes.json();
              // Count available slots for today (first day)
              if (calendar.days && calendar.days.length > 0) {
                const today = calendar.days[0];
                availableSlots = today.slots.filter(
                  (s: any) => s.status === 'libre'
                ).length;
              }
            }

            return {
              ...room,
              availableSlots,
              totalSlots,
            };
          })
        );

        setRooms(roomsWithAvail);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error unknown');
      } finally {
        setLoading(false);
      }
    };

    if (blockId) {
      fetchData();
    }
  }, [blockId, date]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <a href="/blocks" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
              ← Volver a bloques
            </a>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Bloque {blockName}
            </h1>
            <p className="text-slate-600">
              Salones disponibles el {new Date(date + 'T00:00:00').toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="mt-2 text-slate-600">Cargando salones...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Rooms Grid */}
          {!loading && rooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  roomId={room.id}
                  code={room.code}
                  type={room.type}
                  capacity={room.capacity}
                  equipment={room.equipment || undefined}
                  availableSlots={room.availableSlots}
                  totalSlots={room.totalSlots}
                  blockId={blockId}
                  isActive={room.is_active}
                  date={date}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && rooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No hay salones disponibles en este bloque</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
