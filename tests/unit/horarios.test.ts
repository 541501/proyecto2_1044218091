/**
 * tests/unit/horarios.test.ts
 *
 * Tests unitarios COMPLETOS para detección de conflictos de horarios
 * CRÍTICO PARA LA INTEGRIDAD DEL SISTEMA
 * 
 * Riesgos cubiertos:
 * - Race condition: detectar solapamientos exactos
 * - Solapamientos parciales: inicio o fin del nuevo horario dentro del existente
 * - Horarios adyacentes: NO deben ser considerados conflicto
 * - Contenido: horario pequeño dentro de otro más grande
 * - Edge cases: minutos exactos, Date objects, validación de entrada
 */

import { describe, it, expect } from 'vitest';
import { hayConflicto, detectarConflicto, HorarioReserva } from '@/lib/utils/horarios';

/**
 * ══════════════════════════════════════════════════════════════════════
 * SUITE DE TESTS: hayConflicto — Función crítica para integridad
 * ══════════════════════════════════════════════════════════════════════
 * 
 * Cubre 6 casos de solapamiento especificados en plan_implementacion.md Fase 7:
 * ✓ sin solapamiento → false
 * ✓ solapamiento exacto → true
 * ✓ solapamiento parcial inicio → true
 * ✓ solapamiento parcial fin → true
 * ✓ contenido → true
 * ✓ adyacente (fin == inicio del otro) → false [CRÍTICO]
 * 
 * Riesgo cubierto: Race condition de 2 usuarios simultáneos en mismo slot
 */

describe('✓ hayConflicto — Detección de Solapamientos de Horarios', () => {
  
  // ╔════════════════════════════════════════════════════════════╗
  // ║ CASO 1: SIN SOLAPAMIENTO                                   ║
  // ║ [09:00-10:00] y [11:00-12:00] → FALSE                      ║
  // ╚════════════════════════════════════════════════════════════╝
  it('1️⃣  SIN SOLAPAMIENTO: horarios completamente separados → false', () => {
    const resultado = hayConflicto('09:00', '10:00', '11:00', '12:00');
    expect(resultado).toBe(false);
  });

  // ╔════════════════════════════════════════════════════════════╗
  // ║ CASO 2: SOLAPAMIENTO EXACTO (RACE CONDITION CRÍTICA)       ║
  // ║ [09:00-10:00] y [09:00-10:00] → TRUE                       ║
  // ╚════════════════════════════════════════════════════════════╝
  it('2️⃣  SOLAPAMIENTO EXACTO: dos usuarios mismo slot → true', () => {
    const resultado = hayConflicto('09:00', '10:00', '09:00', '10:00');
    expect(resultado).toBe(true);
  });

  // ╔════════════════════════════════════════════════════════════╗
  // ║ CASO 3: SOLAPAMIENTO PARCIAL INICIO                        ║
  // ║ [10:00-12:00] y [10:30-11:30] → TRUE                       ║
  // ╚════════════════════════════════════════════════════════════╝
  it('3️⃣  SOLAPAMIENTO PARCIAL INICIO: nuevo comienza dentro existente → true', () => {
    const resultado = hayConflicto('10:00', '12:00', '10:30', '11:30');
    expect(resultado).toBe(true);
  });

  // ╔════════════════════════════════════════════════════════════╗
  // ║ CASO 4: SOLAPAMIENTO PARCIAL FIN                           ║
  // ║ [10:00-12:00] y [11:30-13:00] → TRUE                       ║
  // ╚════════════════════════════════════════════════════════════╝
  it('4️⃣  SOLAPAMIENTO PARCIAL FIN: nuevo termina después existente → true', () => {
    const resultado = hayConflicto('10:00', '12:00', '11:30', '13:00');
    expect(resultado).toBe(true);
  });

  // ╔════════════════════════════════════════════════════════════╗
  // ║ CASO 5: CONTENIDO (pequeño dentro de grande)               ║
  // ║ [09:00-12:00] y [10:00-11:00] → TRUE                       ║
  // ╚════════════════════════════════════════════════════════════╝
  it('5️⃣  CONTENIDO: nuevo completamente dentro de existente → true', () => {
    const resultado = hayConflicto('09:00', '12:00', '10:00', '11:00');
    expect(resultado).toBe(true);
  });

  // ╔════════════════════════════════════════════════════════════╗
  // ║ CASO 6: ADYACENTE (FIN == INICIO) [CRÍTICO NO CONFLICTO]  ║
  // ║ [09:00-10:00] y [10:00-11:00] → FALSE                      ║
  // ║ Este es el más importante: dos clases consecutivas OK      ║
  // ╚════════════════════════════════════════════════════════════╝
  it('6️⃣  ADYACENTE CRÍTICO: [09:00-10:00] y [10:00-11:00] → false', () => {
    const resultado = hayConflicto('09:00', '10:00', '10:00', '11:00');
    expect(resultado).toBe(false);
  });

  // ╔════════════════════════════════════════════════════════════╗
  // ║ CASOS ADICIONALES: Validación y Edge Cases                ║
  // ╚════════════════════════════════════════════════════════════╝

  it('✓ Adyacente inverso: segunda después de primera → false', () => {
    const resultado = hayConflicto('10:00', '11:00', '09:00', '10:00');
    expect(resultado).toBe(false);
  });

  it('✓ Solapamiento de 1 minuto: 09:59 está dentro de 09:00-10:00 → true', () => {
    const resultado = hayConflicto('09:00', '10:00', '09:59', '10:01');
    expect(resultado).toBe(true);
  });

  it('✓ Horario inverso: horaInicio > horaFin → lanza error', () => {
    expect(() => {
      hayConflicto('10:00', '09:00', '11:00', '12:00');
    }).toThrow('horaInicio debe ser anterior a horaFin');
  });

  it('✓ Date objects como entrada: debe funcionar igual que strings', () => {
    const d1 = new Date('2026-04-13T09:00:00');
    const d2 = new Date('2026-04-13T10:00:00');
    const d3 = new Date('2026-04-13T10:00:00');
    const d4 = new Date('2026-04-13T11:00:00');

    const resultado = hayConflicto(d1, d2, d3, d4);
    expect(resultado).toBe(false);
  });

  it('✓ Horarios al mediodía: 12:00-13:00 y 13:00-14:00 → false', () => {
    const resultado = hayConflicto('12:00', '13:00', '13:00', '14:00');
    expect(resultado).toBe(false);
  });

  it('✓ Noche: 22:00-23:00 y 23:00-23:59 → false', () => {
    const resultado = hayConflicto('22:00', '23:00', '23:00', '23:59');
    expect(resultado).toBe(false);
  });

  it('✓ Madrugada: 06:00-07:00 y 06:15-07:15 → true', () => {
    const resultado = hayConflicto('06:00', '07:00', '06:15', '07:15');
    expect(resultado).toBe(true);
  });

  it('✓ Minutos exactos: 09:15-10:45 y 10:45-12:00 → false', () => {
    const resultado = hayConflicto('09:15', '10:45', '10:45', '12:00');
    expect(resultado).toBe(false);
  });

  it('✓ Una hora de clase: 09:00-10:00 y 08:00-17:00 (clase todo-día) → true', () => {
    const resultado = hayConflicto('09:00', '10:00', '08:00', '17:00');
    expect(resultado).toBe(true);
  });

  it('✓ Solapamiento mínimo de 1 minuto: 09:00-09:01 y 09:00-09:02 → true', () => {
    const resultado = hayConflicto('09:00', '09:01', '09:00', '09:02');
    expect(resultado).toBe(true);
  });
});

