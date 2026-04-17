'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { LoginSchema, type LoginInput } from '@/lib/validations/usuario.schema';

type LoginFormData = LoginInput;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError('Correo no autorizado o credenciales incorrectas');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Error al iniciar sesion. Intenta de nuevo.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">ClassSport</h1>
        <p className="mt-2 text-sm text-slate-600">Acceso solo para cuentas autorizadas por administracion</p>
      </div>

      <div className="rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Iniciar sesion</h2>

        {error && (
          <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Iniciando sesion...
              </>
            ) : (
              'Iniciar sesion'
            )}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
          Solo las cuentas agregadas previamente por un administrador pueden registrarse e iniciar sesion.
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">
        Si tu correo ya fue autorizado,{' '}
        <Link href="/registro" className="font-semibold text-blue-600 hover:text-blue-700">
          completa tu registro aqui
        </Link>
      </p>
    </div>
  );
}
