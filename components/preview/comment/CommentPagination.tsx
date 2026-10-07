import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

/**
 * 1 … 4 5 [6] 7 8 … 20 처럼 첫/끝 페이지와 현재 페이지 주변만 남기고 나머지는 생략.
 * 생략할 페이지가 하나뿐이면 … 대신 그 번호를 그대로 보여줌
 */
const getPageItems = (
  current: number,
  total: number,
  siblings = 4,
): PageItem[] => {
  let start = current - siblings;
  let end = current + siblings;
  if (start <= 3) start = 2;
  if (end >= total - 2) end = total - 1;

  const items: PageItem[] = [1];
  if (start > 2) items.push("start-ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("end-ellipsis");
  if (total > 1) items.push(total);
  return items;
};

function CommentPagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="댓글 페이지"
      className="flex items-center justify-center gap-1 border-t pt-4">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="이전 페이지"
        title="이전 페이지"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}>
        <ChevronLeftIcon />
      </Button>

      {getPageItems(currentPage, totalPages).map(item =>
        typeof item === "number" ?
          <Button
            key={item}
            variant={item === currentPage ? "default" : "ghost"}
            size="sm"
            className={
              "min-w-7 px-1.5 text-gray-500 tabular-nums"
              + (item === currentPage ?
                " bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-500"
              : "")
            }
            aria-current={item === currentPage ? "page" : undefined}
            // disabled로 막으면 opacity-50이 걸려 현재 페이지 강조가 흐려지므로 클릭만 무시
            onClick={() => item !== currentPage && onChange(item)}>
            {item}
          </Button>
        : <span
            key={item}
            aria-hidden
            className="w-5 text-center text-sm text-muted-foreground select-none">
            …
          </span>,
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="다음 페이지"
        title="다음 페이지"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}>
        <ChevronRightIcon />
      </Button>
    </nav>
  );
}

export default CommentPagination;
