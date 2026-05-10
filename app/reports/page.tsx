'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { OccupancyReportRow } from '@/lib/types';

const ReportsPage: React.FC = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [blockId, setBlockId] = useState('');
  const [blocks, setBlocks] = useState<Array<{ id: string; name: string }>>([]);
  const [reportData, setReportData] = useState<OccupancyReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch blocks on mount
  React.useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await fetch('/api/blocks');
        if (response.ok) {
          const data = await response.json();
          setBlocks(data);
        }
      } catch (err) {
        console.error('Error fetching blocks:', err);
      }
    };
    fetchBlocks();
  }, []);

  const handleGenerateReport = async () => {
    // Validation
    if (!fromDate || !toDate) {
      setError('Por favor selecciona rango de fechas');
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      setError('Fecha fin no puede ser antes de fecha inicio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from_date: fromDate,
        to_date: toDate,
        format: 'json',
        ...(blockId && { block_id: blockId }),
      });

      const response = await fetch(`/api/reports/occupancy?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Error al generar reporte'
        );
      }

      const data = await response.json();
      setReportData(data);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte');
      setReportData([]);
      setShowPreview(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams({
        from_date: fromDate,
        to_date: toDate,
        format: 'csv',
        ...(blockId && { block_id: blockId }),
      });

      const response = await fetch(`/api/reports/occupancy?${params}`);

      if (!response.ok) {
        throw new Error('Error al descargar reporte');
      }

      // Get filename from Content-Disposition header
      const disposition = response.headers.get('content-disposition');
      let filename = 'reporte-ocupacion.csv';
      if (disposition) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches) filename = matches[1];
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al descargar reporte');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reporte de Ocupación
          </h1>
          <p className="text-gray-600 mt-2">
            Genera y exporta reportes de uso de salones
          </p>
        </div>

        {/* Filters Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Block Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bloque
              </label>
              <select
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los bloques</option>
                {blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    Bloque {block.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {/* Generate button */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </Button>

            {showPreview && reportData.length > 0 && (
              <Button
                onClick={handleDownloadCSV}
                variant="secondary"
                className="flex-1 sm:flex-none"
              >
                Descargar CSV
              </Button>
            )}
          </div>
        </Card>

        {/* Preview Table */}
        {showPreview && reportData.length > 0 && (
          <Card className="p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">
              Vista Previa ({reportData.length} registros)
            </h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium">Fecha</th>
                  <th className="px-4 py-2 text-left font-medium">Bloque</th>
                  <th className="px-4 py-2 text-left font-medium">Salón</th>
                  <th className="px-4 py-2 text-left font-medium">Franja</th>
                  <th className="px-4 py-2 text-left font-medium">Profesor</th>
                  <th className="px-4 py-2 text-left font-medium">Materia</th>
                  <th className="px-4 py-2 text-left font-medium">Grupo</th>
                  <th className="px-4 py-2 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{row.fecha}</td>
                    <td className="px-4 py-2">{row.bloque}</td>
                    <td className="px-4 py-2 font-medium">{row.salon}</td>
                    <td className="px-4 py-2">{row.codigo}</td>
                    <td className="px-4 py-2">{row.franja}</td>
                    <td className="px-4 py-2">{row.profesor}</td>
                    <td className="px-4 py-2">{row.materia}</td>
                    <td className="px-4 py-2">{row.grupo}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.estado === 'Confirmada'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {row.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Empty state */}
        {showPreview && reportData.length === 0 && !error && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">
              No hay reservas confirmadas para el período seleccionado
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
