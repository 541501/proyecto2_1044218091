'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

interface DiagnosticData {
  supabaseConnected: boolean;
  blobConnected: boolean;
  migrationsApplied: string[];
  pendingMigrations: string[];
  tableCount: {
    users: number;
    blocks: number;
    slots: number;
    rooms: number;
    reservations: number;
  };
}

const DbSetupPage: React.FC = () => {
  const router = useRouter();
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');
  const [bootstrapMessage, setBootstrapMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authorization
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUserRole(meData.role);

        if (meData.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        // Get diagnostic data (for now, show placeholder)
        setDiagnosticData({
          supabaseConnected: false,
          blobConnected: false,
          migrationsApplied: [],
          pendingMigrations: [
            '0001_init_users.sql',
            '0002_init_spaces.sql',
            '0003_init_reservations.sql',
          ],
          tableCount: {
            users: 0,
            blocks: 0,
            slots: 0,
            rooms: 0,
            reservations: 0,
          },
        });
      } catch (error) {
        console.error('Error fetching diagnostic data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleBootstrap = async () => {
    setIsBootstrapping(true);
    setBootstrapMessage('Aplicando migrations...');

    try {
      const response = await fetch('/api/system/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setBootstrapMessage(
          `✓ Bootstrap completado: ${data.appliedMigrations} migrations aplicadas, 1 usuario admin, 3 bloques, 6 franjas, 4 salones.`
        );
        
        // Refresh diagnostic data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const error = await response.json();
        setBootstrapMessage(`✗ Error: ${error.error || 'Bootstrap failed'}`);
      }
    } catch (error) {
      setBootstrapMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBootstrapping(false);
      setShowConfirmModal(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout userRole={userRole}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 h-8 w-8 mb-4"></div>
            <p className="text-slate-600">Cargando diagnóstico...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={userRole} isSeeding={true}>
      <div className="mb-8">
        <h1 className="section-title">Configuración del Sistema</h1>
        <p className="mt-2 text-slate-600">Diagnóstico y bootstrap de la base de datos</p>
      </div>

      <div className="grid gap-6">
        {/* Diagnostic Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Conexiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">Supabase Postgres</span>
                <Badge variant={diagnosticData?.supabaseConnected ? 'success' : 'danger'}>
                  {diagnosticData?.supabaseConnected ? '✓ Conectado' : '✗ No conectado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">Vercel Blob</span>
                <Badge variant={diagnosticData?.blobConnected ? 'success' : 'danger'}>
                  {diagnosticData?.blobConnected ? '✓ Conectado' : '✗ No conectado'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migrations Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Migrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(diagnosticData?.migrationsApplied?.length ?? 0) === 0 && (
                <div className="text-slate-600">
                  <p className="font-medium mb-3">Migrations Pendientes:</p>
                  <ul className="space-y-2">
                    {(diagnosticData?.pendingMigrations ?? []).map((m) => (
                      <li key={m} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">→</span>
                        <span className="font-mono">{m}</span>
                        <Badge variant="warning" className="ml-auto">
                          Pendiente
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(diagnosticData?.migrationsApplied?.length ?? 0) > 0 && (
                <div className="text-slate-600">
                  <p className="font-medium mb-3">Migrations Aplicadas:</p>
                  <ul className="space-y-2">
                    {(diagnosticData?.migrationsApplied ?? []).map((m) => (
                      <li key={m} className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span className="font-mono">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              El bootstrap aplicará 3 migrations e insertará:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-bold text-blue-600">1</span>
                <span>usuario admin (admin@classsport.edu.co)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-blue-600">3</span>
                <span>bloques (A, B, C)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-blue-600">6</span>
                <span>franjas horarias (07:00-20:00 en bloques de 2 horas)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-blue-600">4</span>
                <span>salones de demo (A-101, A-102, B-201, C-301)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Bootstrap Action */}
        {(diagnosticData?.pendingMigrations?.length ?? 0) > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Bootstrap Disponible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 mb-4">
                Todo está listo para ejecutar el bootstrap y pasar a modo producción.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                onClick={() => setShowConfirmModal(true)}
                disabled={isBootstrapping}
                isLoading={isBootstrapping}
              >
                Ejecutar Bootstrap
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Bootstrap Message */}
        {bootstrapMessage && (
          <Card
            className={bootstrapMessage.startsWith('✓') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
          >
            <CardContent className="pt-6">
              <p
                className={
                  bootstrapMessage.startsWith('✓')
                    ? 'text-green-800'
                    : 'text-red-800'
                }
              >
                {bootstrapMessage}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Bootstrap"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isBootstrapping}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleBootstrap}
              isLoading={isBootstrapping}
            >
              Confirmar Bootstrap
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-900 font-medium">
            ¿Estás seguro de que deseas ejecutar el bootstrap?
          </p>
          <p className="text-slate-600 text-sm">
            Esta operación aplicará las 3 migrations de base de datos e insertará los datos iniciales (1 admin, 3 bloques, 6 franjas, 4 salones).
          </p>
          <p className="text-slate-600 text-sm">
            Esta acción solo puede realizarse una vez. Los datos insertados permanecerán en la base de datos.
          </p>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-mono text-yellow-900">
              ⚠️ No se puede deshacer. Asegúrate de que las variables de entorno están correctamente configuradas.
            </p>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default DbSetupPage;
