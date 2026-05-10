'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { SafeUser } from '@/lib/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'profesor' | 'coordinador' | 'admin'>(
    'profesor'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear usuario');
      }

      const result = await response.json();
      setTempPassword(result.temporaryPassword);
      setName('');
      setEmail('');
      setRole('profesor');
      
      // Call success after showing password
      setTimeout(() => {
        onSuccess();
        setTempPassword(null);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 mx-4">
        <h2 className="text-lg font-semibold mb-4">Crear nuevo usuario</h2>

        {tempPassword ? (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Usuario creado exitosamente
            </p>
            <div className="bg-white p-2 rounded border border-blue-300 font-mono text-sm mb-4">
              {tempPassword}
            </div>
            <p className="text-xs text-blue-700 mb-4">
              Contraseña temporal. El usuario deberá cambiarla al primer login.
            </p>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
              }}
              className="w-full"
            >
              Copiar contraseña
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="profesor">Profesor</option>
                <option value="coordinador">Coordinador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
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

        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId ? { ...u, is_active: !currentStatus } : u
          )
        );
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-600 mt-2">Gestión de cuentas de usuario</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + Nuevo usuario
          </Button>
        </div>

        {/* Users Table */}
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 text-left font-medium">Nombre</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Rol</th>
                <th className="px-4 py-2 text-left font-medium">Estado</th>
                <th className="px-4 py-2 text-left font-medium">Última sesión</th>
                <th className="px-4 py-2 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : 'Nunca'}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      variant={user.is_active ? 'secondary' : 'primary'}
                      className="text-xs"
                    >
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay usuarios registrados
            </div>
          )}
        </Card>
      </div>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={async () => {
          const res = await fetch('/api/users');
          if (res.ok) {
            setUsers(await res.json());
          }
        }}
      />
    </AppLayout>
  );
};

export default UsersPage;
