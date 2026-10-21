export function ProgressBar({ current, max }) {
  const percent = Math.round((current / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>
          質問 {current} / {max}
        </span>
        <span>早めに終わることもあります</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
