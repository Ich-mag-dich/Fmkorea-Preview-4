import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { fetchImageCons } from "@/lib/api/image-cons";
import type { PostData } from "@/lib/types";

/**
 * 이미지콘 선택 창의 목록. 창을 열 때(마운트) 요청함.
 * 글은 Referer에만 쓰고 목록은 글과 상관없어서 키에 넣지 않음
 */
export const useImageCons = (post: PostData) => {
  return useQuery({
    queryKey: queryKeys.imageCons(),
    queryFn: () => fetchImageCons(post),
  });
};
