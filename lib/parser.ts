import { urls } from "./api/urls";
import { absolutizeMedia, cleanContent } from "./media";
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
  let contentEl: Element | null = null;

  // 핫딜 처리
  if (doc.querySelector(".hotdeal_table")) {
    const parent = doc.querySelector(".hotdeal_url")?.parentElement;
    const rdBody = doc.querySelector(".rd_body");
    if (parent && rdBody) {
      parent.appendChild(rdBody);
      contentEl = parent;
    }
  }

  contentEl ??=
    doc.querySelector(".xe_content") ?? doc.querySelector(".rd_body");

  if (!contentEl) return "<p>내용을 불러올 수 없습니다.</p>";

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
  const totalPages = Math.max(...nums, currentPage);
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
  const count =
    Array.from(doc.querySelectorAll("div.side.fr span b"))
      ?.at(-1)
      ?.textContent?.trim() ?? "0";
  const commentCount = parseInt(count) || 0;
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
          isBest: li.classList.contains("comment_best"),
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
  let docId = url.match(/\/(\d+)(?:\/|\?|$)/)?.[1] ?? "";

  try {
    const docHref = (
      doc.querySelector("div.document_address > a") as HTMLAnchorElement
    ).href;
    const extracted = docHref
      .replace(`${urls.BASE_URL}/`, "")
      .replace("best/", "")
      .match(/^(\d+)/)?.[1];
    if (extracted) docId = extracted;
  } catch {}

  if (docId) {
    const voteBtn = doc.querySelector(`#fm_vote${docId}`);
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
    docId: url.match(/\/(\d+)(?:\/|\?|$)/)?.[1] ?? "",
    url,
    mid:
      doc.querySelector<HTMLInputElement>("input[name='mid']")?.value ??
      url.match(/fmkorea\.com\/(?:best\/)?([a-z_]+)\//)?.[1] ??
      "",

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
  };

  return postData;
};
