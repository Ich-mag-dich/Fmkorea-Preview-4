import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PREVIEW_WIDTH, previewWidthItem } from "@/lib/settings";
import { useSliderSetting } from "../hooks/use-slider-setting";
import Card from "./Card";
import RangeSlider from "./RangeSlider";
import SavedBadge from "./SavedBadge";
import WidthPreview from "./WidthPreview";

const WIDTH_PRESETS = [
  { label: "좁게", value: 800 },
  { label: "기본", value: PREVIEW_WIDTH.default },
  { label: "넓게", value: 1280 },
  { label: "최대", value: PREVIEW_WIDTH.max },
];

export default function PreviewWidthSetting() {
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
