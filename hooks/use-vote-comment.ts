import { voteComment } from "@/lib/api/comment";
import type { CommentData, VoteType } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refetchPostAndComments, updateComments } from "./query-cache";

export const useVoteComment = (href: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ comment, type }: { comment: CommentData; type: VoteType }) =>
      voteComment(comment, type),
    // 댓글 추천 응답은 성공/취소/실패 모두 error: -2라서 필드로 판단
    // - 추천/추천 취소: voted_count(갱신된 개수)가 옴
    // - 비추천: my_vote: -1, 개수는 안 옴
    // - 비추천 취소, 쿨다운 등 실패: 둘 다 my_vote: 0에 개수도 없어서 구분 불가
    onSuccess: (result, { comment, type }) => {
      let patch: ((c: CommentData) => CommentData) | undefined;
      if (result.voted_count !== undefined) {
        const voteUp = result.voted_count;
        patch = c => ({ ...c, voteUp });
      } else if (type === "down" && result.my_vote === -1) {
        patch = c => ({ ...c, voteDown: c.voteDown + 1 });
      }

      if (!patch) {
        // 취소인지 실패인지 모르니 메시지만 보여주고 서버에서 다시 받아 개수를 맞춤
        toast.info(result.message);
        refetchPostAndComments(queryClient, href);
        return;
      }

      // 베스트 댓글은 상단 사본과 원본이 같은 id라 둘 다 갱신
      updateComments(queryClient, href, comments =>
        comments.map(c => (c.id === comment.id ? patch(c) : c)),
      );
      toast.success(result.message);
    },
    onError: error => toast.error(error.message),
  });
};
