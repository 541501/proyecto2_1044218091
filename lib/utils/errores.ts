export class AppError extends Error {
  constructor(
    public override message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ConflictoHorarioError extends AppError {
  constructor(message: string = 'El horario seleccionado esta ocupado') {
    super(message, 'CONFLICT_HORARIO', 409);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'No tienes permiso para esta accion') {
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
    message: string = 'Validacion fallida',
    public details?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

type PrismaLikeError = {
  code?: string;
  meta?: {
    target?: string[];
  };
};

export function mapearErrorPrisma(
  error: unknown
): {
  status: number;
  code: string;
  message: string;
} {
  const prismaError = error as PrismaLikeError;

  if (prismaError.code) {
    switch (prismaError.code) {
      case 'P2002':
        return {
          status: 409,
          code: 'UNIQUE_CONSTRAINT_FAILED',
          message: `Campo duplicado: ${prismaError.meta?.target?.[0] || 'valor'}`,
        };
      case 'P2025':
        return {
          status: 404,
          code: 'RECORD_NOT_FOUND',
          message: 'El recurso solicitado no existe',
        };
      case 'P2014':
        return {
          status: 409,
          code: 'TRANSACTION_FAILED',
          message: 'Error de transaccion (posible conflicto de horario)',
        };
      case 'P2003':
        return {
          status: 400,
          code: 'FOREIGN_KEY_CONSTRAINT_FAILED',
          message: 'Referencia invalida a otro recurso',
        };
      case 'P2000':
        return {
          status: 400,
          code: 'VALUE_TOO_LONG',
          message: 'El valor es demasiado largo para el campo',
        };
      default:
        return {
          status: 500,
          code: `PRISMA_${prismaError.code}`,
          message: 'Error en la base de datos',
        };
    }
  }

  if (error instanceof AppError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
    };
  }

  return {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor',
  };
}
