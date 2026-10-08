import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// 2027학년도 학생용 최신 헤더 목록 (10개 프로그램 5점 척도 + Top 3 선택 + The자람 제도 등 반영)
const STUDENT_HEADERS = [
  "타임스탬프", "UUID", "연락처",
  "성별", "소속_단과대학", "캠퍼스", "입학년도", "학년",
  "문1_진로고민_시작시기", "문2_학과선택_이유", "문3_직업선택_기준",
  "문4_지원부서_인지여부", "문4-1_알게된_경로", "문4-2_모르는_이유",
  "문5_방문경험", "문5-1_방문횟수", "문6_프로그램_참여여부", "문6-1_미참여_이유",
  "문7_학생역량시스템_활용여부", "문7-1_활용_기능_1순위", "문7-1_활용_기능_2순위", "문7-1_활용_기능_3순위",
  "문8_더자람제도_인지여부", "문8-1_더자람_인지경로", "문8-2_더자람_도움기대도", "문8-3_더자람_미인지이유",
  "문9_졸업후_진로", "문9-1_계획없는_이유", "문10_취업준비_적정시기", "문11_희망취업처", "문11-1_희망직무",
  "문12_희망근무지역", "문13_희망연봉",
  "문14_1_진로설정_적극노력", "문14_2_정보탐색_스스로", "문14_3_지인과_진로대화", "문14_4_구체적_목표계획",
  "문15_1_전공직무_역량함양", "문15_2_기업채용_정보탐색", "문15_3_취업역량_개발", "문15_4_직무경험", "문15_5_상담프로그램_참여",
  "문16_취득자격증", "문17_정보획득_경로", "문18_가장_필요한것",
  "문19_필요도_개일상담", "문19_필요도_교과목", "문19_필요도_정보제공", "문19_필요도_취업처추천",
  "문19_필요도_채용설명회", "문19_필요도_역량강화", "문19_필요도_직무자격", "문19_필요도_NCS인적성",
  "문19_필요도_해외취업", "문19_필요도_학과맞춤",
  "문20_희망프로그램_의견",
  "문21_1_학기중_특강시간", "문21_1_방학중_특강시간",
  "문21_2_학기중_캠프일정", "문21_2_방학중_캠프일정",
  "문22_비교과_선택요소", "문23_희망_외부포털", "문24_교과목_필수화_의견"
];

// 2027학년도 교원용 최신 헤더 목록 (캠퍼스 추가, The자람 제도 등 반영)
const FACULTY_HEADERS = [
  "타임스탬프", "UUID", "연락처",
  "성별", "소속_단과대학", "캠퍼스", "직급",
  "문1_지도_직무범위", "문2_지도_중요사항", "문3_지도_어려움_이유", "문4_정보_획득_경로",
  "문5_필요한_지원", "문6_가이드북_희망주제", "문7_취업률제고_우선영역",
  "문8_더자람제도_인지여부", "문8-1_더자람_인지경로", "문8-2_더자람_도움기대도",
  "문8-3_더자람_정착필요사항", "문8-4_더자람_미인지이유",
  "문9_꿈미래개척_희망자료",
  "문10_특강_운영방법", "문11_참여가능_교육시간", "문12_참여_최적시기",
  "문13_특강_희망내용", "문14_특강_참여의향", "문14-1_미참여_이유", "문15_바라는점"
];

function formatFieldValue(val: any, etcVal?: string): string {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if ((item === '기타' || (typeof item === 'string' && item.startsWith('기타'))) && etcVal) {
          return `기타(${etcVal})`;
        }
        return item;
      })
      .join('; ');
  }
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }
  const str = String(val);
  if ((str === '기타' || str.startsWith('기타')) && etcVal) {
    return `기타(${etcVal})`;
  }
  return str;
}

function getFieldWithEtc(d: any, key: string): string {
  return formatFieldValue(d[key], d[`${key}_기타`]);
}

