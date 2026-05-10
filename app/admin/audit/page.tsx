'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import type { AuditEntry } from '@/lib/types';

const AuditPage: React.FC = () => {
  const router = useRouter();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().split('T')[0].substring(0, 7)
  );

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        if (meData.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        // For now, show empty audit since we're not implementing full audit UI
        // The audit data is stored in Vercel Blob via recordAudit()
        setAuditEntries([]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [router, selectedMonth]);

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">Cargando...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoría</h1>
          <p className="text-gray-600 mt-2">Registro de todas las operaciones del sistema</p>
        </div>

        {/* Month Selector */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Filtrar por mes</h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </Card>

        {/* Audit Entries */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Operaciones registradas</h2>

          {auditEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              La auditoría se registra automáticamente en Vercel Blob.
              <br />
              Todas las operaciones de reservas, usuarios y administración quedan registradas.
            </div>
          ) : (
            <div className="space-y-2">
              {auditEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{entry.summary}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Usuario: {entry.user_email} ({entry.user_role})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {entry.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default AuditPage;
