import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePost } from "@/hooks/use-post";
import PostView from "./PostView";
import CommentList from "./CommentList";
import PreviewSkeleton from "./PreviewSkeleton";
import PreviewError from "./PreviewError";

function PreviewModal({
  href,
  open,
  portalContainer,
  onClose,
  onClosed,
}: {
  href: string;
  open: boolean;
  portalContainer: HTMLElement;
  onClose: () => void;
  /** 닫힘 애니메이션까지 끝난 뒤 호출 */
  onClosed: () => void;
}) {
  const { data, isPending, isError, isFetching, refetch } = usePost(href);
  const popupRef = useRef<HTMLDivElement>(null);

  // 미리보기 중엔 탭 제목을 게시글 제목으로, 닫히거나 다른 글로 바뀌면 원래대로.
  // 닫힘 애니메이션을 기다리지 않고 닫기 시작할 때 바로 되돌림
  const pageTitle = open ? data?.PostData.pageTitle : undefined;
  useEffect(() => {
    if (!pageTitle) return;
    const previousTitle = document.title;
    document.title = pageTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose(); // ESC, 바깥 클릭, X 버튼 전부 여기로
      }}
      onOpenChangeComplete={nextOpen => {
        if (!nextOpen) onClosed();
      }}>
      {/* scrollOutside: 배경에서 휠을 굴려도 미리보기가 스크롤됨 (스크롤바는 화면 오른쪽 끝) */}
      <DialogContent
        ref={popupRef}
        // 기본값은 "첫 번째 포커스 가능한 요소"라서 본문/댓글 중간 링크에 포커스가 가면
        // 그 위치로 스크롤돼 버림. 창 자체에 포커스해서 항상 맨 위에서 시작
        initialFocus={popupRef}
        container={portalContainer}
        scrollOutside
        className="gap-0 p-8 shadow-2xl ring-0 sm:max-w-5xl">
        {isPending ? (
          <PreviewSkeleton />
        ) : isError ? (
          <PreviewError href={href} onRetry={refetch} retrying={isFetching} />
        ) : (
          <>
            <PostView post={data.PostData} />
            <CommentList
              comments={data.CommentData}
              commentCount={data.commentCount}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PreviewModal;
