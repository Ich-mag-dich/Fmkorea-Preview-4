import { getDocumentSrl, urls } from "./api/urls";
import { absolutizeMedia, cleanContent } from "./media";
import { prepareEmbeds } from "./embed";
import { parsePredictionPolls, removePredictionPolls } from "./prediction-poll";
import type { CommentData, PostData } from "./types";

/**
 * memberPlate에서 작성자 이름 텍스트를 추출하여 반환
 */
export const extractAuthorText = (memberPlate: Element | null): string => {
  if (!memberPlate) return "알 수 없음";
  const textNode = Array.from(memberPlate.childNodes)
    .filter(n => n.nodeType === 3)
    .map(n => n.textContent?.trim())
    .filter(Boolean)
    .join("");
  return textNode || "알 수 없음";
};

/**
 * 본문 요소를 찾아 정리한 뒤 HTML 문자열로 반환.
 * !주의: doc을 직접 수정함
 *
 * @param doc 게시글을 포함한 문서 객체
 * @returns 본문 HTML 문자열
 */
const extractContentHtml = (doc: Document): string => {
  const rdBody = doc.querySelector(".rd_body");
  const hotdealTable = doc.querySelector("table.hotdeal_table");

  let contentEl: Element | null;
  if (hotdealTable && rdBody) {
    // 핫딜 정보 표(링크/쇼핑몰/가격...)는 본문(.rd_body) 밖 머리글 쪽에 있어서
    // 본문 맨 앞으로 옮겨 같이 정리함.
    // 표 안 칸마다 .xe_content가 있으므로 .xe_content 대신 .rd_body 전체를 씀
    rdBody.prepend(hotdealTable);
    contentEl = rdBody;
  } else {
    contentEl = doc.querySelector(".xe_content") ?? rdBody;
  }

  if (!contentEl) return "<p>내용을 불러올 수 없습니다.</p>";

  removePredictionPolls(contentEl);
  cleanContent(contentEl);
  contentEl.querySelector(".document_address")?.remove();
  return contentEl.innerHTML;
};

/**
 * 아이콘 URL을 절대 경로로 변환하여 반환
 */
export const fixIconUrl = (src: string | null | undefined): string => {
  if (!src) return "";
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return `${urls.BASE_URL}${src}`;
  return src;
};

const COMMENTS_PER_PAGE = 100;

export const parseCommentCount = (doc: Document): number => {
  const count =
    Array.from(doc.querySelectorAll("div.side.fr span b"))
      .at(-1)
      ?.textContent?.trim() ?? "0";
  return parseInt(count.replace(/,/g, "")) || 0;
};

export const parsePagination = (
  doc: Document,
): { currentPage: number; totalPages: number } => {
  const allPgDivs = Array.from(doc.querySelectorAll(".bd_pg"));

  const pgDiv =
    allPgDivs.find(
      div =>
        !!div.closest("#comment") ||
        Array.from(div.querySelectorAll("a")).some(a =>
          a.getAttribute("href")?.includes("cpage="),
        ),
    ) ?? null;

  if (!pgDiv) return { currentPage: 1, totalPages: 1 };

  const currentPage =
    parseInt(pgDiv.querySelector("strong.this")?.textContent?.trim() ?? "1") ||
    1;

  const nums = Array.from(pgDiv.querySelectorAll("a:not(.direction)"))
    .map(a => parseInt(a.textContent?.trim() ?? ""))
    .filter(n => !isNaN(n) && n > 0);

  const byCount = Math.ceil(parseCommentCount(doc) / COMMENTS_PER_PAGE);

  const totalPages = Math.max(byCount, ...nums, currentPage);

  return { currentPage, totalPages };
};

/**
 * 문서에서 댓글 데이터를 파싱하여 반환
 *
 * @param doc 댓글을 포함한 문서 객체
 * @returns 댓글 데이터 배열
 */
