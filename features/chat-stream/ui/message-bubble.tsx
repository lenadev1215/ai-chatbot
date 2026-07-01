import type { ChatMessage } from "@/entities/message";
import { Markdown } from "@/shared/lib";
import { GUIDE_NAME } from "./guide-mark";

type MessageBubbleProps = {
  message: ChatMessage;
  /** 등장 지연(ms). 레이아웃 전환이 끝난 뒤 슬라이드하도록 첫 배치에 사용. */
  enterDelay?: number;
};

/**
 * 채팅 말풍선.
 * user는 우측 블루 틴트 유리(우측에서 슬라이드인),
 * assistant는 좌측 흰 유리에 가이드(샛별) 마크·이름을 얹고 좌측에서 슬라이드인.
 */
export function MessageBubble({ message, enterDelay = 0 }: MessageBubbleProps) {
  const animationDelay = { animationDelay: `${enterDelay}ms` };

  if ( message.role === "user" ) {
    return (
      <div className="flex justify-end u-slide-right" style={animationDelay}>
        <div className="max-w-[80%] rounded-2xl bg-accent/15 px-4 py-2.5 text-base leading-relaxed text-foreground shadow-[0_4px_16px_rgba(91,124,250,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start u-slide-left" style={animationDelay}>
      <div className="flex max-w-[80%] flex-col gap-1.5">
        <div className="flex items-center gap-1.5 pl-0.5">
          <span className="text-xs tracking-wide text-text-muted">{GUIDE_NAME}</span>
        </div>
        <div className="glass-surface rounded-2xl px-4 py-2.5 text-base leading-relaxed text-foreground">
          <Markdown content={message.content} />
        </div>
      </div>
    </div>
  );
}
