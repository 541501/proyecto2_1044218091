'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';

interface RoomCardProps {
  roomId: string;
  code: string;
  type: string;
  capacity: number;
  equipment?: string;
  availableSlots: number;
  totalSlots: number;
  blockId: string;
  isActive: boolean;
  date?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  roomId,
  code,
  type,
  capacity,
  equipment,
  availableSlots,
  totalSlots,
  blockId,
  isActive,
  date = new Date().toISOString().split('T')[0],
}) => {
  const router = useRouter();

  const typeLabels: Record<string, string> = {
    salon: '🏫 Salón',
    laboratorio: '🔬 Laboratorio',
    auditorio: '📢 Auditorio',
    sala_computo: '💻 Sala de Cómputo',
    otro: '📦 Otro',
  };

  const handleClick = () => {
    if (isActive) {
      router.push(`/blocks/${blockId}/${roomId}?date=${date}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isActive}
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all text-left ${
        !isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-lg font-bold text-slate-900">{code}</h4>
            <p className="text-sm text-slate-600">{typeLabels[type] || type}</p>
          </div>
          {!isActive && (
            <Badge variant="danger">Inactivo</Badge>
          )}
        </div>
      </div>

      <div className="mb-3 text-sm">
        <p className="text-slate-600">
          👥 {capacity} personas
        </p>
        {equipment && (
          <p className="text-slate-600">
            🔧 {equipment}
          </p>
        )}
      </div>

      {isActive && (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Disponibilidad hoy</span>
            <span className="font-semibold text-slate-900">
              {availableSlots}/{totalSlots}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                availableSlots > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                width: `${availableSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </button>
  );
};

export default RoomCard;
