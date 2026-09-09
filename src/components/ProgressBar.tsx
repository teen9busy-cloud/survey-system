interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
}: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full bg-white border-b border-slate-100 py-3.5 px-4 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-600 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-600">Part {currentStep}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700 truncate max-w-[200px] sm:max-w-md">
              {stepTitles[currentStep - 1]}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {percentage}% 완료
          </span>
        </div>

        {/* 바 형태의 진행도 */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* 스텝 인디케이터 (태블릿/PC) */}
        <div className="hidden sm:grid grid-cols-4 gap-2 mt-3 text-xs text-center">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                type="button"
                key={title}
                onClick={() => onStepClick && onStepClick(stepNum)}
                disabled={!onStepClick}
                className={`py-1 px-2 rounded-lg font-medium transition-all text-left truncate ${
                  isCurrent
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                    : isCompleted
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="mr-1 font-bold">P{stepNum}.</span> {title.replace(/Part \d+\.?\s*/, '')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
