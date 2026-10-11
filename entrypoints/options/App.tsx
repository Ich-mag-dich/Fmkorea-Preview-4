import { CodeIcon } from "lucide-react";
import PreviewWidthSetting from "./components/PreviewWidthSetting";
import VideoVolumeSetting from "./components/VideoVolumeSetting";
import FontSetting from "./components/FontSetting";
import PopularPostSetting from "./components/PopularPostSetting";
import BoardFrontSetting from "./components/BoardFrontSetting";

function App() {
  const { version } = browser.runtime.getManifest();
  return (
    // 라이트 모드는 배경을 카드(흰색)보다 진하게 해서 카드가 구분되게.
    // 다크 모드는 배경이 카드보다 밝아지지 않게 그대로 옅게 둠
    <div className="min-h-screen bg-muted dark:bg-muted/40">
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 lg:max-w-6xl">
        <header className="flex items-center gap-3">
          <img src="/icon/128.png" alt="" className="size-12 rounded-sm p-1" />
          <div className="flex flex-1 flex-col">
            <h1 className="text-xl leading-tight font-bold">
              Fmkorea Preview 설정
            </h1>
            <p className="text-sm text-muted-foreground">
              에펨코리아 게시글 미리보기
            </p>
          </div>
          <a
            href="https://github.com/Ich-mag-dich/Fmkorea-Preview-4"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-card dark:hover:bg-muted [&_svg]:size-4 [&_svg]:shrink-0">
            <span className="text-muted-foreground">
              <CodeIcon />
            </span>
            <span className="flex-1">GitHub</span>
          </a>
          <span className="rounded-full bg-card px-2.5 py-1 text-sm font-medium text-muted-foreground tabular-nums dark:bg-muted">
            v{version}
          </span>
        </header>

        {/* 넓은 화면에선 두 열, 좁으면 왼쪽 열 다음 오른쪽 열 순서로 한 열 */}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <PreviewWidthSetting />
            <FontSetting />
          </div>
          <div className="flex flex-col gap-6">
            <BoardFrontSetting />
            <PopularPostSetting />
            <VideoVolumeSetting />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          설정은 자동으로 저장되며, 브라우저 동기화가 켜져 있으면 다른 기기에도
          적용됩니다.
        </p>
      </main>
    </div>
  );
}

export default App;
