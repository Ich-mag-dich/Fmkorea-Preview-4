import { useComments } from "@/hooks/use-comments";
import { useFindComment } from "@/hooks/use-find-comment";
import { useVoteComment } from "@/hooks/use-vote-comment";
import { useEffect, useRef, useState } from "react";
import CommentList from "./CommentList";
import type { CommentData } from "@/lib/types";
import CommentPagination from "./CommentPagination";
import CommentForm from "./CommentForm";
import { useInsertComment } from "@/hooks/use-insert-comment";
import { usePreviewPost } from "@/hooks/use-preview-post";

function CommentSection({
  initial,
  onPageChange,
}: {
  /** 게시글 페이지에 같이 들어 있던 첫 댓글 페이지 */
  initial: {
    comments: CommentData[];
    commentCount: number;
    currentPage: number;
    totalPages: number;
  };
  onPageChange?: () => void;
}) {
  const { href, post } = usePreviewPost();
  const { mid, docId } = post;
  const [page, setPage] = useState(initial.currentPage);
  const isInitialPage = page === initial.currentPage;
  const { data, isFetching } = useComments(href, page, !isInitialPage);
  const current = isInitialPage ? initial : (data ?? initial);
  const vote = useVoteComment(href);
  const insert = useInsertComment({ href, mid, docId });
  // 에러 토스트는 훅에서 띄우고, 실패하면 false를 돌려줘서 입력 내용은 남겨둠
  const submit = (content: string, parentSrl?: string) =>
    insert
      .mutateAsync({ content, parentSrl })
      .then(() => true)
      .catch(() => false);

  // 베스트 댓글의 "댓글로 가기". 원 댓글이 지금 페이지에 있으면 바로 스크롤하고,
  // 다른 페이지에 있으면 그 페이지를 받아 넘긴 뒤 그려지면 스크롤
  const listRef = useRef<HTMLDivElement>(null);
  const findComment = useFindComment(href, docId);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const scrollToOriginal = (id: string) => {
    // 상단 베스트 사본에는 data-comment-id가 없어서 원 댓글만 찾음
    const el = listRef.current?.querySelector(`[data-comment-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !!el;
  };
  const goToComment = (id: string) => {
    if (scrollToOriginal(id)) return;
    findComment.mutate(id, {
      onSuccess: p => {
        setPage(p);
        setScrollTarget(id);
      },
    });
  };
  useEffect(() => {
    if (scrollTarget && scrollToOriginal(scrollTarget)) setScrollTarget(null);
  }, [scrollTarget, current.comments]);

  return (
    <div
      ref={listRef}
      className={
        isFetching || findComment.isPending ?
          "opacity-60 transition-opacity"
        : undefined
      }>
      <CommentList
        comments={current.comments}
        commentCount={current.commentCount}
        onVote={(type, id) => {
          const comment = current.comments.find(c => c.id === id);
          if (comment) vote.mutate({ comment, type });
        }}
        votePending={vote.isPending}
        onGoToComment={goToComment}
        goToPending={findComment.isPending}
        onReply={(parentSrl, content) => submit(content, parentSrl)}
        replyPending={insert.isPending}
      />
      <CommentPagination
        currentPage={page}
        totalPages={current.totalPages}
        onChange={p => {
          setPage(p);
          onPageChange?.();
        }}
      />
      <CommentForm
        className="mt-6"
        pending={insert.isPending}
        onSubmit={content => submit(content)}
      />
    </div>
  );
}

export default CommentSection;
