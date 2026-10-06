import { useId, useRef, useState, type SubmitEvent } from "react";
import {
  ChartPieIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  LockIcon,
  RotateCwIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  POLL_LIST_PAGE_SIZE,
  usePredictionPollList,
} from "@/hooks/use-prediction-poll-list";
import { cn } from "@/lib/utils";
import type { PredictionPoll, PredictionPollOption } from "@/lib/types";

const formatNumber = (n: number) => n.toLocaleString("ko-KR");

/** 20261007024626 → "2026-10-07 02:46:26" */
const formatRegdate = (regdate: number) =>
  String(regdate).replace(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "$1-$2-$3 $4:$5:$6",
  );

function PollOption({
  pk,
  option,
  name,
  checked,
  disabled,
  leading,
  onSelect,
}: {
  /** 승부예측 번호 */
  pk: string;
  option: PredictionPollOption;
  name: string;
  checked: boolean;
  disabled: boolean;
  /** 가장 많이 걸린 선택지 */
  leading: boolean;
  onSelect: () => void;
}) {
  const [showList, setShowList] = useState(false);

  return (
    // 참여 현황 목록을 눌러도 선택되지 않게 label은 위쪽만 감쌈
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border px-3 py-2.5 transition-colors",
        !disabled && "hover:bg-muted/60",
        checked && "border-(--poll) bg-(--poll)/5 ring-2 ring-(--poll)/25",
      )}>
      <label
        className={cn("flex flex-col gap-2", !disabled && "cursor-pointer")}>
        <div className="flex items-center gap-2.5">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={checked}
            disabled={disabled}
            onChange={onSelect}
            className="size-4 shrink-0 accent-(--poll) disabled:hidden"
          />
          <span className="min-w-0 font-medium">{option.label}</span>
          {option.myBet && (
            <span
              className="shrink-0 rounded-full bg-(--poll)/15 px-2 py-0.5 text-xs font-semibold text-(--poll) tabular-nums"
              title="내가 건 잉여력 (지급 예상)">
              {`내 참여 ${formatNumber(option.myBet.point)} (${formatNumber(option.myBet.exp)})`}
            </span>
          )}
          <span className="ml-auto shrink-0 text-base font-bold tabular-nums">
            {option.percent}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              leading || checked ? "bg-(--poll)" : "bg-(--poll)/45",
            )}
            style={{ width: `${option.percent}%` }}
          />
        </div>
      </label>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
        <span>
          배당 <b className="font-semibold text-foreground">x{option.odds}</b>
        </span>
        <span>{formatNumber(option.sum)} 잉여력</span>
        <span>{formatNumber(option.count)}명</span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          aria-expanded={showList}
          disabled={option.count === 0}
          onClick={() => setShowList(prev => !prev)}
          className="ml-auto text-muted-foreground">
          참여 현황
          <ChevronDownIcon
            className={cn("transition-transform", showList && "rotate-180")}
          />
        </Button>
      </div>

      {showList && <ParticipantList pk={pk} option={option} />}
    </div>
  );
}

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

/** 게시글 속 승부예측. 원래 본문의 form.fm-pp를 떼어내서 다시 그림 */
function PredictPoll({
  poll,
  onSubmit,
  pending = false,
}: {
  poll: PredictionPoll;
  /** 참여하기. 없으면 참여 버튼이 비활성화됨 */
  onSubmit?: (option: string, bet: number) => void;
  /** 참여 요청 중 */
  pending?: boolean;
}) {
  const id = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState(String(poll.bet?.initial ?? ""));

  const { bet } = poll;
  const open = bet !== null;
  const maxSum = Math.max(...poll.options.map(o => o.sum));

  const amountNum = parseInt(amount) || 0;
  const amountValid = !!bet && amountNum >= bet.min && amountNum <= bet.max;
  const canSubmit = !!onSubmit && selected !== null && amountValid && !pending;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (canSubmit) onSubmit(selected, amountNum);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col overflow-hidden rounded-lg border text-sm [--poll:#5b79bd]">
      <header className="flex flex-col gap-1.5 bg-(--poll) px-4 py-3 text-white">
        <h3 className="leading-snug font-bold">{poll.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80 tabular-nums [&_svg]:size-3.5">
          <span className="inline-flex items-center gap-1" title="잉여력 합산">
            <ChartPieIcon />
            {formatNumber(poll.totalSum)} 잉여력
          </span>
          <span className="inline-flex items-center gap-1" title="참여 수">
            <UsersIcon />
            {formatNumber(poll.totalCount)}명 참여
          </span>
          {!open && poll.endMessage && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 font-medium text-white">
              <LockIcon />
              마감
            </span>
          )}
        </div>
      </header>

      <div role="radiogroup" className="flex flex-col gap-2 p-4">
        {poll.options.map(option => (
          <PollOption
            key={option.value}
            pk={poll.pk}
            option={option}
            name={`${id}-o`}
            checked={selected === option.value}
            disabled={!open}
            leading={option.sum === maxSum && maxSum > 0}
            onSelect={() => setSelected(option.value)}
          />
        ))}
      </div>

      {bet ? (
        <div className="flex flex-wrap items-center gap-2 border-t bg-muted/40 px-4 py-3">
          <label htmlFor={`${id}-bet`} className="font-medium">
            잉여력
          </label>
          <input
            id={`${id}-bet`}
            type="number"
            inputMode="numeric"
            min={bet.min}
            max={bet.max}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            aria-invalid={!amountValid}
            className="h-8 w-28 rounded-md border border-input bg-background px-2.5 text-right tabular-nums outline-none focus-visible:border-(--poll) focus-visible:ring-3 focus-visible:ring-(--poll)/30 aria-invalid:border-destructive"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount(String(bet.max))}>
            최대
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            보유 {formatNumber(bet.myPoint)}
          </span>
          <Button
            type="submit"
            disabled={!canSubmit}
            title={
              !onSubmit
                ? "아직 지원하지 않습니다"
                : selected === null
                  ? "선택지를 고르세요"
                  : undefined
            }
            className="ml-auto bg-(--poll) text-white hover:bg-(--poll)/85">
            {pending && <LoaderCircleIcon className="animate-spin" />}
            참여하기
          </Button>
          {!amountValid && (
            <p className="w-full text-xs text-destructive">
              {bet.myPoint < bet.min
                ? `잉여력이 부족합니다. (최소 ${formatNumber(bet.min)})`
                : `${formatNumber(bet.min)} ~ ${formatNumber(bet.max)} 사이로 입력하세요.`}
            </p>
          )}
        </div>
      ) : (
        poll.endMessage && (
          <p className="border-t bg-muted/40 px-4 py-3 text-center font-medium text-red-600 dark:text-red-400">
            {poll.endMessage}
          </p>
        )
      )}

      {poll.notices.length > 0 && (
        <ul className="flex flex-col gap-0.5 border-t px-4 py-3 text-xs text-muted-foreground">
          {poll.notices.map((notice, i) => (
            <li key={i}>{notice}</li>
          ))}
        </ul>
      )}
    </form>
  );
}

export default PredictPoll;
