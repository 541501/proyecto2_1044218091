import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import Providers from '@/components/providers/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'ClassSport - Gestión de Salones Universitarios',
  description: 'Sistema inteligente de reserva de salones de clase con bloqueo de horarios en tiempo real',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const description =
    typeof metadata.description === 'string'
      ? metadata.description
      : 'Sistema inteligente de reserva de salones de clase';

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="description" content={description} />
        {/* Preconnect a APIs externas si es necesario */}
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* SessionProvider obtiene sesión del backend próximo */}
        <SessionProvider>
          {/* QueryClientProvider envuelve toda la app para TanStack Query */}
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
