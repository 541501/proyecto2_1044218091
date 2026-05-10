'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { WeekNavigator } from '@/components/blocks/WeeklyCalendar';
import { WeeklyCalendarGrid, WeeklyCalendarAccordion } from '@/components/blocks/WeeklyCalendar';
import type { WeeklyCalendar } from '@/lib/availabilityService';

export default function RoomDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const blockId = params.blockId as string;
  const roomId = params.roomId as string;
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Calculate week start (Monday) from the given date
  const getWeekStart = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  };

  const [weekStart, setWeekStart] = useState(getWeekStart(initialDate));
  const [roomCode, setRoomCode] = useState<string>('');
  const [calendar, setCalendar] = useState<WeeklyCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch room info
        const roomRes = await fetch(`/api/rooms/${roomId}`);
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setRoomCode(roomData.code);
        }

        // Fetch calendar
        const calRes = await fetch(
          `/api/rooms/${roomId}/calendar?weekStart=${weekStart}`
        );
        if (!calRes.ok) throw new Error('Error fetching calendar');
        const calData = await calRes.json();
        setCalendar(calData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error unknown');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchData();
    }
  }, [roomId, weekStart]);

  const handleSelectSlot = (slotId: string, date: string) => {
    // Navigate to reservation creation page with pre-filled parameters
    const params = new URLSearchParams({
      roomId: roomId,
      slotId: slotId,
      date: date,
    });
    window.location.href = `/reservations/new?${params.toString()}`;
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <a href={`/blocks/${blockId}?date=${weekStart}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
              ← Volver al bloque
            </a>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Salón {roomCode}
            </h1>
            <p className="text-slate-600">
              Disponibilidad semanal
            </p>
          </div>

          {/* Week Navigator */}
          <WeekNavigator
            weekStart={weekStart}
            onWeekChange={setWeekStart}
          />

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="mt-2 text-slate-600">Cargando calendario...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Calendar */}
          {!loading && calendar && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              {isMobile ? (
                <div className="p-4">
                  <WeeklyCalendarAccordion
                    calendar={calendar}
                    onSelectSlot={handleSelectSlot}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <WeeklyCalendarGrid
                    calendar={calendar}
                    onSelectSlot={handleSelectSlot}
                  />
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Leyenda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-green-100 border border-green-300"></div>
                <span className="text-sm text-slate-700">Disponible</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-red-100 border border-red-300"></div>
                <span className="text-sm text-slate-700">Ocupado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-slate-100 border border-slate-300"></div>
                <span className="text-sm text-slate-700">Pasado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
