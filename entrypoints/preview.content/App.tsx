import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { previewStore } from "@/lib/preview-store";
import { isNightMode } from "@/lib/night-mode";
import PreviewModal from "@/components/preview/PreviewModal";
import { Toaster } from "@/components/ui/toast";
import { PortalContainerContext } from "@/hooks/use-portal-container";
import { useStorageItem } from "@/hooks/use-storage-item";
import { fontItem, videoVolumeItem } from "@/lib/settings";
import { toFontFamily } from "@/lib/font";

function App({ portalContainer }: { portalContainer: HTMLElement }) {
  const href = useSyncExternalStore(previewStore.subscribe, previewStore.get);

  // 열 때마다 쿠키를 다시 읽어서, 사이트에서 야간 모드를 바꿔도 새로고침 없이 반영.
  // 미리보기는 portalContainer 안에 렌더링되므로 여기에 .dark를 붙인다.
  // useLayoutEffect: 밝은 테마로 한 프레임 그려졌다가 바뀌는 깜빡임 방지
  useLayoutEffect(() => {
    if (href) portalContainer.classList.toggle("dark", isNightMode());
  }, [href, portalContainer]);

  // 미리보기는 Shadow DOM이라 사이트에 넣은 글꼴 스타일이 안 닿으므로 따로 적용.
  // 미리보기/토스트/메뉴가 전부 portalContainer 안이라 여기 하나로 상속됨
  const [fontName] = useStorageItem(fontItem);
  useLayoutEffect(() => {
    portalContainer.style.fontFamily = toFontFamily(fontName) ?? "";
  }, [fontName, portalContainer]);

  // 영상 기본 볼륨. 본문/댓글 HTML은 문자열로 렌더링돼서 파싱할 때 넣은 volume이 사라지므로,
  // 실제로 그려진 <video>가 메타데이터를 읽는 순간 볼륨을 넣는다.
  // 미디어 이벤트는 버블링되지 않아서 capture로 container 한 곳에서 받음
  const [videoVolume] = useStorageItem(videoVolumeItem);
  const videoVolumeRef = useRef(videoVolume);
  videoVolumeRef.current = videoVolume;
  useEffect(() => {
    const onLoaded = (e: Event) => {
      if (e.target instanceof HTMLVideoElement) {
        e.target.volume = videoVolumeRef.current;
      }
    };
    portalContainer.addEventListener("loadedmetadata", onLoaded, true);
    return () =>
      portalContainer.removeEventListener("loadedmetadata", onLoaded, true);
  }, [portalContainer]);

  // 닫는 중(href=null)에도 닫힘 애니메이션이 끝날 때까지 마지막 글을 계속 렌더링
  const [renderedHref, setRenderedHref] = useState(href);
  if (href && href !== renderedHref) setRenderedHref(href);

  return (
    <PortalContainerContext value={portalContainer}>
      {renderedHref && (
        <PreviewModal
          href={renderedHref}
          open={href !== null}
          onClose={previewStore.close}
          // 닫힘 애니메이션이 끝나면 언마운트
          onClosed={() => setRenderedHref(null)}
        />
      )}
      {/* 미리보기를 닫아도 떠 있는 토스트가 사라지지 않게 모달 바깥에 둠 */}
      <Toaster container={portalContainer} />
    </PortalContainerContext>
  );
}

export default App;
