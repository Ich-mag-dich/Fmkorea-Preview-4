import { find as findLinks } from "linkifyjs";

type VideoProvider = "youtube" | "chzzk" | "soop";
type PostProvider = "twitter" | "instagram";

export type EmbedInfo =
  | {
      kind: "video";
      provider: VideoProvider;
      /** 같은 영상이 여러 번 나올 때 한 번만 임베드하기 위한 키 */
      key: string;
      /** 원본 페이지 주소 */
      url: string;
      /** 재생 버튼을 누른 뒤 불러올 iframe 주소 (자동 재생) */
      src: string;
      thumbnail?: string;
      /** 쇼츠처럼 세로 영상 */
      vertical?: boolean;
    }
  | {
      kind: "post";
      provider: PostProvider;
      key: string;
      url: string;
      src: string;
    }
  | {
      /** 링크 주소가 이미지 파일 */
      kind: "image";
      provider: "image";
      key: string;
      url: string;
      src: string;
    };

export const PROVIDER_LABEL: Record<EmbedInfo["provider"], string> = {
  youtube: "YouTube",
  chzzk: "치지직",
  soop: "SOOP",
  twitter: "X",
  instagram: "Instagram",
  image: "이미지",
};

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp)$/i;
const IMAGE_FORMAT = /^(jpe?g|png|gif|webp|avif)$/i;

/** 1h2m3s / 90 같은 유튜브 시작 시간을 초로 */
const parseYoutubeTime = (t: string | null): number => {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
};

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

const parseYoutube = (u: URL): EmbedInfo | null => {
  const host = u.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  let vertical = false;

  if (host === "youtu.be") {
    id = u.pathname.slice(1).split("/")[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, first, second] = u.pathname.split("/");
    if (first === "watch") id = u.searchParams.get("v");
    else if (first === "shorts") [id, vertical] = [second ?? null, true];
    else if (first === "embed" || first === "live") id = second ?? null;
  }
  if (!id || !YT_ID.test(id)) return null;

  const start = parseYoutubeTime(
    u.searchParams.get("t") ?? u.searchParams.get("start"),
  );
  const src = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  src.searchParams.set("autoplay", "1");
  if (start) src.searchParams.set("start", String(start));

  return {
    kind: "video",
    provider: "youtube",
    key: `youtube:${id}`,
    url: `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}` : ""}`,
    src: src.href,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    vertical,
  };
};

/** URL이 임베드 가능한 서비스면 정보를, 아니면 null */
export const parseEmbed = (raw: string): EmbedInfo | null => {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  // fmkorea 외부 링크 중계 주소면 실제 주소로 (link.fmkorea.org/link.php?url=...)
  const relayed = u.hostname.endsWith("fmkorea.org")
    ? u.searchParams.get("url")
    : null;
  if (relayed) return parseEmbed(relayed);
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const yt = parseYoutube(u);
  if (yt) return yt;

  const host = u.hostname.replace(/^www\./, "");
  const path = u.pathname;

  const chzzk = host === "chzzk.naver.com" && path.match(/^\/clips\/([\w-]+)/);
  if (chzzk) {
    return {
      kind: "video",
      provider: "chzzk",
      key: `chzzk:${chzzk[1]}`,
      url: u.href,
      src: `https://chzzk.naver.com/embed/clip/${chzzk[1]}`,
    };
  }

  const soop =
    /^vod\.(sooplive\.com|afreecatv\.com)$/.test(host) &&
    path.match(/^\/player\/(\d+)/);
  if (soop) {
    return {
      kind: "video",
      provider: "soop",
      key: `soop:${soop[1]}`,
      url: u.href,
      src: `https://vod.sooplive.com/player/${soop[1]}/embed?autoPlay=true`,
    };
  }

  const tweet =
    /^(twitter|x)\.com$/.test(host) && path.match(/^\/\w+\/status\/(\d+)/);
  if (tweet) {
    return {
      kind: "post",
      provider: "twitter",
      key: `twitter:${tweet[1]}`,
      url: u.href,
      src: `https://platform.twitter.com/embed/Tweet.html?id=${tweet[1]}&dnt=true`,
    };
  }

  const insta =
    host === "instagram.com" && path.match(/^\/(?:p|reels?)\/([\w-]+)/);
  if (insta) {
    return {
      kind: "post",
      provider: "instagram",
      key: `instagram:${insta[1]}`,
      url: u.href,
      src: `https://www.instagram.com/p/${insta[1]}/embed/`,
    };
  }

  // 이미지 파일 주소. X 이미지처럼 확장자 대신 ?format=jpg로 오는 경우도 포함
  const isImage =
    IMAGE_EXT.test(path) ||
    IMAGE_FORMAT.test(u.searchParams.get("format") ?? "");
  if (isImage) {
    return {
      kind: "image",
      provider: "image",
      key: `image:${u.href}`,
      url: u.href,
      src: u.href,
    };
  }

  return null;
};

