"use client";

import { useState, type FormEvent } from "react";

type GlassPromptProps = {
  /** 입력값이 전송되면 호출 (공백 제거된 텍스트, 빈 값은 차단) */
  onSubmit: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

/**
 * 글래스 입력창 — idle 메인 입력과 chat 하단 입력에서 공유한다.
 * 유리 표면(.glass-surface) 위에 입력 필드 + 바이올렛 전송 버튼.
 */
export function GlassPrompt({ onSubmit, placeholder, autoFocus }: GlassPromptProps) {
  const [ value, setValue ] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = value.trim();
    if ( !text ) return;
    onSubmit(text);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-surface flex w-full items-center gap-2 rounded-2xl py-2 pl-5 pr-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="질문 입력"
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground placeholder:text-text-muted/70 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="질문 보내기"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_4px_14px_rgba(91,124,250,0.4)] transition-all duration-200 ease-out hover:brightness-110 active:scale-95 disabled:opacity-40"
        disabled={!value.trim()}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}
