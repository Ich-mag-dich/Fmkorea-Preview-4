import { createContext, use } from "react";
import type { PostData } from "@/lib/types";

type PreviewPost = {
  /** 미리보기로 연 주소. 쿼리 키와 캐시 갱신에 씀 */
  href: string;
  post: PostData;
};

/**
 * 미리보기에서 지금 보고 있는 글. PreviewModal이 게시글을 받은 뒤 제공한다.
 * 작성자 메뉴(mid, docId)나 추천·참여 버튼처럼 글 정보가 필요한 컴포넌트는
 * 이 값을 직접 꺼내 쓰므로, 중간 컴포넌트가 props로 넘겨 줄 필요가 없다
 */
export const PreviewPostContext = createContext<PreviewPost | null>(null);

export const usePreviewPost = (): PreviewPost => {
  const value = use(PreviewPostContext);
  if (!value) {
    throw new Error(
      "usePreviewPost는 PreviewPostContext 안에서만 쓸 수 있습니다",
    );
  }
  return value;
};
