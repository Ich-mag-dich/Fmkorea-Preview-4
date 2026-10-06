import type { MouseEvent } from "react";
import { previewStore } from "@/lib/preview-store";

/**
 * 미리보기 안의 게시글 링크 onClick용 (게시판 이력, 유사 핫딜 등).
 * 그냥 클릭은 미리보기 안에서 그 글로 이동, Ctrl/Shift/휠 클릭은 브라우저 기본 동작(새 탭)
 */
export const openInPreview = (
  e: MouseEvent<HTMLAnchorElement>,
  url: string,
) => {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
    return;
  }
  e.preventDefault();
  previewStore.open(url);
};
