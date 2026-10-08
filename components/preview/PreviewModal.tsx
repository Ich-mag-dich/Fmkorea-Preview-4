import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePortalContainer } from "@/hooks/use-portal-container";
import { usePost } from "@/hooks/use-post";
import { PreviewPostContext } from "@/hooks/use-preview-post";
import { useStorageItem } from "@/hooks/use-storage-item";
import { previewWidthItem } from "@/lib/settings";
import { cn } from "@/lib/utils";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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

  // 뼈대를 보여 줬던 글만 내용을 페이드인. 캐시에서 바로 그리는 글까지 페이드하면
  // 창 여는 애니메이션(0.1초)보다 길어져서 오히려 굼떠 보임. 다른 글로 바뀌면 그 글 기준으로 다시 정함
  const [fade, setFade] = useState({ href, on: isPending });
  if (fade.href !== href || (isPending && !fade.on))
    setFade({ href, on: isPending });

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

  // 닫을 때는 스크롤한 위치에서 닫히므로, 지금 화면 가운데를 기준점으로 맞춰서 제자리에서 작아지게.
  // useLayoutEffect: 닫힘 애니메이션이 시작되기 전에 넣어야 함
  useLayoutEffect(() => {
    const popup = popupRef.current;
    if (open || !popup) return;
    const originY = window.innerHeight / 2 - popup.getBoundingClientRect().top;
    popup.style.transformOrigin = `50% ${originY}px`;
  }, [open]);

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
        className={cn(
          "grid-cols-[minmax(0,1fr)] gap-0 p-8 shadow-2xl ring-0 sm:max-w-(--preview-width)",
          // 창은 짧으면 가운데, 길면 위에서 시작함(m-auto). 뼈대가 짧으면 가운데 떴다가
          // 긴 글이 오는 순간 맨 위로 튀어 올라가므로, 로딩 중에는 Viewport(py-8)를 꽉 채워 처음부터 위에서 시작
          isPending && "min-h-[calc(100dvh-4rem)]",
          // 여닫을 때 커지고 작아지는(zoom) 기준점. 기본값(창 정중앙)이면 캐시에서 바로 그린 긴 글은
          // 기준점이 화면 한참 아래라 창이 밑에서 올라오는 것처럼 보임. 열 때는 항상 맨 위라서
          // 짧은 창은 정중앙, 긴 창은 화면 가운데(Viewport py-8 빼고)를 기준으로. 닫을 때는 아래 effect에서 다시 맞춤
          "origin-[50%_min(50%,50dvh-2rem)]",
        )}>
        {isPending ?
          <PreviewSkeleton />
        : isError ?
          <PreviewError href={href} onRetry={refetch} retrying={isFetching} />
          // 본문·댓글 안의 컴포넌트는 이 값으로 지금 보는 글을 꺼내 씀 (props로 안 넘김)
        : <PreviewPostContext value={{ href, post: data.PostData }}>
            {/* 뼈대에서 내용으로 바로 바뀌지 않고 서서히 나타나게 (fade 참고) */}
            <div
              className={cn(
                "min-w-0",
                fade.on && "animate-in duration-300 fade-in-0",
              )}>
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
            </div>
          </PreviewPostContext>
        }
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
