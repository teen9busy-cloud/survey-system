'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import {
  Download,
  Users,
  Key,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface StatsOverview {
  totalCount: number;
  studentCount: number;
  facultyCount: number;
  todayCount: number;
  collegeStats: Record<string, number>;
  recentSubmissions: Array<{
    type: string;
    college: string;
    grade: string;
    submitted_at: string;
    phone: string;
  }>;
}

export default function AdminDashboardPage() {
  const [secret, setSecret] = useState('surveyadmin2026!');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [selectedType, setSelectedType] = useState<'student' | 'faculty'>('student');
  const [detailData, setDetailData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 실시간 통계 조회
  const fetchOverview = useCallback(async (pass: string) => {
    try {
      const res = await fetch(`/api/admin/export?action=overview&secret=${encodeURIComponent(pass)}`);
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || '통계 조회에 실패했습니다.');
      }
      setStats(resData.stats);
      setLastUpdated(new Date());
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || '인증에 실패했습니다.');
      setIsAuthenticated(false);
    }
  }, []);

  // 상세 목록 조회
  const fetchDetailList = useCallback(async (type: 'student' | 'faculty', pass: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/export?type=${type}&format=json&secret=${encodeURIComponent(pass)}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setDetailData(resData.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOverview(secret);
    fetchDetailList(selectedType, secret);
  };

  const handleManualRefresh = () => {
    if (isAuthenticated) {
      fetchOverview(secret);
      fetchDetailList(selectedType, secret);
    }
  };

  const handleTabChange = (type: 'student' | 'faculty') => {
    setSelectedType(type);
    if (isAuthenticated) {
      fetchDetailList(type, secret);
    }
  };

  // 실시간 자동 갱신 (10초 주기)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchOverview(secret);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, secret, fetchOverview]);

  // CSV 다운로드 트리거
  const handleDownloadCsv = (type: 'student' | 'faculty') => {
    const downloadUrl = `/api/admin/export?type=${type}&format=csv&secret=${encodeURIComponent(secret)}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header title="설문 관리자 실시간 대시보드" badge="Admin Live" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {!isAuthenticated ? (
          /* 로그인 폼 카드 */
          <div className="max-w-md mx-auto mt-16 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 mx-auto shadow-inner">
              <Key className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              관리자 대시보드 접속
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              실시간 응답자 집계 및 전체 데이터 엑셀(CSV) 다운로드를 위한 비밀키를 입력하세요.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 text-left animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    관리자 비밀키
                  </label>
                  <span className="text-xs text-indigo-600 font-medium">기본: surveyadmin2026!</span>
                </div>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="비밀키를 입력하세요"
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2"
              >
                대시보드 로그인
              </button>
            </form>
          </div>
        ) : (
          /* 실시간 대시보드 메인 */
          <div className="space-y-8">
            {/* 상단 컨트롤 바 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    실시간 집계 중
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    설문 응답 현황 분석
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  마지막 업데이트: {lastUpdated ? lastUpdated.toLocaleTimeString('ko-KR') : '-'}
                  {autoRefresh && <span className="text-indigo-600 font-medium">(10초 자동 새로고침)</span>}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none bg-slate-100 px-3 py-2 rounded-xl">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  자동 갱신
                </label>

                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                  title="지금 새로고침"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* 핵심 통계 요약 카드 4종 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. 총 응답자 수 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    총 누적 응답자
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    {stats?.totalCount ?? 0}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">명</span>
                </div>
                <span className="text-xs text-slate-400 mt-2 block">
                  학생 + 교원 전체 통합 집계
                </span>
              </div>

              {/* 2. 학생용 응답자 수 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    학생용 응답 수
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600">
                    {stats?.studentCount ?? 0}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">건</span>
                </div>
                <span className="text-xs text-slate-400 mt-2 block">
                  재학생 진로·취업 의식조사
                </span>
              </div>

              {/* 3. 교원용 응답자 수 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    교원용 응답 수
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                    {stats?.facultyCount ?? 0}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">건</span>
                </div>
                <span className="text-xs text-slate-400 mt-2 block">
                  교수/강사진 지도 실태조사
                </span>
              </div>

              {/* 4. 오늘 신규 응답 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    오늘 접수 건수
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-600">
                    {stats?.todayCount ?? 0}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">건</span>
                </div>
                <span className="text-xs text-slate-400 mt-2 block">
                  금일 자정 이후 신규 제출
                </span>
              </div>
            </div>

            {/* 엑셀(CSV) 다운로드 전용 카드 섹션 */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold">전체 응답 데이터 원본 엑셀(CSV) 내보내기</h3>
                  </div>
                  <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                    구글 앱스 스크립트 시트의 문항 헤더와 100% 동일한 양식으로 다운로드됩니다. 
                    엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 인코딩이 적용되어 있습니다.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv('student')}
                    className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all transform hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    학생용 응답 다운로드 (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv('faculty')}
                    className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all transform hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    교원용 응답 다운로드 (.csv)
                  </button>
                </div>
              </div>
            </div>

            {/* 단과대학별 응답 분포 & 최근 응답 타임라인 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 단과대학별 분포 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 text-base">단과대별 응답 분포</h4>
                </div>

                {stats?.collegeStats && Object.keys(stats.collegeStats).length > 0 ? (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {Object.entries(stats.collegeStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([college, count]) => {
                        const pct = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
                        return (
                          <div key={college}>
                            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                              <span>{college}</span>
                              <span className="text-slate-500">{count}명 ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-8 text-center">집계된 데이터가 없습니다.</p>
                )}
              </div>

              {/* 최근 응답자 실시간 타임라인 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-slate-800 text-base">최근 설문 응답자 타임라인</h4>
                  </div>
                  <span className="text-xs text-slate-400">최근 10건</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">구분</th>
                        <th className="p-3">소속 단과대학</th>
                        <th className="p-3">학년/직급</th>
                        <th className="p-3">연락처</th>
                        <th className="p-3 text-right">제출 시간</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                        stats.recentSubmissions.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-2xs font-bold ${
                                item.type === '학생용'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-slate-800">{item.college}</td>
                            <td className="p-3">{item.grade}</td>
                            <td className="p-3 font-mono text-slate-500">{item.phone}</td>
                            <td className="p-3 text-right text-slate-400">
                              {new Date(item.submitted_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            응답 내역이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 전체 응답 상세 데이터 목록 및 탭 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTabChange('student')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      selectedType === 'student'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    학생용 상세 응답 ({stats?.studentCount ?? 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('faculty')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      selectedType === 'faculty'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    교원용 상세 응답 ({stats?.facultyCount ?? 0})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadCsv(selectedType)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  현재 탭 CSV 다운로드
                </button>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                {detailData.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    {loading ? '데이터를 불러오는 중...' : '등록된 데이터가 없습니다.'}
                  </div>
                ) : (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3">제출 일시</th>
                        <th className="p-3">연락처</th>
                        <th className="p-3">성별</th>
                        <th className="p-3">소속 단과대학</th>
                        {selectedType === 'student' ? (
                          <>
                            <th className="p-3">캠퍼스</th>
                            <th className="p-3">입학년도</th>
                            <th className="p-3">학년</th>
                            <th className="p-3">진로 고민 시작</th>
                            <th className="p-3">희망 취업처</th>
                          </>
                        ) : (
                          <>
                            <th className="p-3">직급</th>
                            <th className="p-3">특강 참여의향</th>
                            <th className="p-3">참여가능 시간</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {detailData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80">
                          <td className="p-3 whitespace-nowrap">
                            {new Date(row.submitted_at).toLocaleString('ko-KR')}
                          </td>
                          <td className="p-3 font-mono">{row.phone}</td>
                          <td className="p-3">{row.gender || '-'}</td>
                          <td className="p-3">{row.college || '-'}</td>
                          {selectedType === 'student' ? (
                            <>
                              <td className="p-3">{row.campus || '-'}</td>
                              <td className="p-3">{row.admission_year || '-'}</td>
                              <td className="p-3">{row.grade || '-'}</td>
                              <td className="p-3">{row.q1_start_period || row.raw_data?.['문1_진로고민_시작시기'] || '-'}</td>
                              <td className="p-3">{row.q10_target_workplace || row.raw_data?.['문10_희망취업처'] || '-'}</td>
                            </>
                          ) : (
                            <>
                              <td className="p-3">{row.position || '-'}</td>
                              <td className="p-3">{row.q13_participation_intent || row.raw_data?.['문13_특강 참여의향'] || '-'}</td>
                              <td className="p-3">{row.q9_available_hours || row.raw_data?.['문9_참여가능 교육시간'] || '-'}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
