/**
 * lib/validations/usuario.schema.ts
 */

import { z } from 'zod';

/**
 * Schema para registro de nuevo usuario (profesor)
 */
export const RegistroSchema = z
  .object({
    nombre: z
      .string()
      .min(2, 'Nombre mínimo 2 caracteres')
      .max(100, 'Nombre máximo 100 caracteres'),
    email: z
      .string()
      .email('Email inválido')
      .max(100),
    password: z
      .string()
      .min(
        8,
        'Contraseña mínimo 8 caracteres'
      )
      .regex(
        /[A-Z]/,
        'Debe contener al menos una mayúscula'
      )
      .regex(
        /[0-9]/,
        'Debe contener al menos un número'
      ),
    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    }
  );

export type RegistroInput = z.infer<typeof RegistroSchema>;

/**
 * Schema para login
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Contraseña requerida'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Schema para cambiar contraseña
 */
export const CambiarPasswordSchema = z
  .object({
    passwordActual: z.string(),
    passwordNueva: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(
        /[A-Z]/,
        'Al menos una mayúscula'
      )
      .regex(
        /[0-9]/,
        'Al menos un número'
      ),
    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.passwordNueva ===
      data.confirmPassword,
    {
      message: 'No coinciden',
      path: ['confirmPassword'],
    }
  )
  .refine(
    (data) =>
      data.passwordActual !==
      data.passwordNueva,
    {
      message:
        'Debe ser diferente a la actual',
      path: ['passwordNueva'],
    }
  );

export type CambiarPasswordInput = z.infer<
  typeof CambiarPasswordSchema
>;
