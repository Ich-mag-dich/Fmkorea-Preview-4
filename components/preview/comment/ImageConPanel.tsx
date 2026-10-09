import { useState } from "react";
import { StarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageConFavorite } from "@/hooks/use-image-con-favorite";
import { useImageCons } from "@/hooks/use-image-cons";
import { usePreviewPost } from "@/hooks/use-preview-post";
import type { RecentImageCon } from "@/lib/api/types";
import { urls } from "@/lib/api/urls";
import { cn } from "@/lib/utils";
import ImageConFavoriteDialog from "./ImageConFavoriteDialog";

export interface SelectedImageCon {
  setSrl: number;
  sortOrder: number;
  /** 사이트의 data-ic-name과 같은 "세트 이름(이미지 이름)" */
  name: string;
}

const keyOf = (con: { setSrl: number; sortOrder: number }) =>
  `${con.setSrl}_${con.sortOrder}`;

/** 즐겨찾기·최근 사용 목록. 여러 세트가 섞여 있어서 항목마다 세트 정보가 있음 */
const fromList = (list: RecentImageCon[]): SelectedImageCon[] =>
  list.map(con => ({
    setSrl: con.set_srl,
    sortOrder: con.sort_order,
    name: `${con.title}(${con.alt_text})`,
  }));

/**
 * 댓글 입력창 아래에 펼치는 이미지콘 선택 창.
 * 사이트 이미지콘 창처럼 위에 "즐겨찾기" + "최근 사용" + 보유한 세트 탭, 아래에 이미지 격자를 보여줌.
 * 누르면 onSelect(바로 등록), 우클릭하면 즐겨찾기 등록·해제 확인창
 */
function ImageConPanel({
  onSelect,
  className,
}: {
  onSelect: (con: SelectedImageCon) => void;
  className?: string;
}) {
  const { post } = usePreviewPost();
  const { data, isPending, isError } = useImageCons(post);
  const favoriteMutation = useImageConFavorite(post);
  const [tab, setTab] = useState<string>();
  // 닫히는 애니메이션 동안 문구가 바뀌지 않게, 등록/해제 여부는 열 때 정해서 보관
  const [favDialog, setFavDialog] = useState<{
    open: boolean;
    con: SelectedImageCon | null;
    favorite: boolean;
  }>({ open: false, con: null, favorite: false });

  const box = cn(
    "flex flex-col overflow-hidden rounded-md border bg-background",
    className,
  );

  if (isPending) {
    return (
      <div className={cn(box, "gap-2 p-2")}>
        <Skeleton className="h-7 w-48" />
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="size-18.25" />
          ))}
        </div>
      </div>
    );
  }

  // 사이트와 같은 순서. 비어 있는 탭은 뺌 (세트 번호와 겹치지 않게 앞 두 탭은 글자 키)
  const tabs =
    isError ?
      []
    : [
        {
          key: "favorites",
          title: "즐겨찾기",
          items: fromList(data.favorites),
        },
        { key: "recent", title: "최근 사용", items: fromList(data.recent) },
        ...data.sets.map(set => ({
          key: String(set.set_srl),
          title: set.title,
          items: set.images.map(con => ({
            setSrl: set.set_srl,
            sortOrder: con.sort_order,
            name: `${set.title}(${con.alt_text})`,
          })),
        })),
      ].filter(t => t.items.length > 0);

  // 고른 탭이 없으면 첫 탭 (즐겨찾기 → 최근 사용 → 첫 세트 순)
  const current = tabs.find(t => t.key === tab) ?? tabs[0];

  if (!current) {
    return (
      <div
        className={cn(box, "items-center p-6 text-sm text-muted-foreground")}>
        {isError ?
          "이미지콘을 불러오지 못했습니다"
        : "보유한 이미지콘이 없습니다"}
      </div>
    );
  }

  const favorites = data?.favorites ?? [];
  const favoritesMax = data?.favorites_max ?? 0;
  const favoriteKeys = new Set(fromList(favorites).map(keyOf));

  return (
    <div className={box}>
      {/* 세트가 많으면 탭이 줄바꿈되지 않고 가로로 스크롤 */}
      <div
        className="flex shrink-0 overflow-x-auto border-b text-sm"
        role="tablist">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === current.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-1.5 whitespace-nowrap transition-colors",
              t.key === current.key ?
                "border-blue-500 font-semibold text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
            )}>
            {t.title}
          </button>
        ))}
      </div>
      <div
        className="flex max-h-60 flex-wrap gap-1 overflow-y-auto p-2"
        role="tabpanel">
        {current.items.map(con => (
          <button
            key={keyOf(con)}
            type="button"
            // 우클릭 즐겨찾기는 눈에 안 보여서 툴팁으로 알려 줌
            title={
              favoritesMax > 0 ? `${con.name}\n우클릭: 즐겨찾기` : con.name
            }
            onClick={() => onSelect(con)}
            onContextMenu={e => {
              e.preventDefault();
              // 사이트도 즐겨찾기 한도가 0이면 우클릭해도 아무것도 안 함
              if (favoritesMax <= 0) return;
              setFavDialog({
                open: true,
                con,
                favorite: favoriteKeys.has(keyOf(con)),
              });
            }}
            className="relative rounded-md p-0.5 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <img
              src={urls.imageCon(con.setSrl, con.sortOrder)}
              alt={con.name}
              width={73}
              height={73}
              loading="lazy"
              draggable={false}
              className="size-18.25 object-contain"
            />
            {/* 즐겨찾기 탭 밖에서 즐겨찾기한 이미지콘 표시 (사이트와 같음) */}
            {current.key !== "favorites" && favoriteKeys.has(keyOf(con)) && (
              <StarIcon className="absolute top-1 right-1 size-3.5 fill-yellow-400 text-yellow-500 drop-shadow-sm" />
            )}
          </button>
        ))}
      </div>
      <ImageConFavoriteDialog
        open={favDialog.open}
        con={favDialog.con}
        favorite={favDialog.favorite}
        count={favorites.length}
        max={favoritesMax}
        pending={favoriteMutation.isPending}
        onOpenChange={open => setFavDialog(prev => ({ ...prev, open }))}
        onConfirm={() => {
          if (!favDialog.con) return;
          favoriteMutation.mutate(
            { con: favDialog.con, favorite: !favDialog.favorite },
            // 실패하면 창을 열어둬서 다시 시도할 수 있게
            {
              onSuccess: () => setFavDialog(prev => ({ ...prev, open: false })),
            },
          );
        }}
      />
    </div>
  );
}

export default ImageConPanel;
