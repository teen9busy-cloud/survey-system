# 📊 대학 진로·취업 의식조사 시스템 (Next.js + Neon Postgres)

구글 앱스 스크립트(Google Apps Script) 기반의 설문 시스템을 현대적인 **Next.js (App Router)** 웹 애플리케이션으로 마이그레이션한 프로젝트입니다. 학생용과 교원용 설문을 독립된 경로로 지원하며, **Neon Postgres DB**와 직접 연동되어 안전하고 빠른 응답 데이터 수집 및 관리를 제공합니다.

---

## 🌟 주요 기능 및 특징

1. **학생용 & 교원용 설문 지원**
   - **학생용 (`/student`)**: Part 1(진로 준비도), Part 2(취업 준비도 및 역량 5점 척도), Part 3(프로그램 수요), Part 4(인적사항/연락처)
   - **교원용 (`/faculty`)**: Part 1(공통사항), Part 2(지도 실태/인식), Part 3(특강 수요), Part 4(감사 상품 연락처)
2. **Neon Postgres 직접 연동 및 최적화**
   - `@neondatabase/serverless`를 통한 서버리스 연결 풀링 지원
   - 정규화된 분석 필드와 함께 원본 호환 `raw_data` (JSONB)를 동시 저장하여 기존 엑셀/시트 마이그레이션 호환
   - 연락처(전화번호) 기반 **실시간 중복 제출 방지**
3. **모바일 & PC 반응형 UI/UX**
   - Tailwind CSS 기반 모던 디자인
   - 단계별 진행률 표시줄(Progress Bar)
   - 조건부 문항 노출(예: 인지 여부에 따른 하위 문항 분기)
   - 5점 리커트(Likert) 척도 터치 친화적 인터페이스
4. **관리자 대시보드 (`/admin`)**
   - 비밀키 인증을 통한 실시간 응답 건수 확인
   - 수집된 응답 데이터를 엑셀(CSV, UTF-8 BOM) 형태로 즉시 다운로드

---

## 🗄️ Neon Postgres 데이터베이스 설정

Neon 대시보드(SQL Editor)에서 프로젝트 루트의 `schema.sql` 내용을 실행하여 테이블을 생성합니다.

```bash
# schema.sql 파일 내용이 실행되어 다음 두 테이블이 생성됩니다:
# - student_survey_responses (학생용)
# - faculty_survey_responses (교원용)
```

---

## 🚀 로컬 실행 방법

### 1. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고, Neon 대시보드의 연결 문자열을 입력합니다.

```env
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
ADMIN_PASSWORD="surveyadmin2026!"
```

### 2. 패키지 설치 및 실행
```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 🌐 Vercel 배포 가이드

1. [Vercel](https://vercel.com)에 로그인 후 **Add New Project**를 선택합니다.
2. 연동된 GitHub 리포지토리(`survey-system`)를 Import합니다.
3. **Environment Variables**에 다음 항목을 추가합니다:
   - `DATABASE_URL`: Neon Postgres 연결 문자열
   - `ADMIN_PASSWORD`: 관리자 비밀번호 (예: `surveyadmin2026!`)
4. **Deploy** 버튼을 클릭하면 수초 내로 접속 가능한 배포 URL(예: `https://survey-system-xyz.vercel.app`)이 생성됩니다.
