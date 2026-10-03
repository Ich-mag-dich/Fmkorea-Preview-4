import { useMemo } from "react";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { CommentData, CommentVoteType } from "@/lib/types";

// 댓글 본문도 fmkorea HTML이라 하위 태그 선택자로 스타일링
const contentClassName = cn(
  "text-sm leading-relaxed break-words",
  "[&_*]:max-w-full",
  "[&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400",
  "[&_a.findParent]:mr-1 [&_a.findParent]:font-semibold [&_a.findParent]:no-underline",
  "[&_img]:my-2 [&_img]:h-auto [&_img]:max-w-[min(400px,100%)] [&_img]:rounded-md",
  "[&_video]:my-2 [&_video]:max-h-[360px] [&_video]:max-w-full",
);

function CommentItem({
  comment,
  onVote,
}: {
  comment: CommentData;
  onVote?: (type: CommentVoteType, id: string) => void;
}) {
  const contentHtml = useMemo(
    () => sanitizeHtml(comment.content),
    [comment.content],
  );

  return (
    <li
      // 부모 댓글 링크(a.findParent) 클릭 시 스크롤 대상. 상단 베스트 사본은 제외
      data-comment-id={comment.isBest ? undefined : comment.id}
      className={cn(
        "flex flex-col gap-1.5 border-x-2 border-y px-6 py-5",
        comment.depth > 0 && "border-l-3 pl-6",
        comment.isBest && "bg-blue-50 px-6 dark:bg-blue-500/10",
        comment.divider && "mt-4",
      )}
      style={{ marginLeft: `${comment.depth * 1.25}rem` }}>
      <div className="flex flex-wrap items-center gap-x-2 text-xs">
        {comment.isBest && (
          <span className="rounded bg-blue-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
            BEST
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-sm font-semibold">
          {comment.levelIcon && (
            <img
              src={comment.levelIcon}
              alt=""
              className="size-5 object-contain"
            />
          )}
          {comment.userIcon && (
            <img
              src={comment.userIcon}
              alt=""
              className="size-5 object-contain"
            />
          )}
          {comment.author}
        </span>
        {comment.isWriter && (
          <span className="rounded border border-blue-500/40 px-1 py-0.5 text-[10px] leading-none text-blue-600 dark:text-blue-400">
            작성자
          </span>
        )}
        <span className="text-muted-foreground">{comment.date}</span>

        {/* ml-auto: 작성자 줄 오른쪽 끝으로 밀기 */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-blue-600"
            disabled={!onVote}
            onClick={() => onVote?.("up", comment.id)}>
            <ThumbsUpIcon />
            {comment.voteUp}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-red-600"
            disabled={!onVote}
            onClick={() => onVote?.("down", comment.id)}>
            <ThumbsDownIcon />
            {comment.voteDown}
          </Button>
        </div>
      </div>

      <div
        className={contentClassName}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </li>
  );
}

export default CommentItem;
