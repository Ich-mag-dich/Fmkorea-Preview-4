/** 핫딜: 글 아래 "유사한 쿠팡/지마켓 상품" */
import type { PostData, RelatedProduct, RelatedProductsResult } from "../types";
import { postAct, readJson } from "./request";

/**
 * 핫딜 글 아래 "유사한 쿠팡/지마켓 상품" 목록.
 * 페이지 HTML에는 빈 <ul>만 있고 사이트도 이 요청으로 채움
 * (act 이름의 Releavnt 오타는 사이트 그대로)
 */
export const fetchRelatedProducts = async (
  post: PostData,
): Promise<RelatedProduct[]> => {
  const act = "dispFmhotdealReleavntProductListFromAD";
  const res = await postAct(
    act,
    { document_srl: post.docId, module: "fmhotdeal", act },
    { referrer: post.url },
  );
  const data = await readJson<RelatedProductsResult>(
    res,
    "관련 상품을 불러오지 못했습니다",
  );
  return data.product_list ?? [];
};
