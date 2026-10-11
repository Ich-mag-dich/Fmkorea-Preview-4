// 팝업·설정 페이지 스크린샷을 찍어 images/store/에 저장한다 (bun run screenshots)
// - popup.jpg, options.jpg: Chrome 웹 스토어 규격(1280x800 JPEG, 알파 없음), 라이트 모드
// - options-full.png: README용 설정 페이지 전체
// 확장 페이지만 열고 에펨코리아에는 접속하지 않는다. 다크 모드 이미지는 직접 찍는다.
// 다른 PC에서 처음 실행하면 `bunx playwright install chromium`으로 브라우저를 먼저 받는다.
import { chromium } from "playwright";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const EXT = resolve(".output/chrome-mv3"); // wxt build 결과
const OUT = resolve("images/store");
const W = 1280;
const H = 800;

const profile = mkdtempSync(join(tmpdir(), "fmp-shot-"));
// 확장은 persistent context + chromium 채널(새 headless)에서만 불러와짐
const ctx = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  headless: true,
  viewport: { width: W, height: H },
  colorScheme: "light",
  args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
});

try {
  const page = ctx.pages()[0] ?? (await ctx.newPage());

  // 확장 id (background가 없어서 확장 관리 페이지에서 읽음)
  await page.goto("chrome://extensions");
  const id = await page.locator("extensions-item").first().getAttribute("id");
  const base = `chrome-extension://${id}`;

  // 1. 팝업: 그대로는 작아서 배경 위에 키워 가운데 둠
  await page.goto(`${base}/popup.html`);
  await page.locator("main").waitFor();
  await page.addStyleTag({
    content: `
      html, body { width: ${W}px; height: ${H}px; margin: 0; overflow: hidden; }
      body { display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #eef2f7 0%, #dfe6f0 100%) !important; }
      main { zoom: 1.6; background: #fff; border-radius: 12px;
        box-shadow: 0 1px 2px rgba(15,23,42,.06), 0 12px 32px rgba(15,23,42,.14); }
    `,
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(OUT, "popup.jpg"),
    type: "jpeg",
    quality: 95,
  });

  // 2. 설정: 실제 페이지 그대로. 저장된 설정값과 글꼴 목록을 불러올 때까지 기다림
  await page.goto(`${base}/options.html`);
  await page.locator("main section").last().waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({
    path: join(OUT, "options-full.png"),
    fullPage: true,
  });
  // 스토어용은 아래 카드가 조금 더 보이게 0.85배로 줄여서 첫 화면만
  await page.evaluate(() => {
    document.querySelector("main").style.zoom = "0.85";
    document.documentElement.style.overflow = "hidden";
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(OUT, "options.jpg"),
    type: "jpeg",
    quality: 95,
  });

  console.log(`저장함: ${OUT} (popup.jpg, options.jpg, options-full.png)`);
} finally {
  await ctx.close();
  rmSync(profile, { recursive: true, force: true });
}
