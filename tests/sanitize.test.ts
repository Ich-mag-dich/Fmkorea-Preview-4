import { describe, expect, test } from "vitest";
import { openLinkInNewTab } from "@/lib/sanitize";
import { htmlDoc } from "./helpers";

// sanitizeHtml을 거쳐 확인하지 않는 이유: happy-dom(20.14)에서는 DOMPurify가
// 훅이 없어도 <a>를 통째로 지워 버려서 결과에 링크가 남지 않음 (브라우저에선 남음)
const linkAfter = (html: string) => {
  const a = htmlDoc(html).querySelector("a")!;
  openLinkInNewTab(a);
  return a;
};

describe("openLinkInNewTab", () => {
  // https://www.fmkorea.com/10434560650 본문의 이미지 링크 (target 없음)
  test("이미지를 감싼 링크는 새 탭으로 열림", () => {
    const a = linkAfter(
      '<a href="https://image.fmkorea.com/files/attach/new3/20230408/486616/702166792/5658282799/1df31944091db85fcde29b954951ba30.jpg" style="color:rgb(1,137,221);"><img src="//image.fmkorea.com/files/attach/new3/20230408/486616/702166792/5658282799/1df31944091db85fcde29b954951ba30.jpg" width="1080" height="1350" /></a>',
    );
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener");
  });

  test("target이 다른 값이어도 새 탭으로 바꿈", () => {
    const a = linkAfter('<a href="https://example.com/" target="_self">x</a>');
    expect(a.getAttribute("target")).toBe("_blank");
  });

  test("같은 문서 안 링크(#)와 href 없는 링크는 그대로", () => {
    expect(linkAfter('<a href="#comment_1">x</a>').hasAttribute("target")).toBe(
      false,
    );
    expect(linkAfter("<a>신고자</a>").hasAttribute("target")).toBe(false);
  });
});
