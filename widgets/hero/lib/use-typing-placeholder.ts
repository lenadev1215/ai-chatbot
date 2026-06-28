import { useEffect, useState } from "react";

const TYPE_SPEED = 75; // 한 글자 입력 간격(ms)
const DELETE_SPEED = 40; // 한 글자 삭제 간격(ms)
const HOLD = 1500; // 완성 후 머무는 시간(ms)
const BLINK = 530; // 커서 깜빡임 주기(ms)

/**
 * 입력창 placeholder가 추천 질문을 한 글자씩 타이핑→삭제하며 순환한다.
 * "AI 가이드가 살아있다"는 시그니처 모션. 커서(▌)는 깜빡인다.
 * prefers-reduced-motion이면 첫 질문을 고정 표시한다.
 */
export function useTypingPlaceholder(words: readonly string[]): string {
  const [ text, setText ] = useState("");
  const [ wordIndex, setWordIndex ] = useState(0);
  const [ deleting, setDeleting ] = useState(false);
  const [ cursorOn, setCursorOn ] = useState(true);
  const [ reduced, setReduced ] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // 타이핑/삭제 진행
  useEffect(() => {
    if ( reduced || words.length === 0 ) return;

    const current = words[ wordIndex % words.length ];

    if ( !deleting && text === current ) {
      const t = setTimeout(() => setDeleting(true), HOLD);
      return () => clearTimeout(t);
    }
    if ( deleting && text === "" ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    const next = deleting
      ? current.slice(0, text.length - 1)
      : current.slice(0, text.length + 1);
    const t = setTimeout(() => setText(next), deleting ? DELETE_SPEED : TYPE_SPEED);
    return () => clearTimeout(t);
  }, [ text, deleting, wordIndex, words, reduced ]);

  // 커서 깜빡임
  useEffect(() => {
    if ( reduced ) return;
    const t = setInterval(() => setCursorOn((on) => !on), BLINK);
    return () => clearInterval(t);
  }, [ reduced ]);

  if ( reduced ) return words[ 0 ] ?? "";

  // 공백( )으로 자리를 유지해 커서 깜빡임에 글자가 흔들리지 않게 함
  return text + (cursorOn ? "▌" : " ");
}
