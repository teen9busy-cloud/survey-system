'use client';

import React from 'react';

interface LikertItem {
  id: string;
  label: string;
}

interface LikertScaleProps {
  options: string[];
  items: LikertItem[];
  values: Record<string, string>;
  onChange: (itemId: string, value: string) => void;
}

export default function LikertScale({
  options,
  items,
  values,
  onChange,
}: LikertScaleProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {items.map((item) => {
        const currentValue = values[item.id] || '';
        const selectedOptIdx = options.findIndex((opt) => opt === currentValue);

        return (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              currentValue
                ? 'border-indigo-200 bg-indigo-50/30 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
            }`}
          >
            {/* 문항 라벨 */}
            <p className="text-[15px] sm:text-base font-semibold text-slate-900 leading-snug mb-3">
              {item.label}
            </p>

            {/* 상단 척도 양극단 가이드 (모바일에서도 1점과 5점의 의미가 한눈에 보임) */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1 mb-2">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="inline-block w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-center leading-4 text-[10px] font-bold">1</span>
                {options[0]}
              </span>
              <span className="hidden sm:inline text-slate-400">
                보통 ({options[Math.floor(options.length / 2)]})
              </span>
              <span className="flex items-center gap-1 text-indigo-700">
                {options[options.length - 1]}
                <span className="inline-block w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 text-center leading-4 text-[10px] font-bold">5</span>
              </span>
            </div>

            {/* 1~5점 터치 버튼 그리드 (모바일 터치 최적화 48px 이상 확보) */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
              {options.map((option, optIdx) => {
                const isSelected = currentValue === option;
                const score = optIdx + 1;

                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => onChange(item.id, option)}
                    className={`flex flex-col items-center justify-center min-h-[50px] sm:min-h-[58px] p-2 rounded-xl border text-center cursor-pointer transition-all select-none active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-300/60 font-bold scale-[1.02]'
                        : 'bg-white sm:bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-indigo-50/50 hover:border-indigo-300'
                    }`}
                  >
                    <span className={`text-base sm:text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {score}
                    </span>
                    {/* PC/태블릿에서는 텍스트 함께 표시 */}
                    <span className={`hidden sm:block text-[11px] leading-tight mt-0.5 truncate max-w-full ${
                      isSelected ? 'text-indigo-100 font-medium' : 'text-slate-500'
                    }`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 선택 결과 즉시 피드백 안내 바 (모바일에서 내가 몇 점을 찍었는지 명확히 확인) */}
            {currentValue ? (
              <div className="mt-2.5 flex items-center justify-between text-xs sm:text-sm bg-indigo-50 border border-indigo-200/80 rounded-lg px-3 py-1.5 text-indigo-900 animate-fadeIn">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-600"></span>
                  선택: <strong className="text-indigo-700 font-bold">{selectedOptIdx + 1}점</strong>
                  <span className="text-slate-600 font-normal">({currentValue})</span>
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-2xs border border-indigo-100">
                  선택 완료
                </span>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-end">
                <span className="text-[11px] text-slate-400">
                  1~5점 중 하나를 눌러주세요
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
