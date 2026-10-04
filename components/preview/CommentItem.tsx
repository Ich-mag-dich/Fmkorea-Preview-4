import type { ReactNode } from "react";
import { ReplyIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommentData, VoteType } from "@/lib/types";
import AuthorMenu from "./AuthorMenu";
import RichContent from "./RichContent";

// 댓글 본문도 fmkorea HTML이라 하위 태그 선택자로 스타일링
const contentClassName = cn(
  "text-sm leading-relaxed break-words",
  "[&_*]:max-w-full",
  "[&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400",
  "[&_a.findParent]:mr-1 [&_a.findParent]:font-semibold [&_a.findParent]:no-underline",
  "[&_img]:my-2 [&_img]:h-auto [&_img]:max-w-[min(400px,100%)] [&_img]:rounded-md",
  "[&_video]:my-2 [&_video]:max-h-[360px] [&_video]:max-w-full",
);

/** 한 단계 들여쓰기 폭(rem) */
const INDENT = 1.25;
/** 이보다 깊은 답글은 더 들여쓰지 않음. 본문 앞 부모 닉네임 링크로 대상을 알 수 있음 */
const MAX_DEPTH = 6;

function CommentItem({
  comment,
  mid,
  docId,
  onVote,
  isReplying = false,
  onReply,
  replyForm,
}: {
  mid: string;
  docId: string;
  comment: CommentData;
  onVote?: (type: VoteType, id: string) => void;
  /** 이 댓글의 답글 입력창이 열려 있는지 */
  isReplying?: boolean;
  /** 답글 버튼 클릭 (입력창 열기/닫기) */
  onReply?: () => void;
  /** 열려 있을 때 본문 아래에 넣을 답글 입력창 */
  replyForm?: ReactNode;
}) {
  const depth = Math.min(comment.depth, MAX_DEPTH);

  return (
    <li
      // 부모 댓글 링크(a.findParent) 클릭 시 스크롤 대상. 상단 베스트 사본은 제외
      data-comment-id={comment.isBest ? undefined : comment.id}
      className={cn("group relative", comment.divider && "mt-4")}
      style={{ paddingLeft: `${depth * INDENT}rem` }}>
      {/* 코드 들여쓰기처럼 depth만큼 세로선. li 사이에 간격이 없어서
          연속된 답글끼리 선이 위아래로 이어져 스레드처럼 보임 */}
      {Array.from({ length: depth }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute inset-y-0 w-px bg-foreground/25"
          style={{ left: `${i * INDENT + INDENT / 2}rem` }}
        />
      ))}

      {/* 구분선은 들여쓴 내용 쪽에만. 첫 댓글은 위 "댓글" 제목의 border-b와 겹치므로 생략 */}
      <div
        className={cn(
          "flex flex-col gap-1.5 border-t px-4 py-4 group-first:border-t-0",
          comment.isBest && "bg-blue-50 dark:bg-blue-500/10",
        )}>
        <div className="flex flex-wrap items-center gap-x-2 text-xs">
          {comment.isBest && (
            <span className="rounded bg-blue-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
              BEST
            </span>
          )}
          <AuthorMenu
            memberSrl={comment.memberSrl}
            mid={mid}
            docId={docId}
            className="inline-flex items-center gap-1.5 text-foreground">
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
          </AuthorMenu>
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
              className={cn(
                "text-muted-foreground hover:text-foreground",
                isReplying && "bg-muted text-foreground",
              )}
              aria-pressed={isReplying}
              disabled={!onReply}
              onClick={onReply}>
              <ReplyIcon />
              답글
            </Button>
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

        <RichContent
          html={comment.content}
          className={contentClassName}
          compact
        />

        {isReplying && replyForm}
      </div>
    </li>
  );
}

export default CommentItem;
