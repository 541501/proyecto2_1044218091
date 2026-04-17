/**
 * lib/validations/reserva.schema.ts
 *
 * Validación de Zod para operaciones de reserva
 * Single source of truth para tipos e inputs
 */

import { z } from 'zod';

/**
 * Schema para crear una nueva reserva
 * Validaciones:
 * - salonId: CUID válido
 * - fecha: fecha válida, no en pasado
 * - horaInicio: formato HH:MM, entre 06:00-22:00
 * - horaFin: formato HH:MM, > horaInicio, máx duración 4h
 * - nombreClase: 3-100 caracteres
 * - descripcion: opcional, máx 500
 */
export const CrearReservaSchema = z.object({
  salonId: z
    .string()
    .cuid('ID de salón inválido'),
  fecha: z
    .string()
    .date('Formato de fecha inválido (YYYY-MM-DD)')
    .refine(
      (fecha) => {
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return fechaObj >= hoy;
      },
      {
        message:
          'La fecha no puede ser anterior a hoy',
      }
    ),
  horaInicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM requerido')
    .refine(
      (hora) => {
        const [h, m] = hora.split(':').map(Number);
        return h >= 6 && h < 22;
      },
      {
        message:
          'Horario de clases: 06:00 — 21:59',
      }
    ),
  horaFin: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM requerido')
    .refine(
      (hora) => {
        const [h, m] = hora.split(':').map(Number);
        return h >= 6 && h < 22;
      },
      {
        message:
          'Horario de clases: 06:00 — 21:59',
      }
    ),
  nombreClase: z
    .string()
    .min(
      3,
      'Nombre de clase: mínimo 3 caracteres'
    )
    .max(
      100,
      'Nombre de clase: máximo 100 caracteres'
    ),
  descripcion: z
    .string()
    .max(
      500,
      'Descripción: máximo 500 caracteres'
    )
    .optional(),
});

/**
 * Refinamiento: verificar que horaFin > horaInicio
 * y que la duración está entre 30 min y 4 horas
 */
export const CrearReservaSchemaRefinado =
  CrearReservaSchema.refine(
    (data) => {
      const [h1, m1] = data.horaInicio
        .split(':')
        .map(Number);
      const [h2, m2] = data.horaFin
        .split(':')
        .map(Number);

      const minutoInicio = h1 * 60 + m1;
      const minutoFin = h2 * 60 + m2;

      return minutoFin > minutoInicio;
    },
    {
      message:
        'horaFin debe ser posterior a horaInicio',
      path: ['horaFin'],
    }
  )
  .refine(
    (data) => {
      const [h1, m1] = data.horaInicio
        .split(':')
        .map(Number);
      const [h2, m2] = data.horaFin
        .split(':')
        .map(Number);

      const minutoInicio = h1 * 60 + m1;
      const minutoFin = h2 * 60 + m2;
      const duracion = minutoFin - minutoInicio;

      return duracion >= 30;
    },
    {
      message: 'Duración mínima: 30 minutos',
      path: ['horaFin'],
    }
  )
  .refine(
    (data) => {
      const [h1, m1] = data.horaInicio
        .split(':')
        .map(Number);
      const [h2, m2] = data.horaFin
        .split(':')
        .map(Number);

      const minutoInicio = h1 * 60 + m1;
      const minutoFin = h2 * 60 + m2;
      const duracion = minutoFin - minutoInicio;

      return duracion <= 4 * 60; // 4 horas
    },
    {
      message: 'Duración máxima: 4 horas',
      path: ['horaFin'],
    }
  );

export type CrearReservaInput = z.infer<
  typeof CrearReservaSchemaRefinado
>;

/**
 * Schema para cancelar reserva
 * Solo requiere la razón (opcional)
 */
export const CancelarReservaSchema = z.object({
  razon: z
    .string()
    .max(
      200,
      'Razón máximo 200 caracteres'
    )
    .optional(),
});

export type CancelarReservaInput = z.infer<
  typeof CancelarReservaSchema
>;

/**
 * Schema para listar reservas con filtros
 */
export const FiltrosReservaSchema = z.object({
  estado: z
    .enum(['CONFIRMADA', 'CANCELADA'])
    .optional(),
  fechaDesde: z
    .string()
    .date()
    .optional(),
  fechaHasta: z
    .string()
    .date()
    .optional(),
  salonId: z.string().cuid().optional(),
  usuarioId: z.string().cuid().optional(),
});

export type FiltrosReserva = z.infer<
  typeof FiltrosReservaSchema
>;
