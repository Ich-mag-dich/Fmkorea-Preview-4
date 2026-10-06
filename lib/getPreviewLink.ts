export const getPreviewLink = (e: HTMLElement): HTMLAnchorElement | null => {
  const link = e.closest("a");

  if (
    link?.classList.contains("title") ||
    // 핫딜 제목. 종료된 핫딜은 hotdeal_var8Y처럼 뒤에 글자가 붙음
    Array.from(link?.classList ?? []).some(c => c.startsWith("hotdeal_var8"))
  ) {
    return link;
  }
  const td = e.closest("td.title");
  if (!td) return null;
  // td 빈 곳을 눌렀으면 글 제목 링크를 대신 사용
  return link ?? td.querySelector("a");
};
