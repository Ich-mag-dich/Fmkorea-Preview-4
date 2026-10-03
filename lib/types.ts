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
}

export interface MemberPopup {
  memberSrl: string;
  author: string;
  x: number;
  y: number;
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

export type CommentVoteType = "up" | "down";

export type AuthorClickHandler = (
  memberSrl: string,
  author: string,
  event: MouseEvent,
) => void;
