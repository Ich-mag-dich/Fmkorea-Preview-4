import { useMemo } from "react";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { CommentVoteType, PostData } from "@/lib/types";

// 본문은 fmkorea가 준 HTML이라 Tailwind 클래스를 직접 못 붙이므로 하위 태그 선택자로 스타일링
const contentClassName = cn(
  "min-h-60 px-6 py-6 text-[15px] leading-relaxed break-words",
  // style="width:900px" 같은 고정 너비 요소가 창을 넘지 않게. img는 아래 규칙이 더 구체적이라 그쪽이 적용됨
  "[&_*]:max-w-full",
  "[&_p]:my-2",
  "[&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400",
  "[&_img]:mx-auto [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-[min(600px,100%)] [&_img]:rounded-md",
  "[&_video]:mx-auto [&_video]:my-3 [&_video]:max-h-[480px] [&_video]:max-w-full",
  "[&_iframe]:max-w-full",
);

function PostView({
  post,
  onVote,
}: {
  post: PostData;
  onVote?: (type: CommentVoteType) => void;
}) {
  const contentHtml = useMemo(() => sanitizeHtml(post.content), [post.content]);

  return (
    <article className="flex flex-col">
      {/* pr-8: DialogContent 우상단 X 버튼과 겹치지 않게 */}
      <header className="flex flex-col gap-2 border-b pr-8 pb-4">
        <DialogTitle className="text-xl leading-snug font-bold">
          {post.title}
        </DialogTitle>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            {post.authorLevelIcon && (
              <img
                src={post.authorLevelIcon}
                alt=""
                className="size-6 object-contain"
              />
            )}
            {post.authorUserIcon && (
              <img
                src={post.authorUserIcon}
                alt=""
                className="size-6 object-contain"
              />
            )}
            {post.author}
          </span>
          <div className="flex gap-3">
            {post.date && <span>{post.date}</span>}
            {post.views && <span>{post.views}</span>}
          </div>
        </div>
      </header>

      <div
        className={contentClassName}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <div className="flex items-center justify-center gap-3 py-6">
        <Button
          variant="outline"
          className="text-blue-600 dark:text-blue-400"
          disabled={!onVote}
          onClick={() => onVote?.("up")}>
          <ThumbsUpIcon />
          추천
        </Button>
        <span className="min-w-12 text-center text-lg font-bold tabular-nums">
          {post.voteCount}
        </span>
        <Button
          variant="outline"
          className="text-red-700 dark:text-red-400"
          disabled={!onVote}
          onClick={() => onVote?.("down")}>
          <ThumbsDownIcon />
          비추천
        </Button>
      </div>
    </article>
  );
}

export default PostView;
