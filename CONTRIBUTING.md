# 기여 안내

이 문서는 이 프로젝트에 처음 코드를 기여하는 사람을 위한 안내입니다. 개발 환경, 코드 구조, 새 기능을 추가하는 순서, 그리고 에펨코리아 사이트를 다룰 때 알아야 할 특이점을 정리했습니다.

## 시작하기

[Bun](https://bun.sh/)이 필요합니다.

```bash
bun install
bun run dev          # Chrome 개발 모드 (브라우저가 열리고 저장하면 다시 로드됨)
bun run dev:firefox  # Firefox 개발 모드
```

> `bun build`처럼 `run` 없이 실행하면 Bun 자체 명령어가 실행됩니다. 꼭 `bun run`을 붙여 주세요.

변경을 올리기 전에 아래 세 가지가 통과해야 합니다.

```bash
bun run compile   # 타입 검사
bun run test      # 파서 테스트 (bun run test:watch 는 저장할 때마다 다시 실행)
bun run build     # 빌드
```

## 전체 흐름

미리보기 하나가 열리는 과정입니다. 코드를 처음 읽을 때 이 순서대로 따라가면 됩니다.

1. **우클릭 감지** — [entrypoints/preview.content/index.tsx](entrypoints/preview.content/index.tsx)가 페이지의 `contextmenu`를 잡고, [lib/getPreviewLink.ts](lib/getPreviewLink.ts)로 글 제목 링크인지 판단합니다.
2. **미리보기 열기** — [lib/preview-store.ts](lib/preview-store.ts)의 `previewStore.open(url)`이 주소창을 글 주소로 바꾸고(뒤로 가기로 닫히게) 열린 글을 알립니다.
3. **창 렌더링** — [App.tsx](entrypoints/preview.content/App.tsx) → [PreviewModal](components/preview/PreviewModal.tsx)이 Shadow DOM 안에 창을 띄웁니다.
4. **데이터 요청** — `usePost(href)` → [lib/api/post.ts](lib/api/post.ts)의 `fetchPost`가 게시글 페이지 HTML을 통째로 받습니다.
5. **파싱** — [lib/parser.ts](lib/parser.ts)가 HTML에서 제목, 본문, 댓글, 승부예측 등을 `PostData`로 뽑습니다. 본문 HTML은 정리(이미지 주소, 임베드 자리표시자 등)한 문자열로 담습니다.
6. **화면** — [PostView](components/preview/post/PostView.tsx)와 [CommentSection](components/preview/comment/CommentSection.tsx)이 그립니다. 본문 HTML은 [RichContent](components/preview/content/RichContent.tsx)가 DOMPurify로 정화한 뒤 넣습니다.
7. **사용자 동작** — 추천, 댓글, 참여 같은 동작은 `hooks/`의 mutation 훅이 `lib/api/`로 요청하고, 성공하면 react-query 캐시를 고치거나 다시 받습니다.

## 폴더 구조

```text
entrypoints/
  preview.content/   미리보기 content script (Shadow DOM, React 루트)
  content.ts         사이트 전체에 적용하는 설정 (글꼴, 인기글·대문 숨기기)
  popup/ options/    확장 아이콘 팝업, 설정 페이지
components/
  preview/           미리보기 창 틀 (모달, 리모컨, 로딩·에러)
    post/ comment/ content/ author/ poll/ hotdeal/   기능별 컴포넌트
  ui/                공통 UI (shadcn 기반 Button, Dialog, Toast 등)
hooks/
  query-keys.ts      react-query 키 (모든 키는 여기서만 만듦)
  query-cache.ts     게시글·댓글 캐시를 고치는 함수
  use-*.ts           기능별 조회(query)·동작(mutation) 훅
lib/
  api/
    request.ts       공통 요청 함수 (postAct, postXml, readJson ...)
    post.ts comment.ts member.ts poll.ts hotdeal.ts   기능별 요청
    urls.ts          사이트 주소, 글 번호 추출
    types.ts         사이트 응답(JSON) 형식
  parser.ts          페이지·응답 HTML/XML → 데이터
  prediction-poll.ts 승부예측 폼 파싱과 참여 결과 반영
  embed.ts           링크 → 영상/SNS 임베드 판별
  sanitize.ts        렌더링 전 HTML 정화 (DOMPurify)
  types.ts           화면에 쓰는 데이터 타입 (PostData 등)
  settings.ts        설정 항목 (확장 저장소)
tests/
  *.test.ts          Vitest 테스트
  fixtures/          사이트에서 저장한 페이지·응답, 개인 정보 지우는 스크립트
```

### 각 층의 책임

| 층                 | 하는 일                                                       | 하지 않는 일                               |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------ |
| `lib/api/`         | 사이트에 요청을 보내고, 응답을 파서에 넘겨 결과를 돌려줌      | HTML 구조를 직접 뒤지기, React/캐시 다루기 |
| `lib/parser.ts` 등 | HTML/XML에서 데이터를 뽑음                                    | 요청 보내기                                |
| `hooks/`           | react-query로 요청을 부르고 캐시를 갱신, 결과를 토스트로 알림 | 요청 형식 알기, 캐시 키 문자열 직접 쓰기   |
| `components/`      | 데이터를 그리고 사용자 입력을 훅에 전달                       | 요청 함수 직접 부르기                      |

## 새 기능을 추가하는 순서

사이트 기능 하나(예: 승부예측 참여)를 미리보기에 붙이는 일반적인 순서입니다.

1. **사이트 요청 확인** — 사이트에서 그 기능을 직접 써 보면서 개발자 도구 네트워크 탭으로 요청 주소, 헤더, 본문(파라미터 순서까지), 응답을 확인합니다. 응답 예시는 PR이나 주석에 남겨 두면 다음 사람이 편합니다.
2. **타입** — 사이트 응답(JSON) 형식은 필드 이름 그대로 [lib/api/types.ts](lib/api/types.ts)에, 파싱해서 화면에 쓰는 데이터 타입은 [lib/types.ts](lib/types.ts)에 추가합니다.
3. **요청 함수** — 맞는 `lib/api/<기능>.ts`에 함수를 만듭니다. 대부분 아래 형태로 충분합니다.

   ```ts
   export const doSomething = async (post: PostData, value: string) => {
     const res = await postAct(
       "procSomething",
       { target_srl: post.docId, value, module: "x", act: "procSomething" },
       { referrer: post.url },
     );
     return readJson<SomethingResult>(res, "처리하지 못했습니다");
   };
   ```

4. **파싱** — 응답이나 페이지가 HTML이면 파싱 함수를 [lib/parser.ts](lib/parser.ts)(또는 기능 전용 파일)에 둡니다. 게시글 페이지에서 읽을 값이면 `parsePost`의 `PostData`에 필드를 추가합니다.
5. **캐시 키** — 조회라면 [hooks/query-keys.ts](hooks/query-keys.ts)에 키를 추가합니다.
6. **훅** — `hooks/use-<기능>.ts`에 `useQuery`/`useMutation` 훅을 만듭니다. 게시글 데이터를 고쳐야 하면 [hooks/query-cache.ts](hooks/query-cache.ts)의 `updatePostData`, `updateComments`를 씁니다.
7. **컴포넌트** — `components/preview/<기능>/`에 컴포넌트를 만들고 [PostView](components/preview/post/PostView.tsx) 등에 배치합니다. 지금 보는 글(`href`, `post`)이 필요하면 props로 받지 말고 [`usePreviewPost()`](hooks/use-preview-post.ts)로 꺼내고, 버튼 동작은 그 컴포넌트에서 훅을 직접 부릅니다.

## 에펨코리아 사이트 특이점

코드에 주석으로도 남겨 두었지만, 처음 보면 헷갈리는 것들입니다.

- **요청 형식이 제각각입니다.** `/?act=...` JSON 요청은 본문이 form 형식(`a=1&b=2`)인데 `content-type`은 `application/json`입니다. 사이트가 실제로 이렇게 보내므로 그대로 맞춥니다(`postAct`). 회원 메뉴와 댓글 작성은 XML(`postXml`), 블라인드는 일반 form 형식입니다.
- **실패해도 HTTP 200입니다.** 실패는 응답의 `error`(0이 아님)와 `message`로 옵니다. `readJson`이 이것을 예외로 바꿔서 mutation의 `onError`(에러 토스트)로 보냅니다.
  - 예외: 댓글 추천은 성공·취소·실패 모두 `error: -2`라서 응답 필드로 판단합니다([use-vote-comment.ts](hooks/use-vote-comment.ts)).
- **로그인이 필요한 요청은 `pageFetch`로 보냅니다.** Firefox에서는 content script의 기본 `fetch`가 확장 쪽 요청으로 나가서, 페이지가 보낸 것처럼 나가는 `content.fetch`를 씁니다([request.ts](lib/api/request.ts)).
- **파서는 문서를 직접 수정합니다.** 본문 정리 과정에서 요소를 옮기거나 지우므로, 같은 문서에서 읽기만 하는 파싱(댓글, 승부예측 등)은 그 전에 해야 합니다. 함수 주석의 `!주의` 표시를 확인하세요.
- **사이트 HTML은 예고 없이 바뀝니다.** 선택자는 위치보다 의미 있는 클래스나 글자로 찾고(예: 승부예측의 "배당률" 설명으로 값을 찾음), 못 찾으면 빈 값이나 `null`로 넘어가게 짭니다.
- **처음 보는 상태값은 그대로 보여 줍니다.** 확인하지 못한 경우(예: 정산된 승부예측의 상태값)는 추측해서 바꾸지 말고 받은 글자를 그대로 표시합니다.

## 화면 작업할 때

- **Shadow DOM** — 미리보기는 Shadow DOM 안에 있어서 사이트 CSS와 서로 영향을 주지 않습니다. Dialog, 메뉴 같은 Portal은 `usePortalContainer()`의 컨테이너를 넘겨야 스타일과 다크 모드가 적용됩니다.
- **사이트에서 가져온 HTML 스타일** — 본문/댓글 HTML에는 Tailwind 클래스를 붙일 수 없어서 두 가지 방법을 씁니다.
  - 공통 규칙은 [PostView](components/preview/post/PostView.tsx)의 `contentClassName`에 하위 선택자(`[&_img]:...`)로 둡니다.
  - 특정 사이트 요소(핫딜 정보 표 등)는 [style.css](entrypoints/preview.content/style.css)의 `@layer components`에 둡니다. utilities 층이 components 층보다 우선한다는 점에 주의하세요.
- **다크 모드** — 사이트 야간 모드 쿠키를 읽어 컨테이너에 `.dark`를 붙입니다. 색은 가능하면 테마 변수(`bg-muted`, `text-muted-foreground`, `border` 등)를 쓰고, 직접 고른 색에는 `dark:` 값을 함께 둡니다.
- **안전** — 사이트 HTML은 반드시 `RichContent`(DOMPurify)를 거쳐 렌더링합니다. iframe은 [embed.ts](lib/embed.ts)의 허용 목록에 있는 주소만 남습니다.

## 코드 스타일

- 포맷은 Prettier가 맞춥니다. 편집기에서 저장 시 포맷을 켜 두거나 `npx prettier --write <파일>`을 실행하세요. Claude Code로 작업하면 `.claude/settings.json`의 훅이 고친 파일에 자동으로 돌립니다.
  - 긴 조건은 연산자(`&&`, `+`)를 줄 앞에 두고, 여러 단계 삼항식은 `? :`를 줄 앞에 맞춥니다 (`.prettierrc`의 `experimentalOperatorPosition`, `experimentalTernaries`).
- 주석은 한국어로, "무엇"보다 "왜"를 적습니다. 특히 사이트 동작 때문에 이상해 보이는 코드에는 이유를 꼭 남깁니다.
- 파일 이름: 컴포넌트는 `PascalCase.tsx`, 훅은 `use-kebab-case.ts`, 그 외는 `kebab-case.ts`.
- import는 다른 폴더면 `@/` 경로, 같은 기능 폴더 안이면 `./` 상대 경로를 씁니다.

## 확인 방법

### 자동 테스트

`tests/`에 [Vitest](https://vitest.dev/) 테스트가 있습니다. 사이트에서 저장한 실제 페이지(`tests/fixtures/`)를 [happy-dom](https://github.com/capricorn86/happy-dom)으로 읽어 파서 결과를 확인합니다. 네트워크는 쓰지 않습니다.

- `parser.test.ts` — 게시글·댓글·페이지 파싱, 본문 정리, 핫딜
- `prediction-poll.test.ts` — 승부예측 파싱과 참여 결과 반영
- `links.test.ts` — 글 주소 처리, 우클릭한 링크 판별

파서를 바꾸면 테스트도 같이 고치거나 추가합니다. 새 페이지가 필요하면 [tests/fixtures/README.md](tests/fixtures/README.md)의 방법대로 저장하고, 커밋 전에 `bun run fixtures:sanitize`로 개인 정보를 지웁니다.

### 직접 확인

화면과 실제 요청은 테스트로 확인할 수 없어서, 변경한 부분에 맞춰 브라우저에서 확인해 주세요.

- 일반 글, 이미지·영상이 많은 글, 핫딜 글(정보 표, 유사 핫딜, 종료 신고), 승부예측 글(마감 전·후)
- 댓글 페이지 이동, 답글, 베스트 댓글
- 로그인한 상태와 안 한 상태
- 사이트 야간 모드 켜고 끄기
- Chrome과 Firefox 둘 다

## 커밋과 PR

- 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식으로 쓰되, **내용은 한국어**로 씁니다.
  - 앞의 종류(`feat`, `fix`, `refactor`, `docs`, `chore` 등)는 영어 그대로 둡니다. 릴리즈 노트가 이 접두어로 자동 분류됩니다.
  - 내용은 한국어로 짧게 씁니다. API, Firefox, 파일·함수 이름처럼 영어가 자연스러운 단어는 영어로 써도 됩니다.
  - 설명이 더 필요하면 한 줄 띄우고 본문에 `-` 목록으로 적습니다.

  ```text
  feat: 핫딜 글 아래 유사 핫딜 목록 표시
  fix: 종료된 핫딜 제목도 우클릭으로 열리게 수정
  refactor: API 파일을 기능별로 분리
  docs: 기여 안내 문서 추가
  chore: 버전 4.2.0으로 올림
  ```

  > 2026년 10월 이전 커밋은 영어로 작성되어 있습니다.

- 기능 변경과 리팩터링(파일 이동, 이름 변경)은 다른 커밋으로 나눕니다.
- PR에는 무엇을 바꿨는지, 어떻게 확인했는지(위 체크리스트 중 무엇을 봤는지)를 적어 주세요. 화면이 바뀌면 스크린샷을 붙여 주세요.

## 릴리즈 (관리자용)

1. `package.json`의 `version`을 올리고 `chore: 버전 x.y.z로 올림`으로 커밋합니다.
2. GitHub Actions의 **Release** 워크플로를 수동 실행합니다. 타입 검사 후 Chrome·Firefox zip을 빌드하고, 이전 태그 이후 커밋으로 릴리즈 노트를 만들어 GitHub 릴리즈에 올린 뒤, Firefox Add-ons와 Chrome 웹 스토어에 제출합니다(종류가 `release`일 때만).
   - Chrome에 이전 버전이 심사 중이면 `stores`를 `firefox`로 골라 Chrome을 빼 주세요. 심사가 끝난 뒤 릴리즈의 zip을 대시보드에 직접 올리면 됩니다.
   - `dry_run`을 켜면 스토어 키가 맞는지만 확인하고, GitHub 릴리즈와 제출은 하지 않습니다.
   - 스토어 키는 저장소 Secrets에 있습니다: `FIREFOX_JWT_ISSUER`, `FIREFOX_JWT_SECRET`(AMO API 키), `CHROME_PUBLISHER_ID`, `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL`, `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`(서비스 계정 키 JSON의 `private_key`, `\n`을 실제 줄바꿈으로).

> **권한 추가 주의** — `wxt.config.ts`의 `permissions`/`host_permissions`를 늘리면 Chrome에서 기존 사용자의 확장이 다시 승인할 때까지 꺼집니다. 꼭 필요할 때만 추가하고, 가능하면 선택 권한(optional permissions)을 검토하세요.
