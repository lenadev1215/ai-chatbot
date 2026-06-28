import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

type GlassButtonProps = ComponentProps<"button">;

/**
 * 글래스모피즘 버튼.
 * 반투명 배경 + backdrop-blur로 뒤 배경을 빨아들여 유리처럼 보인다.
 * backdrop-blur는 "뒤에 비칠 무언가"가 있어야 효과가 드러난다 — 컬러풀한 배경 위에서 써야 한다.
 */
export function GlassButton({
  className = "",
  children,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={cn(
        // 형태
        "rounded-2xl px-6 py-3 text-sm font-medium text-slate-800",
        "[text-shadow:0_1px_1px_rgba(255,255,255,0.3)]", // 텍스트 가독성 (유리 위 글씨)
        // 유리 본체: 위는 밝고 아래는 투명한 방향성 그라데이션 + 블러
        "bg-gradient-to-b from-white/20 to-white/5",
        "backdrop-blur-xl backdrop-saturate-150", // saturate로 뒤 색을 더 진하게 머금음
        "border border-white/30",
        // 빛: 외부 그림자 + 위쪽 하이라이트(inset top) + 아래쪽 미세 반사(inset bottom)
        "shadow-[0_8px_32px_rgba(31,38,135,0.15),inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(255,255,255,0.25)]",
        // 인터랙션: 호버 시 살짝 떠오르며 밝아짐
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:from-white/35 hover:to-white/15",
        "hover:shadow-[0_14px_40px_rgba(31,38,135,0.22),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(255,255,255,0.3)]",
        "active:translate-y-0 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
