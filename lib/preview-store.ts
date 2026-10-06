import type { MouseEvent } from "react";

type Listener = () => void;

// 미리보기가 쌓은 방문 기록 항목 표시. 뒤로/앞으로 가기 때 이 값으로 구분
const HISTORY_KEY = "fmPreview";

// 현재 열려 있는 프리뷰 링크
let current: string | null = null;

const listeners = new Set<Listener>();

// 현재 열려 있는 프리뷰 링크가 바뀌었음을 구독자들에게 알림
const emit = () => listeners.forEach(l => l());

export const isPreviewHistoryState = (state: unknown): boolean =>
  typeof state === "object" && state !== null && HISTORY_KEY in state;

export const previewStore = {
  /**
   * 미리보기를 열고 주소창을 게시글 주소로 바꿈
   *
   * @param fromHistory 앞으로 가기로 다시 열 때 true. 이미 주소가 바뀐 상태라 기록을 건드리지 않음
   */
  open(href: string, { fromHistory = false } = {}) {
    if (!fromHistory) {
      const state = { [HISTORY_KEY]: true };
      // 열린 상태에서 다른 글로 바뀌면 기록을 더 쌓지 않고 교체
      if (current) history.replaceState(state, "", href);
      else history.pushState(state, "", href);
    }
    current = href;
    emit();
  },
  close() {
    if (!current) return;
    current = null;
    emit();
    // X/ESC/바깥 클릭으로 닫으면 열 때 쌓은 기록을 되돌림.
    // 뒤로 가기로 닫힌 경우엔 이미 이전 항목이라 조건에 안 걸림
    if (isPreviewHistoryState(history.state)) history.back();
  },
  get: () => current,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/**
 * 미리보기 안의 게시글 링크 onClick용.
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
