import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** 게시판 화면을 블럭으로 그려서 대문 이미지가 어디인지 보여줌 */
export default function BoardFrontPreview({ show }: { show: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/50 p-[4%]">
      <div className="flex flex-col gap-3 rounded-md bg-background p-4 shadow-lg ring-1 ring-foreground/10">
        {/* 로고 + 검색창 */}
        <div className="flex items-end gap-2">
          <div className="h-5 w-24 rounded-md bg-foreground/25" />
          <div className="h-1.5 w-16 rounded-full bg-foreground/10" />
          <div className="ml-auto h-4 w-28 rounded-sm ring-1 ring-foreground/20" />
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

        <div className="flex gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {/* 대문 이미지: 끄면 높이가 0으로 접힘 */}
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300",
                show ? "grid-rows-[1fr]" : "grid-rows-[0fr] opacity-0",
              )}>
              <div className="overflow-hidden">
                <div className="flex justify-center rounded-md p-2 ring-2 ring-blue-500/50 ring-inset">
                  <div className="flex aspect-[7/4] w-3/4 items-center justify-center rounded bg-foreground/10">
                    <ImageIcon className="size-8 text-foreground/25" />
                  </div>
                </div>
              </div>
            </div>

            {/* 게시판 이름 + 관리자 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-1.5 rounded-sm bg-foreground/30" />
                <div className="h-2.5 w-1/4 rounded-full bg-foreground/30" />
              </div>
              <div className="h-1.5 w-1/3 rounded-full bg-foreground/10" />
            </div>

            {/* 카테고리 탭 */}
            <div className="flex gap-2 rounded-md bg-muted p-2">
              {[8, 6, 9, 11, 12, 10].map((w, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full bg-foreground/20"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>

            {/* 게시글 목록 */}
            <div className="flex flex-col gap-2">
              {[70, 55, 82].map((w, i) => (
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

          {/* 오른쪽 위젯 */}
          <div className="flex w-1/5 shrink-0 flex-col gap-2">
            {[5, 4].map((rows, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-sm p-1.5 ring-1 ring-foreground/10">
                <div className="mb-0.5 h-2 w-1/2 rounded-full bg-foreground/25" />
                {Array.from({ length: rows }, (_, j) => (
                  <div
                    key={j}
                    className="h-1.5 rounded-full bg-foreground/10"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
