'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';
import LikertScale from '@/components/LikertScale';
import RankingSelect from '@/components/RankingSelect';
import { STUDENT_SURVEY, Question } from '@/lib/questions-student';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, Eye, ExternalLink } from 'lucide-react';

function StudentSurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

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

  // 체크박스 다중 선택 핸들러
  const handleCheckboxChange = (q: Question, option: string) => {
    const currentList: string[] = Array.isArray(formData[q.id]) ? [...formData[q.id]] : [];
    const index = currentList.indexOf(option);

    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      if (q.maxSelect && currentList.length >= q.maxSelect) {
        setErrorMessage(`최대 ${q.maxSelect}개까지만 선택할 수 있습니다.`);
        return;
      }
      currentList.push(option);
    }

    setFormData((prev) => ({ ...prev, [q.id]: currentList }));
    setErrorMessage(null);
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
      } else if (q.type === 'ranking') {
        const rankingVal = formData[q.id] || {};
        if (!rankingVal.rank1 || !rankingVal.rank2 || !rankingVal.rank3) {
          setErrorMessage(`"${q.title}" 문항의 1순위, 2순위, 3순위를 모두 선택해 주세요.`);
          return false;
        }
      } else if (q.type === 'checkbox') {
        const list = formData[q.id];
        if (q.required && (!Array.isArray(list) || list.length === 0)) {
          setErrorMessage(`"${q.title}" 문항을 최소 1개 이상 선택해 주세요.`);
          return false;
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
    if (!isPreview && !validateStep()) {
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

  const handleStepJump = (step: number) => {
    if (isPreview) {
      setErrorMessage(null);
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPreview) {
      alert('현재 [검토 / 미리보기 모드]입니다. 실제 설문 제출 데이터는 DB에 저장되지 않습니다.');
      return;
    }

    if (!validateStep()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

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
      {/* 검토/미리보기 모드 안내 배너 */}
      {isPreview && (
        <aside aria-label="검토 모드 안내" className="bg-amber-500 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 shrink-0 text-amber-100" />
              <span>[검토 / 미리보기 모드] 필수 입력 없이 자유롭게 모든 단계를 둘러보실 수 있습니다.</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-amber-600/90 text-amber-50 px-2 py-0.5 rounded font-normal">
                상단 Part 클릭 시 즉시 점프
              </span>
              <span className="bg-amber-700 text-amber-100 px-2 py-0.5 rounded font-bold">
                DB 저장 차단됨
              </span>
            </div>
          </div>
        </aside>
      )}

      <Header title="학생용 진로·취업 의식조사" badge="학생용" />

      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitles={STUDENT_SURVEY.map((p) => p.title)}
        onStepClick={isPreview ? handleStepJump : undefined}
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

                {/* 2. Checkbox 다중 선택 */}
                {q.type === 'checkbox' && q.options && (
                  <div className="space-y-2.5">
                    {q.maxSelect && (
                      <div className="mb-2 flex items-center justify-between text-xs text-indigo-700 bg-indigo-50/60 px-3 py-1.5 rounded-lg border border-indigo-100">
                        <span>최대 {q.maxSelect}개까지 선택 가능</span>
                        <span className="font-semibold">
                          선택됨: {Array.isArray(formData[q.id]) ? formData[q.id].length : 0} / {q.maxSelect}
                        </span>
                      </div>
                    )}
                    {q.options.map((option) => {
                      const list: string[] = Array.isArray(formData[q.id]) ? formData[q.id] : [];
                      const isSelected = list.includes(option);
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
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(q, option)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="flex-1">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 3. Ranking 우선순위 선택 (1, 2, 3순위) */}
                {q.type === 'ranking' && q.options && (
                  <RankingSelect
                    options={q.options}
                    value={formData[q.id]}
                    onChange={(val) => handleInputChange(q.id, val)}
                  />
                )}

                {/* 4. Select 드롭다운 */}
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

                {/* 5. Likert 5점 척도 */}
                {q.type === 'likert' && q.options && q.likertItems && (
                  <LikertScale
                    options={q.options}
                    items={q.likertItems}
                    values={formData}
                    onChange={(itemId, val) => handleInputChange(itemId, val)}
                  />
                )}

                {/* 6. Text input */}
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

                {/* 7. Textarea */}
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow"
              >
                다음 단계
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    설문 제출하기
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

export default function StudentSurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <StudentSurveyContent />
    </Suspense>
  );
}
