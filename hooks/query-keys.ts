/**
 * react-query 키를 한곳에서 만듦. 키 문자열을 훅마다 직접 쓰면
 * 하나만 오타가 나도 갱신(invalidate)이 조용히 안 되므로 여기서만 만든다.
 *
 * 앞부분이 같은 키는 묶어서 갱신할 수 있음
 * (예: comments(href)로 invalidate하면 commentsPage(href, n) 전부 포함)
 */
export const queryKeys = {
  /** 열려 있는 모든 게시글 (블라인드 후 전체 다시 받기용) */
  posts: () => ["post"] as const,
  /** 게시글 + 첫 댓글 페이지 */
  post: (href: string) => ["post", href] as const,

  /** 모든 글의 댓글 페이지 */
  allComments: () => ["comments"] as const,
  /** 한 글의 모든 댓글 페이지 */
  comments: (href: string) => ["comments", href] as const,
  commentsPage: (href: string, page: number) =>
    ["comments", href, page] as const,

  boardHistory: (docId: string, memberSrl: string | undefined) =>
    ["board-history", docId, memberSrl] as const,

  blindStatus: (memberSrl: string) => ["blind-status", memberSrl] as const,

  /** 승부예측 하나의 모든 선택지·페이지 참여 현황 */
  pollList: (pk: string) => ["prediction-poll-list", pk] as const,
  pollListPage: (pk: string, option: string, page: number) =>
    ["prediction-poll-list", pk, option, page] as const,

  relatedProducts: (docId: string) => ["related-products", docId] as const,
};
