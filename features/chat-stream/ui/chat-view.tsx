import type { ChatMessage } from "@/entities/message";
import { MessageBubble } from "./message-bubble";
import { FollowUpChips } from "./follow-up-chips";

/** Hero의 grid 전환(duration-700)이 끝난 뒤 첫 말풍선이 등장하도록 맞춘 지연(ms). */
const LAYOUT_SETTLE = 500;
/** user→assistant 순차 등장 간격(ms). */
const ROLE_STAGGER = 160;

type ChatViewProps = {
  messages: ChatMessage[];
  /** 마지막 답변에 딸린 후속 질문(스트리밍이 끝난 뒤에만 채워짐). */
  followups: string[];
  onFollowUp: (question: string) => void;
};

/**
 * 채팅 메시지 리스트. 메시지를 하단(입력창 쪽)에 붙여 쌓고,
 * 마지막 답변 아래에 가이드(좌측)가 건네는 후속 질문 칩을 띄운다.
 * idle→chat 전환에 동반되는 첫 배치(첫 user+assistant)는 레이아웃 전환이
 * 끝난 뒤 슬라이드하고, 이후 대화는 즉시 등장한다.
 */
export function ChatView({ messages, followups, onFollowUp }: ChatViewProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-end gap-5 overflow-hidden px-4 pb-7 sm:px-10">
      {messages.map((message, index) => {
        const isFirstBatch = index < 2;
        const roleDelay = message.role === "assistant" ? ROLE_STAGGER : 0;
        const enterDelay = (isFirstBatch ? LAYOUT_SETTLE : 0) + roleDelay;
        return (
          <MessageBubble key={message.id} message={message} enterDelay={enterDelay} />
        );
      })}

      {followups.length > 0 && (
        <div className="flex justify-start">
          <FollowUpChips items={followups} onSelect={onFollowUp} />
        </div>
      )}
    </div>
  );
}
