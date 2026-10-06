import { useState, type ReactNode } from "react";
import {
  FileTextIcon,
  HistoryIcon,
  MessageSquareIcon,
  RotateCwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { openInPreview } from "@/lib/preview-store";
import { useBoardHistory } from "@/hooks/use-board-history";
import type { HistoryItem, PostData } from "@/lib/types";

function HistoryList({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: HistoryItem[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          없습니다
        </p>
      ) : (
        <ul className="flex flex-col">
          {items.map(item => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                // 댓글이면 원글 제목, 글이면 전체 날짜를 툴팁으로
                title={
                  item.postTitle ? `원글: ${item.postTitle}` : item.fullDate
                }
                onClick={e => openInPreview(e, item.url)}
                className={cn(
                  "flex items-center gap-2 rounded px-1.5 py-1 text-sm transition-colors hover:bg-muted",
                  item.active &&
                    "font-semibold text-blue-600 dark:text-blue-400",
                )}>
                <span className="min-w-0 flex-1 truncate">{item.text}</span>
                {item.commentCount !== undefined && (
                  <span className="shrink-0 text-xs text-blue-600 tabular-nums dark:text-blue-400">
                    [{item.commentCount}]
                  </span>
                )}
                <time
                  dateTime={item.fullDate}
                  className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.date}
                </time>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 작성자의 이 게시판 최근 글/댓글. 사이트의 "게시판 이력" 버튼과 같은 기능 */
function BoardHistory({ post }: { post: PostData }) {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError, isFetching, refetch } = useBoardHistory(
    post,
    open,
  );

  // 비로그인 등으로 사이트에 이력 버튼이 없는 글
  if (!post.historyParams) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}>
        <HistoryIcon />
        {open ? "게시판 이력 닫기" : "게시판 이력"}
      </Button>

      {open && (
        <section className="w-full rounded-lg border bg-muted/30 p-4">
          {isPending ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map(col => (
                <div key={col} className="flex flex-col gap-2">
                  {/* 상자 배경(bg-muted)과 같은 색이라 안 보여서 진하게 */}
                  <Skeleton className="h-4 w-16 bg-foreground/10" />
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-5 w-full bg-foreground/10" />
                  ))}
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-4 text-sm text-muted-foreground">
              게시판 이력을 불러오지 못했습니다.
              <Button
                variant="ghost"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}>
                <RotateCwIcon />
                다시 시도
              </Button>
            </div>
          ) : (
            <>
              {data.summary && (
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  {data.summary}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <HistoryList
                  icon={<FileTextIcon />}
                  title="최근 글"
                  items={data.documents}
                />
                <HistoryList
                  icon={<MessageSquareIcon />}
                  title="최근 댓글"
                  items={data.comments}
                />
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default BoardHistory;
