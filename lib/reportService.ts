/**
 * Report Service — Occupancy Report Generation
 * Handles CSV generation for occupancy reports with proper formatting.
 */

export interface OccupancyReportRow {
  fecha: string;           // Date in DD/MM/YYYY format
  bloque: string;          // Block name
  salon: string;           // Room code
  codigo: string;          // Room code (duplicate for spreadsheet clarity)
  franja: string;          // Slot name (e.g., "07:00–09:00")
  profesor: string;        // Professor full name
  materia: string;         // Subject
  grupo: string;           // Group name
  estado: string;          // Status (Confirmada/Cancelada)
}

/**
 * Generates a CSV string from occupancy report rows.
 * Columns: Fecha, Bloque, Salón, Código, Franja, Profesor, Materia, Grupo, Estado
 * 
 * @param rows Array of OccupancyReportRow objects
 * @returns CSV string with proper escaping and headers
 */
export function generateOccupancyCSV(rows: OccupancyReportRow[]): string {
  // CSV headers
  const headers = [
    'Fecha',
    'Bloque',
    'Salón',
    'Código',
    'Franja',
    'Profesor',
    'Materia',
    'Grupo',
    'Estado',
  ];

  // Escape function for CSV fields
  const escapeCSVField = (field: string | null | undefined): string => {
    if (!field) return '';
    const str = String(field);
    // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV content
  const csvLines: string[] = [];

  // Add header row
  csvLines.push(headers.join(','));

  // Add data rows
  for (const row of rows) {
    const line = [
      escapeCSVField(row.fecha),
      escapeCSVField(row.bloque),
      escapeCSVField(row.salon),
      escapeCSVField(row.codigo),
      escapeCSVField(row.franja),
      escapeCSVField(row.profesor),
      escapeCSVField(row.materia),
      escapeCSVField(row.grupo),
      escapeCSVField(row.estado),
    ].join(',');
    csvLines.push(line);
  }

  return csvLines.join('\n');
}
