import { describe, expect, test } from "vitest";
import { isAllowedIframeSrc, parseEmbed, prepareEmbeds } from "@/lib/embed";
import { htmlDoc } from "./helpers";

// post-normal.html 본문에 있는 유튜브 영상
const YT_ID = "AjBp0R8B5wQ";
const YT_URL = `https://www.youtube.com/watch?v=${YT_ID}`;

describe("parseEmbed: YouTube", () => {
  test("watch 주소", () => {
    expect(parseEmbed(YT_URL)).toEqual({
      kind: "video",
      provider: "youtube",
      key: `youtube:${YT_ID}`,
      url: YT_URL,
      src: `https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1`,
      thumbnail: `https://i.ytimg.com/vi/${YT_ID}/hqdefault.jpg`,
      vertical: false,
    });
  });

  test.each([
    `https://youtu.be/${YT_ID}`,
    `https://m.youtube.com/watch?v=${YT_ID}`,
    `https://music.youtube.com/watch?v=${YT_ID}`,
    `https://www.youtube.com/embed/${YT_ID}`,
    `https://www.youtube.com/live/${YT_ID}`,
    `https://www.youtube-nocookie.com/embed/${YT_ID}`,
  ])("다른 주소 형식도 같은 영상: %s", url => {
    const info = parseEmbed(url);
    expect(info?.key).toBe(`youtube:${YT_ID}`);
    expect(info?.url).toBe(YT_URL);
  });

  test("쇼츠는 세로 영상", () => {
    const info = parseEmbed(`https://youtube.com/shorts/${YT_ID}`);
    expect(info).toMatchObject({ key: `youtube:${YT_ID}`, vertical: true });
  });

  test.each([
    [`https://youtu.be/${YT_ID}?t=90`, 90],
    [`${YT_URL}&t=1h2m3s`, 3723],
    [`${YT_URL}&t=2m`, 120],
    [`https://www.youtube.com/embed/${YT_ID}?start=30`, 30],
  ])("시작 시간: %s → %i초", (url, start) => {
    const info = parseEmbed(url);
    expect(info?.url).toBe(`${YT_URL}&t=${start}`);
    expect(info?.src).toBe(
      `https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1&start=${start}`,
    );
  });

  test("읽을 수 없는 시작 시간은 처음부터", () => {
    const info = parseEmbed(`${YT_URL}&t=abc`);
    expect(info?.url).toBe(YT_URL);
    expect(info?.src).not.toContain("start=");
  });

  test.each([
    "https://www.youtube.com/watch?v=tooShort",
    "https://www.youtube.com/@channel",
    "https://www.youtube.com/playlist?list=PL0123456789",
  ])("영상 주소가 아니면 null: %s", url => {
    expect(parseEmbed(url)).toBeNull();
  });
});

describe("parseEmbed: 다른 서비스", () => {
  test("치지직 클립", () => {
    expect(parseEmbed("https://chzzk.naver.com/clips/abcDEF123")).toEqual({
      kind: "video",
      provider: "chzzk",
      key: "chzzk:abcDEF123",
      url: "https://chzzk.naver.com/clips/abcDEF123",
      src: "https://chzzk.naver.com/embed/clip/abcDEF123",
    });
  });

  test("SOOP VOD (예전 afreecatv 주소도 sooplive 플레이어로)", () => {
    const src = "https://vod.sooplive.com/player/123456/embed?autoPlay=true";
    expect(parseEmbed("https://vod.sooplive.com/player/123456")?.src).toBe(src);
    expect(parseEmbed("https://vod.afreecatv.com/player/123456")).toMatchObject(
      { key: "soop:123456", src },
    );
  });

  test.each([
    "https://x.com/user/status/1234567890",
    "https://twitter.com/user/status/1234567890?s=20",
  ])("X 게시물: %s", url => {
    expect(parseEmbed(url)).toEqual({
      kind: "post",
      provider: "twitter",
      key: "twitter:1234567890",
      url,
      src: "https://platform.twitter.com/embed/Tweet.html?id=1234567890&dnt=true",
    });
  });

  test.each([
    "https://www.instagram.com/p/ABC_123/",
    "https://www.instagram.com/reel/ABC_123/",
    "https://www.instagram.com/reels/ABC_123/",
  ])("Instagram 게시물·릴스: %s", url => {
    expect(parseEmbed(url)).toMatchObject({
      kind: "post",
      key: "instagram:ABC_123",
      src: "https://www.instagram.com/p/ABC_123/embed/",
    });
  });

  test.each([
    "https://chzzk.naver.com/live/abc123",
    "https://x.com/user",
    "https://www.instagram.com/user/",
    "https://example.com/page",
  ])("임베드할 게시물이 아니면 null: %s", url => {
    expect(parseEmbed(url)).toBeNull();
  });
});