/**
 * ══════════════════════════════════════════════════════════════════════
 * SUITE DE TESTS: detectarConflicto — Validación contra múltiples reservas
 * ══════════════════════════════════════════════════════════════════════
 * 
 * Prueba la función que itera sobre todas las reservas existentes
 * en un salón und día buscando conflictos
 */

describe('✓ detectarConflicto — Detectar conflictos en lista de reservas', () => {
  
  it('✓ Sin reservas existentes → false (slot completamente libre)', () => {
    const resultado = detectarConflicto('09:00', '10:00', []);
    expect(resultado).toBe(false);
  });

  it('✓ Una reserva sin conflicto → false', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '10:00' },
    ];
    const resultado = detectarConflicto('10:00', '11:00', reservas);
    expect(resultado).toBe(false);
  });

  it('✓ Una reserva con conflicto exacto → true', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '10:00' },
    ];
    const resultado = detectarConflicto('09:00', '10:00', reservas);
    expect(resultado).toBe(true);
  });

  it('✓ Una reserva con solapamiento parcial → true', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '10:00' },
    ];
    const resultado = detectarConflicto('09:30', '10:30', reservas);
    expect(resultado).toBe(true);
  });

  it('✓ Múltiples reservas, conflicto con la segunda → true', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '10:00' },
      { horaInicio: '11:00', horaFin: '12:00' },
      { horaInicio: '14:00', horaFin: '15:00' },
    ];
    const resultado = detectarConflicto('11:30', '12:30', reservas);
    expect(resultado).toBe(true);
  });

  it('✓ Múltiples reservas, sin conflictos → false', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '10:00' },
      { horaInicio: '11:00', horaFin: '12:00' },
      { horaInicio: '14:00', horaFin: '15:00' },
    ];
    const resultado = detectarConflicto('12:30', '13:30', reservas);
    expect(resultado).toBe(false);
  });

  it('✓ Slots adyacentes en lista múltiple → false', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '10:00' },
      { horaInicio: '11:00', horaFin: '12:00' },
    ];
    const resultado = detectarConflicto('10:00', '11:00', reservas);
    expect(resultado).toBe(false);
  });

  it('✓ Slot new contenido en una reserva existente → true', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '08:00', horaFin: '17:00' }, // Evento todo el día
    ];
    const resultado = detectarConflicto('10:00', '11:00', reservas);
    expect(resultado).toBe(true);
  });

  it('✓ Con Date objects como horaInicio/horaFin → funciona', () => {
    const d1 = new Date('2026-04-13T09:00:00');
    const d2 = new Date('2026-04-13T10:00:00');
    const reservas: HorarioReserva[] = [
      { horaInicio: d1, horaFin: d2 },
    ];
    const resultado = detectarConflicto('10:00', '11:00', reservas);
    expect(resultado).toBe(false);
  });

  it('✓ Gran lista de reservas (10+) → performance acceptable', () => {
    const reservas: HorarioReserva[] = Array.from({ length: 20 }, (_, i) => ({
      horaInicio: `${7 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      horaFin: `${7 + Math.floor(i / 2)}:${i % 2 === 0 ? '30' : '00'}`,
    }));
    
    const startTime = performance.now();
    const resultado = detectarConflicto('22:00', '23:00', reservas);
    const endTime = performance.now();
    
    expect(resultado).toBe(false);
    expect(endTime - startTime).toBeLessThan(10); // < 10ms
  });
});

/**
 * ══════════════════════════════════════════════════════════════════════
 * SUITE CRÍTICA: Integridad de Reservas — Casos del mundo real
 * ══════════════════════════════════════════════════════════════════════
 */

describe('🔴 CRÍTICO: Integridad de Reservas — Casos del mundo real', () => {

  it('🔴 CRÍTICO: Dos clases consecutivas [10:00-11:00] + [11:00-12:00] → ambas permitidas', () => {
    const existentes: HorarioReserva[] = [
      { horaInicio: '10:00', horaFin: '11:00', id: 'prof1-matematica' },
    ];
    
    const resultado = detectarConflicto('11:00', '12:00', existentes);
    expect(resultado).toBe(false); // Debe permitirse
  });

  it('🔴 CRÍTICO: Race condition exacta — mismo slot exactamente', () => {
    const existentes: HorarioReserva[] = [
      { horaInicio: '14:00', horaFin: '15:00', id: 'prof2-clase' },
    ];
    
    // Prof 1 intenta el mismo slot
    const intento1 = detectarConflicto('14:00', '15:00', existentes);
    expect(intento1).toBe(true); // DEBE RECHAZARSE
    
    // Prof 2 intenta solapado
    const intento2 = detectarConflicto('14:15', '14:45', existentes);
    expect(intento2).toBe(true); // DEBE RECHAZARSE
  });

  it('🔴 CRÍTICO: Reserva pequeña dentro de otra → debe detectarse', () => {
    const existentes: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '17:00', id: 'evento-conferencista' },
    ];
    
    // Intento de reservar 1 hora dentro del evento
    const resultado = detectarConflicto('10:00', '11:00', existentes);
    expect(resultado).toBe(true); // CRÍTICO: Debe rechazarse
  });

  it('🔴 CRÍTICO: Fin == Inicio no es conflicto (cambio de profesor)', () => {
    const horarioProf1End = '11:00';
    const horarioProf2Start = '11:00';
    
    const resultado = hayConflicto('10:00', horarioProf1End, horarioProf2Start, '12:00');
    expect(resultado).toBe(false); // CRÍTICO: Cambio de profesor OK
  });

  it('🔴 CRÍTICO: Tres reservas, intento en la segunda → detectar', () => {
    const reservas: HorarioReserva[] = [
      { horaInicio: '09:00', horaFin: '10:00', id: 'clase1' },
      { horaInicio: '11:00', horaFin: '12:00', id: 'clase2' }, // Intento aquí
      { horaInicio: '13:00', horaFin: '14:00', id: 'clase3' },
    ];
    
    const resultado = detectarConflicto('11:15', '11:45', reservas);
    expect(resultado).toBe(true); // CRÍTICO: Debe detectarse la colisión
  });

  it('🔴 CRÍTICO: Horarios de minuto exacto — 09:45-10:30 vs 10:15-11:00', () => {
    const resultado = hayConflicto('09:45', '10:30', '10:15', '11:00');
    expect(resultado).toBe(true); // Solapamiento 10:15-10:30
  });
});
