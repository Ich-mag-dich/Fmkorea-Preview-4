import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PredictionPollOption } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import ParticipantList from "./ParticipantList";

/** 승부예측 선택지 하나. 비율 막대와 참여 현황 펼치기 */
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

export default PollOption;
