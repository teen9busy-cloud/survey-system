import Link from 'next/link';
import { GraduationCap, BookOpen, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100/60">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-16">
        {/* 히어로 헤더 */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> 2026년도 진로·취업 지원 고도화
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            진로·취업 의식 및 요구도 조사
          </h1>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            대학 구성원의 소중한 의견을 수렴하여 더욱 실효성 있는 진로 탐색 및 취업 지원 프로그램을 마련하고자 합니다. 해당하시는 설문 대상을 선택하여 참여해 주시기 바랍니다.
          </p>
        </div>

        {/* 설문 선택 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* 학생용 설문 카드 */}
          <div className="relative group bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-t-2xl group-hover:h-2 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 mb-2">
                재학생 대상
              </span>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                학생용 진로·취업 의식조사
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                진로 설정 현황, 취업 준비도, 교내 프로그램 수요 및 지원실 인지도 등에 관한 설문입니다.
              </p>

              <ul className="space-y-2 text-xs text-slate-500 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  소요 시간: 약 3 ~ 5분
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  참여 혜택: 모바일 기프티콘 추첨 증정
                </li>
              </ul>
            </div>

            <Link
              href="/student"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200 group-hover:shadow-indigo-300"
            >
              학생용 설문 시작하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 교원용 설문 카드 */}
          <div className="relative group bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600 rounded-t-2xl group-hover:h-2 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                교원(교수·강사) 대상
              </span>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                교원용 진로·취업 지원 의식조사
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                학과 학생 지도 현황, 지도 시 애로사항 및 교원 연수/특강 수요에 관한 설문입니다.
              </p>

              <ul className="space-y-2 text-xs text-slate-500 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  소요 시간: 약 3분
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  참여 혜택: 설문 참여 감사 상품 증정
                </li>
              </ul>
            </div>

            <Link
              href="/faculty"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-200 group-hover:shadow-emerald-300"
            >
              교원용 설문 시작하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 하단 푸터 & 관리자 링크 */}
        <footer className="mt-16 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>응답하신 모든 내용은 통계법 제33조에 의해 비밀이 보장되며, 통계 분석 및 사업 개선 목적으로만 활용됩니다.</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
          >
            🔒 관리자 대시보드
          </Link>
        </footer>
      </main>
    </div>
  );
}
