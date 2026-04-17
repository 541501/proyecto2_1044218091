/**
 * lib/validations/usuario.schema.ts
 */

import { z } from 'zod';

const EMAIL_INSTITUCIONAL_DOMINIO = '@usa.edu.co';

export const emailInstitucionalSchema = z
  .string()
  .trim()
  .email('Email invalido')
  .max(100)
  .transform((email) => email.toLowerCase())
  .refine(
    (email) => email.endsWith(EMAIL_INSTITUCIONAL_DOMINIO),
    `El correo debe terminar en ${EMAIL_INSTITUCIONAL_DOMINIO}`
  );

export const passwordSchema = z
  .string()
  .min(8, 'Contrasena minimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
  .regex(/[0-9]/, 'Debe contener al menos un numero')
  .regex(/[!@#$%^&*]/, 'Debe contener al menos un caracter especial (!@#$%^&*)');

export const RegistroApiSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre minimo 2 caracteres').max(100, 'Nombre maximo 100 caracteres'),
  email: emailInstitucionalSchema,
  password: passwordSchema,
});

export const CuentaAutorizadaSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre minimo 2 caracteres').max(100, 'Nombre maximo 100 caracteres').optional(),
  email: emailInstitucionalSchema,
  rol: z.enum(['ADMIN', 'PROFESOR']).default('PROFESOR'),
});

/**
 * Schema para registro desde el formulario.
 */
export const RegistroSchema = RegistroApiSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

export type RegistroInput = z.infer<typeof RegistroSchema>;
export type RegistroApiInput = z.infer<typeof RegistroApiSchema>;
export type CuentaAutorizadaInput = z.infer<typeof CuentaAutorizadaSchema>;

/**
 * Schema para login
 */
export const LoginSchema = z.object({
  email: z.string().trim().email('Email invalido').transform((email) => email.toLowerCase()),
  password: z.string().min(1, 'Contrasena requerida'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Schema para cambiar contrasena
 */
export const CambiarPasswordSchema = z
  .object({
    passwordActual: z.string(),
    passwordNueva: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.passwordNueva === data.confirmPassword, {
    message: 'No coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.passwordActual !== data.passwordNueva, {
    message: 'Debe ser diferente a la actual',
    path: ['passwordNueva'],
  });

export type CambiarPasswordInput = z.infer<typeof CambiarPasswordSchema>;
