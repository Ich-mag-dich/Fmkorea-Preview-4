import { insertComment } from "@/lib/api/comment";
import { toast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refetchPostAndComments } from "./query-cache";
import { queryKeys } from "./query-keys";

export const useInsertComment = ({
  href,
  mid,
  docId,
}: {
  href: string;
  mid: string;
  docId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      content,
      parentSrl,
    }: {
      content: string;
      parentSrl?: string;
    }) => insertComment({ mid, docId, content, parentSrl }),
    onSuccess: () => {
      toast.success("댓글을 등록했습니다");
      // 작성자 아이콘/날짜/위치를 직접 만들지 않고 서버에서 다시 받아 반영
      refetchPostAndComments(queryClient, href);
      // 이미지콘 댓글이면 "최근 사용"이 바뀜. 사이트도 등록할 때 이미지콘 캐시를 지움.
      // 이미지콘 창은 등록하면 닫히므로, 요청 없이 다음에 열 때 다시 받음
      queryClient.invalidateQueries({ queryKey: queryKeys.imageCons() });
    },
    onError: error => toast.error(error.message),
  });
};
