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
