import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import Embed from "./Embed";

/**
 * fmkorea 본문/댓글 HTML을 그리고, 그 안의 임베드 자리표시자(data-embed)에
 * React로 만든 임베드를 portal로 끼워 넣음
 */
function RichContent({
  html,
  className,
  compact = false,
}: {
  html: string;
  className?: string;
  /** 댓글용. 영상 임베드를 작게 그림 */
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sanitized = useMemo(() => sanitizeHtml(html), [html]);
  const [slots, setSlots] = useState<{ node: HTMLElement; url: string }[]>([]);

  // innerHTML이 바뀔 때마다 자리표시자를 다시 찾음 (이전 노드는 이미 교체돼 있음)
  useLayoutEffect(() => {
    const nodes = Array.from(
      ref.current?.querySelectorAll<HTMLElement>("[data-embed]") ?? [],
    );
    // 임베드 없는 댓글이 대부분이라, 없을 땐 같은 빈 배열을 유지해서 재렌더링을 막음
    setSlots(prev =>
      nodes.length === 0 && prev.length === 0 ?
        prev
      : nodes.map(node => ({ node, url: node.dataset.embed ?? "" })),
    );
  }, [sanitized]);

  return (
    <>
      <div
        ref={ref}
        // 임베드를 감싼 요소의 인라인 높이 제한(<h1 style="max-height:5.6rem"> 안의
        // 영상 링크 등)이 임베드를 못 담아 아래 내용과 겹치지 않게 풀어 줌.
        // 인라인 style을 이겨야 해서 !
        className={cn(
          "[&_:has([data-embed])]:h-auto! [&_:has([data-embed])]:max-h-none!",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
      {slots.map(({ node, url }, i) =>
        createPortal(
          <Embed url={url} compact={compact} />,
          node,
          `${i}:${url}`,
        ),
      )}
    </>
  );
}

export default RichContent;