export const parseComment = (
  doc: Document,
): { comments: CommentData[]; commentCount: number } => {
  const commentCount = parseCommentCount(doc);

  const items = doc.querySelectorAll<HTMLLIElement>("ul.fdb_lst_ul > li");
  return {
    comments: Array.from(items).flatMap((li): CommentData[] => {
      // 베스트 댓글은 목록 위에 id="comment_123_"처럼 끝에 _가 붙어 한 번 더 나온다
      const id = li.id?.replace("comment_", "").replace(/_$/, "") ?? "";
      if (!id || li.querySelector(".fdb_delete")) return [];
      const contentWrap = li.querySelector(".comment-content");
      const contentEl =
        contentWrap?.querySelector(".xe_content") ?? contentWrap;
      if (contentEl) {
        absolutizeMedia(contentEl);
        contentEl
          .querySelectorAll("a[onclick]")
          .forEach(a => a.removeAttribute("onclick"));
        contentEl.querySelector("span.imagecon-buy-icon")?.remove();
        prepareEmbeds(contentEl);
      }

      const memberPlate = li.querySelector(".member_plate");
      const levelImg = memberPlate?.querySelector("img.level");
      const userIconImg = memberPlate?.querySelector("img.icon");
      const memberClass = Array.from(memberPlate?.classList ?? []).find(c =>
        /^member_\d+$/.test(c),
      );
      const memberSrl = memberClass?.replace("member_", "") ?? "";

      return [
        {
          id,
          author: extractAuthorText(memberPlate),
          levelIcon: fixIconUrl(levelImg?.getAttribute("src")),
          userIcon: fixIconUrl(userIconImg?.getAttribute("src")),
          memberSrl,
          date: li.querySelector(".date")?.textContent?.trim() ?? "",
          content: contentEl?.innerHTML ?? "",
          voteUp:
            parseInt(
              li.querySelector(".voted_count")?.textContent?.trim() ?? "0",
            ) || 0,
          voteDown:
            parseInt(
              li.querySelector(".blamed_count")?.textContent?.trim() ?? "0",
            ) || 0,
          isReply: li.classList.contains("re"),
          // comment_best 클래스는 일반 위치의 원본에도 붙어 있어(같은 id로 key 중복 발생)
          // 상단 사본 구분은 id 끝의 _로 함
          isBest: li.id.endsWith("_"),
          isWriter: contentWrap?.classList.contains("document_writer") ?? false,
          // 대댓글은 style="margin-left:2%", 한 단계 깊어질 때마다 2%씩 증가
          depth: Math.round((parseFloat(li.style.marginLeft) || 0) / 2),
          divider: li.classList.contains("comment_border"),
        },
      ];
    }),
    commentCount,
  };
};

/**
 * 문서에서 게시글 데이터를 파싱하여 반환
 *
 * @param url 게시글 URL
 * @param doc 게시글을 포함한 문서 객체
 * @returns 게시글 데이터 객체
 */
