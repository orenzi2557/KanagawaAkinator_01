"use client";

import { GENRE_LABELS } from "@/lib/engine/constants";
import { TagBadges } from "./TagBadges";

/** 2位・3位などの候補カード。クリックすると 1 位と入れ替えて表示する */
export function CandidateCard({ rank, spot, percent, reasons, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-line bg-surface p-4 text-left transition hover:border-primary"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold">
          <span className="mr-2 text-sm text-muted">{rank}位</span>
          {spot.name}
        </span>
        <span className="shrink-0 text-sm text-primary-strong">{percent}%</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {GENRE_LABELS[spot.genre]}・{spot.area}
      </p>
      <div className="mt-2">
        <TagBadges tags={reasons} />
      </div>
    </button>
  );
}
