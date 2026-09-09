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

    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL이 설정되지 않아 모의 모드로 응답을 저장합니다.');
      return NextResponse.json({
        success: true,
        mock: true,
        message: '설문이 성공적으로 접수되었습니다. (DB 환경변수 등록 필요)',
      });
    }

    const sql = getDb();

    // 1. 중복 검사
    const existing = await sql(
      'SELECT id FROM faculty_survey_responses WHERE phone = $1 LIMIT 1',
      [phone]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: '이미 해당 연락처로 설문 응답이 제출되었습니다.',
      }, { status: 409 });
    }

    // 2. DB 저장
    const insertResult = await sql`
      INSERT INTO faculty_survey_responses (
        phone,
        gender,
        college,
        position,
        q1_job_scope,
        q2_important_points,
        q3_difficulty_reasons,
        q4_info_routes,
        q5_needed_supports,
        q6_guidebook_topics,
        q7_priority_areas,
        q8_dream_future_material,
        q9_available_hours,
        q10_optimal_timing,
        q11_special_lecture_topics,
        q12_operation_methods,
        q13_participation_intent,
        q13_1_non_participation_reason,
        q14_wishes_for_center,
        responses,
        raw_data
      ) VALUES (
        ${phone},
        ${responses['성별'] || null},
        ${responses['소속_단과대학'] || responses['소속 단과대학'] || null},
        ${responses['직급'] || null},
        ${responses['문1_지도_직무범위'] || null},
        ${responses['문2_지도_중요사항'] || null},
        ${responses['문3_지도_어려움_이유'] || null},
        ${responses['문4_정보_획득_경로'] || null},
        ${responses['문5_필요한_지원'] || null},
        ${responses['문6_가이드북_희망주제'] || null},
        ${responses['문7_취업률_제고_우선영역'] || null},
        ${responses['문8_꿈미래개척_필요자료'] || null},
        ${responses['문9_참여가능_교육시간'] || null},
        ${responses['문10_참여_최적시기'] || null},
        ${responses['문11_특강_희망내용'] || null},
        ${responses['문12_특강_운영방법'] || null},
        ${responses['문13_특강_참여의향'] || null},
        ${responses['문13-1_미참여_이유'] || null},
        ${responses['문14_진로취업지원실에_바라는_점'] || null},
        ${JSON.stringify(responses)},
        ${JSON.stringify(raw_data || responses)}
      )
      RETURNING id, submitted_at
    `;

    return NextResponse.json({
      success: true,
      id: insertResult[0]?.id,
      submitted_at: insertResult[0]?.submitted_at,
      message: '설문이 성공적으로 접수되었습니다. 교수님의 고견에 감사드립니다!',
    });
  } catch (error: any) {
    console.error('교원 설문 저장 중 오류:', error);
    return NextResponse.json({
      success: false,
      message: '서버 오류로 인해 제출에 실패했습니다: ' + error.message,
    }, { status: 500 });
  }
}
