import {
  RotateCcwIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VIDEO_VOLUME_DEFAULT, videoVolumeItem } from "@/lib/settings";
import { useSliderSetting } from "../hooks/use-slider-setting";
import Card from "./Card";
import RangeSlider from "./RangeSlider";
import SavedBadge from "./SavedBadge";

export default function VideoVolumeSetting() {
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
