import { urls } from "./api/urls";

const DEFAULT_VIDEO_VOLUME = 0.5;
const VIDEO_VOLUME_STORAGE_KEY = "fmk_preview_video_volume";

let cachedVideoVolume = DEFAULT_VIDEO_VOLUME;

/**
 * 비디오 요소에 기본 볼륨 값을 적용
 *
 * @param video 볼륨을 적용할 비디오 요소
 */
export const applyDefaultVideoVolume = (video: HTMLVideoElement) => {
  video.volume = cachedVideoVolume;
};

const cleanVideoWrappers = (root: Element) => {
  root.querySelectorAll(".height_keep").forEach(wrapper => {
    const video = wrapper.querySelector("video");
    const source = video?.querySelector("source");
    if (!video) return;

    const newVid = document.createElement("video");
    newVid.src = source?.getAttribute("src") ?? video.getAttribute("src") ?? "";
    fixAttr(newVid, "src");
    newVid.controls = true;
    newVid.preload = "metadata";
    newVid.style.cssText =
      "max-width:100%;max-height:480px;width:auto;border-radius:6px;margin:8px 0;display:block";

    const poster = video.getAttribute("poster");
    if (poster) {
      newVid.poster = poster.startsWith("//") ? `https:${poster}` : poster;
    }

    if (video.classList.contains("video-without-sound")) {
      newVid.autoplay = true;
      newVid.loop = true;
      newVid.muted = true;
    }

    applyDefaultVideoVolume(newVid);

    wrapper.replaceWith(newVid);
  });
};

/**
 * 비디오 볼륨 값을 정규화하여 0과 1 사이의 유효한 값으로 변환
 *
 * 유효하지 않은 값이 들어오면 기본 볼륨 값을 반환
 *
 * @param value 비디오 볼륨 값
 * @returns 0과 1 사이의 유효한 비디오 볼륨 값
 */
const normalizeVideoVolume = (value: unknown) =>
  typeof value === "number" && value >= 0 && value <= 1
    ? value
    : DEFAULT_VIDEO_VOLUME;

/**
 * 상대 경로로 된 URL을 절대 경로로 변환
 *
 * @param el URL을 절대 경로로 변환할 요소
 * @param attr 변환할 속성 이름
 */
export const fixAttr = (el: Element, attr: string): void => {
  const val = el.getAttribute(attr);
  if (val?.startsWith("//")) el.setAttribute(attr, `https:${val}`);
  else if (val?.startsWith("/"))
    el.setAttribute(attr, `${urls.BASE_URL}${val}`);
};

/**
 * 루트 요소 내의 모든 미디어 요소(img, source)의 URL을 절대 경로로 변환
 *
 * @param root URL을 절대 경로로 변환할 루트 요소
 */
export const absolutizeMedia = (root: Element): void => {
  root.querySelectorAll("img").forEach(img => {
    const orig =
      img.getAttribute("data-original") ?? img.getAttribute("data-src");
    if (orig) img.setAttribute("src", orig);
    fixAttr(img, "src");
  });
  root.querySelectorAll("source").forEach(s => fixAttr(s, "src"));
};

export const cleanContent = (root: Element) => {
  root.querySelectorAll(".beforeLoad").forEach(el => {
    el.className = el.className.replace("beforeLoad", "").trim();
  });
  root.querySelectorAll<HTMLElement>(".auto_media_wrapper").forEach(el => {
    el.style.opacity = "1";
    el.style.width = "100%";
    el.style.maxWidth = "100%";
    const vid = el.querySelector<HTMLVideoElement>("video");
    if (vid) {
      vid.style.maxWidth = "100%";
      vid.style.maxHeight = "480px";
      vid.style.width = "auto";
    }
  });
  absolutizeMedia(root);
  cleanVideoWrappers(root);
  root.innerHTML = root.innerHTML.replace(/<!--[\s\S]*?-->/g, "");
  // embedMedia(root);
};
