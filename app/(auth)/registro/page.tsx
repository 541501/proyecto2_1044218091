'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { AlertCircle, Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import { RegistroSchema, type RegistroInput } from '@/lib/validations/usuario.schema';

type RegistroFormData = RegistroInput;

export default function RegistroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(RegistroSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegistroFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || 'Error al registrarse. Intenta con un email diferente.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('Error al registrarse. Intenta de nuevo.');
      console.error('Registro error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Registro exitoso</h1>
          <p className="mt-2 text-slate-600">Tu cuenta ha sido creada. Redirigiendo a login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">ClassSport</h1>
        <p className="mt-2 text-sm text-slate-600">Crea tu cuenta si tu correo ya fue autorizado por administracion</p>
      </div>

      <div className="rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Registro</h2>

        {error && (
          <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nombre completo</label>
            <input
              type="text"
              placeholder="Juan Gutierrez"
              {...register('nombre')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Correo institucional</label>
            <input
              type="email"
              placeholder="nombre.apellido@usa.edu.co"
              {...register('email')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            <p className="mt-1 text-xs text-slate-500">
              Solo se permiten correos institucionales que terminen en @usa.edu.co
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ademas, el correo debe existir previamente en la lista autorizada por un administrador.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Contrasena</label>
            <input
              type="password"
              placeholder="********"
              {...register('password')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}

            {password && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-slate-600">Requisitos:</p>
                <div className="text-xs">
                  {/[A-Z]/.test(password) ? (
                    <p className="text-green-600">OK Contiene mayuscula</p>
                  ) : (
                    <p className="text-slate-400">Pendiente: contiene mayuscula</p>
                  )}
                  {/[0-9]/.test(password) ? (
                    <p className="text-green-600">OK Contiene numero</p>
                  ) : (
                    <p className="text-slate-400">Pendiente: contiene numero</p>
                  )}
                  {/[!@#$%^&*]/.test(password) ? (
                    <p className="text-green-600">OK Contiene caracter especial</p>
                  ) : (
                    <p className="text-slate-400">Pendiente: contiene caracter especial (!@#$%^&*)</p>
                  )}
                  {password.length >= 8 ? (
                    <p className="text-green-600">OK Minimo 8 caracteres</p>
                  ) : (
                    <p className="text-slate-400">Pendiente: minimo 8 caracteres</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirmar contrasena</label>
            <input
              type="password"
              placeholder="********"
              {...register('confirmPassword')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-600">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Inicia sesion aqui
        </Link>
      </p>
    </div>
  );
}
