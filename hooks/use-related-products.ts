import { useQuery } from "@tanstack/react-query";
import { fetchRelatedProducts } from "@/lib/api/fmkorea-api";
import type { PostData } from "@/lib/types";

/** 핫딜 글 아래 "유사한 쿠팡/지마켓 상품". 자리가 있는 글에서만 요청 */
export const useRelatedProducts = (post: PostData) =>
  useQuery({
    queryKey: ["related-products", post.docId],
    queryFn: () => fetchRelatedProducts(post),
    enabled: post.hasRelatedProducts,
    staleTime: 5 * 60_000,
  });
