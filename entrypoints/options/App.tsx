import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Slider } from "@base-ui/react/slider";
import {
  CheckIcon,
  ChevronRightIcon,
  RotateCcwIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  CodeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PREVIEW_WIDTH,
  VIDEO_VOLUME_DEFAULT,
  fontItem,
  previewWidthItem,
  videoVolumeItem,
} from "@/lib/settings";
import {
  FONT_PRESETS,
  isFontInstalled,
  sanitizeFontName,
  toFontFamily,
} from "@/lib/font";
import { useStorageItem } from "@/hooks/use-storage-item";

const WIDTH_PRESETS = [
  { label: "좁게", value: 800 },
  { label: "기본", value: PREVIEW_WIDTH.default },
  { label: "넓게", value: 1280 },
  { label: "최대", value: PREVIEW_WIDTH.max },
];

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/** 내 화면 안에서 미리보기 창이 차지하는 폭을 축소해서 보여줌 */
function WidthPreview({ width }: { width: number }) {
  const screenWidth = window.screen.width;
  const ratio = Math.min(width / screenWidth, 1);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/50 p-[4%]">
        <div
          className="flex h-full flex-col gap-1.5 rounded-md bg-background p-3 shadow-lg ring-1 ring-foreground/10 transition-[width] duration-150"
          style={{ width: `${ratio * 100}%` }}>
          <div className="h-2.5 w-2/3 rounded-full bg-foreground/20" />
          <div className="mb-1 h-1.5 w-1/4 rounded-full bg-foreground/10" />
          {[100, 92, 96, 70].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-foreground/10"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        현재 화면 너비 {screenWidth}px 기준
        {width >= screenWidth && " · 화면보다 넓어서 화면 너비에 맞춰집니다"}
      </p>
    </div>
  );
}

/**
 * 슬라이더로 바꾸는 숫자 설정.
 * 드래그 중엔 화면(draft)만 바꾸고 놓을 때 저장 (sync 저장소는 분당 쓰기 횟수 제한이 있음)
 */
function useSliderSetting(item: Parameters<typeof useStorageItem<number>>[0]) {
  const [saved, save] = useStorageItem(item);
  const [draft, setDraft] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => setDraft(saved), [saved]);

  const commit = async (value: number) => {
    setDraft(value);
    await save(value);
    setJustSaved(true);
  };
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [justSaved]);

  return { draft, setDraft, commit, justSaved };
}

function SavedBadge({ show }: { show: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-sm text-green-600 transition-opacity dark:text-green-400",
        !show && "opacity-0",
      )}>
      <CheckIcon className="size-3.5" />
      저장됨
    </span>
  );
}

function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  return (
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onChange}
      onValueCommitted={onCommit}>
      <Slider.Control className="flex w-full touch-none items-center py-2 select-none">
        <Slider.Track className="h-1.5 w-full rounded-full bg-muted">
          <Slider.Indicator className="rounded-full bg-blue-500" />
          <Slider.Thumb
            aria-label={label}
            className="size-5 rounded-full border-2 border-blue-500 bg-background shadow-md outline-none has-focus-visible:ring-3 has-focus-visible:ring-blue-500/40"
          />
        </Slider.Track>
      </Slider.Control>
      <div className="mt-1 flex justify-between text-sm text-muted-foreground tabular-nums">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </Slider.Root>
  );
}

