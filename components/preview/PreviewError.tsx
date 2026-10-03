import { CircleAlertIcon, ExternalLinkIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PreviewError({
  href,
  onRetry,
  retrying = false,
}: {
  href: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <CircleAlertIcon className="size-8 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">게시글을 불러오지 못했습니다</p>
        <p className="text-muted-foreground">
          삭제되었거나 일시적인 오류일 수 있습니다.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onRetry()} disabled={retrying}>
          <RotateCwIcon className={cn(retrying && "animate-spin")} />
          다시 시도
        </Button>
        {/* 미리보기가 안 되면 원문으로 바로 이동할 수 있게 */}
        <Button
          variant="ghost"
          nativeButton={false}
          render={<a href={href} target="_blank" rel="noopener noreferrer" />}>
          <ExternalLinkIcon />
          원문 열기
        </Button>
      </div>
    </div>
  );
}

export default PreviewError;
