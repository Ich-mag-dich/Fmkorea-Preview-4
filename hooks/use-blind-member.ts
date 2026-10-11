import { blindMember, fetchBlindStatus } from "@/lib/api/member";
import type { BlindType } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

const BLIND_LABEL: Record<BlindType, string> = {
  default: "글,댓글",
  message: "쪽지",
};

/** 회원의 블라인드 상태. enabled일 때만 요청 (작성자 메뉴를 열 때) */
export const useBlindStatus = (
  {
    memberSrl,
    docId,
    mid,
  }: {
    memberSrl: string;
    docId: string;
    mid: string;
  },
  enabled: boolean,
) =>
  useQuery({
    queryKey: queryKeys.blindStatus(memberSrl),
    queryFn: () => fetchBlindStatus({ memberSrl, docId, mid }),
    enabled: enabled && !!memberSrl,
    staleTime: 30_000, // 바로 다시 열면 재요청 안 함
  });

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

      // api.php 응답 형식을 믿지 않고, 상태를 다시 조회해서 실제로 바뀌었는지로 판단
      const status = await queryClient.query({
        queryKey: queryKeys.blindStatus(memberSrl),
        queryFn: () => fetchBlindStatus({ memberSrl, docId, mid }),
        // 기본 staleTime(60초)이면 메뉴를 열 때 받아 둔 변경 전 상태를 그대로 돌려줘서
        // 성공해도 실패로 판단함. 항상 서버에 다시 물음
        staleTime: 0,
      });
      if (status[type] !== (mode === "add")) {
        throw new Error(data?.message || "블라인드 처리에 실패했습니다");
      }
    },
    onSuccess: (_, { type, mode }) => {
      toast.success(
        mode === "add" ?
          `${BLIND_LABEL[type]} 블라인드했습니다`
        : `${BLIND_LABEL[type]} 블라인드를 해제했습니다`,
      );
      // 블라인드된 회원의 글/댓글 표시가 바뀌므로 열려 있는 미리보기를 다시 받음
      if (type === "default") {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
        queryClient.invalidateQueries({ queryKey: queryKeys.allComments() });
      }
    },
    onError: error => toast.error(error.message),
  });
};
