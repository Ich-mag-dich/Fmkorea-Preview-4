export const urls = {
  BASE_URL: "https://www.fmkorea.com",
};

/**
 * 게시글 URL에서 글 번호(document_srl)를 추출
 * - https://www.fmkorea.com/10409551104
 * - https://www.fmkorea.com/best/10409551104
 * - https://www.fmkorea.com/index.php?mid=...&document_srl=10409551104
 */
export const getDocumentSrl = (url: string): string | undefined => {
  const { pathname, searchParams } = new URL(url, urls.BASE_URL);
  return (
    searchParams.get("document_srl") ??
    pathname.match(/^\/(?:best\/)?(\d+)/)?.[1]
  );
};

/** 글 번호를 알 수 있으면 파싱이 확실한 짧은 URL로 바꾸고, 아니면 원본 그대로 반환 */
export const toCanonicalPostUrl = (url: string): string => {
  const srl = getDocumentSrl(url);
  if (!srl) return url;

  const canonical = new URL(`/${srl}`, urls.BASE_URL);
  const cpage = new URL(url, urls.BASE_URL).searchParams.get("cpage");
  if (cpage) canonical.searchParams.set("cpage", cpage);
  return canonical.href;
};
