'use client';

import React from 'react';

interface RankingSelectProps {
  options: string[];
  value: { rank1?: string; rank2?: string; rank3?: string };
  onChange: (value: { rank1?: string; rank2?: string; rank3?: string }) => void;
  required?: boolean;
}

export default function RankingSelect({ options, value, onChange }: RankingSelectProps) {
  const current = value || {};

  const handleRankChange = (rank: 'rank1' | 'rank2' | 'rank3', selectedVal: string) => {
    const updated = { ...current, [rank]: selectedVal };
    if (rank === 'rank1') {
      if (updated.rank2 === selectedVal) updated.rank2 = '';
      if (updated.rank3 === selectedVal) updated.rank3 = '';
    } else if (rank === 'rank2') {
      if (updated.rank1 === selectedVal) updated.rank1 = '';
      if (updated.rank3 === selectedVal) updated.rank3 = '';
    } else if (rank === 'rank3') {
      if (updated.rank1 === selectedVal) updated.rank1 = '';
      if (updated.rank2 === selectedVal) updated.rank2 = '';
    }
    onChange(updated);
  };

  const ranks: { key: 'rank1' | 'rank2' | 'rank3'; label: string; badge: string; color: string }[] = [
    { key: 'rank1', label: '1순위 (가장 많이 활용)', badge: '1순위', color: 'bg-indigo-600 text-white' },
    { key: 'rank2', label: '2순위 (두 번째로 활용)', badge: '2순위', color: 'bg-indigo-100 text-indigo-700 font-bold border border-indigo-200' },
    { key: 'rank3', label: '3순위 (세 번째로 활용)', badge: '3순위', color: 'bg-slate-200 text-slate-700 font-bold border border-slate-300' },
  ];

  return (
    <div className="space-y-3 pt-1">
      {ranks.map((r) => {
        const selectedVal = current[r.key] || '';
        return (
          <div
            key={r.key}
            className={`flex flex-col sm:flex-row sm:items-center gap-2.5 p-3.5 sm:p-4 rounded-xl border transition-all ${
              selectedVal ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 shrink-0 sm:w-48">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs ${r.color}`}>
                {r.badge}
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-900">
                {r.label}
              </span>
            </div>
            <div className="flex-1">
              <select
                value={selectedVal}
                onChange={(e) => handleRankChange(r.key, e.target.value)}
                className="w-full min-h-[48px] p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-[16px] sm:text-[17px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer shadow-2xs"
              >
                <option value="">항목을 선택해 주세요</option>
                {options.map((opt) => {
                  const isUsedElsewhere =
                    (r.key !== 'rank1' && current.rank1 === opt) ||
                    (r.key !== 'rank2' && current.rank2 === opt) ||
                    (r.key !== 'rank3' && current.rank3 === opt);

                  return (
                    <option key={opt} value={opt} disabled={isUsedElsewhere}>
                      {opt} {isUsedElsewhere ? '(다른 순위에서 선택됨)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
