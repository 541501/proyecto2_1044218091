/**
 * lib/utils/errores.ts
 *
 * Clases de error personalizadas para la aplicación
 * Centraliza la lógica de manejo de errores de la BD
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ConflictoHorarioError extends AppError {
  constructor(message: string = 'El horario seleccionado está ocupado') {
    super(message, 'CONFLICT_HORARIO', 409);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'No tienes permiso para esta acción') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Debes estar autenticado') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validación fallida',
    public details?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

/**
 * Mapear errores de Prisma a HTTP 4xx/5xx
 * P2002: Unique constraint failed
 * P2025: Record not found
 * P2014: Transaction failed
 * etc.
 */
export function mapearErrorPrisma(
  error: any
): {
  status: number;
  code: string;
  message: string;
} {
  // Prisma error
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return {
          status: 409,
          code: 'UNIQUE_CONSTRAINT_FAILED',
          message: `Campo duplicado: ${
            error.meta?.target?.[0] || 'valor'
          }`,
        };

      case 'P2025':
        return {
          status: 404,
          code: 'RECORD_NOT_FOUND',
          message:
            'El recurso solicitado no existe',
        };

      case 'P2014':
        return {
          status: 409,
          code: 'TRANSACTION_FAILED',
          message:
            'Error de transacción (posible conflicto de horario)',
        };

      case 'P2003':
        return {
          status: 400,
          code: 'FOREIGN_KEY_CONSTRAINT_FAILED',
          message:
            'Referencia inválida a otro recurso',
        };

      case 'P2000':
        return {
          status: 400,
          code: 'VALUE_TOO_LONG',
          message:
            'El valor es demasiado largo para el campo',
        };

      default:
        return {
          status: 500,
          code: `PRISMA_${error.code}`,
          message:
            'Error en la base de datos',
        };
    }
  }

  // AppError
  if (error instanceof AppError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
    };
  }

  // Generic error
  return {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message:
      'Error interno del servidor',
  };
}
