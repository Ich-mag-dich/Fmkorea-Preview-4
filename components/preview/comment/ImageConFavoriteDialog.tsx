import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortalContainer } from "@/hooks/use-portal-container";
import { urls } from "@/lib/api/urls";
import type { SelectedImageCon } from "./ImageConPanel";

/**
 * 이미지콘 즐겨찾기 등록·해제 확인창 (사이트에서 이미지콘을 우클릭하면 뜨는 창과 같은 문구).
 * 즐겨찾기가 가득 찼는데 등록하려 하면 확인 버튼만 있는 안내로 바뀜
 */
function ImageConFavoriteDialog({
  open,
  con,
  favorite,
  count,
  max,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  con: SelectedImageCon | null;
  /** 이미 즐겨찾기한 이미지콘이면 true (해제 확인) */
  favorite: boolean;
  count: number;
  max: number;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const container = usePortalContainer();
  const full = !favorite && count >= max;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 미리보기 창 위에 겹쳐 뜨므로 그림자로 층을 구분 */}
      <DialogContent
        container={container}
        className="shadow-2xl ring-foreground/15 sm:max-w-sm dark:shadow-black/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">즐겨찾기</DialogTitle>
          <DialogDescription>
            {full ?
              <>
                즐겨찾기는 최대 {max}개입니다.
                <br />
                즐겨찾기 관리에서 정리해 주세요.
              </>
            : <>
                <b className="text-foreground">{con?.name}</b>
                을(를) 즐겨찾기에{favorite ? "서 해제할까요?" : " 등록할까요?"}
                <span className="mt-1 block text-xs tabular-nums">
                  현재 {count} / {max}
                </span>
              </>
            }
          </DialogDescription>
        </DialogHeader>
        {con && !full && (
          <img
            src={urls.imageCon(con.setSrl, con.sortOrder)}
            alt=""
            width={73}
            height={73}
            className="mx-auto size-18.25 object-contain"
          />
        )}
        <div className="flex justify-end gap-2">
          {!full && (
            <Button
              type="button"
              disabled={pending}
              onClick={onConfirm}
              className="bg-blue-500 text-white hover:bg-blue-600">
              {pending ?
                "처리 중…"
              : favorite ?
                "해제"
              : "등록"}
            </Button>
          )}
          <DialogClose render={<Button type="button" variant="outline" />}>
            {full ? "확인" : "취소"}
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageConFavoriteDialog;
