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
                ? 'border-indigo-200 bg-indigo-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
            }`}
          >
            {/* 문항 라벨 (글자 크기 16~17px로 시원하게 확대) */}
            <p className="text-[16px] sm:text-[17px] font-semibold text-slate-900 leading-relaxed mb-3.5">
              {item.label}
            </p>

            {/* 상단 척도 양극단 가이드 */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium px-1 mb-2.5">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="inline-block w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-center leading-4 text-[11px] font-bold">1</span>
                {options[0]}
              </span>
              <span className="hidden sm:inline text-slate-400 text-xs">
                보통 ({options[Math.floor(options.length / 2)]})
              </span>
              <span className="flex items-center gap-1.5 text-indigo-800 font-semibold">
                {options[options.length - 1]}
                <span className="inline-block w-4 h-4 rounded-full bg-indigo-200 text-indigo-900 text-center leading-4 text-[11px] font-bold">5</span>
              </span>
            </div>

            {/* 1~5점 터치 버튼 그리드 (최소 높이 52px 이상 대형 버튼) */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
              {options.map((option, optIdx) => {
                const isSelected = currentValue === option;
                const score = optIdx + 1;

                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => onChange(item.id, option)}
                    className={`flex flex-col items-center justify-center min-h-[52px] sm:min-h-[60px] p-2 rounded-xl border text-center cursor-pointer transition-all select-none active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-300/70 font-bold scale-[1.02]'
                        : 'bg-white sm:bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-indigo-50/50 hover:border-indigo-300'
                    }`}
                  >
                    <span className={`text-lg sm:text-xl font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {score}
                    </span>
                    {/* PC/태블릿에서는 텍스트 함께 표시 */}
                    <span className={`hidden sm:block text-[12px] leading-tight mt-0.5 truncate max-w-full ${
                      isSelected ? 'text-indigo-100 font-semibold' : 'text-slate-600'
                    }`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 선택 결과 즉시 피드백 안내 바 */}
            {currentValue ? (
              <div className="mt-3 flex items-center justify-between text-xs sm:text-sm bg-indigo-50 border border-indigo-200 rounded-lg px-3.5 py-2 text-indigo-950 animate-fadeIn">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  선택: <strong className="text-indigo-700 font-bold text-sm sm:text-base">{selectedOptIdx + 1}점</strong>
                  <span className="text-slate-700 font-normal">({currentValue})</span>
                </span>
                <span className="text-xs font-semibold text-indigo-700 bg-white px-2.5 py-0.5 rounded shadow-2xs border border-indigo-200">
                  선택 완료
                </span>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-end">
                <span className="text-xs text-slate-400">
                  1~5점 중 하나를 터치해 주세요
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
