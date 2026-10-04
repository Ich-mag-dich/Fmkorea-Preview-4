import type { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function RemoteButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      variant="outline"
      size="default"
      className="rounded-full shadow-md"
      aria-label={label}
      title={label}
      onClick={onClick}>
      {children}
    </Button>
  );
}

/**
 * 미리보기 창 오른쪽에 붙는 이동 버튼 묶음.
 * 창(position: relative) 안에 넣어야 하며, 창 높이만큼의 세로 레일 안에서
 * sticky로 화면 아래쪽을 따라온다
 */
function PreviewRemote({
  onTop,
  onComments,
  onBottom,
}: {
  onTop: () => void;
  /** 없으면 댓글 버튼을 숨김 (로딩/에러 중) */
  onComments?: () => void;
  onBottom: () => void;
}) {
  return (
    // 넓은 화면(xl)에선 창 오른쪽 바깥, 좁으면 창 안쪽 오른쪽 가장자리 (바깥에 두면 가로 스크롤 생김)
    <div className="pointer-events-none absolute inset-y-0 right-3 flex flex-col justify-end py-6 xl:right-auto xl:left-full xl:ml-4">
      <div className="pointer-events-auto sticky bottom-8 flex flex-col gap-2">
        <RemoteButton label="맨 위로" onClick={onTop}>
          <ArrowUpIcon />
        </RemoteButton>
        {onComments && (
          <RemoteButton label="댓글로" onClick={onComments}>
            <MessageSquareIcon />
          </RemoteButton>
        )}
        <RemoteButton label="맨 아래로" onClick={onBottom}>
          <ArrowDownIcon />
        </RemoteButton>
      </div>
    </div>
  );
}

export default PreviewRemote;
