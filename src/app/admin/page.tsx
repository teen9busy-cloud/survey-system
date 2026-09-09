'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Download, Users, Key, AlertCircle, RefreshCw, GraduationCap, BookOpen } from 'lucide-react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedType, setSelectedType] = useState<'student' | 'faculty'>('student');
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveyData = async (type: 'student' | 'faculty', pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/export?type=${type}&format=json&secret=${encodeURIComponent(pass)}`);
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || '데이터를 불러오지 못했습니다.');
      }
      setData(resData.data || []);
      setTotalCount(resData.totalCount || 0);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || '인증 실패 또는 서버 오류입니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSurveyData(selectedType, secret);
  };

  const handleTabChange = (type: 'student' | 'faculty') => {
    setSelectedType(type);
    if (isAuthenticated) {
      fetchSurveyData(type, secret);
    }
  };

  const handleExportCsv = () => {
    const downloadUrl = `/api/admin/export?type=${selectedType}&format=csv&secret=${encodeURIComponent(secret)}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header title="설문 관리자 대시보드" badge="Admin" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800 mb-2">
              관리자 인증
            </h2>
            <p className="text-xs text-center text-slate-500 mb-6">
              설문 응답 결과 확인 및 CSV 다운로드를 위한 비밀키를 입력하세요.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  관리자 비밀키 (기본: surveyadmin2026!)
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="비밀키 입력"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                대시보드 접속
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 상단 컨트롤 및 탭 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTabChange('student')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    selectedType === 'student'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  학생용 응답 ({selectedType === 'student' ? totalCount : '-'})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('faculty')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    selectedType === 'faculty'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  교원용 응답 ({selectedType === 'faculty' ? totalCount : '-'})
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fetchSurveyData(selectedType, secret)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="새로고침"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-emerald-200"
                >
                  <Download className="w-4 h-4" />
                  CSV 엑셀 다운로드
                </button>
              </div>
            </div>

            {/* 통계 요약 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium block mb-1">총 응답 수</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-500" />
                  {totalCount}건
                </span>
              </div>
            </div>

            {/* 응답 데이터 테이블 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">
                  최근 제출 목록 ({selectedType === 'student' ? '학생용' : '교원용'})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                {data.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    아직 수집된 응답 데이터가 없습니다.
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
                            <th className="p-3">학년</th>
                          </>
                        ) : (
                          <th className="p-3">직급</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {data.map((row) => (
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
                              <td className="p-3">{row.grade || '-'}</td>
                            </>
                          ) : (
                            <td className="p-3">{row.position || '-'}</td>
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
