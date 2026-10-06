import type { QueryClient } from "@tanstack/react-query";
import type { fetchComments, fetchPost } from "@/lib/api/fmkorea-api";
import type { CommentData, PostData } from "@/lib/types";
import { queryKeys } from "./query-keys";

export type PostQueryData = Awaited<ReturnType<typeof fetchPost>>;
export type CommentsQueryData = Awaited<ReturnType<typeof fetchComments>>;

/**
 * 캐시에 있는 게시글 데이터를 고침. 캐시 구조({ PostData, CommentData, ... })는
 * 여기서만 알고, 훅은 무엇을 바꿀지만 넘김
 */
export const updatePostData = (
  queryClient: QueryClient,
  href: string,
  update: (post: PostData) => PostData,
) =>
  queryClient.setQueryData<PostQueryData>(
    queryKeys.post(href),
    prev => prev && { ...prev, PostData: update(prev.PostData) },
  );

/**
 * 한 글의 댓글을 캐시에서 고침.
 * 첫 댓글 페이지는 게시글 쿼리에, 나머지 페이지는 댓글 쿼리에 들어 있어서 둘 다 고침
 */
export const updateComments = (
  queryClient: QueryClient,
  href: string,
  update: (comments: CommentData[]) => CommentData[],
) => {
  queryClient.setQueryData<PostQueryData>(
    queryKeys.post(href),
    prev => prev && { ...prev, CommentData: update(prev.CommentData) },
  );
  queryClient.setQueriesData<CommentsQueryData>(
    { queryKey: queryKeys.comments(href) },
    prev => prev && { ...prev, comments: update(prev.comments) },
  );
};

/** 한 글의 게시글·댓글을 서버에서 다시 받게 함 (직접 고치기 어려운 변경 뒤) */
export const refetchPostAndComments = (
  queryClient: QueryClient,
  href: string,
) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.post(href) });
  queryClient.invalidateQueries({ queryKey: queryKeys.comments(href) });
};
