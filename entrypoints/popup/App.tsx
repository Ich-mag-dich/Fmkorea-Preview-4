import type { ReactNode } from "react";
import {
  BugIcon,
  ChevronRightIcon,
  CodeIcon,
  ExternalLinkIcon,
  SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { urls } from "@/lib/api/urls";

const REPO_URL = "https://github.com/Ich-mag-dich/Fmkorea-Preview-4";

export const LINKS: { icon: ReactNode; label: string; href: string }[] = [
  // {
  //   icon: <ExternalLinkIcon />,
  //   label: "에펨코리아 열기",
  //   href: urls.BASE_URL,
  // },
  { icon: <CodeIcon />, label: "GitHub 저장소", href: REPO_URL },
  {
    icon: <BugIcon />,
    label: "버그 제보 · 건의",
    href: `${REPO_URL}/issues/new`,
  },
];

const USAGE: { keys: string[]; action: string }[] = [
  { keys: ["우클릭"], action: "게시글 제목에서 미리보기 열기" },
  { keys: ["Shift", "우클릭"], action: "브라우저 기본 메뉴 열기" },
  { keys: ["Esc"], action: "미리보기 닫기 (뒤로 가기도 가능)" },
];

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-b-2 bg-muted px-1.5 py-0.5 font-sans text-[11px] leading-none font-medium text-foreground">
      {children}
    </kbd>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-semibold text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function App() {
  const { version } = browser.runtime.getManifest();

  const openOptions = async () => {
    await browser.runtime.openOptionsPage();
    window.close(); // 설정 탭이 열리면 팝업은 닫음
  };

  return (
    <main className="flex w-80 flex-col gap-5 p-4">
      <header className="flex items-center gap-3">
        <img src="/icon/128.png" alt="" className="size-12 rounded-lg p-2" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-base leading-tight font-bold">Fmkorea Preview</h1>
          <p className="text-sm text-muted-foreground">
            에펨코리아 게시글 미리보기
          </p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          v{version}
        </span>
      </header>

      <Section title="사용법">
        <ul className="flex flex-col gap-2 rounded-lg border p-3">
          {USAGE.map(({ keys, action }) => (
            <li key={action} className="flex items-center gap-2 text-sm">
              <span className="flex shrink-0 items-center gap-1">
                {keys.map((key, i) => (
                  <span key={key} className="text-md flex items-center gap-1">
                    {i > 0 && <span className="text-muted-foreground">+</span>}
                    <Kbd>{key}</Kbd>
                  </span>
                ))}
              </span>
              <span className="text-muted-foreground">{action}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="바로가기">
        <ul className="flex flex-col overflow-hidden rounded-lg border">
          {LINKS.map(({ icon, label, href }) => (
            <li key={href} className="border-t first:border-t-0">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-muted [&_svg]:size-4 [&_svg]:shrink-0">
                <span className="text-muted-foreground">{icon}</span>
                <span className="flex-1">{label}</span>
                <ChevronRightIcon className="text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Button size="lg" className="w-full" onClick={openOptions}>
        <SettingsIcon />
        설정
      </Button>
    </main>
  );
}

export default App;
