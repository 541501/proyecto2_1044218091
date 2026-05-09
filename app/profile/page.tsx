'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>('profesor');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUserProfile(meData);
        setUserRole(meData.role);

        const modeRes = await fetch('/api/system/mode');
        if (modeRes.ok) {
          const modeData = await modeRes.json();
          setIsSeeding(modeData.mode === 'seed');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Error al cambiar la contraseña' });
        setIsChangingPassword(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error desconocido',
      });
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout userRole={userRole} isSeeding={isSeeding}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 h-8 w-8 mb-4"></div>
            <p className="text-slate-600">Cargando perfil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={userRole} isSeeding={isSeeding}>
      <div className="mb-8">
        <h1 className="section-title">Mi Perfil</h1>
        <p className="mt-2 text-slate-600">Gestiona tu información y contraseña</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre</label>
                <p className="mt-1 text-slate-900">{userProfile?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Correo</label>
                <p className="mt-1 text-slate-900">{userProfile?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Rol</label>
                <p className="mt-1 text-slate-900 capitalize">{userProfile?.role || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={isChangingPassword}
                disabled={isChangingPassword}
              >
                Cambiar Contraseña
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-4">Cerrar tu sesión</p>
            <Button
              variant="secondary"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
            >
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
