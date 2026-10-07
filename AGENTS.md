# AGENTS.md

AI 코딩 도구(Claude Code, Codex, Cursor 등)가 이 저장소에서 작업할 때 따르는 규칙이다.
Claude Code는 [CLAUDE.md](CLAUDE.md)가 이 파일을 불러온다.

에펨코리아(fmkorea.com) 게시글을 우클릭으로 미리보는 브라우저 확장 (WXT · React 19 · TypeScript · Tailwind v4 · TanStack Query, Chrome·Firefox).

**작업 전에 [CONTRIBUTING.md](CONTRIBUTING.md)를 먼저 읽는다.** 구조, 층별 책임, 새 기능 추가 순서, 에펨코리아 사이트 특이점이 거기 있다. 이 파일은 그 위에 AI 도구용 규칙만 더한다.

## 작업 규칙

- 사용자 답변, 코드 주석, 문서는 한국어로 쓴다.
- 커밋 메시지는 Conventional Commits 접두어(`feat:`, `fix:` …) + 한국어 내용. 2026년 10월 이전 기록은 영어지만 따라 하지 않는다.
- 패키지 매니저는 Bun. 스크립트는 항상 `bun run <이름>`으로 실행한다 (`bun build`는 Bun 자체 명령).
- 코드를 바꾼 뒤에는 바꾼 파일에 `npx prettier --write`, 그다음 `bun run compile`, `bun run test`, `bun run build`가 통과하는지 확인한다. (Claude Code는 `.claude/settings.json` 훅이 고친 파일에 Prettier를 자동으로 돌린다. 저장소 전체에 `prettier --write .`를 돌리지 않는다)
- 파서(`lib/parser.ts`, `lib/prediction-poll.ts` 등)를 바꾸면 `tests/`에 테스트도 추가·수정한다. 사이트 HTML이 필요하면 사용자에게 저장을 부탁하고, 로그인한 채 저장한 파일은 커밋 전에 `bun run fixtures:sanitize`로 개인 정보를 지운다 ([tests/fixtures/README.md](tests/fixtures/README.md)).
- 브라우저 화면은 직접 볼 수 없다. UI 변경은 "화면 확인은 못 함"이라고 알리고, 사용자가 스크린샷으로 확인하게 한다.

## 사이트 요청

- 요청 형식(주소, 헤더, 파라미터 순서, 응답)을 추측해서 만들지 않는다. 모르면 사용자에게 개발자 도구 네트워크 탭에서 복사한 요청과 응답을 받아 그대로 맞춘다.
- 사용자 계정에 영향을 주는 요청(승부예측 참여, 추천, 댓글, 블라인드)은 직접 보내지 않는다. 응답 형식 확인용 읽기 요청은 한 번 정도 괜찮다.
- 새 요청은 `lib/api/request.ts`의 `postAct` / `postXml` / `readJson`을 먼저 쓴다.

## 하지 말 것

- `wxt.config.ts`의 `permissions` / `host_permissions`를 늘리지 않는다. Chrome에서 기존 사용자의 확장이 다시 승인할 때까지 꺼진다. 꼭 필요하면 먼저 사용자에게 묻는다.
- 사용자의 광고 차단기를 우회하는 코드를 넣지 않는다.
- react-query 키 문자열을 직접 쓰지 않는다 (`hooks/query-keys.ts`). 게시글·댓글 캐시는 `hooks/query-cache.ts`의 함수로만 고친다.
- 사이트 HTML을 `RichContent`(DOMPurify)를 거치지 않고 렌더링하지 않는다.

## 작업 원칙

- **추측하지 않는다.** 요구가 여러 가지로 읽히거나 불확실하면 고르지 말고 묻는다. 더 단순한 방법이 있으면 먼저 말한다.
- **필요한 만큼만 만든다.** 요청하지 않은 기능, 한 번만 쓰는 추상화, 일어날 수 없는 경우의 에러 처리는 넣지 않는다.
- **필요한 곳만 고친다.** 요청과 상관없는 코드·주석·포맷은 건드리지 않는다. 눈에 띄는 문제는 고치지 말고 알린다. 내 변경으로 안 쓰게 된 import·함수만 지운다.
- **확인할 기준을 먼저 정한다.** 여러 단계 작업은 단계마다 확인 방법을 정한다 (이 프로젝트에선 compile·test·build).
