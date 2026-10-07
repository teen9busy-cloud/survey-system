import { NextRequest, NextResponse } from 'next/server';
import { getDb, sanitizePhone, isValidPhone } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responses, raw_data } = body;

    if (!responses) {
      return NextResponse.json({ success: false, message: '응답 데이터가 전달되지 않았습니다.' }, { status: 400 });
    }

    const phone = sanitizePhone(responses['연락처']);
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({
        success: false,
        message: '올바른 형식의 휴대폰 번호(10~11자리 숫자)를 입력해 주세요.',
      }, { status: 400 });
    }

    // DATABASE_URL이 없을 경우 개발/테스트용 모의 성공 반환
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL이 설정되지 않아 모의 모드로 응답을 저장합니다.');
      return NextResponse.json({
        success: true,
        mock: true,
        message: '설문이 성공적으로 접수되었습니다. (DB 환경변수 등록 필요)',
      });
    }

    const sql = getDb();

    // 1. 중복 제출 검사
    const existing = await sql(
      'SELECT id FROM student_survey_responses WHERE phone = $1 LIMIT 1',
      [phone]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: '이미 해당 연락처로 설문 응답이 제출되었습니다.',
      }, { status: 409 });
    }

    // 2. DB 저장 (핵심 인적사항 컬럼 및 JSONB 전체 응답 동시 저장)
    const gender = responses['성별'] || null;
    const college = responses['소속_단과대학'] || null;
    const campus = responses['캠퍼스'] || null;
    const admissionYear = responses['입학년도'] || null;
    const grade = responses['학년'] || null;

    const insertResult = await sql`
      INSERT INTO student_survey_responses (
        phone,
        gender,
        college,
        campus,
        admission_year,
        grade,
        responses,
        raw_data
      ) VALUES (
        ${phone},
        ${gender},
        ${college},
        ${campus},
        ${admissionYear},
        ${grade},
        ${JSON.stringify(responses)},
        ${JSON.stringify(raw_data || responses)}
      )
      RETURNING id, submitted_at
    `;

    return NextResponse.json({
      success: true,
      id: insertResult[0]?.id,
      submitted_at: insertResult[0]?.submitted_at,
      message: '설문이 성공적으로 접수되었습니다. 감사합니다!',
    });
  } catch (error: any) {
    console.error('학생 설문 저장 중 오류:', error);
    return NextResponse.json({
      success: false,
      message: '서버 오류로 인해 제출에 실패했습니다: ' + error.message,
    }, { status: 500 });
  }
}
