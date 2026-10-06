/** 내 화면 안에서 미리보기 창이 차지하는 폭을 축소해서 보여줌 */
export default function WidthPreview({ width }: { width: number }) {
  const screenWidth = window.screen.width;
  const ratio = Math.min(width / screenWidth, 1);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/50 p-[4%]">
        <div
          className="flex h-full flex-col gap-1.5 rounded-md bg-background p-3 shadow-lg ring-1 ring-foreground/10 transition-[width] duration-150"
          style={{ width: `${ratio * 100}%` }}>
          <div className="h-2.5 w-2/3 rounded-full bg-foreground/20" />
          <div className="mb-1 h-1.5 w-1/4 rounded-full bg-foreground/10" />
          {[100, 92, 96, 70].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-foreground/10"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        현재 화면 너비 {screenWidth}px 기준
        {width >= screenWidth && " · 화면보다 넓어서 화면 너비에 맞춰집니다"}
      </p>
    </div>
  );
}
