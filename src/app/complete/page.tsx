'use client';

import Link from 'next/link';
import { Home, X } from 'lucide-react';

export default function CompletePage() {
  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
      // 창이 닫히지 않는 브라우저(탭 분리 안 됨 등)를 위한 fallback
      setTimeout(() => {
        window.location.href = '/';
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f0f4f8]">
      {/* 설문 종료 컨테이너 (카드 스타일) */}
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-14 text-center transform transition duration-500 hover:shadow-3xl border border-slate-100">
        
        {/* 성공 아이콘 (SVG 체크마크) */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center animate-bounce">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* 메인 메시지 */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 leading-tight">
          설문이 종료 되었습니다.
        </h1>

        {/* 감사 메시지 */}
        <p className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
          감사합니다!
        </p>

        {/* 추가 안내 문구 */}
        <p className="text-base text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
          귀하의 소중한 의견은 저희 대학의 진로·취업 지원 서비스와 프로젝트 개선에 큰 도움이 됩니다.
        </p>

        {/* 다음 행동 유도 버튼들 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleClose}
            type="button"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition duration-150 ease-in-out transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            창 닫기
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition duration-150 ease-in-out flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            첫 화면으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
