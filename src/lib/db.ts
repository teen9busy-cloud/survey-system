import { neon } from '@neondatabase/serverless';

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다. .env.local 또는 Vercel 환경변수에 Neon DB URL을 등록해 주세요.');
  }
  return neon(databaseUrl);
}

/**
 * 전화번호 문자열 정제 (숫자만 추출)
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * 전화번호 형식 유효성 검사 (10~11자리)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = sanitizePhone(phone);
  return /^01[0-9]{8,9}$/.test(cleaned);
}
