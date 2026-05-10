/**
 * Date utilities for ClassSport
 * All dates are in YYYY-MM-DD format (ISO 8601)
 * Timezone: America/Bogota (Colombia)
 */

/**
 * Get today's date in YYYY-MM-DD format (America/Bogota timezone)
 */
export function getTodayString(): string {
  // Get current date in America/Bogota timezone
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Bogota',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  if (!year || !month || !day) {
    // Fallback to UTC if formatter fails
    return new Date().toISOString().split('T')[0];
  }

  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is in the past (before today)
 */
export function isPastDate(dateStr: string): boolean {
  const today = getTodayString();
  return dateStr < today;
}

/**
 * Check if a date is today or in the past
 */
export function isTodayOrPastDate(dateStr: string): boolean {
  const today = getTodayString();
  return dateStr <= today;
}

/**
 * Check if a date is a weekday (Monday-Friday)
 * Input: YYYY-MM-DD
 * Returns: true if Monday (1) to Friday (5), false if Saturday (6) or Sunday (0)
 */
export function isWeekday(dateStr: string): boolean {
  // Parse the date in America/Bogota timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at midnight UTC (dateStr is in YYYY-MM-DD, representing midnight America/Bogota)
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getUTCDay();

  // 0 = Sunday (no), 1-5 = Monday-Friday (yes), 6 = Saturday (no)
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Check if a date is within 60 days from today
 * Returns: true if <= 60 days, false if > 60 days
 */
export function isWithin60Days(dateStr: string): boolean {
  const today = getTodayString();
  const todayDate = new Date(today);
  const targetDate = new Date(dateStr);

  const diffMs = targetDate.getTime() - todayDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= 60;
}

/**
 * Calculate the number of days from today to a date
 */
export function daysUntilDate(dateStr: string): number {
  const today = getTodayString();
  const todayDate = new Date(today);
  const targetDate = new Date(dateStr);

  const diffMs = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get Monday of the given week (dateStr must be a date in that week)
 */
export function getMonday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Calculate days to subtract to get to Monday
  const dayOfWeek = date.getUTCDay();
  const diff = dayOfWeek === 0 ? -2 : 1 - dayOfWeek; // Adjust for UTC day

  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().split('T')[0];
}

/**
 * Format a date string (YYYY-MM-DD) to Spanish locale format
 * Example: "2026-05-15" → "15 de mayo de 2026"
 */
export function formatDateSpanish(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(date);
}

/**
 * Get day name in Spanish
 * Example: "2026-05-15" → "viernes"
 */
export function getDayNameSpanish(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
  });
  return formatter.format(date);
}
