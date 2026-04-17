import { badRequest } from '@/lib/utils/errores-api';
import { NextRequest } from 'next/server';
import { ZodType } from 'zod';

export async function validarBody<T>(
  schema: ZodType<T>,
  req: NextRequest
): Promise<T> {
  try {
    const body = await req.json();
    const resultado = schema.safeParse(body);

    if (!resultado.success) {
      const detalles: Record<string, string[]> = {};

      for (const issue of resultado.error.issues) {
        const path = issue.path.join('.') || 'general';
        if (!detalles[path]) {
          detalles[path] = [];
        }
        detalles[path].push(issue.message);
      }

      throw new Error(JSON.stringify(detalles));
    }

    return resultado.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw badRequest('JSON invalido en el body');
    }

    if (error instanceof Error && error.message.startsWith('{')) {
      const detalles = JSON.parse(error.message) as Record<string, string[]>;
      throw badRequest('Validacion fallida', detalles);
    }

    throw error;
  }
}

export * from './reserva.schema';
export * from './sede.schema';
export * from './usuario.schema';
