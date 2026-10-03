import type { MouseEvent } from "react";
import type { CommentData, CommentVoteType } from "@/lib/types";
import CommentItem from "./CommentItem";

function CommentList({
  comments,
  commentCount,
  onVote,
}: {
  comments: CommentData[];
  commentCount: number;
  onVote?: (type: CommentVoteType, id: string) => void;
}) {
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
        <ul className="flex flex-col divide-y">
          {comments.map(comment => (
            <CommentItem
              // 베스트 댓글은 일반 위치에도 같은 id로 한 번 더 나오므로 key를 구분
              key={`${comment.isBest ? "best-" : ""}${comment.id}`}
              comment={comment}
              onVote={onVote}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default CommentList;