function extractStudentRow(r: any): string[] {
  const d = r.responses || r.raw_data || {};
  const rankVal = d['문7-1_활용_기능_순위'] || {};

  return [
    r.submitted_at ? new Date(r.submitted_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '',
    r.id || '',
    r.phone || d['연락처'] || '',
    d['성별'] || r.gender || '',
    d['소속_단과대학'] || r.college || '',
    d['캠퍼스'] || r.campus || '',
    d['입학년도'] || r.admission_year || '',
    d['학년'] || r.grade || '',
    getFieldWithEtc(d, '문1_진로고민_시작시기'),
    getFieldWithEtc(d, '문2_학과선택_이유'),
    getFieldWithEtc(d, '문3_직업선택_기준'),
    getFieldWithEtc(d, '문4_지원부서_인지여부'),
    getFieldWithEtc(d, '문4-1_알게된_경로'),
    getFieldWithEtc(d, '문4-2_모르는_이유'),
    getFieldWithEtc(d, '문5_방문경험'),
    getFieldWithEtc(d, '문5-1_방문횟수'),
    getFieldWithEtc(d, '문6_프로그램_참여여부'),
    getFieldWithEtc(d, '문6-1_미참여_이유'),
    getFieldWithEtc(d, '문7_학생역량시스템_활용여부'),
    rankVal.rank1 || '',
    rankVal.rank2 || '',
    rankVal.rank3 || '',
    getFieldWithEtc(d, '문8_더자람제도_인지여부'),
    getFieldWithEtc(d, '문8-1_더자람_인지경로'),
    getFieldWithEtc(d, '문8-2_더자람_도움기대도'),
    getFieldWithEtc(d, '문8-3_더자람_미인지이유'),
    getFieldWithEtc(d, '문9_졸업후_진로'),
    getFieldWithEtc(d, '문9-1_계획없는_이유'),
    getFieldWithEtc(d, '문10_취업준비_적정시기'),
    getFieldWithEtc(d, '문11_희망취업처'),
    getFieldWithEtc(d, '문11-1_희망직무'),
    getFieldWithEtc(d, '문12_희망근무지역'),
    getFieldWithEtc(d, '문13_희망연봉'),
    d['문14_1_진로설정_적극노력'] || '',
    d['문14_2_정보탐색_스스로'] || '',
    d['문14_3_지인과_진로대화'] || '',
    d['문14_4_구체적_목표계획'] || '',
    d['문15_1_전공직무_역량함양'] || '',
    d['문15_2_기업채용_정보탐색'] || '',
    d['문15_3_취업역량_개발'] || '',
    d['문15_4_직무경험'] || '',
    d['문15_5_상담프로그램_참여'] || '',
    getFieldWithEtc(d, '문16_취득자격증'),
    getFieldWithEtc(d, '문17_정보획득_경로'),
    getFieldWithEtc(d, '문18_가장_필요한것'),
    // 10개 프로그램군 5점 척도 필요도 평가
    d['문19_필요도_개일상담'] || '',
    d['문19_필요도_교과목'] || '',
    d['문19_필요도_정보제공'] || '',
    d['문19_필요도_취업처추천'] || '',
    d['문19_필요도_채용설명회'] || '',
    d['문19_필요도_역량강화'] || '',
    d['문19_필요도_직무자격'] || '',
    d['문19_필요도_NCS인적성'] || '',
    d['문19_필요도_해외취업'] || '',
    d['문19_필요도_학과맞춤'] || '',
    d['문20_희망프로그램_의견'] || '',
    getFieldWithEtc(d, '문21_1_학기중_특강시간'),
    getFieldWithEtc(d, '문21_1_방학중_특강시간'),
    getFieldWithEtc(d, '문21_2_학기중_캠프일정'),
    getFieldWithEtc(d, '문21_2_방학중_캠프일정'),
    getFieldWithEtc(d, '문22_비교과_선택요소'),
    getFieldWithEtc(d, '문23_희망_외부포털'),
    getFieldWithEtc(d, '문24_교과목_필수화_의견'),
  ];
}

function extractFacultyRow(r: any): string[] {
  const d = r.responses || r.raw_data || {};

  return [
    r.submitted_at ? new Date(r.submitted_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '',
    r.id || '',
    r.phone || d['연락처'] || '',
    d['성별'] || r.gender || '',
    d['소속_단과대학'] || r.college || '',
    d['캠퍼스'] || '',
    d['직급'] || r.position || '',
    getFieldWithEtc(d, '문1_지도_직무범위'),
    getFieldWithEtc(d, '문2_지도_중요사항'),
    getFieldWithEtc(d, '문3_지도_어려움_이유'),
    getFieldWithEtc(d, '문4_정보_획득_경로'),
    getFieldWithEtc(d, '문5_필요한_지원'),
    getFieldWithEtc(d, '문6_가이드북_희망주제'),
    getFieldWithEtc(d, '문7_취업률제고_우선영역'),
    getFieldWithEtc(d, '문8_더자람제도_인지여부'),
    getFieldWithEtc(d, '문8-1_더자람_인지경로'),
    getFieldWithEtc(d, '문8-2_더자람_도움기대도'),
    getFieldWithEtc(d, '문8-3_더자람_정착필요사항'),
    getFieldWithEtc(d, '문8-4_더자람_미인지이유'),
    d['문9_꿈미래개척_희망자료'] || '',
    getFieldWithEtc(d, '문10_특강_운영방법'),
    getFieldWithEtc(d, '문11_참여가능_교육시간'),
    getFieldWithEtc(d, '문12_참여_최적시기'),
    getFieldWithEtc(d, '문13_특강_희망내용'),
    getFieldWithEtc(d, '문14_특강_참여의향'),
    getFieldWithEtc(d, '문14-1_미참여_이유'),
    d['문15_바라는점'] || '',
  ];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'data';
  const type = (searchParams.get('type') as 'student' | 'faculty') || 'student';
  const format = searchParams.get('format') || 'json';
  const secret = searchParams.get('secret') || '';

  const adminPassword = process.env.ADMIN_PASSWORD || 'surveyadmin2026!';
  if (secret !== adminPassword) {
    return NextResponse.json({ success: false, message: '인증 실패: 유효하지 않은 비밀키입니다.' }, { status: 401 });
  }

  // 1. 통계 요약 (Overview) 요청 처리
  if (action === 'overview') {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        stats: {
          totalCount: 0,
          studentCount: 0,
          facultyCount: 0,
          todayCount: 0,
          collegeStats: {},
          recentSubmissions: []
        }
      });
    }

    try {
      const sql = getDb();
      const studentRows = (await sql`SELECT id, submitted_at, college, grade, phone FROM student_survey_responses ORDER BY submitted_at DESC`) as any[];
      const facultyRows = (await sql`SELECT id, submitted_at, college, position as grade, phone FROM faculty_survey_responses ORDER BY submitted_at DESC`) as any[];

      const studentCount = studentRows.length;
      const facultyCount = facultyRows.length;
      const totalCount = studentCount + facultyCount;

      const today = new Date().toISOString().slice(0, 10);
      const todayCount = [...studentRows, ...facultyRows].filter(r => r.submitted_at && new Date(r.submitted_at).toISOString().slice(0, 10) === today).length;

      const collegeStats: Record<string, number> = {};
      [...studentRows, ...facultyRows].forEach(r => {
        const c = r.college || "기타";
        collegeStats[c] = (collegeStats[c] || 0) + 1;
      });

      const combinedList: any[] = [
        ...studentRows.map(r => ({ ...r, type: "학생용" })),
        ...facultyRows.map(r => ({ ...r, type: "교원용" }))
      ];

      const recent = combinedList
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        .slice(0, 10)
        .map(r => ({
          type: r.type,
          college: r.college || "-",
          grade: r.grade || "-",
          submitted_at: r.submitted_at,
          phone: r.phone ? `${r.phone.slice(0, 3)}****${r.phone.slice(-4)}` : "-"
        }));

      return NextResponse.json({
        success: true,
        stats: {
          totalCount,
          studentCount,
          facultyCount,
          todayCount,
          collegeStats,
          recentSubmissions: recent
        }
      });
    } catch (e: any) {
      console.error(e);
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 2. 전체 데이터 내보내기 (Export Data)
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, message: 'DATABASE_URL이 설정되지 않아 데이터를 다운로드할 수 없습니다.' }, { status: 500 });
  }

  try {
    const sql = getDb();
    let rows: any[] = [];
    let headers: string[] = [];

    if (type === 'student') {
      rows = (await sql`SELECT * FROM student_survey_responses ORDER BY submitted_at DESC`) as any[];
      headers = STUDENT_HEADERS;
    } else {
      rows = (await sql`SELECT * FROM faculty_survey_responses ORDER BY submitted_at DESC`) as any[];
      headers = FACULTY_HEADERS;
    }

    if (format === 'csv') {
      const csvLines = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',')];

      for (const row of rows) {
        const rowData = type === 'student' ? extractStudentRow(row) : extractFacultyRow(row);
        const escaped = rowData.map(val => `"${String(val).replace(/"/g, '""')}"`);
        csvLines.push(escaped.join(','));
      }

      // UTF-8 BOM 추가하여 엑셀 한글 깨짐 방지
      const csvContent = '\uFEFF' + csvLines.join('\r\n');
      const filename = `gnu_survey_${type}_2027_${new Date().toISOString().slice(0, 10)}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
      headers,
      data: rows.map(r => (type === 'student' ? extractStudentRow(r) : extractFacultyRow(r))),
    });
  } catch (error: any) {
    console.error('Export Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
