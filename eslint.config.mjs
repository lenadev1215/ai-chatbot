import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import stylistic from "@stylistic/eslint-plugin";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 개인 코드 스타일: 비어 있지 않은 대괄호/중괄호 안쪽 양끝에 공백 한 칸.
  // (소괄호 ( ) 안 공백은 if 한정으로 두고 싶으나 ESLint가 if만 스코프할 수
  //  없어 룰에서 제외 — if ( ... )는 관례로 유지한다.)
  {
    plugins: { "@stylistic": stylistic },
    rules: {
      "@stylistic/array-bracket-spacing": ["error", "always"], // [ 내용 ]
      "@stylistic/computed-property-spacing": ["error", "always"], // arr[ i ]
      "@stylistic/object-curly-spacing": ["error", "always"], // { 내용 }
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
