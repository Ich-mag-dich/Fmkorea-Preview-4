import { Skeleton } from "@/components/ui/skeleton";

// 게시글 로딩 중 표시. 실제 PostView/CommentList 레이아웃과 비슷한 모양으로 맞춘다
function PreviewSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <span className="sr-only">게시글을 불러오는 중</span>

      {/* 제목 */}
      <Skeleton className="h-6 w-3/4" />

      {/* 작성자 · 날짜 · 조회수 */}
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* 본문 */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* 댓글 */}
      <div className="flex flex-col gap-3 border-t pt-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PreviewSkeleton;
