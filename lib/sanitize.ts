import DOMPurify from "dompurify";
import { isAllowedIframeSrc } from "./embed";

// iframe은 허용한 영상/SNS 주소만 남김. 나머지는 파싱 단계(prepareEmbeds)에서
// 링크로 바뀌지만, 혹시 남은 게 있어도 여기서 한 번 더 제거
DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName !== "iframe") return;
  const src = (node as Element).getAttribute("src") ?? "";
  if (!isAllowedIframeSrc(src)) node.parentNode?.removeChild(node);
});

/**
 * 링크를 새 탭으로 열리게 함. 미리보기를 연 탭은 목록 페이지라서 본문·댓글 링크로 이동하면 안 됨.
 * 사이트는 이미지를 <a href="원본.jpg">로 감싸면서 target을 안 붙이는 경우가 있어서,
 * 그대로 두면 이미지를 누를 때 현재 탭이 이미지 주소로 이동해 버림.
 * 같은 문서 안으로 가는 링크(#)는 그대로 둠
 */
export const openLinkInNewTab = (el: Element) => {
  if (el.nodeName !== "A") return;
  const href = el.getAttribute("href");
  if (!href || href.startsWith("#")) return;
  el.setAttribute("target", "_blank");
  el.setAttribute("rel", "noopener");
};

// 속성 정화가 끝난 뒤에 넣어야 지워지지 않음
DOMPurify.addHook("afterSanitizeAttributes", openLinkInNewTab);

/**
 * fmkorea에서 가져온 HTML을 렌더링 전에 정화
 * 영상 임베드용 iframe만 추가로 허용 (data-embed 자리표시자는 data-* 기본 허용)
 *
 * @param html 정화할 HTML 문자열
 * @returns 정화된 HTML 문자열
 */
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "target"],
  });
