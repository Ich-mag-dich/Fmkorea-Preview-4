import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { fetchCommentPageOf } from "@/lib/api/comment";
import { setCommentsPage } from "./query-cache";

/**
 * 베스트 댓글의 원 댓글이 있는 댓글 페이지를 찾음. 받은 페이지는 캐시에 넣어 두므로
 * 그 페이지로 바꾸면 다시 받지 않음. 결과는 원 댓글이 있는 페이지 번호
 */
export const useFindComment = (href: string, docId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const page = await fetchCommentPageOf(docId, commentId);
      // 지워진 댓글은 목록에 안 들어오므로(parseComment) 원 댓글이 없으면 실패로 봄
      if (!page.comments.some(c => c.id === commentId && !c.isBestCopy)) {
        throw new Error("원 댓글을 찾지 못했습니다");
      }
      setCommentsPage(queryClient, href, page);
      return page.currentPage;
    },
    onError: error => toast.error(error.message),
  });
};
