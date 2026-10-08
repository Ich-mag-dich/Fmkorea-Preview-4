// entrypoints/preview.content/index.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import { getPreviewLink } from "@/lib/getPreviewLink";
import { previewStore } from "@/lib/preview-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default defineContentScript({
  matches: ["https://www.fmkorea.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "fm-preview",
      position: "overlay",
      zIndex: 2147483647,
      onMount: (container, shadow) => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              // 글 하나를 받으면 HTML 전체를 다시 파싱하므로, 창 포커스/재마운트마다
              // 다시 받지 않게. 추천/댓글/블라인드 후엔 invalidate로 직접 갱신함
              staleTime: 60_000,
              refetchOnWindowFocus: false,
              retry: 1,
            },
          },
        });
        const root = ReactDOM.createRoot(container);
        // shadow root를 넘겨서 Dialog/Dropdown Portal이 이 안에 렌더링되게
        root.render(
          <QueryClientProvider client={queryClient}>
            <App portalContainer={container} />
          </QueryClientProvider>,
        );
        return root;
      },
      onRemove: root => root?.unmount(),
    });
    ui.mount();

    // 사이트 단축키(숫자키 즐겨찾기 게시판, S/F 이전·다음 글 등)는 document에서 받는데,
    // Shadow DOM 밖에선 target이 호스트로 바뀌어 미리보기 입력창에 치는 글자도 단축키로
    // 처리됨. 미리보기가 열려 있는 동안 뒤 페이지가 이동하면 안 되므로 미리보기 안에서
    // 생긴 키는 호스트에서 전파를 끊음 (스크롤 같은 브라우저 기본 동작은 그대로).
    // Escape는 Dialog가 document에서 받아 창을 닫으므로 그대로 보냄
    for (const type of ["keydown", "keypress", "keyup"] as const) {
      ctx.addEventListener(ui.shadowHost, type, e => {
        if ((e as KeyboardEvent).key !== "Escape") e.stopPropagation();
      });
    }

    ctx.addEventListener(
      document,
      "contextmenu",
      e => {
        if (e.shiftKey) return;
        const link = getPreviewLink(e.target as HTMLElement);
        if (!link) return;
        e.preventDefault();
        previewStore.open(link.href);
      },
      {
        capture: true,
      },
    );

    ctx.addEventListener(window, "popstate", previewStore.onPopState);
  },
});
