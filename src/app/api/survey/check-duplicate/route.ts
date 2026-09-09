import { NextRequest, NextResponse } from 'next/server';
import { getDb, sanitizePhone, isValidPhone } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'student';
  const rawPhone = searchParams.get('phone') || '';
  const phone = sanitizePhone(rawPhone);

  if (!phone || !isValidPhone(phone)) {
    return NextResponse.json({ isDuplicate: false, message: '유효하지 않은 전화번호입니다.' });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ isDuplicate: false, mock: true });
  }

  try {
    const sql = getDb();
    const table = type === 'faculty' ? 'faculty_survey_responses' : 'student_survey_responses';

    // 해당 테이블에 이미 존재하는 전화번호인지 조회
    const result = await sql(`SELECT id FROM ${table} WHERE phone = $1 LIMIT 1`, [phone]);

    if (result.length > 0) {
      return NextResponse.json({
        isDuplicate: true,
        message: '이미 해당 연락처로 설문 응답이 제출되었습니다.',
      });
    }

    return NextResponse.json({ isDuplicate: false });
  } catch (error: any) {
    console.error('중복 검사 오류:', error);
    return NextResponse.json({ isDuplicate: false, error: error.message });
  }
}
