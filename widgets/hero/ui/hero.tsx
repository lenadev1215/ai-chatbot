"use client";

import { useState } from "react";
import { GlassPrompt } from "@/shared/ui/glass-prompt";
import {
  RecommendedQuestions,
  RECOMMENDED_QUESTIONS,
} from "@/features/recommended-questions";
import { ChatView } from "@/features/chat-stream";
import type { ChatMessage } from "@/entities/message";
import { cn } from "@/shared/lib";
import { useTypingPlaceholder } from "../lib/use-typing-placeholder";

/**
 * idle: rows = 1fr·auto·1fr → 입력창이 수직 중앙.
 * chat: rows = 1fr·auto·0fr → 하단여백이 접히며 입력창이 아래로 내려가고 채팅이 펼쳐진다.
 * LLM 연동 전이라 답변은 임시 에코(추후 스트리밍 이식).
 */
export function Hero() {
  const [ messages, setMessages ] = useState<ChatMessage[]>([]);
  const placeholder = useTypingPlaceholder(RECOMMENDED_QUESTIONS);
  const started = messages.length > 0;

  const handleSend = (text: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    // TODO: 실제 LLM 스트리밍으로 교체. 지금은 전환 확인용 임시 응답.
    const placeholderAnswer: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "곧 제가 그를 대신해 답해드릴게요. (답변 연동 예정)",
    };
    setMessages((prev) => [ ...prev, userMessage, placeholderAnswer ]);
  };

  return (
    <section
      className={cn(
        "dawn-bg relative grid min-h-full flex-1 overflow-hidden px-4 py-0",
        "transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
        started ? "grid-rows-[1fr_auto_0fr]" : "grid-rows-[1fr_auto_1fr]",
      )}
    >
      <div className="min-h-0 overflow-y-auto">
        <ChatView messages={messages} />
      </div>

      <div className={cn(
        "mx-auto flex w-full max-w-2xl flex-col items-center px-10",
        started ? "gap-0" : "gap-6",
      )}>
        <div
          className={cn(
            "grid w-full overflow-hidden text-center transition-all duration-400 ease-out",
            started ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              안녕하세요.
            </h1>
            <p className="mt-3 text-base text-text-muted">AI와 함께하는 프론트엔드 개발자, 김가영입니다.</p>
          </div>
        </div>

        <GlassPrompt onSubmit={handleSend} placeholder={placeholder} autoFocus />

        <div
          className={cn(
            "grid w-full overflow-hidden transition-all duration-700 ease-out",
            started ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
          )}
        >
          <div className={
            cn(
              "min-h-0 overflow-hidden",
              started ? "px-12 pt-8 pb-0" : "p-12 pt-3",
            )
          }>
            <RecommendedQuestions onSelect={handleSend} />
          </div>
        </div>
      </div>

      <div aria-hidden />
    </section>
  );
}
