"use client";

/**
 * 4択ボタン。選ぶとハイライトされるだけで、次には進まない。
 * @param {{ options: { value: string|number, label: string }[], selected: any, onSelect: Function, disabled?: boolean }} props
 */
export function AnswerButtons({ options, selected, onSelect, disabled = false }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup">
      {options.map((o) => {
        const active = selected === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onSelect(active ? null : o.value)}
            className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition disabled:opacity-50 ${
              active
                ? "border-primary bg-primary-soft text-primary-strong"
                : "border-line bg-surface hover:border-primary/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