/**
 * 직접 iframe으로 남겨둘 수 있는 주소. 위에서 임베드로 바꾸지 못한 iframe 중
 * 여기에 없는 건 링크로 바꾼다 (sanitize에서도 같은 목록으로 한 번 더 거름)
 */
export const IFRAME_ALLOWED_HOSTS = [
  "youtube.com",
  "youtube-nocookie.com",
  "chzzk.naver.com",
  "vod.sooplive.com",
  "platform.twitter.com",
  "instagram.com",
  "player.vimeo.com",
  "tv.naver.com",
  "streamable.com",
];

export const isAllowedIframeSrc = (src: string): boolean => {
  try {
    const u = new URL(src);
    return (
      u.protocol === "https:" &&
      IFRAME_ALLOWED_HOSTS.some(
        h => u.hostname === h || u.hostname.endsWith(`.${h}`),
      )
    );
  } catch {
    return false;
  }
};

const placeholder = (doc: Document, url: string) => {
  // <p> 안에 들어가도 HTML이 깨지지 않게 span. 실제 임베드는 RichContent가 그려 넣음
  const el = doc.createElement("span");
  el.dataset.embed = url;
  return el;
};

const externalLink = (doc: Document, href: string, text = href) => {
  const a = doc.createElement("a");
  a.href = href;
  a.textContent = text;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
};

/** <a>, <script> 등 안쪽을 뺀 텍스트 노드 */
const collectTextNodes = (root: Element): Text[] => {
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: node =>
        node.parentElement?.closest("a, script, style, iframe, textarea")
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    },
  );
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
};

/**
 * 본문/댓글 HTML에서 임베드할 수 있는 링크·URL·iframe을 자리표시자로 바꾸고,
 * 링크가 안 걸린 URL 텍스트는 링크로 만든다. 같은 영상/글은 처음 한 번만 임베드.
 * !주의: root를 직접 수정함
 */
export const prepareEmbeds = (root: Element): void => {
  const doc = root.ownerDocument;
  const seen = new Set<string>();
  const claim = (url: string) => {
    const info = parseEmbed(url);
    if (!info || seen.has(info.key)) return null;
    seen.add(info.key);
    return info;
  };

  // 1. 사이트가 이미 넣어둔 iframe
  root.querySelectorAll("iframe").forEach(iframe => {
    const src = iframe.getAttribute("src") ?? "";
    const full = src.startsWith("//") ? `https:${src}` : src;
    const info = parseEmbed(full);
    if (info) {
      if (seen.has(info.key)) iframe.remove();
      else {
        seen.add(info.key);
        iframe.replaceWith(placeholder(doc, info.url));
      }
    } else if (!isAllowedIframeSrc(full)) {
      iframe.replaceWith(externalLink(doc, full, "삽입된 콘텐츠 열기"));
    }
  });

  // 2. 링크. 글자가 주소 그대로면 링크를 임베드로 바꾸고, 다른 글자면 링크는 두고 뒤에 임베드
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(a => {
    // 본문 이미지는 <a href="원본.jpg"><img></a>로 감싸져 있어서, 이미 이미지가 보이는
    // 링크까지 이미지 임베드로 바꾸면 같은 이미지가 중복됨
    if (a.querySelector("img, video") && parseEmbed(a.href)?.kind === "image") {
      return;
    }
    const info = claim(a.href);
    if (!info) return;
    const text = a.textContent?.trim() ?? "";
    const isBareUrl = text === "" || /^(https?:\/\/|www\.)/.test(text);
    if (isBareUrl) a.replaceWith(placeholder(doc, info.url));
    else a.after(placeholder(doc, info.url));
  });

  // 3. 링크가 안 걸린 URL 텍스트
  for (const node of collectTextNodes(root)) {
    const text = node.data;
    const links = findLinks(text, "url");
    if (links.length === 0) continue;

    const frag = doc.createDocumentFragment();
    let last = 0;
    for (const link of links) {
      if (link.start > last) frag.append(text.slice(last, link.start));
      const info = claim(link.href);
      frag.append(
        info
          ? placeholder(doc, info.url)
          : externalLink(doc, link.href, link.value),
      );
      last = link.end;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.replaceWith(frag);
  }
};
