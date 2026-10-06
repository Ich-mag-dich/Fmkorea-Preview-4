import { useMutation, useQueryClient } from "@tanstack/react-query";
import { betPredictionPoll, fetchPost } from "@/lib/api/fmkorea-api";
import { applyBetResult } from "@/lib/prediction-poll";
import type { PostData } from "@/lib/types";
import { toast } from "@/components/ui/toast";

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
      queryClient.setQueryData<Awaited<ReturnType<typeof fetchPost>>>(
        ["post", href],
        prev =>
          prev && {
            ...prev,
            PostData: {
              ...prev.PostData,
              predictionPolls: prev.PostData.predictionPolls.map(poll =>
                poll.pk === pk ? applyBetResult(poll, result) : poll,
              ),
            },
          },
      );
      // 참여 현황에 내 참여가 보이도록 다시 받게 함
      queryClient.invalidateQueries({
        queryKey: ["prediction-poll-list", pk],
      });
      // 토스트는 한 줄이라 줄바꿈을 공백으로
      toast.success(result.message.replace(/\s*\n\s*/g, " "));
    },
    onError: error => toast.error(error.message.replace(/\s*\n\s*/g, " ")),
  });
};
