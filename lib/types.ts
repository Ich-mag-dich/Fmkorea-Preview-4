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
  /** "게시판 이력" 요청에 필요한 값. 게시글에 이력 버튼이 없으면 null */
  historyParams: { ch: string; isBest: boolean; memberSrl: string } | null;
}

export interface HistoryItem {
  url: string;
  /** 글이면 제목, 댓글이면 댓글 내용 */
  text: string;
  /** 댓글이 달린 원글 제목 (댓글만) */
  postTitle?: string;
  /** 글의 댓글 수 (글만) */
  commentCount?: number;
  /** 목록에 보이는 짧은 날짜 (10-04) */
  date: string;
  /** 전체 날짜 (2026-10-04 22:04:46) */
  fullDate: string;
  /** 지금 보고 있는 글 */
  active: boolean;
}

/** 작성자의 이 게시판 활동 이력 (게시판 이력 버튼) */
export interface BoardHistory {
  /** "게시판: 메이플 / 가입일: 2024-12-27" */
  summary: string;
  documents: HistoryItem[];
  comments: HistoryItem[];
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
