import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'student';
  const format = searchParams.get('format') || 'json';
  const secret = searchParams.get('secret') || '';

  const adminPassword = process.env.ADMIN_PASSWORD || 'surveyadmin2026!';
  if (secret !== adminPassword) {
    return NextResponse.json({ success: false, message: '인증 실패: 유효하지 않은 비밀키입니다.' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: true,
      totalCount: 0,
      data: [],
      message: 'DATABASE_URL이 설정되지 않았습니다.',
    });
  }

  try {
    const sql = getDb();
    const table = type === 'faculty' ? 'faculty_survey_responses' : 'student_survey_responses';

    const rows = await sql(`SELECT * FROM ${table} ORDER BY submitted_at DESC`);

    if (format === 'csv') {
      if (rows.length === 0) {
        return new NextResponse('데이터가 없습니다.', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      const headers = Object.keys(rows[0]).filter(k => k !== 'raw_data');
      const csvLines = [headers.join(',')];

      for (const row of rows) {
        const line = headers.map(h => {
          let val = row[h];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') val = JSON.stringify(val);
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvLines.push(line.join(','));
      }

      const csvContent = '\uFEFF' + csvLines.join('\r\n'); // UTF-8 BOM for Excel
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${type}_survey_responses_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      type,
      totalCount: rows.length,
      data: rows,
    });
  } catch (error: any) {
    console.error('데이터 조회 오류:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
