export const getPreviewLink = (e: HTMLElement): HTMLAnchorElement | null => {
  const link = e.closest("a");

  if (
    link?.classList.contains("title") ||
    link?.classList.contains("hotdeal_var8")
  ) {
    return link;
  }
  const td = e.closest("td.title");
  if (!td) return null;
  // td 빈 곳을 눌렀으면 글 제목 링크를 대신 사용
  return link ?? td.querySelector("a");
};
