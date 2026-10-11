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
    // - my_vote: 요청 뒤 내 상태 (1 추천, -1 비추천, 0 안 함). 쿨다운으로 실패해도 그대로의 상태가 옴
    //   예) 비추천 직후 추천: { my_vote: -1, message: "1초 후 추천/비추천을 취소하거나 바꿀 수 있습니다." }
    // - voted_count: 추천 개수가 바뀔 때만 옴 (추천, 추천 취소, 추천↔비추천 전환). 비추천 개수는 안 옴
    // 같은 버튼을 다시 누르면 취소, 다른 버튼이면 전환이라 누르기 전 상태로 결과를 예상할 수 있음
    onSuccess: (result, { comment, type }) => {
      const before = comment.myVote;
      const after = before === type ? null : type;
      const expected =
        after === "up" ? 1
        : after === "down" ? -1
        : 0;

      if (result.my_vote !== expected) {
        // 쿨다운 등으로 실패했거나 다른 탭에서 바꿔서 누르기 전 상태가 달랐음. 서버에서 다시 받아 맞춤
        toast.info(result.message);
        refetchPostAndComments(queryClient, href);
        return;
      }

      // 비추천 개수는 응답에 없어서 비추천 상태가 바뀐 만큼 더하고 뺌
      const downDelta = Number(after === "down") - Number(before === "down");
      const patch = (c: CommentData): CommentData => ({
        ...c,
        myVote: after,
        voteUp: result.voted_count ?? c.voteUp,
        voteDown: c.voteDown + downDelta,
      });
      // 베스트 댓글은 상단 사본과 원본이 같은 id라 둘 다 갱신
      updateComments(queryClient, href, comments =>
        comments.map(c => (c.id === comment.id ? patch(c) : c)),
      );
      toast.success(result.message);
    },
    onError: error => toast.error(error.message),
  });
};
