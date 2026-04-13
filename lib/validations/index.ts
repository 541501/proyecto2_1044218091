/**
 * lib/validations/index.ts
 *
 * Función utilitaria para validar body de requests
 * Retorna datos validados o NextResponse 400
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { badRequest } from '@/lib/utils/errores-api';

/**
 * Validar body de un request contra un schema Zod
 * Retorna los datos validados o lanza NextResponse 400
 *
 * USO:
 * const data = await validarBody(CrearReservaSchema, req);
 * // data es tipado automáticamente como CrearReservaInput
 */
export async function validarBody<T>(
  schema: ZodSchema,
  req: NextRequest
): Promise<T> {
  try {
    const body = await req.json();

    const resultado = schema.safeParse(body);

    if (!resultado.success) {
      // Convertir errors de Zod a formato legible
      const detalles: Record<string, string[]> = {};

      for (const issue of resultado.error.issues) {
        const path =
          issue.path.join('.') || 'general';
        if (!detalles[path]) {
          detalles[path] = [];
        }
        detalles[path].push(issue.message);
      }

      throw new Error(
        JSON.stringify(detalles)
      );
    }

    return resultado.data as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw badRequest(
        'JSON inválido en el body'
      );
    }

    if (error instanceof Error && error.message.startsWith('{')) {
      const detalles = JSON.parse(error.message);
      throw badRequest(
        'Validación fallida',
        detalles
      );
    }

    throw error;
  }
}

export * from './reserva.schema';
export * from './sede.schema';
export * from './usuario.schema';
