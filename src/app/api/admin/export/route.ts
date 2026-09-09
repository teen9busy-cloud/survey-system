import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GAS 학생용 원본 헤더 목록
const STUDENT_HEADERS = [
  "타임스탬프", "UUID", "성별", "소속_단과대학", "캠퍼스", "입학년도", "학년",
  "문1_진로고민_시작시기", "문2_학과선택_이유", "문3_직업선택_기준", "문4_지원부서_인지여부",
  "문4-1_알게된_경로", "문4-2_모르는_이유", "문5_지원실_방문횟수", "문6_프로그램_참여여부",
  "문6-1_미참여_이유", "문7_취업역량시스템_활용여부", "문7-1_만족한_기능", "문8_졸업후_진로",
  "문8-1_계획없는_이유", "문9_취업준비_적정시기", "문10_희망취업처", "문10-1_희망직무",
  "문11_희망근무지역", "문12_예상연봉", "문13_1_진로설정_노력", "문13_2_정보탐색_방법인지",
  "문13_3_지인과_대화", "문13_4_온라인_자료탐색", "문13_5_오프라인_자료탐색", "문13_6_교내외_기관인지",
  "문13_7_구체적_목표와_계획", "문14_1_전공역량_함양", "문14_2_기업_이해", "문14_3_직무_이해",
  "문14_4_현장실습_경험", "문14_5_전공자격증", "문14_6_외국어능력", "문14_7_공모전경험",
  "문14_8_채용박람회_참여", "문14_9_일반직무역량", "문15_취득자격증", "문16_정보획득_경로",
  "문17_가장_필요한_것", "문18_필요한_프로그램_분야", "문19_희망프로그램_서술형",
  "문20-1_학기중_특강시간", "문20-1_방학중_특강시간", "문20-2_학기중_캠프일정", "문20-2_방학중_캠프일정",
  "문21_프로그램_선택요소", "문22_희망_외부사이트", "문23_교과목_필수화_의견", "연락처"
];

// GAS 교원용 원본 헤더 목록
const FACULTY_HEADERS = [
  "타임스탬프", "성별", "소속 단과대학", "직급",
  "문1_지도 직무범위", "문2_지도 중요사항", "문3_지도 어려움 이유", "문4_정보 획득 경로",
  "문5_필요한 지원", "문6_가이드북 희망주제", "문7_취업률 제고 우선영역", "문8_꿈미래개척 필요자료",
  "문9_참여가능 교육시간", "문10_참여 최적시기", "문11_특강 희망내용", "문12_특강 운영방법",
  "문13_특강 참여의향", "문13-1_미참여 이유", "문14_진로취업지원실에 바라는 점", "연락처"
];

