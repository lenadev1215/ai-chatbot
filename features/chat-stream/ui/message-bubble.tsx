import type { ChatMessage } from "@/entities/message";
import { cn } from "@/shared/lib";

type MessageBubbleProps = {
  message: ChatMessage;
  /** 등장 지연(ms). 레이아웃 전환이 끝난 뒤 슬라이드하도록 첫 배치에 사용. */
  enterDelay?: number;
};

/**
 * 채팅 말풍선. user는 우측 블루 틴트 유리(우측에서 슬라이드인),
 * assistant는 좌측 흰 유리(좌측에서 슬라이드인). enterDelay로 순차 등장.
 */
export function MessageBubble({ message, enterDelay = 0 }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={isUser ? "flex justify-end u-slide-right" : "flex justify-start u-slide-left"}
      style={{ animationDelay: `${enterDelay}ms` }}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-base leading-relaxed",
          isUser
            ? "bg-accent/15 text-foreground shadow-[0_4px_16px_rgba(91,124,250,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md"
            : "glass-surface text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
