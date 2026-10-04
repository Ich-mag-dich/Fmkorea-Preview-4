import { insertComment } from "@/lib/api/fmkorea-api";
import { toast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      // 첫 댓글 페이지는 게시글 쿼리에, 나머지 페이지는 댓글 쿼리에 들어 있음
      queryClient.invalidateQueries({ queryKey: ["post", href] });
      queryClient.invalidateQueries({ queryKey: ["comments", href] });
    },
    onError: error => toast.error(error.message),
  });
};
