import DOMPurify from "dompurify";

/**
 * fmkorea에서 가져온 HTML을 렌더링 전에 정화
 * 영상 임베드용 iframe만 추가로 허용
 *
 * @param html 정화할 HTML 문자열
 * @returns 정화된 HTML 문자열
 */
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "target"],
  });
