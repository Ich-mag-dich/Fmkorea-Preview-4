import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Window } from "happy-dom";

const FIXTURES = join(import.meta.dirname, "fixtures");

/** tests/fixtures 안의 파일 내용 */
export const readFixture = (name: string): string =>
  readFileSync(join(FIXTURES, name), "utf8");

/**
 * 저장한 페이지를 읽는 전용 window.
 * iframe(광고, 유튜브)을 실제로 불러오지 않게 꺼 두면 happy-dom이 iframe마다
 * "Iframe page loading is disabled" 에러를 콘솔에 찍는다. 테스트 환경의 window는
 * 콘솔을 바꿀 수 없어서, 그 메시지만 걸러 내는 콘솔을 가진 window를 따로 만든다
 */
const pageWindow = new Window({
  url: "https://www.fmkorea.com/",
  console: {
    ...console,
    error: (...args: unknown[]) => {
      if (String(args[0]).includes("Iframe page loading is disabled")) return;
      console.error(...args);
    },
  } as Console,
  settings: {
    disableJavaScriptFileLoading: true,
    disableJavaScriptEvaluation: true,
    disableCSSFileLoading: true,
    disableIframePageLoading: true,
    handleDisabledFileLoadingAsSuccess: true,
  },
});

/**
 * 저장해 둔 페이지를 문서로 읽음. 확장이 fetch로 받은 HTML을 DOMParser로 읽는 것과 같다.
 * 파서 중엔 문서를 직접 고치는 것이 있으므로 테스트마다 새로 읽는다
 */
export const loadPage = (name: string): Document =>
  new pageWindow.DOMParser().parseFromString(
    readFixture(name),
    "text/html",
  ) as unknown as Document;

/** HTML 조각을 body에 넣은 문서 */
export const htmlDoc = (body: string): Document =>
  new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${body}</body></html>`,
    "text/html",
  );
