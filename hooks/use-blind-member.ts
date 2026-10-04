import { blindMember, fetchBlindStatus } from "@/lib/api/fmkorea-api";
import type { BlindType } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const blindStatusKey = (memberSrl: string) =>
  ["blind-status", memberSrl] as const;

const BLIND_LABEL: Record<BlindType, string> = {
  default: "글,댓글",
  message: "쪽지",
};

export const useBlindMember = ({
  memberSrl,
  docId,
  mid,
}: {
  memberSrl: string;
  docId: string;
  mid: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      type,
      mode,
      memo,
    }: {
      type: BlindType;
      mode: "add" | "cancel";
      memo?: string;
    }) => {
      const data = await blindMember({
        memberSrl,
        docId,
        mid,
        type,
        mode,
        memo,
      });
      console.log(data);

      // api.php 응답 형식을 믿지 않고, 상태를 다시 조회해서 실제로 바뀌었는지로 판단
      const status = await queryClient.fetchQuery({
        queryKey: blindStatusKey(memberSrl),
        queryFn: () => fetchBlindStatus({ memberSrl, docId, mid }),
      });
      if (status[type] !== (mode === "add")) {
        throw new Error(data?.message || "블라인드 처리에 실패했습니다");
      }
    },
    onSuccess: (_, { type, mode }) => {
      toast.success(
        mode === "add"
          ? `${BLIND_LABEL[type]} 블라인드했습니다`
          : `${BLIND_LABEL[type]} 블라인드를 해제했습니다`,
      );
      // 블라인드된 회원의 글/댓글 표시가 바뀌므로 열려 있는 미리보기를 다시 받음
      if (type === "default") {
        queryClient.invalidateQueries({ queryKey: ["post"] });
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      }
    },
    onError: error => toast.error(error.message),
  });
};