export const parsePost = (url: string, doc: Document): PostData => {
  const authorPlate = doc.querySelector(".member_plate");
  const pagination = parsePagination(doc);
  let voteRid = "";
  let docId = getDocumentSrl(url) ?? "";

  try {
    const docHref = (
      doc.querySelector("div.document_address > a") as HTMLAnchorElement
    ).href;
    const extracted = getDocumentSrl(docHref);
    if (extracted) docId = extracted;
  } catch {}

  if (docId) {
    const voteBtn = doc.querySelector(`span.vote`);
    voteRid =
      voteBtn?.getAttribute("data-rid") ?? voteBtn?.getAttribute("rid") ?? "";
  }

  if (!voteRid) {
    for (const s of Array.from(doc.querySelectorAll("script"))) {
      const m = s.textContent?.match(/"rid"\s*[=:]\s*"([A-Za-z0-9+/=]{20,})"/);
      if (m) {
        voteRid = m[1]!;
        break;
      }
    }
  }

  // 본문 정리(extractContentHtml)보다 먼저 읽어야 함
  const predictionPolls = parsePredictionPolls(doc);

  const postData: PostData = {
    title:
      doc.querySelector(".np_18px_span")?.textContent?.trim() ?? "제목 없음",
    pageTitle: doc.title,
    author: extractAuthorText(authorPlate),
    authorLevelIcon: fixIconUrl(
      authorPlate?.querySelector("img.level")?.getAttribute("src"),
    ),
    authorUserIcon: fixIconUrl(
      authorPlate?.querySelector("img.icon")?.getAttribute("src"),
    ),
    authorMemberSrl:
      Array.from(authorPlate?.classList ?? [])
        .find(c => /^member_\d+$/.test(c))
        ?.replace("member_", "") ?? "",
    date:
      doc.querySelector("span.date.m_no")?.textContent?.trim() ??
      doc.querySelector(".date")?.textContent?.trim() ??
      "",
    views:
      doc
        .querySelector("div.side.fr")
        ?.textContent?.trim()
        .replace(/\s+/g, " ") ?? "",
    docId: getDocumentSrl(url) ?? "",
    url,
    mid: doc.querySelector<HTMLInputElement>("input[name='mid']")?.value ?? "",

    voteCount:
      parseInt(
        (
          doc.querySelector(".new_voted_count") as HTMLElement
        )?.textContent?.trim() ?? "0",
      ) || 0,

    voteRid,
    content: extractContentHtml(doc),

    commentPage: pagination.currentPage,
    totalCommentPages: pagination.totalPages,
    historyParams: parseHistoryParams(doc),
    predictionPolls,
    relatedHotdeals: parseRelatedHotdeals(doc),
    hasRelatedProducts: !!doc.querySelector("ul.relevant_products_from_ad"),
  };

  return postData;
};

/**
 * 핫딜 글 본문 아래(.rd_body 밖)의 "유사한 최근 6개월 핫딜들" 목록을 읽음
 * <li class="list"><a href="...">[조마샵] <span>상품명</span></a>
 *   <span class="price">가격 : <span>189$</span></span>
 *   <span class="regdate">등록일 : <span>2026-10-06</span></span></li>
 */
const parseRelatedHotdeals = (doc: Document): PostData["relatedHotdeals"] =>
  Array.from(doc.querySelectorAll("ul.relevant_hotdeals > li.list")).flatMap(
    li => {
      const a = li.querySelector("a");
      const href = a?.getAttribute("href");
      if (!a || !href) return [];
      const title = a.querySelector("span")?.textContent?.trim() ?? "";
      // 링크 글자에서 상품명을 뺀 앞부분이 "[조마샵]"
      const shop = (a.textContent ?? "")
        .replace(title, "")
        .trim()
        .replace(/^\[(.*)\]$/, "$1");
      return [
        {
          url: new URL(href, urls.BASE_URL).href,
          shop,
          title,
          price: li.querySelector(".price > span")?.textContent?.trim() ?? "",
          date: li.querySelector(".regdate > span")?.textContent?.trim() ?? "",
        },
      ];
    },
  );

/**
 * 게시판 이력 버튼에서 이력 요청 값을 읽음
 * <button class="humorHistory" data-ch="..." onclick="window.humorHistory(this,회원번호);">
 * ch는 글마다 발급되는 값이라 목록이 아닌 게시글 페이지에서만 얻을 수 있음
 */
const parseHistoryParams = (doc: Document): PostData["historyParams"] => {
  const btn = doc.querySelector<HTMLElement>("button.humorHistory");
  const ch = btn?.dataset.ch;
  const memberSrl = btn
    ?.getAttribute("onclick")
    ?.match(/humorHistory\(\s*this\s*,\s*(\d+)\s*\)/)?.[1];
  if (!ch || !memberSrl) return null;
  return { ch, memberSrl, isBest: btn?.dataset.is_best?.trim() === "1" };
};
