export type ClassValue = string | number | boolean | null | undefined | ClassValue[];

/**
 * 조건부 className을 하나로 합친다. falsy(false·null·undefined·"")는 버리고
 * 중첩 배열은 평탄화해 공백으로 잇는다.
 *   cn("a", cond && "b", ["c", null]) → "a b c" (cond=true 기준)
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for ( const input of inputs ) {
    if ( !input ) continue;

    if ( Array.isArray(input) ) {
      const nested = cn(...input);
      if ( nested ) out.push(nested);
    } else {
      out.push(String(input));
    }
  }

  return out.join(" ");
}
