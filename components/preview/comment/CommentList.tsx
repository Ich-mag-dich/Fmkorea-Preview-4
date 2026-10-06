import { useState, type MouseEvent } from "react";
import type { CommentData, VoteType } from "@/lib/types";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

// 베스트 댓글은 일반 위치에도 같은 id로 한 번 더 나오므로 key를 구분
const itemKey = (comment: CommentData) =>
  `${comment.isBest ? "best-" : ""}${comment.id}`;

function CommentList({
  comments,
  commentCount,
  onVote,
  onReply,
  replyPending = false,
}: {
  comments: CommentData[];
  commentCount: number;
  onVote?: (type: VoteType, id: string) => void;
  /** 답글 등록. 성공하면 true (입력창이 닫힘) */
  onReply?: (parentSrl: string, content: string) => Promise<boolean>;
  replyPending?: boolean;
}) {
  // 답글 입력창은 한 번에 하나만. id 대신 key로 잡아야 베스트 사본과 원본 양쪽에 같이 열리지 않음
  const [replyingKey, setReplyingKey] = useState<string | null>(null);

  // 대댓글 앞의 부모 닉네임 링크(a.findParent, href="...#comment_ID")를 누르면
  // 페이지 이동 대신 미리보기 안의 해당 댓글로 스크롤
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>(
      "a.findParent",
    );
    if (!link) return;
    e.preventDefault();
    const id = link.getAttribute("href")?.match(/#comment_(\d+)/)?.[1];
    if (!id) return;
    e.currentTarget
      .querySelector(`[data-comment-id="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="flex flex-col pt-6" onClick={handleClick}>
      <h3 className="flex items-center gap-1.5 border-b pb-3 text-sm font-bold">
        댓글
        <span className="text-blue-600 dark:text-blue-400">{commentCount}</span>
      </h3>

      {comments.length === 0 ? (
        <p className="py-10 text-center text-xl font-bold text-muted-foreground">
          댓글이 없습니다. ;ㅅ;
        </p>
      ) : (
        // 구분선은 CommentItem이 들여쓴 내용 쪽에만 그림 (가이드 라인을 가로지르지 않게)
        <ul className="flex flex-col">
          {comments.map(comment => {
            const key = itemKey(comment);
            const close = () => setReplyingKey(null);
            return (
              <CommentItem
                key={key}
                comment={comment}
                onVote={onVote}
                isReplying={replyingKey === key}
                onReply={
                  onReply &&
                  (() => setReplyingKey(prev => (prev === key ? null : key)))
                }
                replyForm={
                  onReply && (
                    <CommentForm
                      className="mt-2"
                      title={`${comment.author}님에게 답글`}
                      placeholder="답글을 입력하세요"
                      autoFocus
                      pending={replyPending}
                      onCancel={close}
                      onSubmit={async content => {
                        const ok = await onReply(comment.id, content);
                        if (ok) close();
                        return ok;
                      }}
                    />
                  )
                }
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default CommentList;
