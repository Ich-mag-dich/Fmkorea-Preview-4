import { toFontFamily } from "@/lib/font";
import {
  fontItem,
  showBoardFrontItem,
  showPopularPostsItem,
} from "@/lib/settings";

const STYLE_ID = "fmp-font";
const POPULAR_STYLE_ID = "fmp-hide-popular";
const BOARD_FRONT_STYLE_ID = "fmp-hide-board-front";

// 아이콘 폰트를 쓰는 요소까지 바꾸면 아이콘이 네모로 깨지므로 제외
const NOT_ICON = [
  ":not(i)",
  ':not([class*="icon"])',
  ':not([class*="fa-"])',
  ':not([class*="xi-"])',
  ":not(.material-icons)",
].join("");

const buildCss = (family: string) =>
  `body, body *${NOT_ICON} { font-family: ${family} !important; }`;

/** 설정한 글꼴을 사이트 전체에 적용. 빈 값이면 스타일을 지워 사이트 기본 글꼴로 */
const applyFont = (name: string) => {
  const family = toFontFamily(name);
  let style = document.getElementById(STYLE_ID);
  if (!family) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    // document_start 시점엔 <head>가 없을 수 있어서 <html>에 붙임
    document.documentElement.append(style);
  }
  style.textContent = buildCss(family);
};

/** 게시판 인기글 표시 여부. 끄면 CSS로 숨겨서 사이트 JS가 참조해도 안전 */
const applyPopularPosts = (show: boolean) => {
  let style = document.getElementById(POPULAR_STYLE_ID);
  if (show) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = POPULAR_STYLE_ID;
    style.textContent = `
    aside.content_widget { display: none !important; }
    aside.content_widget ~ main { margin-top: 1rem !important; }
    `;
    document.documentElement.append(style);
  }
};

/** 대문 표시 여부 */
const applyBoardFrontItem = (show: boolean) => {
  let style = document.getElementById(BOARD_FRONT_STYLE_ID);
  if (show) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = BOARD_FRONT_STYLE_ID;
    style.textContent = `
    div.fm_daemun_front { display: none !important; }
    `;
    document.documentElement.append(style);
  }
};

export default defineContentScript({
  matches: ["https://www.fmkorea.com/*"],
  // 페이지가 원래 글꼴로 그려졌다가 바뀌는 깜빡임을 줄이려고 최대한 일찍 실행
  runAt: "document_start",
  async main(ctx) {
    applyFont(await fontItem.getValue());
    applyPopularPosts(await showPopularPostsItem.getValue());
    applyBoardFrontItem(await showBoardFrontItem.getValue());
    // 옵션 페이지에서 바꾸면 새로고침 없이 바로 반영
    const unwatch = fontItem.watch(applyFont);
    const unwatchPopular = showPopularPostsItem.watch(applyPopularPosts);
    const unwatchBoardFront = showBoardFrontItem.watch(applyBoardFrontItem);
    ctx.onInvalidated(unwatch);
    ctx.onInvalidated(unwatchPopular);
    ctx.onInvalidated(unwatchBoardFront);
  },
});
