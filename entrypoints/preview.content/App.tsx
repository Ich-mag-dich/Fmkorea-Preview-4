import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { previewStore } from "@/lib/preview-store";
import { isNightMode } from "@/lib/night-mode";
import PreviewModal from "@/components/preview/PreviewModal";

function App({ portalContainer }: { portalContainer: HTMLElement }) {
  const href = useSyncExternalStore(previewStore.subscribe, previewStore.get);

  // 열 때마다 쿠키를 다시 읽어서, 사이트에서 야간 모드를 바꿔도 새로고침 없이 반영.
  // 미리보기는 portalContainer 안에 렌더링되므로 여기에 .dark를 붙인다.
  // useLayoutEffect: 밝은 테마로 한 프레임 그려졌다가 바뀌는 깜빡임 방지
  useLayoutEffect(() => {
    if (href) portalContainer.classList.toggle("dark", isNightMode());
  }, [href, portalContainer]);

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
