import { describe, expect, test } from "vitest";
import {
  getDocumentSrl,
  toCanonicalPostUrl,
  withCommentPage,
} from "@/lib/api/urls";
import { getPreviewLink } from "@/lib/getPreviewLink";
import { htmlDoc } from "./helpers";

describe("getDocumentSrl", () => {
  test.each([
    ["https://www.fmkorea.com/10409551104", "10409551104"],
    ["https://www.fmkorea.com/best/10409551104", "10409551104"],
    ["https://www.fmkorea.com/best2/10409551104", "10409551104"],
    [
      "https://www.fmkorea.com/index.php?mid=hotdeal&document_srl=10409551104",
      "10409551104",
    ],
    ["/10409551104", "10409551104"],
    ["https://www.fmkorea.com/hotdeal", undefined],
  ])("%s → %s", (url, srl) => {
    expect(getDocumentSrl(url)).toBe(srl);
  });
});

test("toCanonicalPostUrl: 짧은 주소로 바꾸고 댓글 페이지는 유지", () => {
  expect(
    toCanonicalPostUrl(
      "https://www.fmkorea.com/index.php?mid=humor&document_srl=123&cpage=3&page=2",
    ),
  ).toBe("https://www.fmkorea.com/123?cpage=3");
  expect(toCanonicalPostUrl("https://www.fmkorea.com/hotdeal")).toBe(
    "https://www.fmkorea.com/hotdeal",
  );
});

test("withCommentPage", () => {
  expect(withCommentPage("https://www.fmkorea.com/best/123", 5)).toBe(
    "https://www.fmkorea.com/123?cpage=5",
  );
});

describe("getPreviewLink: 우클릭한 곳이 미리보기로 열 글 제목인지", () => {
  const target = (html: string, selector: string) =>
    htmlDoc(html).querySelector<HTMLElement>(selector)!;

  test("목록의 글 제목 링크(a.title)", () => {
    const el = target('<a class="title" href="/123">제목</a>', "a");
    expect(getPreviewLink(el)?.getAttribute("href")).toBe("/123");
  });

  test("핫딜 제목. 종료된 핫딜(hotdeal_var8Y)도 포함", () => {
    for (const cls of ["hotdeal_var8", "hotdeal_var8Y"]) {
      const el = target(
        `<h3 class="title"><a href="/10419072217" class=" ${cls}"><span class="ellipsis-target">제목</span></a></h3>`,
        "span",
      );
      expect(getPreviewLink(el)?.getAttribute("href")).toBe("/10419072217");
    }
  });

  test("td.title 칸의 빈 곳을 누르면 그 칸의 글 링크", () => {
    const el = target(
      '<table><tr><td class="title"><a href="/123">제목</a> <span class="x">[3]</span></td></tr></table>',
      "td",
    );
    expect(getPreviewLink(el)?.getAttribute("href")).toBe("/123");
  });

  test("제목이 아닌 링크(추천 수, 썸네일)는 무시", () => {
    const el = target(
      '<a href="/123" class="pc_voted_count"><span>8</span></a>',
      "span",
    );
    expect(getPreviewLink(el)).toBeNull();
  });

  test("다른 사이트 주소는 무시 (주소창을 바꿀 수 없어서)", () => {
    const el = target(
      '<a class="title" href="https://example.com/1">외부</a>',
      "a",
    );
    expect(getPreviewLink(el)).toBeNull();
  });
});
