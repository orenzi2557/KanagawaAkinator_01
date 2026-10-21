"use client";

const LABELS = ["", "いまいち", "あまり", "ふつう", "よかった", "とてもよかった"];

export function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex" role="radiogroup" aria-label="満足度">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}点`}
            onClick={() => onChange(n)}
            className={`px-1 text-4xl leading-none transition ${
              n <= value ? "text-accent" : "text-line hover:text-accent/50"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm text-muted">{LABELS[value]}</span>
    </div>
  );
}