describe("parseEmbed: 이미지 주소", () => {
  test.each([
    "https://image.fmkorea.com/files/attach/a.JPG",
    "https://example.com/b.webp",
    // X 이미지는 확장자 대신 format 파라미터
    "https://pbs.twimg.com/media/AbCdEf?format=jpg&name=large",
  ])("%s", url => {
    expect(parseEmbed(url)).toEqual({
      kind: "image",
      provider: "image",
      key: `image:${url}`,
      url,
      src: url,
    });
  });

  test("확장자가 중간에만 있으면 이미지가 아님", () => {
    expect(parseEmbed("https://example.com/a.jpg.html")).toBeNull();
  });
});

describe("parseEmbed: 외부 링크 중계와 잘못된 주소", () => {
  const relay = (url: string) =>
    `https://link.fmkorea.org/link.php?url=${encodeURIComponent(url)}`;

  test("중계 주소는 실제 주소로 판단", () => {
    expect(parseEmbed(relay(`https://youtu.be/${YT_ID}`))?.url).toBe(YT_URL);
    expect(parseEmbed(relay("https://example.com/page"))).toBeNull();
  });

  test.each([
    "주소 아님",
    "javascript:alert(1)",
    "ftp://example.com/a.jpg",
    relay("javascript:alert(1)"),
  ])("http(s)가 아니면 null: %s", url => {
    expect(parseEmbed(url)).toBeNull();
  });
});

describe("isAllowedIframeSrc", () => {
  test.each([
    `https://www.youtube.com/embed/${YT_ID}`,
    `https://www.youtube-nocookie.com/embed/${YT_ID}`,
    "https://player.vimeo.com/video/76979871",
    "https://tv.naver.com/embed/12345",
  ])("허용: %s", src => {
    expect(isAllowedIframeSrc(src)).toBe(true);
  });

  test.each([
    // https만
    `http://www.youtube.com/embed/${YT_ID}`,
    // 허용한 도메인처럼 보이는 다른 도메인
    "https://evil-youtube.com/embed/x",
    "https://youtube.com.evil.example/embed/x",
    "https://example.com/widget",
    "javascript:alert(1)",
    "",
  ])("거부: %s", src => {
    expect(isAllowedIframeSrc(src)).toBe(false);
  });
});

