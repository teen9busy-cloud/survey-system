-- =========================================================================
-- Neon Postgres Survey Database Schema (2027학년도 최신판)
-- 경상국립대학교 진로·취업 의식조사 (학생용 및 교원용)
-- =========================================================================

-- 1. UUID 확장 기능 활성화 (PostgreSQL 기본 내장)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 2. 학생용 설문 응답 테이블 (student_survey_responses)
-- =========================================================================
CREATE TABLE IF NOT EXISTS student_survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    phone VARCHAR(20) NOT NULL,
    
    -- 기본 인적사항
    gender VARCHAR(20),
    college VARCHAR(100),
    campus VARCHAR(50),
    admission_year VARCHAR(20),
    grade VARCHAR(20),
    
    -- 전체 응답 및 세부 문항 (JSONB)
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 전화번호 유니크 인덱스 (중복 제출 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_survey_phone ON student_survey_responses(phone);
CREATE INDEX IF NOT EXISTS idx_student_survey_submitted_at ON student_survey_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_survey_college ON student_survey_responses(college);
CREATE INDEX IF NOT EXISTS idx_student_survey_campus ON student_survey_responses(campus);


-- =========================================================================
-- 3. 교원용 설문 응답 테이블 (faculty_survey_responses)
-- =========================================================================
CREATE TABLE IF NOT EXISTS faculty_survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    phone VARCHAR(20) NOT NULL,
    
    -- Part 1. 공통사항
    gender VARCHAR(20),
    college VARCHAR(100),
    campus VARCHAR(50),
    position VARCHAR(50),
    
    -- 전체 응답 및 세부 문항 (JSONB)
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 전화번호 유니크 인덱스 (중복 제출 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_survey_phone ON faculty_survey_responses(phone);
CREATE INDEX IF NOT EXISTS idx_faculty_survey_submitted_at ON faculty_survey_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_faculty_survey_college ON faculty_survey_responses(college);
CREATE INDEX IF NOT EXISTS idx_faculty_survey_campus ON faculty_survey_responses(campus);
