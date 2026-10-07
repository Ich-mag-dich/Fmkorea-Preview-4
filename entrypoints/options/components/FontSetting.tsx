import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fontItem } from "@/lib/settings";
import {
  FONT_PRESETS,
  isFontInstalled,
  sanitizeFontName,
  toFontFamily,
} from "@/lib/font";
import { useStorageItem } from "@/hooks/use-storage-item";
import Card from "./Card";
import FontOption, { FONT_SAMPLE } from "./FontOption";

export default function FontSetting() {
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
              customInstalled ?
                "text-muted-foreground"
              : "text-red-600 dark:text-red-400",
            )}>
            {customInstalled ?
              <span
                className="text-base text-foreground"
                style={{ fontFamily: toFontFamily(customName) ?? undefined }}>
                {FONT_SAMPLE}
              </span>
            : "이 이름의 글꼴을 찾을 수 없습니다. 설치 여부와 이름을 확인해 주세요."
            }
          </p>
        )}
      </form>
    </Card>
  );
}
