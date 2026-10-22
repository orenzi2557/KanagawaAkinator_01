"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuiz, usePhaseRedirect } from "@/components/QuizProvider";
import { CandidateCard, NearbyCard } from "@/components/SpotCard";
import { TagBadges } from "@/components/TagBadges";
import { ReasonText } from "@/components/ReasonText";
import { GENRE_LABELS } from "@/lib/engine/constants";
import { descriptions, questions, spots } from "@/lib/data";
import { buildResult } from "@/lib/result";

// Leaflet は SSR 非対応のため、ブラウザでだけ読み込む
const SpotMap = dynamic(() => import("@/components/SpotMap"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-line sm:h-80" />,
});

export default function ResultPage() {
  const ready = usePhaseRedirect();
  const { state, dispatch, ai } = useQuiz();
  const result = useMemo(
    () => buildResult(spots, questions, state.answers, state.selectedSpotId),
    [state.answers, state.selectedSpotId],
  );
  if (!ready) return null;

  const { main, others, nearby, summary } = result;
  const spot = main.spot;
  const select = (spotId) => {
    dispatch({ type: "SELECT_SPOT", spotId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7">
        <p className="text-sm text-muted">
          {main.rank === 1 ? "あなたにおすすめの観光地は…" : `${main.rank}位の候補`}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary-strong sm:text-3xl">{spot.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {GENRE_LABELS[spot.genre]}・{spot.area}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted">マッチ度</span>
            <p className="text-3xl font-bold text-accent">{main.percent}%</p>
          </div>
        </div>
        <div className="mt-3">
          <TagBadges tags={main.reasons} />
        </div>

        <div className="mt-6 space-y-4 leading-relaxed">
          <p>{descriptions[spot.id] ?? spot.summary}</p>
          <div className="rounded-xl bg-primary-soft/60 p-4">
            <h2 className="mb-1 text-sm font-bold text-primary-strong">あなたに合う理由</h2>
            <ReasonText
              key={spot.id}
              spot={spot}
              reasons={main.reasons}
              summary={summary}
              aiChecked={ai.checked}
              aiEnabled={ai.ollama}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">地図と近くのスポット</h2>
        <SpotMap main={spot} nearby={nearby} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {nearby.map((n, i) => (
            <NearbyCard key={n.spot.id} index={i + 1} spot={n.spot} distanceKm={n.distanceKm} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">ほかの候補</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {others.map((c) => (
            <CandidateCard
              key={c.spot.id}
              rank={c.rank}
              spot={c.spot}
              percent={c.percent}
              reasons={c.reasons}
              onSelect={() => select(c.spot.id)}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          className="text-sm text-muted underline"
        >
          最後の質問に戻る
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "GO_FEEDBACK" })}
          className="rounded-full bg-primary px-8 py-3 font-bold text-white shadow transition hover:bg-primary-strong"
        >
          フィードバックへ
        </button>
      </div>
    </div>
  );
}
