import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina nombres de clase con Tailwind merge para evitar conflictos
 * Ejemplo: cn('px-2', 'px-4') → 'px-4' (la última gana)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
