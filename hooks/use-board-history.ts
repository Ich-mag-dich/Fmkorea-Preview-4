import { useQuery } from "@tanstack/react-query";
import { fetchBoardHistory } from "@/lib/api/member";
import type { PostData } from "@/lib/types";
import { queryKeys } from "./query-keys";

/** 게시판 이력. 버튼을 눌러 enabled가 될 때만 요청 */
export const useBoardHistory = (post: PostData, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.boardHistory(post.docId, post.historyParams?.memberSrl),
    queryFn: () => fetchBoardHistory(post),
    enabled: enabled && post.historyParams !== null,
    staleTime: 5 * 60_000, // 다시 펼칠 때마다 요청하지 않게
  });
