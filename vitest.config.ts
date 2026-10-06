import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig({
  // @/ 경로와 확장 API(browser.*) 가짜 구현을 WXT 설정대로 맞춰 줌
  plugins: [WxtVitest()],
  test: {
    // 파서가 DOMParser 등 브라우저 DOM을 쓰므로
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        // 확장이 실제로 도는 페이지와 같은 주소 (상대 링크, location.origin 계산용)
        url: "https://www.fmkorea.com/",
        // 저장한 페이지의 <script src>, <link rel=stylesheet>, iframe을
        // 실제로 받으러 나가지 않게 (테스트는 네트워크 없이 돌아야 함)
        settings: {
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableCSSFileLoading: true,
          disableIframePageLoading: true,
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    include: ["tests/**/*.test.ts"],
  },
});
