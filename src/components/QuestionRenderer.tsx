import React from "react";
import type { Question } from "../types";

export default function QuestionRenderer({
  question,
  value,
  onChange,
  inputRef,
  onKeyDown,
}: {
  question: Question;
  value: any;
  onChange: (v: any) => void;
  inputRef?: React.Ref<any>;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const { input_type, options } = question;

  switch (input_type) {
    case "text":
      return (
        <textarea
          ref={inputRef}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="input"
          rows={3}
        />
      );
    case "number":
      return (
        <input
          ref={inputRef}
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          onKeyDown={onKeyDown}
          className="input"
        />
      );
    case "date":
      return (
        <input
          ref={inputRef}
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="input"
        />
      );
    case "select":
      return (
        <select
          ref={inputRef}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="input"
        >
          <option value="">Select…</option>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div role="radiogroup" aria-label={question.question_text}>
          {options?.map((o) => (
            <label key={o.value} className="flex items-center gap-2">
              <input
                type="radio"
                name={question.id}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div role="group" aria-label={question.question_text}>
          {options?.map((o) => {
            const checked = Array.isArray(value)
              ? value.includes(o.value)
              : false;
            return (
              <label key={o.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...(value || []), o.value]);
                    else
                      onChange(
                        (value || []).filter((v: string) => v !== o.value)
                      );
                  }}
                />
                <span>{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    default:
      return (
        <input
          ref={inputRef}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      );
  }
}
