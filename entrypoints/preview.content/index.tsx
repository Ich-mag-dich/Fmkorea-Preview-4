// entrypoints/preview.content/index.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";

export default defineContentScript({
  matches: ["https://www.fmkorea.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "fm-preview",
      position: "overlay",
      zIndex: 2147483647,
      onMount: (container, shadow) => {
        const root = ReactDOM.createRoot(container);
        // shadow root를 넘겨서 Dialog/Dropdown Portal이 이 안에 렌더링되게
        root.render(<App portalContainer={container} />);
        return root;
      },
      onRemove: root => root?.unmount(),
    });
    ui.mount();

    ctx.addEventListener(document, "contextmenu", e => {
      if (e.shiftKey) return;
    });
  },
});
