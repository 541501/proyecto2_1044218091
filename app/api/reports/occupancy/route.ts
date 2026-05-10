import { NextRequest, NextResponse } from 'next/server';
import { getOccupancyReport } from '@/lib/dataService';
import { generateOccupancyCSV } from '@/lib/reportService';
import { reportFiltersSchema } from '@/lib/schemas';

/**
 * GET /api/reports/occupancy
 * Generate occupancy report in JSON or CSV format
 * 
 * Query params:
 * - from_date (required): YYYY-MM-DD
 * - to_date (required): YYYY-MM-DD  
 * - block_id (optional): UUID of block to filter
 * - format (optional): 'json' or 'csv' (default: 'json')
 * 
 * Access: coordinador and admin only
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Extract user info from token
  let userRole: string;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    userRole = payload.role;
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  // Check authorization
  if (!['coordinador', 'admin'].includes(userRole)) {
    return NextResponse.json(
      { error: 'Forbidden: Only coordinators and admins can generate reports' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryData = {
      from_date: searchParams.get('from_date'),
      to_date: searchParams.get('to_date'),
      block_id: searchParams.get('block_id') || undefined,
      format: searchParams.get('format') || 'json',
    };

    // Validate with schema
    let validatedFilters;
    try {
      validatedFilters = reportFiltersSchema.parse(queryData);
    } catch (parseError: any) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parseError.errors },
        { status: 400 }
      );
    }

    // Fetch report data
    const reportData = await getOccupancyReport(
      validatedFilters.from_date,
      validatedFilters.to_date,
      validatedFilters.block_id
    );

    // Check if there's any data
    if (reportData.length === 0) {
      return NextResponse.json(
        { error: 'No reservations found for the specified period' },
        { status: 404 }
      );
    }

    // Return based on format
    if (validatedFilters.format === 'csv') {
      const csvContent = generateOccupancyCSV(reportData);
      
      // Format filename with date range
      const fromFormatted = validatedFilters.from_date.replace(/-/g, '');
      const toFormatted = validatedFilters.to_date.replace(/-/g, '');
      const filename = `reporte-ocupacion-${fromFormatted}-${toFormatted}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Return JSON for preview
      return NextResponse.json(reportData);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
