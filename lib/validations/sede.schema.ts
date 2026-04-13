/**
 * lib/validations/sede.schema.ts
 */

import { z } from 'zod';

export const CrearSedeSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Nombre mínimo 2 caracteres')
    .max(50, 'Nombre máximo 50 caracteres'),
  descripcion: z
    .string()
    .max(200, 'Descripción máximo 200 caracteres')
    .optional(),
  direccion: z
    .string()
    .min(5, 'Dirección mínimo 5 caracteres')
    .max(200, 'Dirección máximo 200 caracteres'),
});

export type CrearSedeInput = z.infer<
  typeof CrearSedeSchema
>;

export const ActualizarSedeSchema =
  CrearSedeSchema.partial();

export type ActualizarSedeInput = z.infer<
  typeof ActualizarSedeSchema
>;

/**
 * Schema para crear bloque
 */
export const CrearBloqueSchema = z.object({
  nombre: z
    .string()
    .min(1, 'Nombre requerido')
    .max(50),
  descripcion: z
    .string()
    .max(200)
    .optional(),
  sedeId: z
    .string()
    .cuid('ID de sede inválido'),
});

export type CrearBloqueInput = z.infer<
  typeof CrearBloqueSchema
>;

/**
 * Schema para crear salón
 */
export const CrearSalonSchema = z.object({
  nombre: z
    .string()
    .min(1, 'Nombre requerido')
    .max(50),
  capacidad: z
    .number()
    .int()
    .min(1, 'Capacidad mínimo 1')
    .max(500, 'Capacidad máximo 500'),
  bloqueId: z
    .string()
    .cuid('ID de bloque inválido'),
});

export type CrearSalonInput = z.infer<
  typeof CrearSalonSchema
>;
