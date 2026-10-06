import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePortalContainer } from "@/hooks/use-portal-container";
import { usePost } from "@/hooks/use-post";
import { PreviewPostContext } from "@/hooks/use-preview-post";
import { useStorageItem } from "@/hooks/use-storage-item";
import { previewWidthItem } from "@/lib/settings";
import { useEffect, useRef, type CSSProperties } from "react";
import CommentSection from "./comment/CommentSection";
import PostView from "./post/PostView";
import PreviewError from "./PreviewError";
import PreviewRemote from "./PreviewRemote";
import PreviewSkeleton from "./PreviewSkeleton";

function PreviewModal({
  href,
  open,
  onClose,
  onClosed,
}: {
  href: string;
  open: boolean;
  onClose: () => void;
  /** 닫힘 애니메이션까지 끝난 뒤 호출 */
  onClosed: () => void;
}) {
  const portalContainer = usePortalContainer();
  const { data, isPending, isError, isFetching, refetch } = usePost(href);
  const popupRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const [previewWidth] = useStorageItem(previewWidthItem);

  // scrollOutside 모드라 실제로 스크롤되는 건 창을 감싼 Viewport
  const getViewport = () =>
    popupRef.current?.closest('[data-slot="dialog-viewport"]');
  const scrollToTop = () =>
    getViewport()?.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => {
    const viewport = getViewport();
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  };
  const scrollToComments = () =>
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // 미리보기 안에서 다른 글로 이동하면(게시판 이력 등) 이전 스크롤 위치가 아니라 맨 위부터
  useEffect(() => {
    getViewport()?.scrollTo({ top: 0 });
  }, [href]);

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
        // grid-cols-[minmax(0,1fr)]: grid 자식은 기본 min-width:auto라 본문에 넓은 요소가 하나만 있어도
        // 열 전체가 넓어져서 모든 줄이 창 밖으로 튀어나감. 열 너비를 창 너비로 고정
        // 최대 너비는 옵션 페이지에서 설정. 화면이 더 좁으면 w-full이라 화면에 맞춰짐
        style={{ "--preview-width": `${previewWidth}px` } as CSSProperties}
        className="grid-cols-[minmax(0,1fr)] gap-0 p-8 shadow-2xl ring-0 sm:max-w-(--preview-width)">
        {isPending ? (
          <PreviewSkeleton />
        ) : isError ? (
          <PreviewError href={href} onRetry={refetch} retrying={isFetching} />
        ) : (
          // 본문·댓글 안의 컴포넌트는 이 값으로 지금 보는 글을 꺼내 씀 (props로 안 넘김)
          <PreviewPostContext value={{ href, post: data.PostData }}>
            <PostView />
            <div ref={commentsRef}>
              <CommentSection
                key={href} // 다른 글을 열면 page 상태 초기화
                initial={{
                  comments: data.CommentData,
                  commentCount: data.commentCount,
                  currentPage: data.PostData.commentPage,
                  totalPages: data.PostData.totalCommentPages,
                }}
                onPageChange={scrollToComments}
              />
            </div>
          </PreviewPostContext>
        )}
        <PreviewRemote
          onTop={scrollToTop}
          onComments={data ? scrollToComments : undefined}
          onBottom={scrollToBottom}
        />
      </DialogContent>
    </Dialog>
  );
}

export default PreviewModal;
