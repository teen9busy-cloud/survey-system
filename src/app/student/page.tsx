'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';
import LikertScale from '@/components/LikertScale';
import { STUDENT_SURVEY, Question } from '@/lib/questions-student';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

export default function StudentSurveyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneDuplicateError, setPhoneDuplicateError] = useState<string | null>(null);

  const totalSteps = STUDENT_SURVEY.length;
  const currentPart = STUDENT_SURVEY[currentStep - 1];

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMessage(null);

    // 전화번호 입력 시 중복 에러 초기화
    if (id === '연락처') {
      setPhoneDuplicateError(null);
    }
  };

  // 전화번호 blur 시 실시간 중복 체크
  const handlePhoneBlur = async () => {
    const rawPhone = formData['연락처'];
    if (!rawPhone) return;
    const phone = rawPhone.replace(/[^0-9]/g, '');
    if (phone.length < 10) return;

    try {
      setPhoneChecking(true);
      const res = await fetch(`/api/survey/check-duplicate?type=student&phone=${phone}`);
      const data = await res.json();
      if (data.isDuplicate) {
        setPhoneDuplicateError('이미 등록된 휴대전화번호입니다. 중복 참여는 불가합니다.');
      } else {
        setPhoneDuplicateError(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPhoneChecking(false);
    }
  };

  // 조건부 문항 노출 검사
  const isQuestionVisible = (q: Question): boolean => {
    if (!q.dependsOn) return true;
    const parentVal = formData[q.dependsOn.questionId];
    return parentVal === q.dependsOn.value;
  };

  // 현재 단계 필수 입력 항목 검증
  const validateStep = (): boolean => {
    for (const q of currentPart.questions) {
      if (!isQuestionVisible(q)) continue;

      if (q.type === 'likert') {
        if (q.likertItems) {
          for (const item of q.likertItems) {
            if (!formData[item.id]) {
              setErrorMessage(`"${q.title}" 항목의 모든 평가를 완료해 주세요.`);
              return false;
            }
          }
        }
      } else if (q.required) {
        const val = formData[q.id];
        if (!val || (typeof val === 'string' && val.trim() === '')) {
          setErrorMessage(`"${q.title}" 문항을 선택하거나 입력해 주세요.`);
          return false;
        }
      }
    }

    if (currentStep === totalSteps) {
      const rawPhone = formData['연락처'] || '';
      const phone = rawPhone.replace(/[^0-9]/g, '');
      if (!/^01[0-9]{8,9}$/.test(phone)) {
        setErrorMessage('휴대전화번호를 올바른 형식(예: 01012345678)으로 입력해 주세요.');
        return false;
      }
      if (phoneDuplicateError) {
        setErrorMessage(phoneDuplicateError);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/survey/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: formData,
          raw_data: formData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || '설문 제출 중 오류가 발생했습니다.');
      }

      router.push('/complete');
    } catch (err: any) {
      setErrorMessage(err.message || '네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header title="학생용 진로·취업 의식조사" badge="학생용" />

      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitles={STUDENT_SURVEY.map((p) => p.title)}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-10">
        {/* 오류 안내 배너 */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 shadow-xs animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">입력 내용을 확인해 주세요</p>
              <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 현재 파트 헤더 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
            Part {currentStep} of {totalSteps}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {currentPart.title}
          </h1>
          {currentPart.description && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentPart.description}
            </p>
          )}
        </div>

        {/* 문항 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentPart.questions.map((q) => {
            if (!isQuestionVisible(q)) return null;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <label className="block text-base sm:text-lg font-bold text-slate-800 leading-snug">
                    {q.title}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>

                {q.description && (
                  <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
                    {q.description}
                  </p>
                )}

                {/* 1. Radio 단일 선택 */}
                {q.type === 'radio' && q.options && (
                  <div className="space-y-2.5">
                    {q.options.map((option) => {
                      const isSelected = formData[q.id] === option;
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all select-none text-sm sm:text-base ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 font-semibold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleInputChange(q.id, option)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <span className="flex-1">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 2. Select 드롭다운 */}
                {q.type === 'select' && q.options && (
                  <div className="relative">
                    <select
                      value={formData[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-full p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                    >
                      <option value="">선택해 주세요</option>
                      {q.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Likert 5점 척도 */}
                {q.type === 'likert' && q.options && q.likertItems && (
                  <LikertScale
                    options={q.options}
                    items={q.likertItems}
                    values={formData}
                    onChange={(itemId, val) => handleInputChange(itemId, val)}
                  />
                )}

                {/* 4. Text input */}
                {q.type === 'text' && (
                  <div>
                    <input
                      type="text"
                      value={formData[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      onBlur={q.id === '연락처' ? handlePhoneBlur : undefined}
                      placeholder={q.id === '연락처' ? '01012345678' : '입력해 주세요'}
                      className={`w-full p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base focus:outline-none focus:ring-2 transition-all ${
                        phoneDuplicateError
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                      }`}
                    />
                    {phoneChecking && (
                      <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> 중복 참여 여부 확인 중...
                      </p>
                    )}
                    {phoneDuplicateError && (
                      <p className="text-xs text-red-600 font-medium mt-2">
                        {phoneDuplicateError}
                      </p>
                    )}
                  </div>
                )}

                {/* 5. Textarea */}
                {q.type === 'textarea' && (
                  <textarea
                    rows={4}
                    value={formData[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="자유롭게 의견을 작성해 주세요 (선택사항)"
                    className="w-full p-3.5 sm:p-4 rounded-xl border border-slate-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
                  />
                )}
              </div>
            );
          })}

          {/* 하단 네비게이션 버튼 */}
          <div className="flex items-center justify-between gap-4 pt-4 pb-12">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                이전 단계
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200 ml-auto"
              >
                다음 단계
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-200 ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    제출 처리 중...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    설문 최종 제출하기
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
