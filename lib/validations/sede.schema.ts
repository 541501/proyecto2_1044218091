import { z } from 'zod';

export const CrearSedeSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Nombre minimo 2 caracteres')
    .max(50, 'Nombre maximo 50 caracteres'),
  ubicacion: z
    .string()
    .min(5, 'Ubicacion minimo 5 caracteres')
    .max(200, 'Ubicacion maximo 200 caracteres'),
});

export type CrearSedeInput = z.infer<typeof CrearSedeSchema>;

export const ActualizarSedeSchema = CrearSedeSchema.partial();

export type ActualizarSedeInput = z.infer<typeof ActualizarSedeSchema>;

export const CrearBloqueSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(50),
  sedeId: z.string().cuid('ID de sede invalido'),
});

export type CrearBloqueInput = z.infer<typeof CrearBloqueSchema>;

export const CrearSalonSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(50),
  capacidad: z.number().int().min(1, 'Capacidad minimo 1').max(500, 'Capacidad maximo 500'),
  bloqueId: z.string().cuid('ID de bloque invalido'),
});

export type CrearSalonInput = z.infer<typeof CrearSalonSchema>;
