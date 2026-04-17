import type { Prisma, Reserva } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { detectarConflicto } from '@/lib/utils/horarios';
import {
  ConflictoHorarioError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/utils/errores';

export interface CrearReservaParams {
  usuarioId: string;
  salonId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreClase: string;
  descripcion?: string;
}

type ReservaConUsuarioYSalon = Prisma.ReservaGetPayload<{
  include: {
    usuario: true;
    salon: {
      include: {
        bloque: {
          include: { sede: true };
        };
      };
    };
  };
}>;

type ReservaConSalon = Prisma.ReservaGetPayload<{
  include: {
    salon: {
      include: {
        bloque: {
          include: { sede: true };
        };
      };
    };
  };
}>;

type PrismaErrorWithCode = {
  code?: string;
};

export type ReservaView = ReservaConSalon & {
  nombreClase: string;
  descripcionDetalle?: string;
};

export type ReservaDetalleView = ReservaConUsuarioYSalon & {
  nombreClase: string;
  descripcionDetalle?: string;
};

function serializarDescripcionReserva(
  nombreClase: string,
  descripcion?: string
) {
  return descripcion?.trim()
    ? `${nombreClase}\n${descripcion.trim()}`
    : nombreClase;
}

function extraerContenidoReserva(descripcion: string | null) {
  if (!descripcion) {
    return {
      nombreClase: 'Reserva',
      descripcionDetalle: undefined,
    };
  }

  const [nombreClase, ...resto] = descripcion.split('\n');
  return {
    nombreClase: nombreClase || 'Reserva',
    descripcionDetalle: resto.join('\n').trim() || undefined,
  };
}

function mapReservaConSalon(reserva: ReservaConSalon): ReservaView {
  return {
    ...reserva,
    ...extraerContenidoReserva(reserva.descripcion),
  };
}

function mapReservaConUsuarioYSalon(
  reserva: ReservaConUsuarioYSalon
): ReservaDetalleView {
  return {
    ...reserva,
    ...extraerContenidoReserva(reserva.descripcion),
  };
}

export async function crearReserva(
  params: CrearReservaParams
): Promise<ReservaDetalleView> {
  const {
    usuarioId,
    salonId,
    fecha,
    horaInicio,
    horaFin,
    nombreClase,
    descripcion,
  } = params;

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
  });

  if (!salon) {
    throw new NotFoundError('El salon no existe');
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const reservasExistentes = await tx.reserva.findMany({
        where: {
          salonId,
          fecha: new Date(fecha),
          estado: 'CONFIRMADA',
        },
      });

      const hayConflictoExistente = detectarConflicto(
        horaInicio,
        horaFin,
        reservasExistentes.map((reserva) => ({
          horaInicio: reserva.horaInicio,
          horaFin: reserva.horaFin,
        }))
      );

      if (hayConflictoExistente) {
        throw new ConflictoHorarioError(
          `El salon ${salon.nombre} esta ocupado en ese horario`
        );
      }

      return tx.reserva.create({
        data: {
          usuarioId,
          salonId,
          fecha: new Date(fecha),
          horaInicio,
          horaFin,
          descripcion: serializarDescripcionReserva(nombreClase, descripcion),
          estado: 'CONFIRMADA',
        },
        include: {
          usuario: true,
          salon: {
            include: {
              bloque: {
                include: { sede: true },
              },
            },
          },
        },
      });
    });

    return mapReservaConUsuarioYSalon(resultado);
  } catch (error) {
    const prismaError = error as PrismaErrorWithCode;

    if (error instanceof ConflictoHorarioError) {
      throw error;
    }

    if (prismaError.code === 'P2002') {
      throw new ConflictoHorarioError(
        'El horario ya fue reservado en el ultimo momento'
      );
    }

    throw error;
  }
}

