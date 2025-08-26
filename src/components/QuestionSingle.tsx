import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Question, AnswerRow } from "../types";
import QuestionRenderer from "./QuestionRenderer";

type Props = {
  question: Question;
  submissionId: string | null;
  answer?: AnswerRow | null;
  autoFocus?: boolean;
  onSaved?: (answer: AnswerRow, submissionId: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

export default function QuestionSingle({
  question,
  submissionId: submissionIdProp,
  answer,
  autoFocus = false,
  onSaved,
  onNext,
  onPrev,
}: Props) {
  const mountedRef = useRef(true);
  const [localValue, setLocalValue] = useState<any>(() => {
    if (!answer) return "";
    return answer.answer_json ?? answer.answer_text ?? "";
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [submissionId, setSubmissionId] = useState<string | null>(
    submissionIdProp
  );
  const saveTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    if (autoFocus && inputRef.current) inputRef.current.focus();
    return () => {
      mountedRef.current = false;
    };
  }, [autoFocus]);

  // sync if answer prop changes (e.g., parent loaded saved answers)
  useEffect(() => {
    setLocalValue(answer ? answer.answer_json ?? answer.answer_text ?? "" : "");
  }, [answer?.id]);

  // Debounced save
  useEffect(() => {
    // skip initial empty state
    if (typeof localValue === "undefined") return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void saveAnswer();
    }, 800);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue]);

  async function ensureSubmission() {
    if (submissionId) return submissionId;
    // create an in_progress submission
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          survey_id: question.survey_id,
          user_id: userId,
          status: "in_progress",
        },
      ])
      .select()
      .single();
    if (error) throw error;
    setSubmissionId(data.id);
    return data.id;
  }

  async function saveAnswer() {
    try {
      setStatus("saving");
      const sid = await ensureSubmission();
      // prepare payload depending on input type
      const payload: Partial<AnswerRow> = {
        submission_id: sid,
        question_id: question.id,
      };

      // differentiate between structured and plain
      if (Array.isArray(localValue) || typeof localValue === "object") {
        payload.answer_json = localValue;
        payload.answer_text = JSON.stringify(localValue).slice(0, 1000);
      } else {
        payload.answer_text = localValue?.toString?.() ?? "";
        payload.answer_json = null;
      }

      // upsert requires unique constraint on (submission_id, question_id)
      const { data, error } = await supabase
        .from("answers")
        .upsert([payload], { onConflict: "submission_id,question_id" })
        .select()
        .single();

      if (error) throw error;
      if (!mountedRef.current) return;
      setStatus("saved");
      onSaved?.(data, sid);
      // set a timeout to reduce "saved" flicker
      setTimeout(() => {
        if (mountedRef.current) setStatus("idle");
      }, 800);
    } catch (err) {
      console.error("Save error", err);
      if (mountedRef.current) setStatus("error");
      // optional: implement retry/backoff here
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Enter to go next for single-line inputs (avoid for multiline)
    if (e.key === "Enter" && question.input_type !== "text") {
      e.preventDefault();
      onNext?.();
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">{question.question_text}</h3>
          {question.help_text ? (
            <p className="text-sm text-slate-500 mt-1">{question.help_text}</p>
          ) : null}
        </div>
        <div className="text-sm">
          {status === "saving" && <span>Saving…</span>}
          {status === "saved" && <span className="text-green-600">Saved</span>}
          {status === "error" && (
            <span className="text-red-600">Error — retrying</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <QuestionRenderer
          question={question}
          value={localValue}
          onChange={(v) => setLocalValue(v)}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="mt-4 flex justify-between">
        <button onClick={() => onPrev?.()} className="btn-ghost">
          Previous
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void saveAnswer();
              onNext?.();
            }}
            className="btn-primary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