// DB 연결 전 데모/테스트용 샘플 데이터 생성기
function getSampleData(type: 'student' | 'faculty') {
  if (type === 'student') {
    return [
      {
        id: "demo-s-1",
        submitted_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        phone: "010****1234",
        gender: "여성",
        college: "공과대학",
        campus: "가좌",
        admission_year: "2023년",
        grade: "2학년",
        raw_data: {
          "타임스탬프": new Date(Date.now() - 1000 * 60 * 15).toLocaleString('ko-KR'),
          "성별": "여성",
          "소속_단과대학": "공과대학",
          "캠퍼스": "가좌",
          "입학년도": "2023년",
          "학년": "2학년",
          "문1_진로고민_시작시기": "1학년",
          "문2_학과선택_이유": "취업이 잘되는 학과",
          "문3_직업선택_기준": "성장 가능성",
          "문4_지원부서_인지여부": "예",
          "문4-1_알게된_경로": "홈페이지",
          "문5_지원실_방문횟수": "1회",
          "문6_프로그램_참여여부": "예",
          "문7_취업역량시스템_활용여부": "있다",
          "문8_졸업후_진로": "취업",
          "문10_희망취업처": "대기업",
          "문10-1_희망직무": "정보통신·IT",
          "연락처": "010-1234-5678"
        }
      },
      {
        id: "demo-s-2",
        submitted_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        phone: "010****5678",
        gender: "남성",
        college: "경영대학",
        campus: "가좌",
        admission_year: "2022년",
        grade: "3학년",
        raw_data: {
          "타임스탬프": new Date(Date.now() - 1000 * 60 * 45).toLocaleString('ko-KR'),
          "성별": "남성",
          "소속_단과대학": "경영대학",
          "캠퍼스": "가좌",
          "입학년도": "2022년",
          "학년": "3학년",
          "문1_진로고민_시작시기": "2학년",
          "문2_학과선택_이유": "적성에 맞아서",
          "문3_직업선택_기준": "급여 및 복리후생",
          "문4_지원부서_인지여부": "예",
          "문4-1_알게된_경로": "안내 문자",
          "문5_지원실_방문횟수": "2회",
          "문6_프로그램_참여여부": "예",
          "문7_취업역량시스템_활용여부": "있다",
          "문8_졸업후_진로": "공기업",
          "문10_희망취업처": "공공기관/공기업",
          "문10-1_희망직무": "금융·보험",
          "연락처": "010-9876-5432"
        }
      }
    ];
  } else {
    return [
      {
        id: "demo-f-1",
        submitted_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        phone: "010****3333",
        gender: "남성",
        college: "공과대학",
        position: "교수",
        raw_data: {
          "타임스탬프": new Date(Date.now() - 1000 * 60 * 30).toLocaleString('ko-KR'),
          "성별": "남성",
          "소속 단과대학": "공과대학",
          "직급": "교수",
          "문1_지도 직무범위": "위의 모든 내용",
          "문2_지도 중요사항": "전공 교육 및 전공 관련 직무 정보 제공",
          "문3_지도 어려움 이유": "기존 업무로 인한 시간 부족",
          "문4_정보 획득 경로": "본인의 지식과 경험",
          "문5_필요한 지원": "진로·취업 지도에 대한 활동비, 인센티브 등 성과 지원",
          "문13_특강 참여의향": "예",
          "연락처": "010-3333-7777"
        }
      }
    ];
  }
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
      // DB 미연결 시 데모 통계 반환
      return NextResponse.json({
        success: true,
        isDemo: true,
        stats: {
          totalCount: 3,
          studentCount: 2,
          facultyCount: 1,
          todayCount: 3,
          collegeStats: {
            "공과대학": 2,
            "경영대학": 1,
          },
          recentSubmissions: [
            { type: "학생용", college: "공과대학", grade: "2학년", submitted_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), phone: "010****1234" },
            { type: "교원용", college: "공과대학", grade: "교수", submitted_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), phone: "010****3333" },
            { type: "학생용", college: "경영대학", grade: "3학년", submitted_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), phone: "010****5678" }
          ]
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

      // 단과대별 통계
      const collegeStats: Record<string, number> = {};
      [...studentRows, ...facultyRows].forEach(r => {
        const c = r.college || "기타";
        collegeStats[c] = (collegeStats[c] || 0) + 1;
      });

      // 최근 응답 10건
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
        isDemo: false,
        stats: {
          totalCount,
          studentCount,
          facultyCount,
          todayCount,
          collegeStats,
          recentSubmissions: recent
        }
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  // 2. 응답 데이터 조회 및 CSV 다운로드 처리
  let rows: any[] = [];
  let isDemo = false;

  if (!process.env.DATABASE_URL) {
    rows = getSampleData(type);
    isDemo = true;
  } else {
    try {
      const sql = getDb();
      const table = type === 'faculty' ? 'faculty_survey_responses' : 'student_survey_responses';
      rows = await sql(`SELECT * FROM ${table} ORDER BY submitted_at DESC`);
    } catch (err: any) {
      console.error(err);
      rows = getSampleData(type);
      isDemo = true;
    }
  }

  // CSV 다운로드 포맷
  if (format === 'csv') {
    const headers = type === 'student' ? STUDENT_HEADERS : FACULTY_HEADERS;
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      const raw = row.raw_data || {};
      const line = headers.map(header => {
        let val = raw[header];
        if (val === undefined || val === null) {
          if (header === "타임스탬프") val = row.submitted_at ? new Date(row.submitted_at).toLocaleString('ko-KR') : "";
          else if (header === "UUID") val = row.id || "";
          else if (header === "연락처") val = row.phone || "";
          else if (header === "성별") val = row.gender || "";
          else if (header === "소속_단과대학" || header === "소속 단과대학") val = row.college || "";
          else if (header === "캠퍼스") val = row.campus || "";
          else if (header === "입학년도") val = row.admission_year || "";
          else if (header === "학년") val = row.grade || "";
          else if (header === "직급") val = row.position || "";
          else val = "";
        }

        if (typeof val === 'object') val = JSON.stringify(val);
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvLines.push(line.join(','));
    }

    // 엑셀에서 한글 깨짐 방지를 위한 UTF-8 BOM 추가
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const filename = `${type === 'student' ? '학생용' : '교원용'}_진로취업_설문응답_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  }

  // JSON 응답
  return NextResponse.json({
    success: true,
    type,
    isDemo,
    totalCount: rows.length,
    data: rows,
  });
}