export async function listarReservasUsuario(
  usuarioId: string,
  filtros?: {
    estado?: 'CONFIRMADA' | 'CANCELADA';
    fechaDesde?: string;
    fechaHasta?: string;
  }
): Promise<ReservaView[]> {
  const reservas = await prisma.reserva.findMany({
    where: {
      usuarioId,
      ...(filtros?.estado && {
        estado: filtros.estado,
      }),
      ...(filtros?.fechaDesde && {
        fecha: {
          gte: new Date(filtros.fechaDesde),
        },
      }),
      ...(filtros?.fechaHasta && {
        fecha: {
          lte: new Date(filtros.fechaHasta),
        },
      }),
    },
    include: {
      salon: {
        include: {
          bloque: {
            include: { sede: true },
          },
        },
      },
    },
    orderBy: [
      { fecha: 'desc' },
      { horaInicio: 'desc' },
    ],
  });

  return reservas.map(mapReservaConSalon);
}

export async function listarTodasReservas(
  filtros?: {
    estado?: 'CONFIRMADA' | 'CANCELADA';
    fechaDesde?: string;
    fechaHasta?: string;
    salonId?: string;
  }
): Promise<ReservaDetalleView[]> {
  const reservas = await prisma.reserva.findMany({
    where: {
      ...(filtros?.estado && {
        estado: filtros.estado,
      }),
      ...(filtros?.salonId && {
        salonId: filtros.salonId,
      }),
      ...(filtros?.fechaDesde && {
        fecha: {
          gte: new Date(filtros.fechaDesde),
        },
      }),
      ...(filtros?.fechaHasta && {
        fecha: {
          lte: new Date(filtros.fechaHasta),
        },
      }),
    },
    include: {
      usuario: true,
      salon: {
        include: {
          bloque: {
            include: { sede: true },
          },
        },
      },
    },
    orderBy: [
      { fecha: 'desc' },
      { horaInicio: 'desc' },
    ],
  });

  return reservas.map(mapReservaConUsuarioYSalon);
}

export async function cancelarReserva(
  reservaId: string,
  usuarioId: string,
  esAdmin: boolean
): Promise<Reserva> {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
  });

  if (!reserva) {
    throw new NotFoundError('La reserva no existe');
  }

  if (!esAdmin && reserva.usuarioId !== usuarioId) {
    throw new ForbiddenError(
      'No puedes cancelar una reserva que no te pertenece'
    );
  }

  if (reserva.estado === 'CANCELADA') {
    throw new Error('La reserva ya esta cancelada');
  }

  return prisma.reserva.update({
    where: { id: reservaId },
    data: { estado: 'CANCELADA' },
  });
}

export async function obtenerDisponibilidad(
  salonId: string,
  fecha: string
): Promise<Array<{ horaInicio: string; horaFin: string }>> {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
  });

  if (!salon) {
    throw new NotFoundError('El salon no existe');
  }

  const reservas = await prisma.reserva.findMany({
    where: {
      salonId,
      fecha: new Date(fecha),
      estado: 'CONFIRMADA',
    },
    select: {
      horaInicio: true,
      horaFin: true,
    },
  });

  const slots: Array<{ horaInicio: string; horaFin: string }> = [];

  for (let hora = 6; hora < 21; hora++) {
    const horaInicio = `${String(hora).padStart(2, '0')}:00`;
    const horaFin = `${String(hora + 1).padStart(2, '0')}:00`;

    const hayConflictoEnEsteHorario = reservas.some((reserva) => {
      const [hInicio = 0] = reserva.horaInicio.split(':').map(Number);
      const [hFin = 0] = reserva.horaFin.split(':').map(Number);

      return !(hora + 1 <= hInicio || hora >= hFin);
    });

    if (!hayConflictoEnEsteHorario) {
      slots.push({
        horaInicio,
        horaFin,
      });
    }
  }

  return slots;
}

export async function obtenerReserva(
  reservaId: string
): Promise<ReservaDetalleView> {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: {
      usuario: true,
      salon: {
        include: {
          bloque: {
            include: { sede: true },
          },
        },
      },
    },
  });

  if (!reserva) {
    throw new NotFoundError('La reserva no existe');
  }

  return mapReservaConUsuarioYSalon(reserva);
}
