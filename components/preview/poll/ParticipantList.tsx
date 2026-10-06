import { useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  POLL_LIST_PAGE_SIZE,
  usePredictionPollList,
} from "@/hooks/use-prediction-poll-list";
import { cn } from "@/lib/utils";
import type { PredictionPollOption } from "@/lib/types";
import { formatNumber, formatRegdate } from "./format";

/** 응답의 status → 사이트에 보이는 글자 */
const BET_STATUS_TEXT: Record<string, string> = { 베팅: "참여중" };

/** 선택지 하나에 참여한 사람 목록. 사이트의 참여 현황 표와 같은 모양 */
function ParticipantList({
  pk,
  option,
}: {
  pk: string;
  option: PredictionPollOption;
}) {
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
  } = usePredictionPollList(pk, option.value, page);

  // 응답에 전체 페이지 수가 없어서 선택지의 참여 수로 계산
  const totalPages = Math.max(1, Math.ceil(option.count / POLL_LIST_PAGE_SIZE));

  const goTo = (next: number) => {
    setPage(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="overflow-hidden rounded-md border bg-background text-xs">
      {isPending ? (
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-1 p-3 text-xs text-muted-foreground">
          참여 현황을 불러오지 못했습니다.
          <span className="text-destructive">{error.message}</span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={isFetching}
            onClick={() => refetch()}>
            <RotateCwIcon />
            다시 시도
          </Button>
        </div>
      ) : data.length === 0 ? (
        <p className="p-3 text-center text-xs text-muted-foreground">
          참여한 사람이 없습니다.
        </p>
      ) : (
        <div
          ref={scrollRef}
          className={cn(
            "max-h-72 scrollbar-thin overflow-y-auto transition-opacity",
            isPlaceholderData && "opacity-60",
          )}>
          <table className="w-full tabular-nums">
            <thead>
              <tr className="[&>th]:sticky [&>th]:top-0 [&>th]:bg-muted [&>th]:px-3 [&>th]:py-1.5 [&>th]:font-medium [&>th]:whitespace-nowrap [&>th]:text-muted-foreground">
                <th className="text-left">닉네임</th>
                <th className="text-right">잉여력</th>
                <th className="text-right">지급 예상</th>
                <th>상태</th>
                <th className="text-right">시각</th>
              </tr>
            </thead>
            <tbody>
              {data.map(p => (
                <tr
                  key={p.pk}
                  className="even:bg-muted/40 [&>td]:px-3 [&>td]:py-1 [&>td]:whitespace-nowrap">
                  <td className="font-medium">
                    {/* td에는 max-width가 안 먹어서 안쪽 span으로 말줄임 */}
                    <span className="block max-w-40 truncate">
                      {p.nick_name}
                    </span>
                  </td>
                  <td className="text-right">{formatNumber(p.point)}</td>
                  <td className="text-right">{formatNumber(p.exp)}</td>
                  <td className="text-center">
                    {BET_STATUS_TEXT[p.status] ?? p.status}
                  </td>
                  <td className="text-right text-muted-foreground">
                    <time
                      dateTime={formatRegdate(p.regdate)}
                      title={formatRegdate(p.regdate)}>
                      {formatRegdate(p.regdate)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && !isError && (
        <div className="flex items-center justify-center gap-2 border-t py-1 tabular-nums">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="이전 페이지"
            disabled={page <= 1 || isFetching}
            onClick={() => goTo(page - 1)}>
            <ChevronLeftIcon />
          </Button>
          <span>
            <strong>{page}</strong> / {totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="다음 페이지"
            disabled={page >= totalPages || isFetching}
            onClick={() => goTo(page + 1)}>
            <ChevronRightIcon />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ParticipantList;
