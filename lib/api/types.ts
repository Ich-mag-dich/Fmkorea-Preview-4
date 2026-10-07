/**
 * 에펨코리아 응답 형식 (JSON). 서버가 주는 필드 이름(snake_case) 그대로 둔다.
 * 사이트 응답이 바뀌면 이 파일과 lib/api/ 안만 고치면 되도록, 화면용 데이터 타입은
 * lib/types.ts에 따로 둔다.
 *
 * 공통: 실패해도 HTTP 200에 `error`(0이 아님)와 `message`로 알려준다 (readJson이 예외로 바꿈)
 */

/** 게시글·댓글 추천/비추천 응답 (?act=procDocumentVoteUp 등) */
export type VoteResult = {
  // 아래 셋은 성공했을 때만 옴
  my_vote?: number;
  voted_blamed_count?: number; // 게시글 추천시
  voted_count?: number; // 댓글 추천/추천 취소시 (비추천 응답엔 개수가 없음)
  point?: number;
  error: number;
  message: string;
};

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
