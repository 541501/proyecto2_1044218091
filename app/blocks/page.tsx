'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import BlockCard from '@/components/blocks/BlockCard';
import { Block } from '@/lib/types';

export default function BlocksPage() {
  const searchParams = useSearchParams();
  const [date, setDate] = useState(() => {
    const param = searchParams.get('date');
    if (param) return param;
    // Get Monday of current week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    today.setDate(diff);
    return today.toISOString().split('T')[0];
  });

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockAvailability, setBlockAvailability] = useState<
    Record<string, { availableRooms: number; totalRooms: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const blocksRes = await fetch('/api/blocks');
        if (!blocksRes.ok) throw new Error('Error fetching blocks');
        const blocksData = await blocksRes.json();
        setBlocks(blocksData);

        // Fetch availability for each block
        const availability: Record<string, { availableRooms: number; totalRooms: number }> = {};
        for (const block of blocksData) {
          const availRes = await fetch(
            `/api/blocks/${block.id}/availability?date=${date}`
          );
          if (availRes.ok) {
            const data = await availRes.json();
            availability[block.id] = {
              availableRooms: data.roomsAvailable,
              totalRooms: data.roomsTotal,
            };
          }
        }
        setBlockAvailability(availability);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error unknown');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Bloques Académicos
            </h1>
            <p className="text-slate-600">
              Consulta la disponibilidad de salones por bloque
            </p>
          </div>

          {/* Date Picker */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Selecciona una fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  const day = today.getDay();
                  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                  today.setDate(diff);
                  setDate(today.toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Semana actual
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="mt-2 text-slate-600">Cargando bloques...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Blocks Grid */}
          {!loading && blocks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blocks.map((block) => (
                <BlockCard
                  key={block.id}
                  blockId={block.id}
                  blockCode={block.code}
                  blockName={block.name}
                  availableRooms={blockAvailability[block.id]?.availableRooms || 0}
                  totalRooms={blockAvailability[block.id]?.totalRooms || 0}
                  date={date}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && blocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No hay bloques disponibles</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
