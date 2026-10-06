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
  /** 본문 속 승부예측 (form.fm-pp). 없으면 빈 배열 */
  predictionPolls: PredictionPoll[];
  /** 핫딜 글 아래 "유사한 최근 6개월 핫딜들". 없으면 빈 배열 */
  relatedHotdeals: RelatedHotdeal[];
  /**
   * "유사한 쿠팡/지마켓 상품" 자리(ul.relevant_products_from_ad)가 있는지.
   * 목록은 페이지 HTML에 없고 따로 요청해야 함
   */
  hasRelatedProducts: boolean;
}

/** 핫딜 글 아래 "유사한 쿠팡/지마켓 상품" 하나 */
export interface RelatedProduct {
  /** "coupang" | "gmarket" */
  type: string;
  title: string;
  /** 제휴 링크 */
  url: string;
  price: number;
  image: string;
  /** 쇼핑몰이 준 원본 정보. 쿠팡만 배송 정보가 있음 */
  result?: { isFreeShipping?: boolean; isRocket?: boolean };
}

/** ?act=dispFmhotdealReleavntProductListFromAD 응답 */
export interface RelatedProductsResult {
  product_list: RelatedProduct[];
  error: number;
  message: string;
}

export interface RelatedHotdeal {
  url: string;
  /** "조마샵" (대괄호 뺀 쇼핑몰 이름) */
  shop: string;
  title: string;
  /** "189$", "61,740원" 처럼 글쓴이가 적은 그대로 */
  price: string;
  /** "2026-10-06" */
  date: string;
}

export interface PredictionPollOption {
  /** 라디오 값 (참여할 때 보내는 o) */
  value: string;
  /** "[7.5] 언더" */
  label: string;
  /** 이 선택지에 걸린 잉여력 합 */
  sum: number;
  /** 전체 대비 비율 (0~100) */
  percent: number;
  /** 배당률 "1.43" */
  odds: string;
  /** 참여 수 */
  count: number;
  /** 내가 이 선택지에 건 잉여력과 지급 예상. 참여 안 했으면 null */
  myBet: { point: number; exp: number } | null;
}

/** 게시글 속 승부예측 */
export interface PredictionPoll {
  /** 예측 번호 (hidden input pk) */
  pk: string;
  title: string;
  /** 전체 잉여력 합 */
  totalSum: number;
  /** 전체 참여 수 */
  totalCount: number;
  options: PredictionPollOption[];
  /** 참여 입력 칸. 마감됐거나 참여할 수 없으면 null */
  bet: { min: number; max: number; initial: number; myPoint: number } | null;
  /** 마감 안내 "참여 마감 되었습니다." 마감 전이면 null */
  endMessage: string | null;
  /** 참여 마감 시각, 수수료, 최소/최대 잉여력 같은 안내 문구 (한 줄씩) */
  notices: string[];
}

/** 승부예측 참여 기록 하나 */
export interface PredictionPollBet {
  /** 참여 기록 번호 (승부예측 번호와 다름) */
  pk: number;
  /** 고른 선택지 (PredictionPollOption.value와 같은 값) */
  o: number;
  point: number;
  member_srl: number;
  /** "베팅" */
  status: string;
  point_after: number;
  nick_name: string;
  /** 지급 예상 잉여력 (point × 현재 배당률) */
  exp: number;
  /** 20261007024626 (yyyyMMddHHmmss) */
  regdate: number;
  /** "7일 02:46:26" */
  regtext: string;
}

/** 참여하기 응답 (?act=procPpBet) */
export interface PredictionPollBetResult {
  /** 참여 후 남은 잉여력 */
  my_point: number;
  /** 최신 수치로 다시 그린 선택지(.o) HTML. 내 참여(.my)도 들어 있음 */
  tpl: string;
  error: number;
  /** "[아르헨티나(-4.5)] 참여합니다.\n참여후 잉여력: 290" */
  message: string;
}

/** 참여 현황 응답 (?act=getPpList) */
export interface PredictionPollList {
  o_win: number;
  /** o_win=0이면 모든 선택지의 참여 기록이 잉여력 많은 순으로 옴 */
  bet_all: { o_list: PredictionPollBet[] };
  /** "기록 열람" 버튼 HTML */
  btns: string;
  /** 최신 수치로 다시 그린 선택지(.o) HTML */
  tpl: string;
  error: number;
  message: string;
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
