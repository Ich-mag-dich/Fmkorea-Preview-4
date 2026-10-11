# 테스트용 페이지

파서 테스트(`tests/*.test.ts`)가 읽는 에펨코리아 원본 페이지와 응답입니다.

| 파일                      | 원본                                                                               | 테스트하는 것                                         | 저장 시점  |
| ------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- | :--------: |
| `post-normal.html`        | [fmkorea.com/10419657717](https://www.fmkorea.com/10419657717)                     | 일반 글, 유튜브·영상 본문 정리, 게시판 이력 버튼      | 2026.10.07 |
| `post-many-comments.html` | [fmkorea.com/2464551615](https://www.fmkorea.com/2464551615)                       | 베스트 댓글, 댓글 페이지 (27쪽)                       | 2026.10.07 |
| `hotdeal.html`            | [fmkorea.com/10419278576](https://www.fmkorea.com/10419278576)                     | 핫딜 정보 표, 유사 핫딜, 대댓글                       | 2026.10.07 |
| `poll-open.html`          | [fmkorea.com/10419512543](https://www.fmkorea.com/10419512543)                     | 승부예측 마감 전 (참여 입력칸)                        | 2026.10.07 |
| `poll-closed.html`        | [fmkorea.com/10419162730](https://www.fmkorea.com/10419162730)                     | 승부예측 마감 후                                      | 2026.10.07 |
| `poll-my-bet.html`        | [fmkorea.com/10417847267](https://www.fmkorea.com/10417847267)                     | 내가 양쪽에 참여한 승부예측 (`.my`), 정산 대기 안내   | 2026.10.07 |
| `bet-result.json`         | 승부예측 97520 <br>참여하기(`procPpBet`) 응답                                      | `applyBetResult`                                      | 2026.10.07 |
| `is-best-class.html`      | [fmkorea.com/10427494594](https://www.fmkorea.com/10427494594)                     | `STAR-BEST_T` 클래스로 포텐 터진 게시글 판단          | 2026.10.07 |
| `is-best-url.html`        | [fmkorea.com/best/10427494594](https://www.fmkorea.com/best/10427494594)           | 포텐 게시판 주소(`/best`, mid=best)로 연 포텐 글 판단 | 2026.10.07 |
| `image-con.html`          | [fmkorea.com/10430051630](https://www.fmkorea.com/10430051630)                     | 댓글 이미지콘 확인 (게시글 저장 시점 이미지콘 4개)    | 2026.10.10 |
| `comment-link.html`       | [fmkorea.com/2464551615/2464558503](https://www.fmkorea.com/2464551615/2464558503) | 댓글 주소로 받으면 그 댓글이 있는 쪽(5쪽)이 옴        | 2026.10.12 |
| `my-vote.html`            | [fmkorea.com/10437574664](https://www.fmkorea.com/10437574664)                     | 내가 추천/비추천한 댓글 확인                          | 2026.10.12 |

`post-normal.html`은 저장한 사람이 직접 쓴 글이라 제목을 `post-normal`로 바꿔 두었습니다.

## 새로 저장하는 방법

1. **원본 HTML을 저장합니다.** `Ctrl+U`(페이지 소스 보기) 전체를 복사하거나, 개발자 도구 네트워크 탭에서 문서 요청의 응답을 복사합니다.
   - "다른 이름으로 페이지 저장"은 쓰지 마세요. 사이트 스크립트가 실행된 뒤의 화면이라 확장이 실제로 받는 HTML과 다릅니다.
   - 응답(JSON)은 네트워크 탭의 응답 내용을 그대로 저장합니다.
2. **개인 정보를 지웁니다.** 로그인한 채로 저장했다면 커밋 전에 꼭 실행하세요.

   ```bash
   bun run fixtures:sanitize
   ```

   로그인한 회원번호와 닉네임을 가짜 값으로 바꾸고, 알림 목록과 알림 접속 토큰을 지웁니다. 실행한 뒤 `git diff`로 한 번 더 확인하세요.

3. **위 표에 출처를 적습니다.**

사이트가 바뀌어 테스트가 깨졌다면, 같은 글을 다시 저장해서 바뀐 구조에 맞게 파서와 테스트를 고칩니다.
