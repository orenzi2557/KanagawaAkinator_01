// 診断の状態管理（要件 4）。useReducer に渡す純粋な reducer。
// 状態遷移: start → questioning（繰り返し） → result → feedback → start

import { MAX_QUESTIONS, isFinished, selectNextQuestion } from "../engine/index.js";

export const PHASES = {
  start: "start",
  questioning: "questioning",
  result: "result",
  feedback: "feedback",
};

const emptyDraft = () => ({ choice: null, text: "" });

export const initialQuizState = {
  phase: PHASES.start,
  answers: [],
  draft: emptyDraft(),
  analyzing: false,
  selectedSpotId: null,
  feedbackSent: false,
  /** sessionStorage からの復元が済んだか（保存はしない） */
  hydrated: false,
};

/** spots / questions を閉じ込めた reducer を作る（テストで別データを使えるように） */
export function createQuizReducer(spots, questions) {
  function reduce(state, action) {
    switch (action.type) {
      case "START":
        return { ...initialQuizState, draft: emptyDraft(), phase: PHASES.questioning };

      case "SET_CHOICE":
        return { ...state, draft: { ...state.draft, choice: action.choice } };

      case "SET_TEXT":
        return { ...state, draft: { ...state.draft, text: action.text } };

      case "ANALYZE_START":
        return { ...state, analyzing: true };

      case "SUBMIT_ANSWER": {
        if (state.phase !== PHASES.questioning) return state;
        const answers = [...state.answers, action.answer];
        return {
          ...state,
          answers,
          draft: emptyDraft(),
          analyzing: false,
          selectedSpotId: null,
          phase: isFinished(spots, questions, answers) ? PHASES.result : PHASES.questioning,
        };
      }

      case "BACK": {
        if (state.answers.length === 0) return { ...state, phase: PHASES.start };
        const last = state.answers.at(-1);
        return {
          ...state,
          answers: state.answers.slice(0, -1),
          draft: { choice: last.choice, text: last.text ?? "" },
          analyzing: false,
          selectedSpotId: null,
          phase: PHASES.questioning,
        };
      }

      case "SELECT_SPOT":
        return { ...state, selectedSpotId: action.spotId };

      case "GO_FEEDBACK":
        return { ...state, phase: PHASES.feedback, feedbackSent: false };

      case "BACK_TO_RESULT":
        return { ...state, phase: PHASES.result };

      case "FEEDBACK_SENT":
        return { ...state, feedbackSent: true };

      case "RESET":
        return { ...initialQuizState, draft: emptyDraft() };

      case "HYDRATE":
        return { ...initialQuizState, ...action.state, analyzing: false };

      default:
        return state;
    }
  }

  return function quizReducer(state, action) {
    const next = reduce(state, action);
    const hydrated = action.type === "HYDRATE" || state.hydrated;
    return next.hydrated === hydrated ? next : { ...next, hydrated };
  };
}

/** いま表示する質問（質問中でなければ null） */
export function currentQuestion(spots, questions, state) {
  if (state.phase !== PHASES.questioning) return null;
  return selectNextQuestion(spots, questions, state.answers);
}

/** 進捗（現在の問数 / 上限問数） */
export function progress(state) {
  return { current: Math.min(state.answers.length + 1, MAX_QUESTIONS), max: MAX_QUESTIONS };
}

/** 「次へ」を押せるか（4択か自由記述のどちらかがあれば押せる） */
export function canSubmit(state) {
  return !state.analyzing && (state.draft.choice !== null || state.draft.text.trim() !== "");
}
