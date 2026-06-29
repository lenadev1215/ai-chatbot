import Anthropic from "@anthropic-ai/sdk";
import type { ChatRole } from "@/entities/message";

// 게이트웨이 런타임 환경
export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;
const MAX_CONTENT = 2000; // 한 메시지 최대 길이(가드레일 1차)
const MAX_MESSAGES = 30; // 한 요청에 담기는 최대 대화 수

// TODO: shared/knowledge에서 정보 주입 필요
const SYSTEM_PROMPT = [
  "당신은 프론트엔드 개발자 '김가영'의 포트폴리오 사이트를 안내하는 AI 가이드입니다.",
  "방문자의 질문에 김가영을 대신해 한국어로 간결하고 정중하게 답합니다.",
  "아직 상세 경력·프로젝트 데이터는 연동 전이므로, 모르는 사실은 지어내지 말고",
  "'곧 정리해 안내하겠다'고 솔직히 답합니다.",
  "김가영 및 그의 개발 경력과 무관한 주제는 정중히 거절합니다.",
].join(" ");

type IncomingMessage = { role: ChatRole; content: string };

/** 클라이언트가 보낸 untrusted 본문을 검증한다 */
function parseMessages(body: unknown): IncomingMessage[] | null {
  if ( typeof body !== "object" || body === null ) return null;

  const raw = (body as { messages?: unknown }).messages;
  if ( !Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES ) return null;

  const messages: IncomingMessage[] = [];
  for ( const item of raw ) {
    if ( typeof item !== "object" || item === null ) return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ( role !== "user" && role !== "assistant" ) return null;
    if ( typeof content !== "string" ) return null;

    const trimmed = content.trim();
    if ( trimmed.length === 0 || trimmed.length > MAX_CONTENT ) return null;

    messages.push({ role, content: trimmed });
  }

  // 마지막 발화는 사용자여야 한다(빈 assistant 자리 등을 거름).
  if ( messages[ messages.length - 1 ].role !== "user" ) return null;

  return messages;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messages = parseMessages(body);

  if ( !messages ) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  if ( !process.env.ANTHROPIC_API_KEY ) {
    return Response.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const client = new Anthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: Record<string, string>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const llmStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await ( const event of llmStream ) {
          if ( event.type === "content_block_delta" && event.delta.type === "text_delta" ) {
            send({ content: event.delta.text });
          }
        }
      } catch ( err ) {
        console.error("[/api/chat] 스트림 실패:", err);
        send({ error: "stream_failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
