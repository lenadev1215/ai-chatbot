import { GlassButton } from "@/shared/ui/glass-button";
import { RECOMMENDED_QUESTIONS } from "../model/questions";

type RecommendedQuestionsProps = {
  onSelect: (question: string) => void;
};

/**
 * 추천 질문 칩 세트. 클릭하면 해당 질문을 그대로 전송한다.
 */
export function RecommendedQuestions({ onSelect }: RecommendedQuestionsProps) {
  return (
    <ul className="flex flex-wrap justify-center gap-3">
      {RECOMMENDED_QUESTIONS.map((question) => (
        <li key={question}>
          <GlassButton onClick={() => onSelect(question)}>{question}</GlassButton>
        </li>
      ))}
    </ul>
  );
}
