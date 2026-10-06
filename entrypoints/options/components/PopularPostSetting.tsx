import { Switch } from "@base-ui/react/switch";
import { showPopularPostsItem } from "@/lib/settings";
import { useStorageItem } from "@/hooks/use-storage-item";
import Card from "./Card";
import PopularPostsPreview from "./PopularPostsPreview";

export default function PopularPostSetting() {
  const [show, save] = useStorageItem(showPopularPostsItem);

  return (
    <Card
      title="게시판 인기글"
      description="게시판 위쪽의 '오늘의 포텐'과 게시판별 최신 인기글 목록입니다. 끄면 사이트에서 이 영역을 숨겨요.">
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-medium">인기글 표시</span>
        <Switch.Root
          checked={show}
          onCheckedChange={save}
          className="relative flex h-6 w-11 shrink-0 rounded-full bg-muted p-0.5 ring-1 ring-foreground/10 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-blue-500/40 data-checked:bg-blue-500">
          <Switch.Thumb className="size-5 rounded-full bg-background shadow-sm transition-transform data-checked:translate-x-5" />
        </Switch.Root>
      </label>

      <PopularPostsPreview show={show} />
    </Card>
  );
}
