'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';

interface BlockCardProps {
  blockId: string;
  blockCode: string;
  blockName: string;
  availableRooms: number;
  totalRooms: number;
  date: string;
}

const BlockCard: React.FC<BlockCardProps> = ({
  blockId,
  blockCode,
  blockName,
  availableRooms,
  totalRooms,
  date,
}) => {
  const router = useRouter();
  const occupancyPercent = totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0;

  let borderColor = 'border-green-200';
  let badgeVariant: 'success' | 'warning' | 'danger' = 'success';

  if (occupancyPercent <= 25) {
    borderColor = 'border-red-200';
    badgeVariant = 'danger';
  } else if (occupancyPercent <= 66) {
    borderColor = 'border-amber-200';
    badgeVariant = 'warning';
  }

  return (
    <button
      onClick={() => router.push(`/blocks/${blockId}?date=${date}`)}
      className={`rounded-lg border-2 ${borderColor} bg-white p-6 shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer`}
    >
      <div className="mb-4">
        <div className="text-4xl font-bold text-blue-600 mb-1">{blockCode}</div>
        <h3 className="text-lg font-semibold text-slate-900">{blockName}</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{availableRooms}</span>
          <span className="text-slate-500">de {totalRooms} salones disponibles</span>
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
        <div
          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${occupancyPercent}%` }}
        ></div>
      </div>

      <Badge variant={badgeVariant}>
        {occupancyPercent.toFixed(0)}% disponibilidad
      </Badge>
    </button>
  );
};

export default BlockCard;
