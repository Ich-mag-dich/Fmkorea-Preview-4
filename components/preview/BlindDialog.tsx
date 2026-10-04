import { useState } from "react";
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
import type { BlindType } from "@/lib/types";

const TARGET_LABEL: Record<BlindType, string> = {
  default: "글,댓글",
  message: "쪽지",
};

/** 블라인드 추가 전 메모를 입력받는 확인창 (사이트의 블라인드 창과 같은 역할) */
function BlindDialog({
  open,
  type,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  type: BlindType;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (memo: string) => void;
}) {
  const container = usePortalContainer();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 미리보기 창 위에 겹쳐 뜨므로 그림자로 층을 구분 */}
      <DialogContent
        container={container}
        className="shadow-2xl ring-foreground/15 sm:max-w-md dark:shadow-black/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">블라인드</DialogTitle>
          <DialogDescription>
            이 회원의 <b className="text-foreground">{TARGET_LABEL[type]}</b>
            을(를) 블라인드 하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        {/* 창이 닫히면 언마운트돼서 다음에 열 때 메모가 비워짐 */}
        <BlindForm pending={pending} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}

function BlindForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (memo: string) => void;
}) {
  const [memo, setMemo] = useState("");
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(memo.trim());
      }}>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">메모</span>
        <input
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="블라인드 사유를 메모할 수 있습니다."
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={pending}
          className={"bg-blue-500 text-white hover:bg-blue-600"}>
          {pending ? "처리 중…" : "블라인드"}
        </Button>
        <DialogClose render={<Button type="button" variant="outline" />}>
          취소
        </DialogClose>
      </div>
    </form>
  );
}

export default BlindDialog;
