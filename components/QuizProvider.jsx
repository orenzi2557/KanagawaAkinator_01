"use client";

// 診断の状態をページ間で共有する。リロードしても続きから再開できるよう sessionStorage に保存する。

import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { questions, spots } from "@/lib/data";
import { PHASES, createQuizReducer, initialQuizState } from "@/lib/state/quizReducer";

const STORAGE_KEY = "kanagawa-akinator:state";
const reducer = createQuizReducer(spots, questions);

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialQuizState);
  const { hydrated } = state;
  const [ai, setAi] = useState({ checked: false, ollama: false, model: null });

  useEffect(() => {
    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {
      // 保存領域が使えなくても動作は続ける
    }
    dispatch({ type: "HYDRATE", state: saved });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const { hydrated: _omit, ...persisted } = state;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // 保存できなくても動作は続ける
    }
  }, [state, hydrated]);

  // 起動時に Ollama の状態を確認する（使えなければ「AI機能オフ」）
  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : { ollama: false, model: null }))
      .catch(() => ({ ollama: false, model: null }))
      .then((health) => {
        if (!cancelled)
          setAi({ checked: true, ollama: Boolean(health.ollama), model: health.model });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <QuizContext.Provider value={{ state, dispatch, hydrated, ai }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz は QuizProvider の中で使ってください");
  return ctx;
}

const PHASE_PATHS = {
  [PHASES.start]: "/",
  [PHASES.questioning]: "/quiz",
  [PHASES.result]: "/result",
  [PHASES.feedback]: "/feedback",
};

/** 状態に合わないページを開いたときに、正しいページへ移動する */
export function usePhaseRedirect() {
  const { state, hydrated } = useQuiz();
  const router = useRouter();
  const pathname = usePathname();
  const target = PHASE_PATHS[state.phase];
  const ready = hydrated && target === pathname;

  useEffect(() => {
    if (hydrated && target !== pathname) router.replace(target);
  }, [hydrated, target, pathname, router]);

  return ready;
}
