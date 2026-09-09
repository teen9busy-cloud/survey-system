'use client';

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
    <div className="space-y-4">
      {items.map((item, idx) => {
        const currentValue = values[item.id] || '';
        return (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-xs"
          >
            <p className="text-sm sm:text-base font-medium text-slate-800 mb-3">
              {item.label}
            </p>

            {/* Desktop / Tablet: 라디오 버튼 가로 그리드 */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {options.map((option, optIdx) => {
                const isSelected = currentValue === option;
                return (
                  <label
                    key={option}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center cursor-pointer transition-all text-xs sm:text-sm select-none ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-semibold'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={item.id}
                      value={option}
                      checked={isSelected}
                      onChange={() => onChange(item.id, option)}
                      className="sr-only"
                    />
                    <span className="text-xs opacity-75 font-mono mb-0.5">
                      {optIdx + 1}
                    </span>
                    <span className="leading-tight">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
