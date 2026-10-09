import { describe, expect, test } from "vitest";
import { parseComment, parsePagination, parsePost } from "@/lib/parser";
import { loadPage } from "./helpers";

// 각 파일이 어떤 글인지는 tests/fixtures/README.md 참고

describe("parsePost: 일반 글", () => {
  const url = "https://www.fmkorea.com/10419657717";
  const post = () => parsePost(url, loadPage("post-normal.html"));

  test("글 정보", () => {
    const p = post();
    expect(p.title).toBe("post-normal");
    expect(p.docId).toBe("10419657717");
    expect(p.mid).toBe("free");
    expect(p.author).toBe("테스트유저");
    expect(p.authorMemberSrl).toBe("1000000001");
    expect(p.authorLevelIcon).toMatch(/^https:\/\/image\.fmkorea\.com\//);
    expect(p.date).toBe("2026.10.07 08:25");
    expect(p.voteRid).not.toBe("");
  });

  test("게시판 이력 버튼 값 (로그인했을 때만 있음)", () => {
    expect(post().historyParams).toEqual({
      ch: "3727909228",
      memberSrl: "1000000001",
      isBest: false,
    });
  });

  test("본문 정리: 유튜브는 임베드 자리표시자로, 영상은 video로, 글 주소 줄은 제거", () => {
    const { content } = post();
    expect(content).toContain(
      'data-embed="https://www.youtube.com/watch?v=AjBp0R8B5wQ"',
    );
    expect(content).toContain("<video");
    expect(content).not.toContain("height_keep");
    expect(content).not.toContain("document_address");
    expect(content).not.toContain("<!--");
  });

  test("핫딜·승부예측이 아닌 글", () => {
    const p = post();
    expect(p.predictionPolls).toEqual([]);
    expect(p.hotdeal).toBeNull();
  });

  test("URL에 글 번호가 없으면 본문 위 글 주소 링크에서 찾음", () => {
    const p = parsePost(
      "https://www.fmkorea.com/free?foo=1",
      loadPage("post-normal.html"),
    );
    expect(p.docId).toBe("10419657717");
  });
});

describe("parsePost: 핫딜 글", () => {
  const post = () =>
    parsePost("https://www.fmkorea.com/10419278576", loadPage("hotdeal.html"));

  test("핫딜 정보 표를 본문 맨 앞으로 옮기고, 링크는 한 번만", () => {
    const { content } = post();
    expect(content.trimStart().startsWith('<table class="hotdeal_table"')).toBe(
      true,
    );
    expect(content.match(/class="hotdeal_url"/g)).toHaveLength(1);
  });

  test("유사한 최근 6개월 핫딜 목록", () => {
    const relatedDeals = post().hotdeal?.relatedDeals ?? [];
    expect(relatedDeals).toHaveLength(41);
    for (const item of relatedDeals) {
      expect(item.url).toMatch(/^https:\/\/www\.fmkorea\.com\/\d+$/);
      expect(item.title).not.toBe("");
      expect(item.shop).not.toMatch(/^\[|\]$/); // 대괄호는 뺌
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test("쿠팡/지마켓 상품 자리가 있음 (목록은 따로 요청)", () => {
    expect(post().hotdeal?.hasRelatedProducts).toBe(true);
  });
});

describe("parsePost: 포텐 터진 게시글", () => {
  const post1 = parsePost(
    "https://www.fmkorea.com/best/10427494594",
    loadPage("is-best-url.html"),
  );

  test("포텐 게시판(/best) 글 확인", () => {
    expect(post1.isBest).toBe(true);
  });

  const post2 = parsePost(
    "https://www.fmkorea.com/10427494594",
    loadPage("is-best-class.html"),
  );

  test("STAR-BEST_T 클래스 유무로 포텐 터진 게시글 확인", () => {
    expect(post2.isBest).toBe(true);
  });

  test("일반 게시글은 isBest가 false", () => {
    const post = parsePost(
      "https://www.fmkorea.com/10419657717",
      loadPage("post-normal.html"),
    );
    expect(post.isBest).toBe(false);
  });
});

describe("parseComment", () => {
  test("베스트 댓글은 위쪽 사본(id 끝 _)으로 구분", () => {
    const { comments, commentCount } = parseComment(
      loadPage("post-many-comments.html"),
    );
    expect(commentCount).toBe(2650);
    const best = comments.filter(c => c.isBest);
    expect(best).toHaveLength(4);
    // 베스트 사본과 원본은 같은 id라 화면 key는 isBest로 나눔
    expect(comments).toHaveLength(54);
    expect(comments[0]).toMatchObject({
      id: "2464558503",
      author: "oooooooops",
      isBest: true,
      voteUp: 372,
      voteDown: 10,
    });
  });

  test("대댓글 깊이", () => {
    const { comments } = parseComment(loadPage("hotdeal.html"));
    expect(comments).toHaveLength(12);
    expect(comments.some(c => c.depth === 1 && c.isReply)).toBe(true);
    expect(comments.every(c => c.depth <= 1)).toBe(true);
  });

  test("모든 댓글에 id, 작성자, 본문이 있음", () => {
    for (const name of ["post-many-comments.html", "poll-open.html"]) {
      for (const c of parseComment(loadPage(name)).comments) {
        expect(c.id).toMatch(/^\d+$/);
        expect(c.author).not.toBe("");
      }
    }
  });

  test("댓글 없는 글", () => {
    expect(parseComment(loadPage("post-normal.html"))).toEqual({
      comments: [],
      commentCount: 0,
    });
  });

  test("이미지콘 확인", () => {
    const { comments } = parseComment(loadPage("image-con.html"));
    // 게시글 저장 시점, 댓글 4개 모두 이미지콘
    expect(comments.every(c => c.setSrl !== undefined)).toBe(true);
  });
});

describe("parsePagination", () => {
  test("댓글이 여러 페이지면 마지막 페이지가 열려 있음", () => {
    expect(parsePagination(loadPage("post-many-comments.html"))).toEqual({
      currentPage: 27,
      totalPages: 27,
    });
  });

  test("한 페이지뿐인 글", () => {
    expect(parsePagination(loadPage("hotdeal.html"))).toEqual({
      currentPage: 1,
      totalPages: 1,
    });
  });
});
