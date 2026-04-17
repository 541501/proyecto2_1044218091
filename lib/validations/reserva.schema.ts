import { z } from 'zod';

function parseHoraMinutos(hora: string) {
  const [h = NaN, m = NaN] = hora.split(':').map(Number);
  return { h, m, total: h * 60 + m };
}

export const CrearReservaSchema = z.object({
  salonId: z.string().cuid('ID de salon invalido'),
  fecha: z
    .string()
    .date('Formato de fecha invalido (YYYY-MM-DD)')
    .refine((fecha) => {
      const fechaObj = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaObj >= hoy;
    }, 'La fecha no puede ser anterior a hoy'),
  horaInicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM requerido')
    .refine((hora) => {
      const { h } = parseHoraMinutos(hora);
      return h >= 6 && h < 22;
    }, 'Horario de clases: 06:00 - 21:59'),
  horaFin: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM requerido')
    .refine((hora) => {
      const { h } = parseHoraMinutos(hora);
      return h >= 6 && h < 22;
    }, 'Horario de clases: 06:00 - 21:59'),
  nombreClase: z
    .string()
    .min(3, 'Nombre de clase: minimo 3 caracteres')
    .max(100, 'Nombre de clase: maximo 100 caracteres'),
  descripcion: z
    .string()
    .max(500, 'Descripcion: maximo 500 caracteres')
    .optional(),
});

export const CrearReservaSchemaRefinado = CrearReservaSchema
  .refine((data) => parseHoraMinutos(data.horaFin).total > parseHoraMinutos(data.horaInicio).total, {
    message: 'horaFin debe ser posterior a horaInicio',
    path: ['horaFin'],
  })
  .refine((data) => parseHoraMinutos(data.horaFin).total - parseHoraMinutos(data.horaInicio).total >= 30, {
    message: 'Duracion minima: 30 minutos',
    path: ['horaFin'],
  })
  .refine((data) => parseHoraMinutos(data.horaFin).total - parseHoraMinutos(data.horaInicio).total <= 240, {
    message: 'Duracion maxima: 4 horas',
    path: ['horaFin'],
  });

export type CrearReservaInput = z.infer<typeof CrearReservaSchemaRefinado>;

export const CancelarReservaSchema = z.object({
  razon: z.string().max(200, 'Razon maximo 200 caracteres').optional(),
});

export type CancelarReservaInput = z.infer<typeof CancelarReservaSchema>;

export const FiltrosReservaSchema = z.object({
  estado: z.enum(['CONFIRMADA', 'CANCELADA']).optional(),
  fechaDesde: z.string().date().optional(),
  fechaHasta: z.string().date().optional(),
  salonId: z.string().cuid().optional(),
  usuarioId: z.string().cuid().optional(),
});

export type FiltrosReserva = z.infer<typeof FiltrosReservaSchema>;
