/**
 * lib/utils/horarios.ts
 *
 * Utilidades para detectar conflictos de horarios
 * CRÍTICO PARA LA INTEGRIDAD: Esta función es una de las 3 capas defensivas
 */

/**
 * Tipo para representar un horario para análisis
 */
export interface HorarioReserva {
  horaInicio: Date | string;
  horaFin: Date | string;
  id?: string; // para debugging
}

/**
 * Normalizar un tiempo (string o Date) a minutos desde medianoche
 * EJ: "09:30" → 570 minutos
 *     "14:45" → 885 minutos
 */
function tiempoAMinutos(tiempo: string | Date): number {
  let timeStr: string;

  if (tiempo instanceof Date) {
    // Si es Date, extraer HH:MM
    timeStr = tiempo.toISOString().slice(11, 16); // "HH:MM"
  } else {
    timeStr = tiempo; // Asumir formato "HH:MM"
  }

  const [horas, minutos] = timeStr.split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Detectar si dos horarios se solapan
 *
 * REGLAS CRÍTICAS:
 * - [09:00-10:00] y [10:00-11:00] = NO son conflicto (adyacentes)
 * - [09:00-10:00] y [09:30-10:30] = SÍ es conflicto (solapamiento)
 * - [09:00-10:30] y [09:15-10:00] = SÍ es conflicto (contenido)
 * - [09:00-10:00] y [09:00-10:00] = SÍ es conflicto (idéntico)
 *
 * Implementación: A y B se solapan si:
 *   A.inicio < B.fin AND A.fin > B.inicio
 *
 * NO usar <= porque permite adyacentes sin solapamiento
 */
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

  // Validación básica: hora inicio < hora fin
  if (inicio1 >= fin1 || inicio2 >= fin2) {
    throw new Error(
      'horaInicio debe ser anterior a horaFin'
    );
  }

  // Lógica de solapamiento
  // A y B se solapan si: A.inicio < B.fin AND A.fin > B.inicio
  return inicio1 < fin2 && fin1 > inicio2;
}

/**
 * Detectar conflictos contra una lista de reservas existentes
 *
 * PARÁMETRO: reservas = array de reservas ya existentes para ese salón en ese día
 * RETORNA: true si hay conflicto, false si el horario es libre
 *
 * NOTA: Esta función es DEFENSIVA (capa 1 de 3). La BD tiene constraint único.
 */
export function detectarConflicto(
  horaInicio: string | Date,
  horaFin: string | Date,
  reservasExistentes: HorarioReserva[]
): boolean {
  for (const reserva of reservasExistentes) {
    if (hayConflicto(
      horaInicio,
      horaFin,
      reserva.horaInicio,
      reserva.horaFin
    )) {
      return true; // Hay conflicto
    }
  }

  return false; // Sin conflictos
}

/**
 * Validar que un horario es válido
 * - horaInicio < horaFin
 * - Ambas en formato "HH:MM" o Date
 * - Duración mínima: 30 minutos
 * - Duración máxima: 4 horas
 */
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
        error:
          'horaInicio debe ser anterior a horaFin',
      };
    }

    const duracion = fin - inicio;

    if (duracion < duracionMinima) {
      return {
        validos: false,
        error: `Duración mínima: ${duracionMinima} minutos`,
      };
    }

    if (duracion > duracionMaxima) {
      return {
        validos: false,
        error: `Duración máxima: ${duracionMaxima} minutos`,
      };
    }

    return { validos: true };
  } catch (error) {
    return {
      validos: false,
      error:
        'Formato de horario inválido. Usar "HH:MM"',
    };
  }
}

/**
 * Generar slots horarios libres en un rango
 * Útil para listar disponibilidad
 *
 * EJ: generarSlots("09:00", "17:00", 60, [[{09:00, 10:00}]])
 *     → [{ horaInicio: "09:00", horaFin: "09:30", libre: true }, ...]
 */
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
    const inicio = actual;
    const fin = actual + duracionSlot;

    // Convertir minutos de vuelta a "HH:MM"
    const inicioStr = minutosAtiempo(inicio);
    const finStr = minutosAtiempo(fin);

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

/**
 * Convertir minutos desde medianoche a "HH:MM"
 */
function minutosAtiempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(
    mins
  ).padStart(2, '0')}`;
}

/**
 * Parsing helper: convertir string "HH:MM" a objeto { horas, minutos }
 */
export function parseHorario(horarioStr: string): {
  horas: number;
  minutos: number;
  minutosTotales: number;
} {
  const [horasStr, minutosStr] = horarioStr.split(':');
  const horas = parseInt(horasStr, 10);
  const minutos = parseInt(minutosStr, 10);

  if (isNaN(horas) || isNaN(minutos)) {
    throw new Error(`Formato inválido: ${horarioStr}`);
  }

  return {
    horas,
    minutos,
    minutosTotales: horas * 60 + minutos,
  };
}
