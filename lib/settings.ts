import { storage } from "wxt/utils/storage";

/** 미리보기 창 최대 너비(px). 화면이 이보다 좁으면 화면 너비에 맞춰짐 */
export const PREVIEW_WIDTH = {
  min: 640,
  max: 1600,
  step: 20,
  default: 1024,
} as const;

// sync: 브라우저 동기화가 켜져 있으면 다른 기기에도 같은 설정
export const previewWidthItem = storage.defineItem<number>(
  "sync:previewWidth",
  { fallback: PREVIEW_WIDTH.default },
);

/** 미리보기 속 영상의 처음 볼륨 (0~1) */
export const VIDEO_VOLUME_DEFAULT = 0.5;
export const videoVolumeItem = storage.defineItem<number>("sync:videoVolume", {
  fallback: VIDEO_VOLUME_DEFAULT,
});

/** 사이트/미리보기에 적용할 글꼴 이름. 빈 문자열이면 사이트 기본 글꼴 */
export const fontItem = storage.defineItem<string>("sync:fontFamily", {
  fallback: "",
});

/** 게시판 인기글 표시 여부 */
export const showPopularPostsItem = storage.defineItem<boolean>(
  "sync:showPopularPosts",
  {
    fallback: true,
  },
);

/** 게시판 대문 표시 여부 */
export const showBoardFrontItem = storage.defineItem<boolean>(
  "sync:showBoardFront",
  {
    fallback: true,
  },
);
