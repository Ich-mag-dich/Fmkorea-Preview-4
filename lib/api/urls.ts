const BASE_URL = "https://www.fmkorea.com";

const indexUrl = (params: Record<string, string>) =>
  `${BASE_URL}/index.php?${new URLSearchParams(params)}`;

export const urls = {
  BASE_URL,
  messageIcon: `${BASE_URL}/modules/communication/tpl/images/icon_write_message.gif`,
  memberInfoIcon: `https://static.fmkorea.com/modules/member/tpl/images/icon_view_info.gif`,
  writtenIcon: `https://www.fmkorea.com/modules/member/tpl/images/icon_view_written.gif`,
  blindIcon: `https://www.fmkorea.com/modules/blind/tpl/icon_blind.gif`,

  sendMessage: (receiverSrl: string) =>
    indexUrl({
      module: "communication",
      act: "dispCommunicationSendMessage",
      receiver_srl: receiverSrl,
    }),

  memberInfo: ({ mid, memberSrl }: { mid: string; memberSrl: string }) =>
    indexUrl({ mid, act: "dispMemberInfo", member_srl: memberSrl }),

  writtenArticles: ({ mid, memberSrl }: { mid: string; memberSrl: string }) =>
    indexUrl({ mid, search_target: "member_srl", search_keyword: memberSrl }),

  /** 이미지콘 이미지. 사이트 이미지콘 창의 <img src>와 같은 형식 */
  imageCon: (setSrl: number, sortOrder: number) =>
    `https://image.fmkorea.com/filesn/imagecon/${setSrl}/${setSrl}_${sortOrder}.webp`,

  /** 이미지콘 세트 정보(구매) 페이지. 사이트 댓글 이미지콘의 ✚ 아이콘이 가는 주소 */
  imageConInfo: (setSrl: string) =>
    `${BASE_URL}/imagecon?set_srl=${encodeURIComponent(setSrl)}`,
};

/**
 * 게시글 URL에서 글 번호(document_srl)를 추출
 * - https://www.fmkorea.com/10409551104
 * - https://www.fmkorea.com/best/10409551104
 * - https://www.fmkorea.com/best2/10409551104
 * - https://www.fmkorea.com/index.php?mid=...&document_srl=10409551104
 */
export const getDocumentSrl = (url: string): string | undefined => {
  const { pathname, searchParams } = new URL(url, urls.BASE_URL);
  return (
    searchParams.get("document_srl")
    ?? pathname.match(/^\/(?:best\d*\/)?(\d+)/)?.[1]
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

export const withCommentPage = (url: string, cpage: number): string => {
  const u = new URL(toCanonicalPostUrl(url));
  u.searchParams.set("cpage", String(cpage));
  return u.href;
};
