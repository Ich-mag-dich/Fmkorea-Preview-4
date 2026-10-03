// entrypoints/preview.content/index.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import { getPreviewLink } from "@/lib/getPreviewLink";
import { isPreviewHistoryState, previewStore } from "@/lib/preview-store";
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
        const queryClient = new QueryClient();
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

    // 뒤로 가기 → 미리보기 닫기, 앞으로 가기로 미리보기 기록에 돌아오면 → 다시 열기
    ctx.addEventListener(window, "popstate", e => {
      if (isPreviewHistoryState(e.state)) {
        previewStore.open(location.href, { fromHistory: true });
      } else {
        previewStore.close();
      }
    });
  },
});