describe("prepareEmbeds", () => {
  /**
   * prepareEmbeds를 거친 요소. 문서에 붙이지 않은 요소에 넣음:
   * 붙이면 happy-dom이 iframe을 불러오려다 "Iframe page loading is disabled" 에러를 찍음
   */
  const prepared = (html: string) => {
    const root = htmlDoc("").createElement("div");
    root.innerHTML = html;
    prepareEmbeds(root);
    return root;
  };
  const embedsIn = (root: Element) =>
    Array.from(
      root.querySelectorAll<HTMLElement>("[data-embed]"),
      el => el.dataset.embed,
    );

  test("사이트가 넣은 유튜브 iframe은 자리표시자로 (//로 시작하는 주소 포함)", () => {
    const root = prepared(
      `<iframe src="//www.youtube.com/embed/${YT_ID}"></iframe>`,
    );
    expect(embedsIn(root)).toEqual([YT_URL]);
    expect(root.querySelector("iframe")).toBeNull();
  });

  test("허용 목록에 있지만 임베드로 못 바꾸는 iframe은 그대로", () => {
    const src = "https://player.vimeo.com/video/76979871";
    const root = prepared(`<iframe src="${src}"></iframe>`);
    expect(root.querySelector("iframe")?.getAttribute("src")).toBe(src);
  });

  test("//로 시작하는 iframe은 https:를 붙여 남김 (그대로 두면 sanitize가 지움)", () => {
    const root = prepared(
      '<iframe src="//player.vimeo.com/video/76979871"></iframe>',
    );
    const src = root.querySelector("iframe")?.getAttribute("src") ?? "";
    expect(src).toBe("https://player.vimeo.com/video/76979871");
    expect(isAllowedIframeSrc(src)).toBe(true);
  });

  test("허용하지 않은 iframe은 새 탭 링크로", () => {
    const root = prepared('<iframe src="https://example.com/widget"></iframe>');
    expect(root.querySelector("iframe")).toBeNull();
    const a = root.querySelector("a");
    expect(a?.getAttribute("href")).toBe("https://example.com/widget");
    expect(a?.getAttribute("target")).toBe("_blank");
    expect(a?.textContent).toBe("삽입된 콘텐츠 열기");
  });

  test("글자가 주소인 링크는 임베드로 바꾸고, 다른 글자 링크는 두고 뒤에 임베드", () => {
    const tweet = "https://x.com/user/status/1234567890";
    const root = prepared(
      `<p><a href="https://youtu.be/${YT_ID}">https://youtu.be/${YT_ID}</a></p>`
        + `<p><a href="${tweet}">이 트윗</a></p>`,
    );
    expect(embedsIn(root)).toEqual([YT_URL, tweet]);
    const links = root.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0]!.textContent).toBe("이 트윗");
    expect((links[0]!.nextElementSibling as HTMLElement).dataset.embed).toBe(
      tweet,
    );
  });

  test("같은 영상은 처음 한 번만 임베드", () => {
    const iframe = `<iframe src="https://www.youtube.com/embed/${YT_ID}"></iframe>`;
    const root = prepared(
      `${iframe}<a href="https://youtu.be/${YT_ID}">https://youtu.be/${YT_ID}</a>${iframe}`,
    );
    expect(embedsIn(root)).toEqual([YT_URL]);
    expect(root.querySelector("iframe")).toBeNull();
  });

  test("이미지를 감싼 링크는 이미지 임베드를 또 만들지 않음", () => {
    const img = "https://image.fmkorea.com/files/attach/a.jpg";
    const root = prepared(`<a href="${img}"><img src="${img}"></a>`);
    expect(embedsIn(root)).toEqual([]);
    expect(root.querySelector("a img")).not.toBeNull();
  });

  test("링크 없는 주소 글자는 임베드할 수 있으면 자리표시자, 아니면 새 탭 링크", () => {
    const root = prepared(
      `<p>영상 https://youtu.be/${YT_ID} 그리고 https://example.com/page 참고</p>`,
    );
    expect(embedsIn(root)).toEqual([YT_URL]);
    const a = root.querySelector("a");
    expect(a?.getAttribute("href")).toBe("https://example.com/page");
    expect(a?.getAttribute("target")).toBe("_blank");
    expect(root.querySelector("p")?.textContent).toBe(
      "영상  그리고 https://example.com/page 참고",
    );
  });

  test("링크·textarea 안의 주소 글자는 건드리지 않음", () => {
    const root = prepared(
      `<a href="https://example.com/">https://youtu.be/${YT_ID}</a>`
        + `<textarea>https://youtu.be/${YT_ID}</textarea>`,
    );
    expect(embedsIn(root)).toEqual([]);
    expect(root.querySelector("a")?.getAttribute("href")).toBe(
      "https://example.com/",
    );
    expect(root.querySelector("textarea")?.textContent).toBe(
      `https://youtu.be/${YT_ID}`,
    );
  });
});
