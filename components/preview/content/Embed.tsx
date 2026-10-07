import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLinkIcon, PlayIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROVIDER_LABEL, parseEmbed, type EmbedInfo } from "@/lib/embed";
import { usePortalContainer } from "@/hooks/use-portal-container";

const VIDEO_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

function SourceLink({ info }: { info: EmbedInfo }) {
  return (
    <a
      href={info.url}
      target="_blank"
      rel="noopener noreferrer"
      // 본문 링크 스타일([&_a]:underline 등)을 덮어씀
      className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground! no-underline! hover:text-foreground! hover:underline!">
      {info.kind === "image" ?
        "원본 이미지 열기"
      : `${PROVIDER_LABEL[info.provider]}에서 보기`}
      <ExternalLinkIcon className="size-3" />
    </a>
  );
}

/** 이미지 파일 링크를 바로 이미지로. 못 불러오면 원래 링크로 되돌림 */
function ImageEmbed({ info }: { info: Extract<EmbedInfo, { kind: "image" }> }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <a href={info.url} target="_blank" rel="noopener noreferrer">
        {info.url}
      </a>
    );
  }

  return (
    <span className="my-2 flex flex-col items-start">
      <a
        href={info.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block">
        {/* 크기는 본문/댓글의 [&_img] 규칙을 그대로 따르고, 아주 긴 이미지만 높이를 제한 */}
        <img
          src={info.src}
          alt=""
          loading="lazy"
          decoding="async"
          // 외부 이미지 서버가 다른 사이트에서 온 요청(핫링크)을 막는 경우가 있어서 리퍼러를 안 보냄
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="my-0! max-h-120 w-auto object-contain"
        />
      </a>
      <SourceLink info={info} />
    </span>
  );
}

/**
 * 영상은 처음엔 썸네일만 보여주고 누르면 iframe을 불러옴.
 * 댓글에 영상 링크가 많아도 iframe이 한꺼번에 뜨지 않게
 */
function VideoEmbed({
  info,
  compact,
}: {
  info: Extract<EmbedInfo, { kind: "video" }>;
  compact: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const label = PROVIDER_LABEL[info.provider];

  return (
    <span
      className={cn("flex flex-col items-start", compact ? "my-2" : "my-3")}>
      <span
        // max-w에 !: 본문/댓글 영역의 [&_*]:max-w-full이 나중에 출력돼서 덮어쓰므로
        // 우선순위를 올려야 최대 폭이 실제로 적용됨
        className={cn(
          "relative block w-full overflow-hidden rounded-lg bg-black",
          info.vertical ?
            cn("aspect-9/16", compact ? "max-w-48!" : "max-w-80!")
          : cn("aspect-video", compact ? "max-w-100!" : "max-w-160!"),
        )}>
        {playing ?
          <iframe
            src={info.src}
            title={`${label} 영상`}
            allow={VIDEO_ALLOW}
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        : <button
            type="button"
            aria-label={`${label} 영상 재생`}
            onClick={() => setPlaying(true)}
            className="group/play absolute inset-0 flex size-full items-center justify-center">
            {info.thumbnail ?
              <img
                src={info.thumbnail}
                alt=""
                // 본문 img 스타일(가운데 정렬, 최대 600px 등)을 덮어씀
                className="absolute inset-0 m-0! size-full! max-w-none! rounded-none! object-cover"
              />
            : <span className="absolute inset-0 bg-linear-to-br from-neutral-700 to-neutral-950" />
            }
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover/play:bg-black/35" />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-transform group-hover/play:scale-110">
              <PlayIcon className="ml-0.5 size-6 fill-current" />
            </span>
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {label}
            </span>
          </button>
        }
      </span>
      <SourceLink info={info} />
    </span>
  );
}

/**
 * iframe이 postMessage로 알려주는 실제 높이를 읽음 (서비스마다 형식이 다름)
 * @returns 높이와, X의 경우 src에 넘긴 embedId
 */
const readHeight = (
  provider: "twitter" | "instagram",
  data: unknown,
): { height: number; id?: string } | null => {
  let msg = data;
  if (typeof msg === "string") {
    try {
      msg = JSON.parse(msg);
    } catch {
      return null;
    }
  }
  if (!msg || typeof msg !== "object") return null;

  if (provider === "twitter") {
    // { "twttr.embed": { id, method: "twttr.private.resize", params: [{ height }] } }
    const embed = (msg as Record<string, any>)["twttr.embed"];
    if (embed?.method !== "twttr.private.resize") return null;
    const height = Number(embed.params?.[0]?.height);
    return height ? { height, id: embed.id } : null;
  }
  // { type: "MEASURE", details: { height } }
  const m = msg as { type?: string; details?: { height?: number } };
  const height = m.type === "MEASURE" ? Number(m.details?.height) : 0;
  return height ? { height } : null;
};

const POST_EMBED = {
  twitter: {
    origin: "https://platform.twitter.com",
    width: "max-w-[550px]",
    height: 420,
  },
  instagram: {
    origin: "https://www.instagram.com",
    width: "max-w-[550px]",
    height: 620,
  },
} as const;

/** X/인스타그램 글. 높이는 iframe이 알려주는 값으로 맞춤 */
function PostEmbed({ info }: { info: Extract<EmbedInfo, { kind: "post" }> }) {
  const config = POST_EMBED[info.provider];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(config.height);
  const dark = usePortalContainer().classList.contains("dark");
  // X는 embedId를 넘기면 높이 메시지에 같은 id가 실려 옴 (어느 iframe인지 구분용)
  const embedId = `fmp-${info.key}`;

  const src = useMemo(() => {
    if (info.provider !== "twitter") return info.src;
    const u = new URL(info.src);
    u.searchParams.set("theme", dark ? "dark" : "light");
    u.searchParams.set("embedId", embedId);
    return u.href;
  }, [info, dark, embedId]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== config.origin) return;
      const result = readHeight(info.provider, e.data);
      if (!result) return;
      // Firefox content script에선 source 비교가 실패할 수 있어서 X는 id로도 확인
      const fromMe =
        e.source === iframeRef.current?.contentWindow || result.id === embedId;
      if (fromMe) setHeight(Math.ceil(result.height));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [config.origin, info.provider, embedId]);

  return (
    <span className="my-3 flex flex-col items-center">
      <iframe
        ref={iframeRef}
        src={src}
        title={`${PROVIDER_LABEL[info.provider]} 게시물`}
        loading="lazy"
        // 높이는 내용에 맞추므로 스크롤바는 숨김
        scrolling="no"
        style={{ height }}
        // border는 border-box라 height에서 테두리 두께만큼 안쪽이 줄어 스크롤이 생김.
        // ring은 레이아웃에 영향이 없어서 높이가 내용과 정확히 맞음
        className={cn(
          "block min-w-lg rounded-xl bg-muted/40 ring-2 ring-border",
          config.width,
        )}
      />
      <SourceLink info={info} />
    </span>
  );
}

/**
 * 본문/댓글 안의 data-embed 자리표시자에 그려지는 임베드
 * @param compact 댓글처럼 좁은 곳에서 영상을 작게
 */
function Embed({ url, compact = false }: { url: string; compact?: boolean }) {
  const info = useMemo(() => parseEmbed(url), [url]);
  if (!info) return null;
  switch (info.kind) {
    case "video":
      return <VideoEmbed info={info} compact={compact} />;
    case "post":
      return <PostEmbed info={info} />;
    case "image":
      return <ImageEmbed info={info} />;
  }
}

export default Embed;
