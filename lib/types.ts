export interface CommentData {
  id: string;
  author: string;
  levelIcon: string;
  userIcon: string;
  memberSrl: string;
  date: string;
  content: string;
  voteUp: number;
  voteDown: number;
  isReply: boolean;
  isBest: boolean;
  isWriter: boolean;
  /** 대댓글 깊이. 0 = 일반 댓글, 1 = 대댓글, 2 = 대대댓글 ... */
  depth: number;

  // best 댓글과 일반 댓글을 구분하는 구분선 여부
  divider: boolean;
}

export interface PostData {
  title: string;
  /** 게시글 페이지의 <title>. 미리보기 중 브라우저 탭 제목으로 사용 */
  pageTitle: string;
  author: string;
  date: string;
  views: string;
  content: string;
  url: string;
  docId: string;
  authorMemberSrl: string;
  authorLevelIcon: string;
  authorUserIcon: string;
  voteRid: string;
  voteCount: number;
  mid: string;
  commentPage: number;
  totalCommentPages: number;
}

export type SubmitResult = "success" | "error" | null;

export type VoteType = "up" | "down";

export type AuthorClickHandler = (
  memberSrl: string,
  author: string,
  event: MouseEvent,
) => void;

export type VoteResult = {
  // 아래 셋은 성공했을 때만 옴
  my_vote?: number;
  voted_blamed_count?: number; // 게시글 추천시
  voted_count?: number; // 댓글 추천/추천 취소시 (비추천 응답엔 개수가 없음)
  point?: number;
  error: number;
  message: string;
};

export interface MemberPopup {
  memberSrl: string;
  author: string;
  x: number;
  y: number;
}

export type BlindType = "default" | "message"; // 글·댓글 / 쪽지
