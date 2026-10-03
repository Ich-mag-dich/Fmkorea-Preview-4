import { useState, useSyncExternalStore } from "react";
import { previewStore } from "@/lib/preview-store";
import PreviewModal from "@/components/preview/PreviewModal";

function App({ portalContainer }: { portalContainer: HTMLElement }) {
  const href = useSyncExternalStore(previewStore.subscribe, previewStore.get);

  // 닫는 중(href=null)에도 닫힘 애니메이션이 끝날 때까지 마지막 글을 계속 렌더링
  const [renderedHref, setRenderedHref] = useState(href);
  if (href && href !== renderedHref) setRenderedHref(href);

  if (!renderedHref) return null;
  return (
    <PreviewModal
      href={renderedHref}
      open={href !== null}
      portalContainer={portalContainer}
      onClose={previewStore.close}
      // 닫힘 애니메이션이 끝나면 언마운트
      onClosed={() => setRenderedHref(null)}
    />
  );
}

export default App;
