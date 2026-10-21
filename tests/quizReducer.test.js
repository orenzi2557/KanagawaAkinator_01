import { describe, it, expect } from "vitest";
import {
  PHASES,
  canSubmit,
  createQuizReducer,
  currentQuestion,
  initialQuizState,
  progress,
} from "@/lib/state/quizReducer.js";
import { MAX_QUESTIONS } from "@/lib/engine";
import { answer, sampleQuestions as Q, sampleSpots as S } from "./fixtures/sample.js";

const reducer = createQuizReducer(S, Q);
const run = (actions, state = initialQuizState) => actions.reduce(reducer, state);

describe("quizReducer", () => {
  it("START で質問中になり、最初は必須質問", () => {
    const s = run([{ type: "START" }]);
    expect(s.phase).toBe(PHASES.questioning);
    expect(currentQuestion(S, Q, s).id).toBe("r_companion");
    expect(progress(s)).toEqual({ current: 1, max: MAX_QUESTIONS });
  });

  it("選んだだけでは進まず、SUBMIT で次の質問へ", () => {
    let s = run([{ type: "START" }, { type: "SET_CHOICE", choice: 0 }]);
    expect(s.answers).toHaveLength(0);
    expect(canSubmit(s)).toBe(true);
    s = reducer(s, { type: "SUBMIT_ANSWER", answer: answer("r_companion", 0) });
    expect(s.answers).toHaveLength(1);
    expect(s.draft).toEqual({ choice: null, text: "" });
    expect(currentQuestion(S, Q, s).id).toBe("r_budget");
  });

  it("4択も自由記述もなければ「次へ」は押せない。自由記述だけなら押せる", () => {
    let s = run([{ type: "START" }]);
    expect(canSubmit(s)).toBe(false);
    s = reducer(s, { type: "SET_TEXT", text: "   " });
    expect(canSubmit(s)).toBe(false);
    s = reducer(s, { type: "SET_TEXT", text: "海がいい" });
    expect(canSubmit(s)).toBe(true);
    s = reducer(s, { type: "ANALYZE_START" });
    expect(canSubmit(s)).toBe(false);
  });

  it("BACK で 1 つ前の質問に戻り、前の回答が下書きに戻る", () => {
    const s = run([
      { type: "START" },
      { type: "SUBMIT_ANSWER", answer: answer("r_companion", 2, { text: "海" }) },
      { type: "BACK" },
    ]);
    expect(s.answers).toHaveLength(0);
    expect(s.draft).toEqual({ choice: 2, text: "海" });
    expect(currentQuestion(S, Q, s).id).toBe("r_companion");
  });

  it("最初の質問で BACK するとスタートへ", () => {
    expect(run([{ type: "START" }, { type: "BACK" }]).phase).toBe(PHASES.start);
  });

  it("終了条件を満たすと result へ。結果画面から BACK で質問に戻れる", () => {
    let s = run([{ type: "START" }]);
    let guard = 0;
    while (s.phase === PHASES.questioning && guard++ < 20) {
      const q = currentQuestion(S, Q, s);
      const choice = q.tier === "deep" ? "yes" : 0;
      s = reducer(s, { type: "SUBMIT_ANSWER", answer: answer(q.id, choice) });
    }
    expect(s.phase).toBe(PHASES.result);
    expect(s.answers.length).toBeLessThanOrEqual(MAX_QUESTIONS);
    const back = reducer(s, { type: "BACK" });
    expect(back.phase).toBe(PHASES.questioning);
    expect(back.answers).toHaveLength(s.answers.length - 1);
  });

  it("result → feedback → RESET で start", () => {
    let s = { ...initialQuizState, phase: PHASES.result, answers: [answer("r_companion", 0)] };
    s = reducer(s, { type: "SELECT_SPOT", spotId: "lake" });
    expect(s.selectedSpotId).toBe("lake");
    s = reducer(s, { type: "GO_FEEDBACK" });
    expect(s.phase).toBe(PHASES.feedback);
    s = reducer(s, { type: "FEEDBACK_SENT" });
    expect(s.feedbackSent).toBe(true);
    s = reducer(s, { type: "RESET" });
    expect(s).toEqual(initialQuizState);
  });

  it("HYDRATE は解析中フラグを戻す", () => {
    const s = reducer(initialQuizState, {
      type: "HYDRATE",
      state: { ...initialQuizState, phase: PHASES.questioning, analyzing: true },
    });
    expect(s.phase).toBe(PHASES.questioning);
    expect(s.analyzing).toBe(false);
  });
});
