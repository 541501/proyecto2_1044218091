export interface HorarioReserva {
  horaInicio: Date | string;
  horaFin: Date | string;
  id?: string;
}

function tiempoAMinutos(tiempo: string | Date): number {
  const timeStr =
    tiempo instanceof Date ? tiempo.toISOString().slice(11, 16) : tiempo;
  const [horas = NaN, minutos = NaN] = timeStr.split(':').map(Number);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    throw new Error('Formato de hora invalido');
  }

  return horas * 60 + minutos;
}

export function hayConflicto(
  horaInicio1: string | Date,
  horaFin1: string | Date,
  horaInicio2: string | Date,
  horaFin2: string | Date
): boolean {
  const inicio1 = tiempoAMinutos(horaInicio1);
  const fin1 = tiempoAMinutos(horaFin1);
  const inicio2 = tiempoAMinutos(horaInicio2);
  const fin2 = tiempoAMinutos(horaFin2);

  if (inicio1 >= fin1 || inicio2 >= fin2) {
    throw new Error('horaInicio debe ser anterior a horaFin');
  }

  return inicio1 < fin2 && fin1 > inicio2;
}

export function detectarConflicto(
  horaInicio: string | Date,
  horaFin: string | Date,
  reservasExistentes: HorarioReserva[]
): boolean {
  for (const reserva of reservasExistentes) {
    if (
      hayConflicto(
        horaInicio,
        horaFin,
        reserva.horaInicio,
        reserva.horaFin
      )
    ) {
      return true;
    }
  }

  return false;
}

export function validarHorario(
  horaInicio: string | Date,
  horaFin: string | Date,
  duracionMinima: number = 30,
  duracionMaxima: number = 240
): { validos: boolean; error?: string } {
  try {
    const inicio = tiempoAMinutos(horaInicio);
    const fin = tiempoAMinutos(horaFin);

    if (inicio >= fin) {
      return {
        validos: false,
        error: 'horaInicio debe ser anterior a horaFin',
      };
    }

    const duracion = fin - inicio;

    if (duracion < duracionMinima) {
      return {
        validos: false,
        error: `Duracion minima: ${duracionMinima} minutos`,
      };
    }

    if (duracion > duracionMaxima) {
      return {
        validos: false,
        error: `Duracion maxima: ${duracionMaxima} minutos`,
      };
    }

    return { validos: true };
  } catch {
    return {
      validos: false,
      error: 'Formato de horario invalido. Usar "HH:MM"',
    };
  }
}

export interface Slot {
  horaInicio: string;
  horaFin: string;
  libre: boolean;
}

export function generarSlots(
  horaAberturaStr: string,
  horaCierreStr: string,
  duracionSlot: number,
  reservasExistentes: HorarioReserva[]
): Slot[] {
  const slots: Slot[] = [];
  const apertura = tiempoAMinutos(horaAberturaStr);
  const cierre = tiempoAMinutos(horaCierreStr);

  let actual = apertura;

  while (actual + duracionSlot <= cierre) {
    const inicioStr = minutosAtiempo(actual);
    const finStr = minutosAtiempo(actual + duracionSlot);
    const conflicto = detectarConflicto(
      inicioStr,
      finStr,
      reservasExistentes
    );

    slots.push({
      horaInicio: inicioStr,
      horaFin: finStr,
      libre: !conflicto,
    });

    actual += duracionSlot;
  }

  return slots;
}

function minutosAtiempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function parseHorario(horarioStr: string): {
  horas: number;
  minutos: number;
  minutosTotales: number;
} {
  const [horasStr = '', minutosStr = ''] = horarioStr.split(':');
  const horas = parseInt(horasStr, 10);
  const minutos = parseInt(minutosStr, 10);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    throw new Error(`Formato invalido: ${horarioStr}`);
  }

  return {
    horas,
    minutos,
    minutosTotales: horas * 60 + minutos,
  };
}
