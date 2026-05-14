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
    <div className="min-h-screen bg-gradient-to-br from-[#001d4d] via-[#003d99] to-[#0f1729] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md bg-white/10 border border-white/20">
          {/* Left Section - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-900 p-12 text-white"
          >
            {/* Logo and Title */}
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="10"
                      y="12"
                      width="32"
                      height="32"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="18"
                      y1="12"
                      x2="18"
                      y2="44"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="26"
                      y1="12"
                      x2="26"
                      y2="44"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="34"
                      y1="12"
                      x2="34"
                      y2="44"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="10"
                      y1="20"
                      x2="42"
                      y2="20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="10"
                      y1="28"
                      x2="42"
                      y2="28"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="10"
                      y1="36"
                      x2="42"
                      y2="36"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points="26,6 36,12 16,12"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">ClassSport</h2>
                  <p className="text-blue-100 text-xs">Gestión Inteligente</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold mb-3">
                  Bienvenido a ClassSport
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  La plataforma más moderna para la gestión de salones universitarios. Administra espacios, horarios y reservas de forma eficiente.
                </p>
              </motion.div>
            </div>

            {/* Features list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                <span className="text-sm">Gestión en tiempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                <span className="text-sm">Reportes inteligentes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                <span className="text-sm">Seguridad avanzada</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Section - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="p-8 md:p-12 flex flex-col justify-center bg-white/95 backdrop-blur"
          >
            {/* Header */}
            <div className="md:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="10"
                    y="12"
                    width="32"
                    height="32"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <line
                    x1="18"
                    y1="12"
                    x2="18"
                    y2="44"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="26"
                    y1="12"
                    x2="26"
                    y2="44"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="34"
                    y1="12"
                    x2="34"
                    y2="44"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="10"
                    y1="20"
                    x2="42"
                    y2="20"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="10"
                    y1="28"
                    x2="42"
                    y2="28"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="10"
                    y1="36"
                    x2="42"
                    y2="36"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="26,6 36,12 16,12"
                    fill="white"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ClassSport</h1>
            </div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Inicia Sesión
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-600 mb-8"
            >
              Accede a tu cuenta para gestionar salones
            </motion.p>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@classsport.edu.co"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </motion.div>

              {/* Password field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </motion.div>

              {/* Submit button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-8 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 pt-6 border-t border-gray-200"
            >
              <p className="text-center text-xs text-gray-500">
                Institución Universitaria - ClassSport © 2026
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