function PreviewWidthSetting() {
  const { draft, setDraft, commit, justSaved } =
    useSliderSetting(previewWidthItem);

  return (
    <Card
      title="미리보기 창 너비"
      description="미리보기 창의 최대 너비를 정합니다. 바꾸면 열려 있는 미리보기에도 바로 적용돼요.">
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold tabular-nums">
          {draft}
          <span className="ml-1 text-base font-medium text-muted-foreground">
            px
          </span>
        </span>
        <SavedBadge show={justSaved} />
      </div>

      <RangeSlider
        label="미리보기 창 너비"
        value={draft}
        min={PREVIEW_WIDTH.min}
        max={PREVIEW_WIDTH.max}
        step={PREVIEW_WIDTH.step}
        minLabel={`${PREVIEW_WIDTH.min}px`}
        maxLabel={`${PREVIEW_WIDTH.max}px`}
        onChange={setDraft}
        onCommit={commit}
      />

      <div className="flex flex-wrap gap-2">
        {WIDTH_PRESETS.map(({ label, value }) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            aria-pressed={draft === value}
            className={cn(
              "tabular-nums",
              draft === value &&
                "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-500/15 dark:text-blue-300",
            )}
            onClick={() => commit(value)}>
            {label}
            <span className="text-muted-foreground">{value}</span>
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-muted-foreground"
          disabled={draft === PREVIEW_WIDTH.default}
          onClick={() => commit(PREVIEW_WIDTH.default)}>
          <RotateCcwIcon />
          기본값으로
        </Button>
      </div>

      <WidthPreview width={draft} />
    </Card>
  );
}

function VideoVolumeSetting() {
  // 저장은 0~1, 화면에는 0~100%로 표시
  const { draft, setDraft, commit, justSaved } =
    useSliderSetting(videoVolumeItem);
  const percent = Math.round(draft * 100);
  const VolumeIcon =
    percent === 0 ? VolumeXIcon : percent < 50 ? Volume1Icon : Volume2Icon;

  return (
    <Card
      title="영상 기본 볼륨"
      description="미리보기 속 영상이 처음 재생될 때의 볼륨입니다. 영상을 보다가 볼륨을 바꾸면 이 값도 함께 바뀌어 다음 영상에 적용돼요.">
      <div className="flex items-end justify-between">
        <span className="flex items-center gap-2 text-3xl font-bold tabular-nums">
          <VolumeIcon className="size-7 text-muted-foreground" />
          {percent}
          <span className="-ml-1 text-base font-medium text-muted-foreground">
            %
          </span>
        </span>
        <SavedBadge show={justSaved} />
      </div>

      <RangeSlider
        label="영상 기본 볼륨"
        value={draft}
        min={0}
        max={1}
        step={0.05}
        minLabel="음소거"
        maxLabel="100%"
        onChange={setDraft}
        onCommit={commit}
      />

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          disabled={draft === VIDEO_VOLUME_DEFAULT}
          onClick={() => commit(VIDEO_VOLUME_DEFAULT)}>
          <RotateCcwIcon />
          기본값으로
        </Button>
      </div>
    </Card>
  );
}

const FONT_SAMPLE = "다람쥐 헌 쳇바퀴에 타고파 ABC 123";

function FontOption({
  label,
  name,
  selected,
  installed,
  onSelect,
}: {
  label: string;
  name: string;
  selected: boolean;
  installed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={!installed}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        "hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
        selected &&
          "border-blue-500 bg-blue-50 ring-1 ring-blue-500 hover:bg-blue-50 dark:bg-blue-500/15 dark:hover:bg-blue-500/15",
      )}>
      <span className="flex w-full items-center gap-1.5 text-sm font-medium">
        {label}
        {!installed && (
          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            미설치
          </span>
        )}
        {selected && <CheckIcon className="ml-auto size-4 text-blue-500" />}
      </span>
      {/* 이름 없음 = 사이트 기본. 옵션 페이지 기본 글꼴로 견본 표시 */}
      <span
        className="truncate text-base"
        style={{ fontFamily: toFontFamily(name) ?? undefined }}>
        {FONT_SAMPLE}
      </span>
    </button>
  );
}

function FontSetting() {
  const [saved, save] = useStorageItem(fontItem);
  // 프리셋에 없는 값이 저장돼 있으면 직접 입력한 글꼴
  const isCustom = saved !== "" && !FONT_PRESETS.some(p => p.name === saved);
  const [custom, setCustom] = useState("");
  useEffect(() => {
    if (isCustom) setCustom(saved);
  }, [isCustom, saved]);

  // 시스템 글꼴은 로딩이 없어서 한 번만 확인하면 됨
  const installed = useMemo(
    () =>
      new Set(
        FONT_PRESETS.filter(p => isFontInstalled(p.name)).map(p => p.name),
      ),
    [],
  );
  const customName = sanitizeFontName(custom);
  const customInstalled = customName !== "" && isFontInstalled(customName);

  return (
    <Card
      title="글꼴"
      description="에펨코리아 사이트와 미리보기에 사용할 글꼴입니다. PC에 설치된 글꼴만 사용할 수 있어요.">
      <div className="grid gap-2 sm:grid-cols-2">
        <FontOption
          label="사이트 기본"
          name=""
          selected={saved === ""}
          installed
          onSelect={() => save("")}
        />
        {FONT_PRESETS.map(({ label, name }) => (
          <FontOption
            key={name}
            label={label}
            name={name}
            selected={saved === name}
            installed={installed.has(name)}
            onSelect={() => save(name)}
          />
        ))}
      </div>

      <form
        className={cn(
          "flex flex-col gap-2 rounded-lg border p-3",
          isCustom && "border-blue-500 ring-1 ring-blue-500",
        )}
        onSubmit={e => {
          e.preventDefault();
          if (customInstalled) save(customName);
        }}>
        <label htmlFor="custom-font" className="text-sm font-medium">
          직접 입력
        </label>
        <div className="flex gap-2">
          <input
            id="custom-font"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="설치된 글꼴 이름 (예: D2Coding)"
            className="h-8 flex-1 rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <Button
            type="submit"
            disabled={!customInstalled || customName === saved}>
            {isCustom && customName === saved ? "적용됨" : "적용"}
          </Button>
        </div>
        {customName && (
          <p
            className={cn(
              "text-xs",
              customInstalled
                ? "text-muted-foreground"
                : "text-red-600 dark:text-red-400",
            )}>
            {customInstalled ? (
              <span
                className="text-base text-foreground"
                style={{ fontFamily: toFontFamily(customName) ?? undefined }}>
                {FONT_SAMPLE}
              </span>
            ) : (
              "이 이름의 글꼴을 찾을 수 없습니다. 설치 여부와 이름을 확인해 주세요."
            )}
          </p>
        )}
      </form>
    </Card>
  );
}

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
