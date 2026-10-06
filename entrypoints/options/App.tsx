import { CodeIcon } from "lucide-react";
import PreviewWidthSetting from "./components/PreviewWidthSetting";
import VideoVolumeSetting from "./components/VideoVolumeSetting";
import FontSetting from "./components/FontSetting";

function App() {
  const { version } = browser.runtime.getManifest();
  return (
    <div className="min-h-screen bg-muted/40">
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
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
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-muted [&_svg]:size-4 [&_svg]:shrink-0">
            <span className="text-muted-foreground">
              <CodeIcon />
            </span>
            <span className="flex-1">GitHub</span>
          </a>
          <span className="rounded-full bg-muted px-2.5 py-1 text-sm font-medium text-muted-foreground tabular-nums">
            v{version}
          </span>
        </header>

        <PreviewWidthSetting />
        <VideoVolumeSetting />
        <FontSetting />

        <p className="text-center text-sm text-muted-foreground">
          설정은 자동으로 저장되며, 브라우저 동기화가 켜져 있으면 다른 기기에도
          적용됩니다.
        </p>
      </main>
    </div>
  );
}

export default App;
