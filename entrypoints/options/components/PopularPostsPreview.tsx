import { cn } from "@/lib/utils";

// 제목 길이가 들쑥날쑥해 보이도록 고정된 너비 목록 사용
const TITLE_WIDTHS = [
  [62, 48, 55, 40, 58, 50],
  [44, 56, 36, 52, 46, 60],
];

/** 인기글 한 칸: 제목 + 글 목록(글머리 · 제목 · 댓글 수 · 추천 수) */
function PopularColumn({ widths }: { widths: number[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="mb-0.5 flex items-center gap-1.5">
        <div className="size-2.5 rounded-sm bg-blue-500/70" />
        <div className="h-2.5 w-1/3 rounded-full bg-foreground/30" />
      </div>
      {widths.map((w, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="size-1 shrink-0 rounded-full bg-foreground/30" />
          <div
            className="h-1.5 rounded-full bg-foreground/15"
            style={{ width: `${w}%` }}
          />
          <div className="h-1.5 w-3 shrink-0 rounded-full bg-foreground/35" />
          <div className="h-1.5 w-4 shrink-0 rounded-full bg-foreground/10" />
        </div>
      ))}
    </div>
  );
}

/** 사이트 화면을 블럭으로 그려서 인기글 영역이 어디인지 보여줌 */
export default function PopularPostsPreview({ show }: { show: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/50 p-[4%]">
      <div className="flex flex-col gap-3 rounded-md bg-background p-4 shadow-lg ring-1 ring-foreground/10">
        {/* 로고 */}
        <div className="flex items-end gap-2">
          <div className="h-5 w-24 rounded-md bg-foreground/25" />
          <div className="h-1.5 w-16 rounded-full bg-foreground/10" />
        </div>

        {/* 메뉴 */}
        <div className="flex flex-col gap-1.5 rounded-md bg-muted p-2">
          <div className="flex gap-3">
            {[10, 12, 9, 12, 7, 7, 11, 9, 12].map((w, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full bg-foreground/20",
                  i === 5 && "bg-blue-500/60",
                )}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-3.5 w-9 rounded bg-foreground/10" />
            ))}
          </div>
        </div>

        {/* 인기글 영역: 끄면 높이가 0으로 접힘 */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300",
            show ? "grid-rows-[1fr]" : "grid-rows-[0fr] opacity-0",
          )}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 rounded-md p-2 ring-2 ring-blue-500/50 ring-inset">
              {TITLE_WIDTHS.map((widths, i) => (
                <PopularColumn key={i} widths={widths} />
              ))}
            </div>
          </div>
        </div>

        {/* 게시글 목록: 인기글을 끄면 위로 올라옴 */}
        <div className="flex flex-col gap-2 border-t pt-3">
          {[70, 55, 82, 64].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-1.5 w-6 shrink-0 rounded-full bg-foreground/10" />
              <div
                className="h-1.5 rounded-full bg-foreground/15"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
