import { QueryClient } from '@tanstack/react-query';

/**
 * Crea una nueva instancia de QueryClient con configuración óptima para ClassSport
 * 
 * Estrategia de cache:
 * - staleTime: 60s — datos considerados "frescos" por 1 minuto
 * - gcTime: 5min — keep unused queries en memoria por 5 min
 * - retry: 2 intentos — retry automático en NetworkError pero no en 4xx/5xx
 * 
 * Para reservas en particular, revalidamos cada 60s con refetchInterval en CalendarioSalon
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 segundos — re-request después de esto
        gcTime: 5 * 60 * 1000, // 5 minutos (anteriormente cacheTime)
        retry: (failureCount, error) => {
          // No reintentar errores 401/403 (auth), ni 404 (not found), ni 409 (conflict)
          if (error instanceof Error) {
            const status = (error as any).status;
            if (status === 401 || status === 403 || status === 404 || status === 409) {
              return false;
            }
          }
          // Reintentar máx 2 veces para network errors
          return failureCount < 2;
        },
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });

let clientQueryClientSingleton: QueryClient | undefined;

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: siempre crear nueva instancia (sin persista)
    return createQueryClient();
  }

  // Browser: singleton para evitar múltiples instancias
  if (!clientQueryClientSingleton) clientQueryClientSingleton = createQueryClient();
  return clientQueryClientSingleton;
};
