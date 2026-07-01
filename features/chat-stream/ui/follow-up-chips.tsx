type FollowUpChipsProps = {
  items: string[];
  onSelect: (question: string) => void;
};

/**
 * 답변 뒤 따라붙는 후속 질문 칩. idle 추천 버튼보다 조용한 고스트 글래스 +
 * 앞에 ↳ 글리프로 "방금 답에서 이어지는 다음 질문"이라는 맥락을 담는다.
 */
export function FollowUpChips({ items, onSelect }: FollowUpChipsProps) {
  if ( items.length === 0 ) return null;

  return (
    <ul className="u-fade-up flex flex-wrap gap-2 px-1 pt-1">
      {items.map((question, index) => (
        <li key={index}>
          <button
            type="button"
            onClick={() => onSelect(question)}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-white/10 px-3.5 py-1.5 text-sm text-accent/90 backdrop-blur-md transition-colors hover:border-accent/45 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span aria-hidden className="text-accent/55">
              ↳
            </span>
            {question}
          </button>
        </li>
      ))}
    </ul>
  );
}
