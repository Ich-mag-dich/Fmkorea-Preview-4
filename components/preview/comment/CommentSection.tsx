import { useComments } from "@/hooks/use-comments";
import { useVoteComment } from "@/hooks/use-vote-comment";
import { useState } from "react";
import CommentList from "./CommentList";
import type { CommentData } from "@/lib/types";
import CommentPagination from "./CommentPagination";
import CommentForm from "./CommentForm";
import { useInsertComment } from "@/hooks/use-insert-comment";

function CommentSection({
  href,
  initial,
  mid,
  docId,
  onPageChange,
}: {
  href: string;
  initial: {
    comments: CommentData[];
    commentCount: number;
    currentPage: number;
    totalPages: number;
  };
  mid: string;
  docId: string;
  onPageChange?: () => void;
}) {
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

  return (
    <div className={isFetching ? "opacity-60 transition-opacity" : undefined}>
      <CommentList
        comments={current.comments}
        commentCount={current.commentCount}
        mid={mid}
        docId={docId}
        onVote={(type, id) => {
          const comment = current.comments.find(c => c.id === id);
          if (comment) vote.mutate({ comment, type });
        }}
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
