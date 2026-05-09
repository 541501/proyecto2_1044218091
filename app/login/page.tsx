'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error en el inicio de sesión');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1a2538] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Geometric pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1D4ED8_25%,transparent_25%),linear-gradient(-45deg,#1D4ED8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1D4ED8_75%),linear-gradient(-45deg,transparent_75%,#1D4ED8_75%)] bg-[length:60px_60px] bg-[position:0_0,30px_0,30px_-30px,0px_-30px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Card with top blue border */}
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-[#1D4ED8] overflow-hidden">
          {/* Card Content */}
          <div className="p-8">
            {/* Logo - Building icon */}
            <div className="flex justify-center mb-6">
              <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="10"
                  y="12"
                  width="32"
                  height="32"
                  stroke="#1D4ED8"
                  strokeWidth="2"
                />
                <line
                  x1="18"
                  y1="12"
                  x2="18"
                  y2="44"
                  stroke="#1D4ED8"
                  strokeWidth="1.5"
                />
                <line
                  x1="26"
                  y1="12"
                  x2="26"
                  y2="44"
                  stroke="#1D4ED8"
                  strokeWidth="1.5"
                />
                <line
                  x1="34"
                  y1="12"
                  x2="34"
                  y2="44"
                  stroke="#1D4ED8"
                  strokeWidth="1.5"
                />
                <line
                  x1="10"
                  y1="20"
                  x2="42"
                  y2="20"
                  stroke="#1D4ED8"
                  strokeWidth="1.5"
                />
                <line
                  x1="10"
                  y1="28"
                  x2="42"
                  y2="28"
                  stroke="#1D4ED8"
                  strokeWidth="1.5"
                />
                <line
                  x1="10"
                  y1="36"
                  x2="42"
                  y2="36"
                  stroke="#1D4ED8"
                  strokeWidth="1.5"
                />
                <polygon
                  points="26,6 36,12 16,12"
                  fill="#1D4ED8"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-center text-2xl font-bold text-[#0F172A] mb-1">
              ClassSport
            </h1>

            {/* Tagline */}
            <p className="text-center text-sm text-[#64748B] mb-8">
              Gestión de salones universitarios.
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#0F172A] mb-1"
                >
                  Correo
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@classsport.edu.co"
                  className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors"
                  required
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0F172A] mb-1"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs text-[#94A3B8] mt-8">
              Institución Universitaria
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
