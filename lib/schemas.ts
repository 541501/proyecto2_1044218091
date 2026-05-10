import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const createReservationSchema = z.object({
  room_id: z.string().uuid('ID de salón inválido'),
  slot_id: z.string().uuid('ID de franja inválido'),
  reservation_date: z.string().date('Fecha inválida'),
  subject: z
    .string()
    .min(1, 'Materia requerida')
    .max(150, 'Materia demasiado larga'),
  group_name: z
    .string()
    .min(1, 'Grupo requerido')
    .max(50, 'Grupo demasiado largo'),
});

export const cancelReservationSchema = z.object({
  cancellation_reason: z.string().min(0).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;

