import { createContext, use } from "react";

/**
 * Dialog/Menu/Toast 같은 Portal이 렌더링될 shadow root 안의 요소.
 * 기본값(document.body)으로 나가면 shadow DOM 밖이라 Tailwind 스타일과 .dark가 안 먹으므로
 * Portal의 container에는 항상 이 값을 넘긴다
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export const usePortalContainer = (): HTMLElement => {
  const container = use(PortalContainerContext);
  if (!container) {
    throw new Error(
      "usePortalContainer는 PortalContainerContext 안에서만 쓸 수 있습니다",
    );
  }
  return container;
};
