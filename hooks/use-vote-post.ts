import { voteDocument } from "@/lib/api/fmkorea-api";
import type { PostData, VoteType } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePostData } from "./query-cache";

export const useVotePost = (href: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ post, type }: { post: PostData; type: VoteType }) =>
      voteDocument(post, type),
    // voteDocument가 error !== 0이면 예외를 던지므로 여기는 진짜 성공일 때만 옴
    onSuccess: (result, { type }) => {
      updatePostData(queryClient, href, post => ({
        ...post,
        // 서버가 준 최신 추천 수가 있으면 그걸 쓰고, 없으면 ±1
        voteCount:
          result.voted_blamed_count ??
          post.voteCount + (type === "up" ? 1 : -1),
      }));
      toast.success(result.message);
    },
    onError: error => toast.error(error.message),
  });
};
