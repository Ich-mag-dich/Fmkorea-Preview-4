// 이 저장소의 규칙(AGENTS.md "하지 말 것", CONTRIBUTING.md "각 층의 책임")만 검사하는 ESLint 설정.
// 일반적인 코드 품질 규칙은 넣지 않았다. 예외는 파일 단위로 아래에 둔다.
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// no-restricted-syntax는 뒤에 오는 설정이 목록을 통째로 덮어쓰므로, 묶음으로 나눠 두고 파일마다 조합한다
const syntax = (...groups) => ["error", ...groups.flat()];

/** 키 문자열을 훅마다 쓰면 오타 하나로 갱신(invalidate)이 조용히 안 됨 */
const queryKeyLiteral = [
  {
    selector:
      "Property[key.name=/^(queryKey|mutationKey)$/] > ArrayExpression.value",
    message: "react-query 키는 hooks/query-keys.ts의 queryKeys로 만듭니다.",
  },
  {
    selector:
      "CallExpression[callee.property.name=/^(getQueryData|setQueryData|getQueryState)$/] > ArrayExpression.arguments:first-child",
    message: "react-query 키는 hooks/query-keys.ts의 queryKeys로 만듭니다.",
  },
];

/** 캐시 구조({ PostData, CommentData, ... })는 query-cache.ts만 알아야 함 */
const postCacheEdit = [
  {
    selector:
      "CallExpression[callee.property.name=/^set(Query|Queries)Data$/] MemberExpression[object.name='queryKeys'][property.name=/^(posts?|allComments|comments|commentsPage)$/]",
    message:
      "게시글·댓글 캐시는 hooks/query-cache.ts의 updatePostData / updateComments로 고칩니다.",
  },
];

/** 사이트 HTML은 DOMPurify를 거쳐야 함 */
const rawHtml = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: "HTML은 RichContent(DOMPurify)로 그립니다.",
  },
  {
    selector:
      "AssignmentExpression > MemberExpression.left[property.name=/^(innerHTML|outerHTML)$/]",
    message: "HTML은 RichContent(DOMPurify)로 그립니다.",
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: "HTML은 RichContent(DOMPurify)로 그립니다.",
  },
];

/** 요청 형식(헤더, 본문 형식, Firefox의 content.fetch)은 lib/api/ 안에서만 다룸 */
const requestModule = {
  regex: "(^|/)api/request$",
  message:
    "요청 형식은 lib/api/ 안에서만 다룹니다. lib/api/<기능>.ts의 요청 함수를 쓰세요.",
};

export default defineConfig([
  globalIgnores([".output/", ".wxt/"]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "요청은 lib/api/request.ts를 거칩니다. Firefox에서는 content script의 기본 fetch가 확장 쪽 요청으로 나갑니다.",
        },
        {
          name: "XMLHttpRequest",
          message: "요청은 lib/api/request.ts를 거칩니다.",
        },
      ],
      "no-restricted-syntax": syntax(queryKeyLiteral, postCacheEdit),
      "@typescript-eslint/no-restricted-imports": [
        "error",
        { patterns: [requestModule] },
      ],
    },
  },
  {
    files: ["lib/api/request.ts"],
    rules: { "no-restricted-globals": "off" },
  },
  {
    files: ["lib/api/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(react|react-dom|@tanstack/react-query|@/hooks|@/components)(/|$)",
              message:
                "lib/api/는 요청과 응답만 다룹니다. React와 캐시는 hooks/에서 다룹니다.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["hooks/query-cache.ts"],
    rules: { "no-restricted-syntax": syntax(queryKeyLiteral) },
  },
  {
    files: ["components/**", "entrypoints/**"],
    rules: {
      "no-restricted-syntax": syntax(queryKeyLiteral, postCacheEdit, rawHtml),
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // 주소(urls)와 타입(import type)은 화면에서 써도 됨
              regex: "(^|/)lib/api/(?!urls$|image-cons$)",
              allowTypeImports: true,
              message:
                "컴포넌트는 요청 함수를 직접 부르지 않습니다. hooks/의 훅을 쓰세요.",
            },
            {
              // imageConContent는 요청 없이 댓글 본문 글자만 만듦. 입력창이 글자 대신 넘김
              regex: "(^|/)lib/api/image-cons$",
              allowImportNames: ["imageConContent"],
              allowTypeImports: true,
              message:
                "컴포넌트는 요청 함수를 직접 부르지 않습니다. hooks/의 훅을 쓰세요.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/preview/content/RichContent.tsx"],
    rules: { "no-restricted-syntax": syntax(queryKeyLiteral, postCacheEdit) },
  },
]);
