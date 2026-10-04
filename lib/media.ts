import { urls } from "./api/urls";
import { prepareEmbeds } from "./embed";

// 볼륨은 여기서 넣어도 HTML 문자열로 바뀌면서 사라지므로
// 실제로 그려진 뒤 preview.content/App.tsx에서 적용함
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

    wrapper.replaceWith(newVid);
  });
};

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
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
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
  prepareEmbeds(root);
};
