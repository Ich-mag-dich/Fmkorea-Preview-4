import { useMutation, useQueryClient } from "@tanstack/react-query";
import { betPredictionPoll } from "@/lib/api/poll";
import { applyBetResult } from "@/lib/prediction-poll";
import type { PostData } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { updatePostData } from "./query-cache";
import { queryKeys } from "./query-keys";

export const useBetPredictionPoll = (href: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      post,
      pk,
      option,
      bet,
    }: {
      post: PostData;
      pk: string;
      option: string;
      bet: number;
    }) => betPredictionPoll(post, pk, option, bet),
    // betPredictionPoll이 error !== 0이면 예외를 던지므로 여기는 진짜 성공일 때만 옴
    onSuccess: (result, { pk }) => {
      updatePostData(queryClient, href, post => ({
        ...post,
        predictionPolls: post.predictionPolls.map(poll =>
          poll.pk === pk ? applyBetResult(poll, result) : poll,
        ),
      }));
      // 참여 현황에 내 참여가 보이도록 다시 받게 함
      queryClient.invalidateQueries({ queryKey: queryKeys.pollList(pk) });
      // 토스트는 한 줄이라 줄바꿈을 공백으로
      toast.success(result.message.replace(/\s*\n\s*/g, " "));
    },
    onError: error => toast.error(error.message.replace(/\s*\n\s*/g, " ")),
  });
};
