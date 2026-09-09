-- =========================================================================
-- Neon Postgres Survey Database Schema
-- 진로·취업 의식조사 (학생용 및 교원용)
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
    
    -- Part 1. 진로에 대한 의식 및 준비도
    q1_start_period TEXT,
    q2_major_reason TEXT,
    q3_job_criteria TEXT,
    q4_dept_aware VARCHAR(10),
    q4_1_route TEXT,
    q4_2_unaware_reason TEXT,
    q5_visit_count TEXT,
    q6_program_participate VARCHAR(10),
    q6_1_not_participate_reason TEXT,
    q7_system_use VARCHAR(10),
    q7_1_satisfied_feature TEXT,
    
    -- Part 2. 취업에 대한 의식 및 준비도
    q8_after_grad TEXT,
    q8_1_no_plan_reason TEXT,
    q9_prep_timing TEXT,
    q10_target_workplace TEXT,
    q10_1_target_job TEXT,
    q11_target_region TEXT,
    q12_expected_salary TEXT,
    q13_1_effort TEXT,
    q13_2_method TEXT,
    q13_3_peer_talk TEXT,
    q13_4_online_search TEXT,
    q13_5_offline_search TEXT,
    q13_6_dept_aware TEXT,
    q13_7_goal_plan TEXT,
    q14_1_major_competency TEXT,
    q14_2_company_understanding TEXT,
    q14_3_job_understanding TEXT,
    q14_4_field_practice TEXT,
    q14_5_certificate TEXT,
    q14_6_language TEXT,
    q14_7_contest TEXT,
    q14_8_job_fair TEXT,
    q14_9_general_competency TEXT,
    q15_earned_certificates TEXT,
    q16_info_route TEXT,
    q17_most_needed TEXT,
    
    -- Part 3. 프로그램 수요조사
    q18_needed_programs TEXT,
    q19_desired_program_essay TEXT,
    q20_1_semester_lecture_hours TEXT,
    q20_1_vacation_lecture_hours TEXT,
    q20_2_semester_camp_days TEXT,
    q20_2_vacation_camp_days TEXT,
    q21_selection_criteria TEXT,
    q22_desired_external_sites TEXT,
    q23_course_requirement_opinion TEXT,
    
    -- 전체 응답 및 GAS 원본 헤더 호환 JSONB
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 전화번호 유니크 인덱스 (중복 제출 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_survey_phone ON student_survey_responses(phone);
CREATE INDEX IF NOT EXISTS idx_student_survey_submitted_at ON student_survey_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_survey_college ON student_survey_responses(college);


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
    position VARCHAR(50),
    
    -- Part 2. 진로·취업 지도 인식 및 실태
    q1_job_scope TEXT,
    q2_important_points TEXT,
    q3_difficulty_reasons TEXT,
    q4_info_routes TEXT,
    q5_needed_supports TEXT,
    q6_guidebook_topics TEXT,
    q7_priority_areas TEXT,
    q8_dream_future_material TEXT,
    
    -- Part 3. 진로·취업 지도 특강 수요조사
    q9_available_hours TEXT,
    q10_optimal_timing TEXT,
    q11_special_lecture_topics TEXT,
    q12_operation_methods TEXT,
    q13_participation_intent VARCHAR(10),
    q13_1_non_participation_reason TEXT,
    q14_wishes_for_center TEXT,
    
    -- 전체 응답 및 GAS 원본 헤더 호환 JSONB
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 전화번호 유니크 인덱스 (중복 제출 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_survey_phone ON faculty_survey_responses(phone);
CREATE INDEX IF NOT EXISTS idx_faculty_survey_submitted_at ON faculty_survey_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_faculty_survey_college ON faculty_survey_responses(college);
