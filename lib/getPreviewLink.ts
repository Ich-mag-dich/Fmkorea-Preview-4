/**
 * 미리보기로 열 수 있는 링크인지. 미리보기는 주소창을 글 주소로 바꾸는데(history.pushState),
 * 다른 도메인 주소를 넣으면 SecurityError가 나므로 같은 사이트 주소만 받음
 */
const isSameOrigin = (link: HTMLAnchorElement | null) =>
  !!link && link.origin === location.origin;

export const getPreviewLink = (e: HTMLElement): HTMLAnchorElement | null => {
  const link = e.closest("a");

  if (
    link?.classList.contains("title")
    // 핫딜 제목. 종료된 핫딜은 hotdeal_var8Y처럼 뒤에 글자가 붙음
    || Array.from(link?.classList ?? []).some(c => c.startsWith("hotdeal_var8"))
  ) {
    return isSameOrigin(link) ? link : null;
  }
  const td = e.closest("td.title");
  if (!td) return null;
  // td 빈 곳을 눌렀으면 글 제목 링크를 대신 사용
  const target = link ?? td.querySelector("a");
  return isSameOrigin(target) ? target : null;
};
