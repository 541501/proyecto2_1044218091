'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { AlertCircle, Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const registroSchema = z
  .object({
    nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener una mayúscula')
      .regex(/[0-9]/, 'Debe contener un número')
      .regex(/[!@#$%^&*]/, 'Debe contener un carácter especial (!@#$%^&*)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegistroFormData = z.infer<typeof registroSchema>;

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
    resolver: zodResolver(registroSchema),
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

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || 'Error al registrarse. Intenta con un email diferente.'
        );
        return;
      }

      setSuccess(true);
      // Redirigir a login después de 2 segundos
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
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">¡Registro exitoso!</h1>
          <p className="mt-2 text-slate-600">
            Tu cuenta ha sido creada. Redirigiendo a login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">ClassSport</h1>
        <p className="mt-2 text-sm text-slate-600">
          Crea tu cuenta para comenzar
        </p>
      </div>

      {/* Formulario */}
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Registro</h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Juan Pérez"
              {...register('nombre')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="profesor@universidad.edu"
              {...register('email')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}

            {/* Requisitos de contraseña */}
            {password && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-slate-600">Requisitos:</p>
                <div className="text-xs">
                  {/[A-Z]/.test(password) ? (
                    <p className="text-green-600">✓ Contiene mayúscula</p>
                  ) : (
                    <p className="text-slate-400">○ Contiene mayúscula</p>
                  )}
                  {/[0-9]/.test(password) ? (
                    <p className="text-green-600">✓ Contiene número</p>
                  ) : (
                    <p className="text-slate-400">○ Contiene número</p>
                  )}
                  {/[!@#$%^&*]/.test(password) ? (
                    <p className="text-green-600">✓ Contiene carácter especial</p>
                  ) : (
                    <p className="text-slate-400">○ Contiene carácter especial (!@#$%^&*)</p>
                  )}
                  {password.length >= 8 ? (
                    <p className="text-green-600">✓ Mínimo 8 caracteres</p>
                  ) : (
                    <p className="text-slate-400">○ Mínimo 8 caracteres</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>
      </div>

      {/* Link a login */}
      <p className="text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}
