"use client";

export function FreeTextInput({ value, onChange, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">
        自由に書いてもOK（4択と一緒でも、これだけでも）
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={2}
        maxLength={200}
        placeholder="例: 海鮮が食べたいけど、あまり歩きたくない"
        className="w-full resize-none rounded-xl border-2 border-line bg-surface px-3 py-2 outline-none focus:border-primary disabled:opacity-50"
      />
    </label>
  );
}
