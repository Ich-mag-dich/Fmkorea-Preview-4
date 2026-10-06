import { useId, useState, type SubmitEvent } from "react";
import {
  ChartPieIcon,
  LoaderCircleIcon,
  LockIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBetPredictionPoll } from "@/hooks/use-bet-prediction-poll";
import { usePreviewPost } from "@/hooks/use-preview-post";
import type { PredictionPoll } from "@/lib/types";
import { formatNumber } from "./format";
import PollOption from "./PollOption";

/** 게시글 속 승부예측. 원래 본문의 form.fm-pp를 떼어내서 다시 그림 */
function PredictPoll({ poll }: { poll: PredictionPoll }) {
  const { href, post } = usePreviewPost();
  const betMutation = useBetPredictionPoll(href);
  const pending = betMutation.isPending;
  const id = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState(String(poll.bet?.initial ?? ""));

  const { bet } = poll;
  const open = bet !== null;
  const maxSum = Math.max(...poll.options.map(o => o.sum));

  const amountNum = parseInt(amount) || 0;
  const amountValid = !!bet && amountNum >= bet.min && amountNum <= bet.max;
  const canSubmit = selected !== null && amountValid && !pending;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    betMutation.mutate({ post, pk: poll.pk, option: selected, bet: amountNum });
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
            title={selected === null ? "선택지를 고르세요" : undefined}
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
