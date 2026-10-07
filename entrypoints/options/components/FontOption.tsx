import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toFontFamily } from "@/lib/font";

export const FONT_SAMPLE = "다람쥐 헌 쳇바퀴에 타고파 ABC 123";

export default function FontOption({
  label,
  name,
  selected,
  installed,
  onSelect,
}: {
  label: string;
  name: string;
  selected: boolean;
  installed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={!installed}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        "hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
        selected
          && "border-blue-500 bg-blue-50 ring-1 ring-blue-500 hover:bg-blue-50 dark:bg-blue-500/15 dark:hover:bg-blue-500/15",
      )}>
      <span className="flex w-full items-center gap-1.5 text-sm font-medium">
        {label}
        {!installed && (
          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            미설치
          </span>
        )}
        {selected && <CheckIcon className="ml-auto size-4 text-blue-500" />}
      </span>
      {/* 이름 없음 = 사이트 기본. 옵션 페이지 기본 글꼴로 견본 표시 */}
      <span
        className="truncate text-base"
        style={{ fontFamily: toFontFamily(name) ?? undefined }}>
        {FONT_SAMPLE}
      </span>
    </button>
  );
}
