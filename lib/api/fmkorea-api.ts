import { parseComment, parsePagination, parsePost } from "../parser";
import type {
  BlindType,
  BoardHistory,
  HistoryItem,
  PostData,
  PredictionPollBetResult,
  PredictionPollList,
  RelatedProduct,
  RelatedProductsResult,
  VoteResult,
  VoteType,
} from "../types";
import { type CommentData } from "./../types";
import { toCanonicalPostUrl, urls, withCommentPage } from "./urls";

const pageFetch: typeof fetch =
  (globalThis as { content?: { fetch: typeof fetch } }).content?.fetch ?? fetch;

/**
 * 주어진 URL의 게시글 데이터를 가져와 파싱하여 반환
 *
 * @param url 게시글 URL
 * @returns 게시글 데이터와 댓글 데이터를 포함한 객체
 */
export const fetchPost = async (
  url: string,
): Promise<{
  PostData: PostData;
  CommentData: CommentData[];
  commentCount: number;
}> => {
  const postUrl = toCanonicalPostUrl(url);

  const res = await fetch(postUrl);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  // parsePost는 doc을 직접 수정하므로 읽기만 하는 파싱을 먼저 수행
  const { comments: CommentData, commentCount } = parseComment(doc);
  const PostData = parsePost(postUrl, doc);
  return { PostData, CommentData, commentCount };
};

export const fetchComments = async (url: string, cpage: number) => {
  const res = await fetch(withCommentPage(url, cpage));
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  const { comments, commentCount } = parseComment(doc);
  const { currentPage, totalPages } = parsePagination(doc);
  return { comments, commentCount, currentPage, totalPages };
};

export const voteDocument = async (
  post: PostData,
  type: VoteType,
): Promise<VoteResult> => {
  const act = type === "up" ? "procDocumentVoteUp" : "procDocumentVoteDown";
  // 브라우저가 보내는 것과 같은 파라미터, 같은 순서
  const params = new URLSearchParams({ target_srl: post.docId });
  if (post.voteRid) params.set("rid", post.voteRid);
  params.set("module", "document");
  params.set("act", act);

  const res = await pageFetch(`${urls.BASE_URL}/?act=${act}`, {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    credentials: "include",
    referrer: post.url, // 헤더로는 못 바꾸므로 옵션으로
    body: params.toString(),
  });

  const data: VoteResult = await res.json();
  console.log(data);

  // 실패해도 HTTP 200에 error: -1로 오므로 직접 예외로 바꿔야 mutation의 onError로 감
  if (data.error !== 0) throw new Error(data.message);
  return data;
};

export const voteComment = async (
  comment: CommentData,
  type: VoteType,
): Promise<VoteResult> => {
  const act = type === "up" ? "procCommentVoteUp" : "procCommentVoteDown";
  const params = new URLSearchParams({
    target_srl: comment.id,
    module: "comment",
    act,
  });

  const res = await pageFetch(`${urls.BASE_URL}/?act=${act}`, {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    credentials: "include",
    body: params.toString(),
  });

  const data: VoteResult = await res.json();
  console.log(data);

  // 댓글 추천은 성공/취소/실패 모두 error: -2로 와서 여기서 예외로 바꾸지 않음.
  // 성공 여부 판단은 useVoteComment에서 응답 필드로 함
  return data;
};

