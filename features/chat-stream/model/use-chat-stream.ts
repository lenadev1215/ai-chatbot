import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/entities/message";

// 청크를 화면에 흘리는 간격(ms). 클수록 한 글자씩 천천히 찍힌다.
const CHUNK_INTERVAL = 12;
const ERROR_FALLBACK = "연결이 잠시 끊겼습니다. 잠시 후 다시 시도해 주세요.";

type WireChunk = { content?: string; error?: string };

/**
 * 채팅 스트리밍 훅 — /api/chat 게이트웨이가 흘리는 줄 단위 JSON을 수신해
 * 청크 큐 + tick으로 한 글자씩 부드럽게 출력한다("직접 구현" 시연의 본체).
 * 답변 메시지는 빈 채로 먼저 추가하고 델타를 누적해 갱신한다.
 */
export function useChatStream() {
  const [ messages, setMessages ] = useState<ChatMessage[]>([]);
  const [ isStreaming, setIsStreaming ] = useState(false);

  // 전송 시점의 최신 대화 이력을 stale 없이 읽기 위한 거울.
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [ messages ]);

  const queueRef = useRef<string[]>([]); // 수신했지만 아직 안 그린 청크
  const displayedRef = useRef(""); // 현재까지 그린 텍스트
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamDoneRef = useRef(false);
  const assistantIdRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const stopTick = useCallback(() => {
    if ( tickRef.current ) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    if ( tickRef.current ) return;

    tickRef.current = setInterval(() => {
      const queue = queueRef.current;

      // 큐에 청크가 남아 있으면 하나 꺼내 답변 말풍선에 덧붙인다.
      if ( queue.length > 0 ) {
        displayedRef.current += queue.shift();
        const id = assistantIdRef.current;
        const next = displayedRef.current;
        setMessages((prev) =>
          prev.map((m) => ( m.id === id ? { ...m, content: next } : m )),
        );
        return;
      }

      // 큐가 비고 스트림도 끝났으면 종료.
      if ( streamDoneRef.current ) {
        stopTick();
        setIsStreaming(false);
      }
    }, CHUNK_INTERVAL);
  }, [ stopTick ]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if ( !trimmed || isStreaming ) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const assistantId = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      // 게이트웨이에 보낼 이력(이전 대화 + 이번 질문). 빈 답변 자리는 제외.
      const outgoing = [ ...messagesRef.current, userMessage ].map(
        ({ role, content }) => ( { role, content } ),
      );

      assistantIdRef.current = assistantId;
      displayedRef.current = "";
      queueRef.current = [];
      streamDoneRef.current = false;
      setIsStreaming(true);
      setMessages((prev) => [ ...prev, userMessage, assistantMessage ]);

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: outgoing }),
          signal: controller.signal,
        });

        if ( !res.ok || !res.body ) throw new Error(`${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        startTick();

        while ( true ) {
          const { done, value } = await reader.read();
          if ( done ) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // 마지막 조각은 미완성일 수 있어 버퍼에 보관

          for ( const line of lines ) {
            if ( !line.trim() ) continue;
            try {
              const chunk = JSON.parse(line) as WireChunk;
              if ( chunk.error ) {
                queueRef.current.push(ERROR_FALLBACK);
              } else if ( chunk.content ) {
                queueRef.current.push(chunk.content);
              }
            } catch {
              continue; // 깨진 줄은 건너뛴다
            }
          }
        }
      } catch {
        if ( displayedRef.current === "" && queueRef.current.length === 0 ) {
          queueRef.current.push(ERROR_FALLBACK);
        }
      } finally {
        streamDoneRef.current = true;
        controllerRef.current = null;

        // 받아온 게 없으면 tick에 맡기지 않고 즉시 종료 처리.
        if ( queueRef.current.length === 0 ) {
          stopTick();
          setIsStreaming(false);
        }
      }
    },
    [ isStreaming, startTick, stopTick ],
  );

  // 언마운트 시 진행 중 요청·tick 정리.
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      stopTick();
    };
  }, [ stopTick ]);

  return { messages, isStreaming, sendMessage };
}
