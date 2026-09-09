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

    // 2. DB 저장
    const insertResult = await sql`
      INSERT INTO student_survey_responses (
        phone,
        gender,
        college,
        campus,
        admission_year,
        grade,
        q1_start_period,
        q2_major_reason,
        q3_job_criteria,
        q4_dept_aware,
        q4_1_route,
        q4_2_unaware_reason,
        q5_visit_count,
        q6_program_participate,
        q6_1_not_participate_reason,
        q7_system_use,
        q7_1_satisfied_feature,
        q8_after_grad,
        q8_1_no_plan_reason,
        q9_prep_timing,
        q10_target_workplace,
        q10_1_target_job,
        q11_target_region,
        q12_expected_salary,
        q13_1_effort,
        q13_2_method,
        q13_3_peer_talk,
        q13_4_online_search,
        q13_5_offline_search,
        q13_6_dept_aware,
        q13_7_goal_plan,
        q14_1_major_competency,
        q14_2_company_understanding,
        q14_3_job_understanding,
        q14_4_field_practice,
        q14_5_certificate,
        q14_6_language,
        q14_7_contest,
        q14_8_job_fair,
        q14_9_general_competency,
        q15_earned_certificates,
        q16_info_route,
        q17_most_needed,
        q18_needed_programs,
        q19_desired_program_essay,
        q20_1_semester_lecture_hours,
        q20_1_vacation_lecture_hours,
        q20_2_semester_camp_days,
        q20_2_vacation_camp_days,
        q21_selection_criteria,
        q22_desired_external_sites,
        q23_course_requirement_opinion,
        responses,
        raw_data
      ) VALUES (
        ${phone},
        ${responses['성별'] || null},
        ${responses['소속_단과대학'] || null},
        ${responses['캠퍼스'] || null},
        ${responses['입학년도'] || null},
        ${responses['학년'] || null},
        ${responses['문1_진로고민_시작시기'] || null},
        ${responses['문2_학과선택_이유'] || null},
        ${responses['문3_직업선택_기준'] || null},
        ${responses['문4_지원부서_인지여부'] || null},
        ${responses['문4-1_알게된_경로'] || null},
        ${responses['문4-2_모르는_이유'] || null},
        ${responses['문5_지원실_방문횟수'] || null},
        ${responses['문6_프로그램_참여여부'] || null},
        ${responses['문6-1_미참여_이유'] || null},
        ${responses['문7_취업역량시스템_활용여부'] || null},
        ${responses['문7-1_만족한_기능'] || null},
        ${responses['문8_졸업후_진로'] || null},
        ${responses['문8-1_계획없는_이유'] || null},
        ${responses['문9_취업준비_적정시기'] || null},
        ${responses['문10_희망취업처'] || null},
        ${responses['문10-1_희망직무'] || null},
        ${responses['문11_희망근무지역'] || null},
        ${responses['문12_예상연봉'] || null},
        ${responses['문13_1_진로설정_노력'] || null},
        ${responses['문13_2_정보탐색_방법인지'] || null},
        ${responses['문13_3_지인과_대화'] || null},
        ${responses['문13_4_온라인_자료탐색'] || null},
        ${responses['문13_5_오프라인_자료탐색'] || null},
        ${responses['문13_6_교내외_기관인지'] || null},
        ${responses['문13_7_구체적_목표와_계획'] || null},
        ${responses['문14_1_전공역량_함양'] || null},
        ${responses['문14_2_기업_이해'] || null},
        ${responses['문14_3_직무_이해'] || null},
        ${responses['문14_4_현장실습_경험'] || null},
        ${responses['문14_5_전공자격증'] || null},
        ${responses['문14_6_외국어능력'] || null},
        ${responses['문14_7_공모전경험'] || null},
        ${responses['문14_8_채용박람회_참여'] || null},
        ${responses['문14_9_일반직무역량'] || null},
        ${responses['문15_취득자격증'] || null},
        ${responses['문16_정보획득_경로'] || null},
        ${responses['문17_가장_필요한_것'] || null},
        ${responses['문18_필요한_프로그램_분야'] || null},
        ${responses['문19_희망프로그램_서술형'] || null},
        ${responses['문20-1_학기중_특강시간'] || null},
        ${responses['문20-1_방학중_특강시간'] || null},
        ${responses['문20-2_학기중_캠프일정'] || null},
        ${responses['문20-2_방학중_캠프일정'] || null},
        ${responses['문21_프로그램_선택요소'] || null},
        ${responses['문22_희망_외부사이트'] || null},
        ${responses['문23_교과목_필수화_의견'] || null},
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
