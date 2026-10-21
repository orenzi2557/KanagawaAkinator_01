import { TAG_LABELS } from "@/lib/engine/constants";

export function TagBadges({ tags }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li
          key={t}
          className="rounded-full bg-primary-soft px-2.5 py-0.5 text-sm text-primary-strong"
        >
          #{TAG_LABELS[t]}
        </li>
      ))}
    </ul>
  );
}