const xmlBody = (params: Record<string, string>) =>
  `<?xml version="1.0" encoding="utf-8" ?>\n<methodCall>\n<params>\n${Object.entries(
    params,
  )
    .map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`)
    .join("\n")}\n</params>\n</methodCall>`;

/** 해당 회원의 블라인드 상태. 로그인 안 했으면 항목이 없어서 undefined */
export const fetchBlindStatus = async ({
  memberSrl,
  docId,
  mid,
}: {
  memberSrl: string;
  docId: string;
  mid: string;
}): Promise<Partial<Record<BlindType, boolean>>> => {
  const res = await pageFetch(`${urls.BASE_URL}/index.php?act=getMemberMenu`, {
    method: "POST",
    headers: {
      accept: "application/xml, text/xml, */*; q=0.01",
      "content-type": "text/xml; charset=utf-8",
      "x-requested-with": "XMLHttpRequest",
    },
    credentials: "include",
    referrer: `${urls.BASE_URL}/${docId}`,
    body: xmlBody({
      document_srl: docId,
      target_srl: memberSrl,
      cur_mid: mid,
      mid,
      cur_act: "",
      menu_id: `member_${memberSrl}`,
      page_x: "0",
      page_y: "0",
      module: "member",
      act: "getMemberMenu",
    }),
  });
  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
  if (xml.querySelector("parsererror")) {
    throw new Error("회원 메뉴 응답을 해석하지 못했습니다");
  }

  // 블라인드 항목은 상태에 따라 두 형식으로 옴
  // - 아무것도 안 했을 때: blind_click(this, srl, 2, 'add') "블라인드" 하나
  //   (둘 다 했을 때는 'cancel'로 올 것으로 추정, 아직 확인 못 함)
  // - 하나만 했을 때: blind_click(this, srl, 0) 글·댓글 / (…, 1) 쪽지 두 개,
  //   블라인드 중인 쪽은 라벨 끝에 "취소"
  // 로그인 안 했거나 자기 자신이면 항목이 없어서 빈 객체
  const status: Partial<Record<BlindType, boolean>> = {};
  for (const item of xml.querySelectorAll("menus > item")) {
    const [, kind, mode] =
      item
        .querySelector("url")
        ?.textContent?.match(
          /^blind_click\(this,\s*\d+,\s*(\d)(?:,\s*'(\w+)')?/,
        ) ?? [];
    if (kind === "2") {
      const blinded = mode === "cancel";
      status.default = blinded;
      status.message = blinded;
    } else if (kind === "0" || kind === "1") {
      status[kind === "0" ? "default" : "message"] =
        item.querySelector("str")?.textContent?.trim().endsWith("취소") ??
        false;
    }
  }
  return status;
};

export const blindMember = async ({
  memberSrl,
  docId,
  mid,
  type,
  mode,
  memo = "",
}: {
  memberSrl: string;
  docId: string;
  mid: string;
  type: BlindType | "all";
  mode: "add" | "cancel";
  memo?: string;
}) => {
  const res = await pageFetch(`${urls.BASE_URL}/modules/blind/api.php`, {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    credentials: "include",
    referrer: `${urls.BASE_URL}/${docId}`,
    body: new URLSearchParams({
      target_srl: memberSrl,
      type,
      mode,
      memo,
      target_document_srl: docId,
      current_mid: mid,
    }).toString(),
  });
  return res.json(); // 성공/실패 판단은 실제 응답 보고 결정
};

/** 입력한 텍스트를 use_html=Y 댓글 본문으로. 태그로 해석되지 않게 이스케이프하고 줄바꿈은 <br> */
const toCommentHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;") // ]]>도 같이 막혀서 CDATA가 깨지지 않음
    .replace(/\r?\n/g, "<br />");

/**
 * 댓글 작성. parentSrl을 주면 그 댓글에 대한 답글
 * @returns 새 댓글의 comment_srl
 */
export const insertComment = async ({
  mid,
  docId,
  content,
  parentSrl,
}: {
  mid: string;
  docId: string;
  content: string;
  parentSrl?: string;
}): Promise<string> => {
  const res = await pageFetch(
    `${urls.BASE_URL}/write.php?act=procBoardInsertComment`,
    {
      method: "POST",
      headers: {
        accept: "application/xml, text/xml, */*; q=0.01",
        "content-type": "text/xml; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
      },
      credentials: "include",
      referrer: `${urls.BASE_URL}/${docId}`,
      body: xmlBody({
        _filter: "insert_comment",
        mid,
        document_srl: docId,
        content: toCommentHtml(content),
        ...(parentSrl && { parent_srl: parentSrl }),
        use_html: "Y",
        module: "board",
        act: "procBoardInsertComment",
      }),
    },
  );

  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
  const text = (tag: string) => xml.querySelector(tag)?.textContent?.trim();
  const commentSrl = text("comment_srl");
  if (text("error") !== "0" || !commentSrl) {
    // 비로그인, 도배 방지 등은 message에 사유가 옴
    throw new Error(text("message") || "댓글을 등록하지 못했습니다");
  }
  return commentSrl;
};

/** 이력 표의 한 줄(<tr>)을 읽음. 날짜 칸은 <span class="layer">전체 날짜</span>짧은 날짜 구조 */
const parseHistoryRow = (tr: Element): HistoryItem | null => {
  const a = tr.querySelector<HTMLAnchorElement>("th a");
  const href = a?.getAttribute("href");
  if (!a || !href) return null;

  const regdate = tr.querySelector(".regdate");
  const fullDate = regdate?.querySelector(".layer")?.textContent?.trim() ?? "";
  const date = (regdate?.textContent ?? "").replace(fullDate, "").trim();

  // 글 제목 끝의 " [2]"는 댓글 수
  const raw = (a.textContent ?? "").replace(/\s+/g, " ").trim();
  const m = raw.match(/^(.*?)\s*\[(\d+)\]$/);

  return {
    url: new URL(href, urls.BASE_URL).href,
    text: m ? m[1]! : raw,
    commentCount: m ? Number(m[2]) : undefined,
    postTitle: a.getAttribute("title") ?? undefined,
    date,
    fullDate,
    active: a.classList.contains("active"),
  };
};

/**
 * 작성자의 이 게시판 이력(최근 글/댓글 8개씩, 가입일).
 * 게시글 페이지의 "게시판 이력" 버튼과 같은 요청
 */
export const fetchBoardHistory = async (
  post: PostData,
): Promise<BoardHistory> => {
  const history = post.historyParams;
  if (!history) throw new Error("이 글은 게시판 이력을 볼 수 없습니다");

  const params = new URLSearchParams({
    document_srl: post.docId,
    target_member_srl: history.memberSrl,
    is_mobile: "0",
    mid: post.mid,
    is_best: history.isBest ? "1" : "0",
    ch: history.ch,
  });
  const res = await pageFetch(
    `${urls.BASE_URL}/_call/humorHistory.php?${params}`,
    {
      headers: { accept: "*/*", "x-requested-with": "XMLHttpRequest" },
      credentials: "include",
      referrer: post.url,
    },
  );
  if (!res.ok) throw new Error("게시판 이력을 불러오지 못했습니다");

  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  const rows = (selector: string) =>
    Array.from(doc.querySelectorAll(`${selector} tr`))
      .map(parseHistoryRow)
      .filter(item => item !== null);

  return {
    summary: doc.querySelector(".history-member")?.textContent?.trim() ?? "",
    documents: rows(".history-document:not(.history-comment)"),
    comments: rows(".history-comment"),
  };
};

/**
 * 승부예측 참여 현황을 가져옴
 *
 * @param pk 승부예측 번호
 * @param o_win 선택지 값 + 1 (선택지 0 → "1"). "0"이면 모든 선택지
 * @param page 페이지 (한 페이지에 100명)
 */
export const fetchPredictionPollList = async (
  pk: string,
  o_win: string,
  page = 1,
): Promise<PredictionPollList> => {
  const res = await pageFetch(`${urls.BASE_URL}/?act=getPpList`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-requested-with": "XMLHttpRequest",
      "content-type": "application/json",
    },
    credentials: "include",
    body: new URLSearchParams({
      pk: pk,
      o_win: o_win,
      page: String(page),
      module: "pp",
      act: "getPpList",
    }),
  });
  if (!res.ok) throw new Error("승부예측 목록을 불러오지 못했습니다");

  const data: PredictionPollList = await res.json();
  if (data.error !== 0) throw new Error(data.message);
  return data;
};

/**
 * 승부예측 참여하기
 *
 * @param post 승부예측이 있는 게시글 (referrer용)
 * @param pk 승부예측 번호
 * @param option 고른 선택지 값 (참여 현황의 o_win과 달리 +1 하지 않음)
 * @param bet 걸 잉여력
 */
export const betPredictionPoll = async (
  post: PostData,
  pk: string,
  option: string,
  bet: number,
): Promise<PredictionPollBetResult> => {
  // 브라우저가 보내는 것과 같은 파라미터, 같은 순서
  const params = new URLSearchParams({
    pk,
    o: option,
    bet: String(bet),
    module: "pp",
    act: "procPpBet",
  });
  const res = await pageFetch(`${urls.BASE_URL}/?act=procPpBet`, {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    credentials: "include",
    referrer: post.url,
    body: params.toString(),
  });
  if (!res.ok) throw new Error("승부예측에 참여하지 못했습니다");

  // 실패해도 HTTP 200에 error가 0이 아닌 값으로 옴
  const data: PredictionPollBetResult = await res.json();
  if (data.error !== 0) throw new Error(data.message);
  return data;
};

/**
 * 핫딜 글 아래 "유사한 쿠팡/지마켓 상품" 목록.
 * 페이지 HTML에는 빈 <ul>만 있고 사이트도 이 요청으로 채움
 * (act 이름의 Releavnt 오타는 사이트 그대로)
 */
export const fetchRelatedProducts = async (
  post: PostData,
): Promise<RelatedProduct[]> => {
  const act = "dispFmhotdealReleavntProductListFromAD";
  const params = new URLSearchParams({
    document_srl: post.docId,
    module: "fmhotdeal",
    act,
  });
  const res = await pageFetch(`${urls.BASE_URL}/?act=${act}`, {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    credentials: "include",
    referrer: post.url,
    body: params.toString(),
  });
  if (!res.ok) throw new Error("관련 상품을 불러오지 못했습니다");

  const data: RelatedProductsResult = await res.json();
  if (data.error !== 0) throw new Error(data.message);
  return data.product_list ?? [];
};
