import { toFontFamily } from "@/lib/font";
import { fontItem } from "@/lib/settings";

const STYLE_ID = "fmp-font";

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

export default defineContentScript({
  matches: ["https://www.fmkorea.com/*"],
  // 페이지가 원래 글꼴로 그려졌다가 바뀌는 깜빡임을 줄이려고 최대한 일찍 실행
  runAt: "document_start",
  async main(ctx) {
    applyFont(await fontItem.getValue());
    // 옵션 페이지에서 바꾸면 새로고침 없이 바로 반영
    const unwatch = fontItem.watch(applyFont);
    ctx.onInvalidated(unwatch);
  },
});
